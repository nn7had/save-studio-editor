/**
 * siiDecryptService.js
 * ETS2/ATS save dosyalarını decrypt eder ve gerektiğinde re-encrypt eder.
 * Electron main process'te çalışır (Node.js ortamı).
 *
 * Desteklenen formatlar:
 *   SiiN → düz metin (plaintext), değiştirip geri yazılabilir
 *   ScsC → AES-256-CBC şifreli, decrypt → değiştir → re-encrypt
 *   BSII → binary format (desteklenmiyor, g_save_format değiştirmek gerekir)
 */

import { createRequire } from 'module'
import { readFileSync } from 'fs'
import crypto from 'crypto'

const require = createRequire(import.meta.url)
const { SIIDecryptor } = require('@trucky/sii-decrypt-ts')

// ─── ETS2/ATS AES-256-CBC Anahtarı (sabit, tüm save'ler için aynı) ─────────
// Kaynak: TheLazyTomcat/SII_Decrypt, SII-DecryptSharp
const AES_KEY = Buffer.from([
  0x2a, 0x5f, 0xcb, 0x17, 0x91, 0xd2, 0x2f, 0xb6,
  0x02, 0x45, 0xb3, 0xd8, 0x36, 0x9e, 0xd0, 0xb2,
  0xc2, 0x73, 0x71, 0x56, 0x3f, 0xbf, 0x1f, 0x3c,
  0x9d, 0x0a, 0x16, 0xae, 0x4a, 0xd2, 0xf2, 0x2a,
])

// ─── Magic byte sabitleri ────────────────────────────────────────────────────
const MAGIC_SCSC = Buffer.from([0x53, 0x63, 0x73, 0x43]) // 'ScsC' — şifreli
const MAGIC_BSII = Buffer.from([0x42, 0x53, 0x49, 0x49]) // 'BSII' — binary
const MAGIC_SIIN = Buffer.from([0x53, 0x69, 0x69, 0x4E]) // 'SiiN' — plaintext

// ─── Hata kodları ─────────────────────────────────────────────────────────
export const DecryptError = {
  FILE_NOT_FOUND:  'ERR_FILE_NOT_FOUND',
  UNSUPPORTED_FMT: 'ERR_UNSUPPORTED_FORMAT',
  DECRYPT_FAILED:  'ERR_DECRYPT_FAILED',
  BINARY_FAILED:   'ERR_BINARY_FAILED',
  EMPTY_RESULT:    'ERR_EMPTY_RESULT',
}

// ─────────────────────────────────────────────────────────────────────────────
// detectRawFormat
// Dosyanın ilk 4 byte'ına bakarak formatı tespit eder.
// Döner: 'encrypted' | 'binary' | 'text' | 'unknown'
// ─────────────────────────────────────────────────────────────────────────────
export function detectRawFormat(buf) {
  if (buf.slice(0, 4).equals(MAGIC_SCSC)) return 'encrypted'
  if (buf.slice(0, 4).equals(MAGIC_BSII)) return 'binary'
  if (buf.slice(0, 4).equals(MAGIC_SIIN)) return 'text'
  return 'unknown'
}

