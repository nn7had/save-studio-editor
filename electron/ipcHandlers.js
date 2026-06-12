import { ipcMain } from 'electron'
import { copyFileSync, existsSync, writeFileSync } from 'fs'
import { decryptSii, DecryptError, buildOutputBuffer } from '../src/services/siiDecryptService.js'
import { parse, ParseError } from '../src/services/siiParser.js'
import {
  write,
  applyPreset,
  unlockAllGarages,
  discoverAllCities,
  unlockAllDealers,
  unlockEverything,
} from '../src/services/siiWriter.js'
import { registerProfileHandlers } from './profileHandlers.js'
import { registerDlcHandler } from './dlcHandler.js'

const ok  = (data)                       => ({ success: true,  data })
const err = (code, message, detail=null) => ({ success: false, error: { code, message, detail } })

// ─── Ortak: diske yaz (plaintext veya re-encrypt) ────────────────────────────
// wasEncrypted ve originalIv, decryptSii'den gelen değerler.
function writeToDisk(filePath, modifiedText, wasEncrypted, originalIv) {
  const outputBuf = buildOutputBuffer(modifiedText, wasEncrypted, originalIv)
  writeFileSync(filePath, outputBuf)  // encoding parametresi YOK — Buffer yazıyoruz
}

// ─── SAVE OPEN BY PATH ───────────────────────────────────────────────────────
function registerOpenByPathHandler() {
  ipcMain.handle('save:open-path', async (_, filePath) => {
    if (!existsSync(filePath))
      return err('ERR_FILE_NOT_FOUND', 'Dosya bulunamadı: ' + filePath)

    let decrypted
    try { decrypted = decryptSii(filePath) }
    catch (e) { return err(e.code ?? DecryptError.DECRYPT_FAILED, e.message, e.original?.message) }

    let saveData
    try { saveData = parse(decrypted.text) }
    catch (e) { return err(e.code ?? ParseError.NOT_SII, e.message) }

    return ok({
      ...saveData,
      _file: {
        path:         filePath,
        wasEncrypted: decrypted.wasEncrypted,
        format:       decrypted.format,
        // IV'yi hex string olarak sakla — JSON serileştirilebilir
        originalIv:   decrypted.originalIv ? decrypted.originalIv.toString('hex') : null,
      },
      _rawText: decrypted.text,
    })
  })
}

// ─── SAVE WRITE ──────────────────────────────────────────────────────────────
function registerWriteHandler() {
  ipcMain.handle('save:write', async (_, { filePath, rawText, changes, fileInfo }) => {
    if (!filePath || !rawText)
      return err('ERR_MISSING_ARGS', 'filePath veya rawText eksik.')

    if (!existsSync(filePath))
      return err('ERR_FILE_NOT_FOUND', `Dosya bulunamadı: ${filePath}`)

    // fileInfo: renderer'dan gelen { wasEncrypted, originalIv }
    const wasEncrypted = fileInfo?.wasEncrypted ?? false
    const originalIv   = fileInfo?.originalIv
      ? Buffer.from(fileInfo.originalIv, 'hex')
      : null

    try { copyFileSync(filePath, filePath + '.bak') }
    catch (e) { return err('ERR_BACKUP_FAILED', e.message) }

    let modifiedText
    try { modifiedText = write(rawText, changes) }
    catch (e) { return err('ERR_WRITE_FAILED', e.message) }

    try { writeToDisk(filePath, modifiedText, wasEncrypted, originalIv) }
    catch (e) { return err('ERR_WRITE_FAILED', e.message) }

    return ok({ backupPath: filePath + '.bak' })
  })
}

// ─── PRESET ──────────────────────────────────────────────────────────────────
function registerPresetHandler() {
  ipcMain.handle('save:preset', async (_, { filePath, rawText, preset, fileInfo }) => {
    if (!filePath || !rawText || !preset)
      return err('ERR_MISSING_ARGS', 'Eksik argüman.')

    const wasEncrypted = fileInfo?.wasEncrypted ?? false
    const originalIv   = fileInfo?.originalIv
      ? Buffer.from(fileInfo.originalIv, 'hex')
      : null

    try { copyFileSync(filePath, filePath + '.bak') } catch {}

    let modifiedText
    try { modifiedText = applyPreset(rawText, preset) }
    catch (e) { return err('ERR_PRESET_FAILED', e.message) }

    try { writeToDisk(filePath, modifiedText, wasEncrypted, originalIv) }
    catch (e) { return err('ERR_WRITE_FAILED', e.message) }

    try {
      const reparsed = parse(modifiedText)
      return ok({ ...reparsed, _rawText: modifiedText })
    } catch (e) {
      return err(e.code, e.message)
    }
  })
}

// ─── UNLOCK (tekil) ──────────────────────────────────────────────────────────
function registerUnlockHandler() {
  ipcMain.handle('save:unlock', async (_, { filePath, rawText, info, fileInfo }) => {
    if (!filePath || !rawText || !info?.setting)
      return err('ERR_MISSING_ARGS', 'filePath, rawText veya setting eksik.')

    if (!existsSync(filePath))
      return err('ERR_FILE_NOT_FOUND', `Dosya bulunamadı: ${filePath}`)

    const wasEncrypted = fileInfo?.wasEncrypted ?? false
    const originalIv   = fileInfo?.originalIv
      ? Buffer.from(fileInfo.originalIv, 'hex')
      : null

    try { copyFileSync(filePath, filePath + '.bak') } catch {}

    let modifiedText
    try {
      if      (info.setting === 'garages') modifiedText = unlockAllGarages(rawText)
      else if (info.setting === 'cities')  modifiedText = discoverAllCities(rawText)
      else if (info.setting === 'dealers') modifiedText = unlockAllDealers(rawText)
      else return err('ERR_UNKNOWN_SETTING', `Bilinmeyen setting: "${info.setting}"`)
    } catch (e) {
      return err('ERR_UNLOCK_FAILED', e.message)
    }

    try { writeToDisk(filePath, modifiedText, wasEncrypted, originalIv) }
    catch (e) { return err('ERR_WRITE_FAILED', e.message) }

    return ok({ _rawText: modifiedText })
  })
}

// ─── UNLOCK EVERYTHING ───────────────────────────────────────────────────────
function registerUnlockEverythingHandler() {
  ipcMain.handle('save:unlock-all', async (_, { filePath, rawText, fileInfo }) => {
    if (!filePath || !rawText)
      return err('ERR_MISSING_ARGS', 'filePath veya rawText eksik.')

    if (!existsSync(filePath))
      return err('ERR_FILE_NOT_FOUND', `Dosya bulunamadı: ${filePath}`)

    const wasEncrypted = fileInfo?.wasEncrypted ?? false
    const originalIv   = fileInfo?.originalIv
      ? Buffer.from(fileInfo.originalIv, 'hex')
      : null

    try { copyFileSync(filePath, filePath + '.bak') } catch {}

    let modifiedText
    try { modifiedText = unlockEverything(rawText) }
    catch (e) { return err('ERR_UNLOCK_FAILED', e.message) }

    try { writeToDisk(filePath, modifiedText, wasEncrypted, originalIv) }
    catch (e) { return err('ERR_WRITE_FAILED', e.message) }

    return ok({ _rawText: modifiedText })
  })
}

// ─── REGISTER ALL ─────────────────────────────────────────────────────────────
export function registerAllHandlers(mainWindow) {
  registerProfileHandlers()
  registerOpenByPathHandler()
  registerWriteHandler()
  registerPresetHandler()
  registerUnlockHandler()
  registerUnlockEverythingHandler()
  registerDlcHandler()
}