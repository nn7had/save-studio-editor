// electron/dlcHandler.js

import { ipcMain }                        from 'electron'
import { existsSync, readdirSync,
         writeFileSync, copyFileSync }    from 'fs'
import { join }                           from 'path'
import { decryptSii, DecryptError }       from '../src/services/siiDecryptService.js'

// ─── Helpers (ipcHandlers.js ile aynı format) ─────────────────
const ok  = (data)                       => ({ success: true,  data  })
const err = (code, message, detail=null) => ({ success: false, error: { code, message, detail } })

// ─── Ana handler ──────────────────────────────────────────────
export function registerDlcHandler() {
  ipcMain.handle('profile:bypass-dlc', async (_event, profilePath) => {

    // 1. Temel kontrol
    if (!profilePath)
      return err('ERR_MISSING_ARG', 'profilePath eksik.')

    if (!existsSync(profilePath))
      return err('ERR_FILE_NOT_FOUND', `Profil klasörü bulunamadı: ${profilePath}`)

    // 2. .../save/ klasörünü bul
    const savesDir = join(profilePath, 'save')
    if (!existsSync(savesDir))
      return err('ERR_NO_SAVES_DIR', `Save klasörü bulunamadı: ${savesDir}`)

    // 3. save/ altındaki tüm alt klasörleri tara (1, 2, autosave, …)
    let saveEntries
    try {
      saveEntries = readdirSync(savesDir, { withFileTypes: true })
        .filter(e => e.isDirectory())
    } catch (e) {
      return err('ERR_READ_FAILED', `Save klasörü okunamadı: ${e.message}`)
    }

    if (!saveEntries.length)
      return err('ERR_NO_SAVES', 'Bu profilde hiç save klasörü bulunamadı.')

    // 4. Her save klasöründeki info.sii'yi işle
    const results   = []   // { saveId, status, detail? }
    let   patchCount = 0

    for (const entry of saveEntries) {
      const saveId     = entry.name
      const infoSiiPath = join(savesDir, saveId, 'info.sii')

      // info.sii yoksa bu save'i atla (hata değil, normal durum)
      if (!existsSync(infoSiiPath)) {
        console.log(`[DLC Bypass] info.sii yok, atlanıyor: ${infoSiiPath}`)
        results.push({ saveId, status: 'skipped', detail: 'info.sii bulunamadı' })
        continue
      }

      // 4a. Yedek al (.bak)
      try {
        copyFileSync(infoSiiPath, infoSiiPath + '.bak')
      } catch (e) {
        console.warn(`[DLC Bypass] Yedek alınamadı (${saveId}): ${e.message}`)
        // Yedek alınamazsa işleme devam et — kritik değil
      }

      // 4b. Decrypt et (SII Binary → düz metin)
      let decrypted
      try {
        decrypted = decryptSii(infoSiiPath)
        console.log(`[DLC Bypass] Decrypt OK (${saveId}) — format: ${decrypted.format}`)
      } catch (e) {
        console.error(`[DLC Bypass] Decrypt HATA (${saveId}):`, e)
        results.push({ saveId, status: 'error', detail: e.message ?? String(e) })
        continue
      }

      // 4c. Tırnak sonrasındaki "dlc|" → "rdlc|" patch
      // /(?<=")\dlc\|/g → Positive Lookbehind: önünde " olan dlc| ifadesini yakalar
      // Tırnağa dokunmaz, zaten patch'li "rdlc|" satırları tekrar işlenmez
      // Klasör adı içindeki "eut2_dlc_ln_year" gibi ifadelere DOKUNULMAZ
      const original   = decrypted.text
      const patched    = original.replace(/(?<=")dlc\|/g, 'rdlc|')
      const matchCount = (original.match(/(?<=")dlc\|/g) ?? []).length

      if (matchCount === 0) {
        console.log(`[DLC Bypass] dlc_ bulunamadı, atlanıyor (${saveId})`)
        results.push({ saveId, status: 'skipped', detail: '"dlc| ifadesi bulunamadı' })
        continue
      }

      // 4d. Patch'li içeriği geri yaz (UTF-8)
      try {
        writeFileSync(infoSiiPath, patched, 'utf-8')
        console.log(`[DLC Bypass] Yazıldı (${saveId}) — ${matchCount} "dlc| → "rdlc|`)
        results.push({ saveId, status: 'ok', detail: `${matchCount} bağımlılık devre dışı` })
        patchCount++
      } catch (e) {
        console.error(`[DLC Bypass] Yazma HATA (${saveId}):`, e.message)
        results.push({ saveId, status: 'error', detail: `Yazma hatası: ${e.message}` })
      }
    }

    // 5. Sonuç özeti
    const hasError = results.some(r => r.status === 'error')
    const allSkipped = results.every(r => r.status === 'skipped')

    if (allSkipped) {
      return err(
        'ERR_NOTHING_TO_PATCH',
        'Hiçbir save dosyasında DLC bağımlılığı bulunamadı.',
        results
      )
    }

    return ok({
      message: hasError
        ? `İşlem tamamlandı (bazı saveler hatalı). ${patchCount} save başarıyla düzenlendi.`
        : `${patchCount} save dosyası başarıyla düzenlendi. Oyunu yeniden başlatın.`,
      patchedCount : patchCount,
      results,          // per-save detay (UI ileride göstermek isterse)
    })
  })
}