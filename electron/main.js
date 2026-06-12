import { app, BrowserWindow, Menu } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import { readFileSync, existsSync } from 'fs'
import { registerAllHandlers } from './ipcHandlers.js'

app.disableHardwareAcceleration()

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function getDevPort() {
  const portFile = path.join(__dirname, '..', '.vite-port')
  if (existsSync(portFile)) {
    return parseInt(readFileSync(portFile, 'utf-8').trim(), 10)
  }
  return 5173
}

function createWindow() {
  // Menü çubuğunu tamamen kaldır
  Menu.setApplicationMenu(null)

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    resizable: false,
    maximizable: false,
    // 👇 İkonu projenin içinden çeken doğru yol
    icon: path.join(__dirname, '..', 'src', 'assets', 'logo.ico'), 
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  const port = getDevPort()
  win.loadURL(`http://localhost:${port}`)
  //win.webContents.openDevTools()

  registerAllHandlers(win)
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})