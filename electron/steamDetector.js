import { existsSync, readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'

const HOME = homedir()

function getCandidatePaths() {
  return [
    join(HOME, 'Documents', 'Euro Truck Simulator 2'),
    join(HOME, 'Belgeler', 'Euro Truck Simulator 2'),
    join(HOME, 'OneDrive', 'Documents', 'Euro Truck Simulator 2'),
    join(HOME, 'OneDrive', 'Belgeler', 'Euro Truck Simulator 2'),
    join(HOME, 'Euro Truck Simulator 2'),
    join(HOME, '.steam', 'steam', 'steamapps', 'compatdata', '227300', 'pfx',
      'drive_c', 'users', 'steamuser', 'Documents', 'Euro Truck Simulator 2'),
    join(HOME, '.local', 'share', 'Steam', 'steamapps', 'compatdata', '227300', 'pfx',
      'drive_c', 'users', 'steamuser', 'Documents', 'Euro Truck Simulator 2'),
  ]
}

export function findEts2BaseDir() {
  const candidates = getCandidatePaths()
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate
  }
  throw new Error(
    'ETS2 klasörü bulunamadı.\nAranan yollar:\n' +
    candidates.map(p => '  • ' + p).join('\n')
  )
}

export function findProfilesDir() {
  const base = findEts2BaseDir()
  const profilesPath = join(base, 'profiles')
  if (!existsSync(profilesPath)) {
    throw new Error(
      'ETS2 profiles klasörü bulunamadı: ' + profilesPath + '\n' +
      'Oyunu en az bir kez başlatıp profil oluşturmanız gerekiyor.'
    )
  }
  return profilesPath
}

// ─── HEX DECODE ──────────────────────────────────────────────
function decodeHexFolderName(hex) {
  try {
    if (!/^[0-9a-fA-F]+$/.test(hex)) return hex
    const buf = Buffer.from(hex, 'hex')
    const utf8 = new TextDecoder('utf-8', { fatal: true }).decode(buf)
    if (utf8.trim()) return utf8.trim()
  } catch {
    try {
      const latin1 = Buffer.from(hex, 'hex').toString('latin1')
      return Buffer.from(latin1, 'latin1').toString('utf-8').trim()
    } catch {
      return hex
    }
  }
  return hex
}

// ─── PROFILE.SII OKUMA ───────────────────────────────────────
function readProfileName(profileDir) {
  const siiPath = join(profileDir, 'profile.sii')
  if (!existsSync(siiPath)) return null

  let text = null
  try {
    const raw = readFileSync(siiPath)
    text = new TextDecoder('utf-8', { fatal: true }).decode(raw)
  } catch {
    try {
      const raw = readFileSync(siiPath)
      text = new TextDecoder('latin1').decode(raw)
    } catch {
      return null
    }
  }

  if (!text) return null
  const match = text.match(/profile_name\s*:\s*"([^"]*)"/)
  if (!match) return null
  const name = match[1].trim()
  return name || null
}

// ─── PROFİL LİSTESİ ──────────────────────────────────────────
export function listProfiles() {
  const profilesPath = findProfilesDir()

  const entries = readdirSync(profilesPath, { withFileTypes: true })
    .filter(e => e.isDirectory())

  if (!entries.length) throw new Error('Hiç profil bulunamadı.')

  return entries.map(e => {
    const folderName = e.name
    const profileDir = join(profilesPath, folderName)

    let displayName = readProfileName(profileDir)
    if (!displayName) displayName = decodeHexFolderName(folderName)
    if (!displayName) displayName = folderName

    return {
      id:   folderName,
      name: displayName,
      path: profileDir,
    }
  })
}

// ─── SAVE LİSTESİ ────────────────────────────────────────────
export function listSaves(profilePath) {
  if (!profilePath) throw new Error('profilePath eksik.')

  const savesPath = join(profilePath, 'save')
  if (!existsSync(savesPath))
    throw new Error('Save klasörü bulunamadı: ' + savesPath)

  const entries = readdirSync(savesPath, { withFileTypes: true })
    .filter(e => e.isDirectory())

  if (!entries.length) throw new Error('Bu profilde hiç save bulunamadı.')

  return entries.map(e => ({
    id:          e.name,
    name:        e.name,
    gameSiiPath: join(savesPath, e.name, 'game.sii'),
  }))
}