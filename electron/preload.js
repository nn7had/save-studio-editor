const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('saveAPI', {
  // YENİ: fileInfo eklendi (wasEncrypted + originalIv → re-encrypt için)
  write: (filePath, rawText, changes, fileInfo) =>
    ipcRenderer.invoke('save:write', { filePath, rawText, changes, fileInfo }),

  preset: (filePath, rawText, preset, fileInfo) =>
    ipcRenderer.invoke('save:preset', { filePath, rawText, preset, fileInfo }),
})

contextBridge.exposeInMainWorld('profileAPI', {
  listProfiles: () =>
    ipcRenderer.invoke('profiles:list'),

  listSaves: (profilePath) =>
    ipcRenderer.invoke('saves:list', profilePath),

  openSave: (gameSiiPath) =>
    ipcRenderer.invoke('save:open-path', gameSiiPath),
})

contextBridge.exposeInMainWorld('dlcAPI', {
  bypassDlc: (profilePath) =>
    ipcRenderer.invoke('profile:bypass-dlc', profilePath),
})

contextBridge.exposeInMainWorld('unlockAPI', {
  // YENİ: fileInfo eklendi
  unlock: (filePath, rawText, setting, fileInfo) =>
    ipcRenderer.invoke('save:unlock', { filePath, rawText, info: { setting }, fileInfo }),

  unlockAll: (filePath, rawText, fileInfo) =>
    ipcRenderer.invoke('save:unlock-all', { filePath, rawText, fileInfo }),
})