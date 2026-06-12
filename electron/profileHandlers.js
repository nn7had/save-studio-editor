import { ipcMain } from 'electron'
import { listProfiles, listSaves } from './steamDetector.js'

const ok  = (data)          => ({ success: true, data })
const err = (code, message) => ({ success: false, error: { code, message } })

function registerProfilesHandler() {
  ipcMain.handle('profiles:list', async () => {
    try {
      return ok(listProfiles())
    } catch (e) {
      return err(e.code ?? 'ERR_UNKNOWN', e.message)
    }
  })
}

function registerSavesHandler() {
  ipcMain.handle('saves:list', async (_, profilePath) => {
    if (!profilePath) return err('ERR_MISSING_ARG', 'profilePath eksik.')
    try {
      return ok(listSaves(profilePath))
    } catch (e) {
      return err(e.code ?? 'ERR_UNKNOWN', e.message)
    }
  })
}

export function registerProfileHandlers() {
  registerProfilesHandler()
  registerSavesHandler()
}