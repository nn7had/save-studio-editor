import { XP_TABLE, ADR_CLASSES } from '../utils/constants.js'

// ─────────────────────────────────────────────────────────────
// Hata sabitleri
// ─────────────────────────────────────────────────────────────
export const ParseError = {
  NOT_SII:          'ERR_NOT_SII',
  STILL_ENCRYPTED:  'ERR_STILL_ENCRYPTED',
  NO_ECONOMY_BLOCK: 'ERR_NO_ECONOMY_BLOCK',
  NO_BANK_BLOCK:    'ERR_NO_BANK_BLOCK',
  NO_BANK_REF:      'ERR_NO_BANK_REF',
  FIELD_MISSING:    'ERR_FIELD_MISSING',
}

// ─────────────────────────────────────────────────────────────
// detectFormat
// Buffer'ın ilk 4 byte'ına bakarak dosya tipini döndürür.
//
// DÜZELTME: Önceki kodda 'ScsF' (0x46) yazılıydı — YANLIŞ.
// Doğru magic byte 'ScsC' (0x43)'dür.
// ─────────────────────────────────────────────────────────────
export function detectFormat(buffer) {
  // 'ScsC' = AES şifreli (0x53 0x63 0x73 0x43)
  if (buffer[0] === 0x53 && buffer[1] === 0x63 &&
      buffer[2] === 0x73 && buffer[3] === 0x43) {   // ← 0x43 = 'C', önceden 0x46 = 'F' idi
    return 'encrypted'
  }
  // 'BSII' = binary format
  if (buffer[0] === 0x42 && buffer[1] === 0x53 &&
      buffer[2] === 0x49 && buffer[3] === 0x49) {
    return 'binary'
  }
  return 'text'
}

// ─────────────────────────────────────────────────────────────
// extractBlock
// ─────────────────────────────────────────────────────────────
function extractBlock(text, typeName) {
  const lines = text.split('\n')
  let capturing = false
  let depth = 0
  const blockLines = []

  for (const line of lines) {
    if (!capturing) {
      const headerMatch = line.match(
        new RegExp(`^\\s*${typeName}\\s*:\\s*\\S+\\s*(?:\\{)?\\s*$`)
      )
      if (headerMatch) {
        capturing = true
        if (line.includes('{')) depth = 1
        continue
      }
    } else {
      if (depth === 0 && line.trim() === '{') {
        depth = 1
        continue
      }
      for (const ch of line) {
        if (ch === '{') depth++
        else if (ch === '}') depth--
      }
      if (depth <= 0) break
      blockLines.push(line)
    }
  }

  return capturing ? blockLines.join('\n') : null
}

// ─────────────────────────────────────────────────────────────
// extractBlockByRef
// ─────────────────────────────────────────────────────────────
function extractBlockByRef(text, typeName, refName) {
  const escapedRef = refName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const lines = text.split('\n')
  let capturing = false
  let depth = 0
  const blockLines = []

  const headerRe = new RegExp(
    `^\\s*${typeName}\\s*:\\s*${escapedRef}\\s*\\{\\s*$`
  )

  for (const line of lines) {
    if (!capturing) {
      if (headerRe.test(line)) {
        capturing = true
        depth = 1
        continue
      }
    } else {
      for (const ch of line) {
        if (ch === '{') depth++
        else if (ch === '}') depth--
      }
      if (depth <= 0) break
      blockLines.push(line)
    }
  }

  return capturing ? blockLines.join('\n') : null
}

// ─────────────────────────────────────────────────────────────
// readField
// ─────────────────────────────────────────────────────────────
function readField(blockText, fieldName) {
  const re = new RegExp(`^\\s*${fieldName}\\s*:\\s*(-?\\d+)`, 'm')
  const match = blockText.match(re)
  return match ? match[1] : null
}