// ─────────────────────────────────────────────────────────────────────────────
// decryptSii
// Dosyayı okur, gerekirse decrypt eder, ham SII text döndürür.
//
// Dönüş değeri:
//   text          — SiiNunit ile başlayan düz metin
//   wasEncrypted  — orijinal dosya ScsC şifreli miydi?
//   format        — 'text' | 'binary' | 'encrypted'
//   originalIv    — şifreli dosyalarda re-encrypt için orijinal IV (Buffer|null)
// ─────────────────────────────────────────────────────────────────────────────
export function decryptSii(filePath) {
  // Ham dosyayı oku — format tespiti için
  let rawBuf
  try {
    rawBuf = readFileSync(filePath)
  } catch (err) {
    throw { code: DecryptError.FILE_NOT_FOUND, message: `Dosya bulunamadı: ${filePath}` }
  }

  const rawFormat = detectRawFormat(rawBuf)
  console.log(`[decryptSii] Format: ${rawFormat} — ${filePath}`)

  // BSII binary format → g_save_format değiştirmeden desteklenemez
  if (rawFormat === 'binary') {
    throw {
      code: DecryptError.BINARY_FAILED,
      message: 'Binary (BSII) save formatı desteklenmiyor.\n\n' +
               'Çözüm: config.cfg dosyasında "uset g_save_format \\"2\\"" veya "3" satırını ' +
               '"uset g_save_format \\"2\\"" olarak bırak, oyuna gir ve tekrar quicksave yap.',
    }
  }

  // ScsC şifreli → IV'yi header'dan çıkar (re-encrypt için sakla)
  let originalIv = null
  if (rawFormat === 'encrypted') {
    // ScsC header yapısı:
    //   0x00–0x03: 'ScsC' magic
    //   0x04–0x07: versiyon (little-endian uint32)
    //   0x08–0x17: HMAC-MD5 (16 bytes)
    //   0x18–0x27: IV (16 bytes)  ← burası
    //   0x28+    : şifreli veri
    if (rawBuf.length >= 0x28 + 16) {
      originalIv = rawBuf.slice(0x18, 0x28)
      console.log(`[decryptSii] IV alındı: ${originalIv.toString('hex')}`)
    }
  }

  // @trucky/sii-decrypt-ts ile decrypt et
  let result
  try {
    result = SIIDecryptor.decrypt(filePath, true)
  } catch (err) {
    const msg = err?.message ?? String(err)
    if (msg.includes('does not exist')) {
      throw { code: DecryptError.FILE_NOT_FOUND, message: `Dosya bulunamadı: ${filePath}` }
    }
    if (msg.includes('_3nK')) {
      throw { code: DecryptError.UNSUPPORTED_FMT, message: '3nK formatı desteklenmiyor.' }
    }
    if (msg.includes('wrong final block') || msg.includes('bad decrypt')) {
      throw { code: DecryptError.DECRYPT_FAILED, message: 'AES şifre çözme başarısız. Dosya bozuk olabilir.', original: err }
    }
    throw { code: DecryptError.DECRYPT_FAILED, message: `Decrypt hatası: ${msg}`, original: err }
  }

  if (!result.success) {
    throw { code: DecryptError.DECRYPT_FAILED, message: 'Decrypt başarısız (success=false).' }
  }

  if (!result.string_content || result.string_content.trim().length === 0) {
    throw { code: DecryptError.EMPTY_RESULT, message: 'Decrypt sonucu boş.' }
  }

  return {
    text:         result.string_content,
    wasEncrypted: rawFormat === 'encrypted',
    format:       rawFormat,
    originalIv,   // null ise plaintext'ti, Buffer ise re-encrypt için kullan
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// encryptSii
// Düz metin SII içeriğini tekrar AES-256-CBC ile şifreler.
// ETS2'nin okuyacağı ScsC formatında Buffer döndürür.
//
// Parametreler:
//   textContent — SiiNunit ile başlayan düz metin
//   iv          — Buffer(16), null verilirse yeni rastgele IV üretilir
// ─────────────────────────────────────────────────────────────────────────────
export function encryptSii(textContent, iv = null) {
  const ivBuf = iv ?? crypto.randomBytes(16)
  const textBuf = Buffer.from(textContent, 'utf8')

  const cipher = crypto.createCipheriv('aes-256-cbc', AES_KEY, ivBuf)
  const encrypted = Buffer.concat([cipher.update(textBuf), cipher.final()])

  // ScsC header oluştur (0x28 = 40 bytes)
  const header = Buffer.alloc(0x28, 0)
  MAGIC_SCSC.copy(header, 0x00)            // 'ScsC'
  header.writeUInt32LE(0x02000000, 0x04)   // versiyon
  // 0x08–0x17: HMAC (sıfır bırakılıyor — oyun versiyon bağımlı kontrol yapar,
  //             çoğu versiyonda sadece format kontrolü yapılır)
  ivBuf.copy(header, 0x18)                 // IV

  return Buffer.concat([header, encrypted])
}

// ─────────────────────────────────────────────────────────────────────────────
// buildOutputBuffer
// write/unlock işlemlerinden sonra diske yazılacak Buffer'ı üretir.
// wasEncrypted=true ise re-encrypt, false ise plaintext yazar.
// ─────────────────────────────────────────────────────────────────────────────
export function buildOutputBuffer(modifiedText, wasEncrypted, originalIv = null) {
  if (wasEncrypted) {
    console.log('[buildOutputBuffer] Re-encrypting → ScsC format')
    // Orijinal IV'yi kullanmak zorunda değiliz, yeni IV da çalışır.
    // Ama güvenlik açısından yeni IV daha iyidir.
    return encryptSii(modifiedText, null)
  }

  // Plaintext dosya → plaintext geri yaz
  console.log('[buildOutputBuffer] Plaintext → SiiN format')
  return Buffer.from(modifiedText, 'utf8')
}