// ─────────────────────────────────────────────────────────────
// xpToLevel
// ─────────────────────────────────────────────────────────────
export function xpToLevel(xp) {
  const MAX_LEVEL = XP_TABLE.length

  let level = 1
  for (let i = 0; i < MAX_LEVEL; i++) {
    if (xp >= XP_TABLE[i]) level = i + 1
    else break
  }

  if (level >= MAX_LEVEL) {
    return { level: MAX_LEVEL, progress: 1, currentXp: xp, nextLevelXp: null }
  }

  const currentLevelXp = XP_TABLE[level - 1]
  const nextLevelXp    = XP_TABLE[level]
  const progress       = (xp - currentLevelXp) / (nextLevelXp - currentLevelXp)

  return {
    level,
    progress:    Math.min(1, Math.max(0, progress)),
    currentXp:   xp,
    nextLevelXp,
    xpToNext:    nextLevelXp - xp,
  }
}

// ─────────────────────────────────────────────────────────────
// adrDecode
// ─────────────────────────────────────────────────────────────
export function adrDecode(value) {
  return ADR_CLASSES.map((cls) => !!(value & cls.value))
}

// ─────────────────────────────────────────────────────────────
// parse
// ─────────────────────────────────────────────────────────────
export function parse(text) {
  // Format doğrulama — string üzerinden
  // ScsC kontrolü: 'S','c','s','C'
  if (text.charCodeAt(0) === 0x53 &&
      text.charCodeAt(1) === 0x63 &&
      text.charCodeAt(2) === 0x73 &&
      text.charCodeAt(3) === 0x43) {
    throw { code: ParseError.STILL_ENCRYPTED, message: 'Dosya hâlâ şifreli. Önce decrypt et.' }
  }

  if (!text.trimStart().startsWith('SiiNunit')) {
    throw { code: ParseError.NOT_SII, message: 'Geçerli bir SII dosyası değil (SiiNunit header bulunamadı).' }
  }

  const economyBlock = extractBlock(text, 'economy')
  if (!economyBlock) {
    throw { code: ParseError.NO_ECONOMY_BLOCK, message: 'economy bloğu bulunamadı.' }
  }

  const bankRefMatch = economyBlock.match(/^\s*bank\s*:\s*(\S+)/m)
  if (!bankRefMatch) {
    throw { code: ParseError.NO_BANK_REF, message: 'economy bloğunda bank referansı bulunamadı.' }
  }
  const bankRef = bankRefMatch[1]

  const bankBlock = extractBlockByRef(text, 'bank', bankRef)
  if (!bankBlock) {
    throw { code: ParseError.NO_BANK_BLOCK, message: `bank bloğu bulunamadı: ${bankRef}` }
  }

  const rawXP         = readField(economyBlock, 'experience_points')
  const rawADR        = readField(economyBlock, 'adr')
  const rawLongDist   = readField(economyBlock, 'long_dist')
  const rawHeavy      = readField(economyBlock, 'heavy')
  const rawFragile    = readField(economyBlock, 'fragile')
  const rawUrgent     = readField(economyBlock, 'urgent')
  const rawMechanical = readField(economyBlock, 'mechanical')
  const rawMoney      = readField(bankBlock, 'money_account')

  if (rawXP    === null) throw { code: ParseError.FIELD_MISSING, message: 'experience_points bulunamadı.' }
  if (rawMoney === null) throw { code: ParseError.FIELD_MISSING, message: 'money_account bulunamadı.' }

  const xp    = parseInt(rawXP,    10)
  const adr   = parseInt(rawADR   ?? '0', 10)
  const money = parseInt(rawMoney, 10)

  const levelInfo = xpToLevel(xp)
  const adrFlags  = adrDecode(adr)

  return {
    money,
    xp,
    level:         levelInfo.level,
    levelProgress: levelInfo.progress,
    xpToNext:      levelInfo.xpToNext ?? 0,
    nextLevelXp:   levelInfo.nextLevelXp,
    skills: {
      adr,
      adrFlags,
      long_dist:   parseInt(rawLongDist   ?? '0', 10),
      heavy:       parseInt(rawHeavy      ?? '0', 10),
      fragile:     parseInt(rawFragile    ?? '0', 10),
      urgent:      parseInt(rawUrgent     ?? '0', 10),
      mechanical:  parseInt(rawMechanical ?? '0', 10),
    },
    _meta: { bankRef },
  }
}