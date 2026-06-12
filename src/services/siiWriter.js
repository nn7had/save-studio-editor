import { LIMITS, PRESETS, ADR_CLASSES } from '../utils/constants.js'

// ─────────────────────────────────────────────────────────────
// adrEncode
// ─────────────────────────────────────────────────────────────
export function adrEncode(flags) {
  return ADR_CLASSES.reduce((acc, cls, i) => acc | (flags[i] ? cls.value : 0), 0)
}

// ─────────────────────────────────────────────────────────────
// validateChanges
// ─────────────────────────────────────────────────────────────
export function validateChanges(changes) {
  const errors = []

  if (changes.money !== undefined) {
    if (!Number.isInteger(changes.money))
      errors.push('money tam sayı olmalı.')
    else if (changes.money < LIMITS.money.min || changes.money > LIMITS.money.max)
      errors.push(`money ${LIMITS.money.min}–${LIMITS.money.max} aralığında olmalı.`)
  }

  if (changes.xp !== undefined) {
    if (!Number.isInteger(changes.xp))
      errors.push('xp tam sayı olmalı.')
    else if (changes.xp < LIMITS.xp.min || changes.xp > LIMITS.xp.max)
      errors.push(`xp ${LIMITS.xp.min}–${LIMITS.xp.max} aralığında olmalı.`)
  }

  if (changes.skills) {
    const { adr, long_dist, heavy, fragile, urgent, mechanical } = changes.skills
    const checkSkill = (name, val) => {
      if (val === undefined) return
      if (!Number.isInteger(val))
        errors.push(`skills.${name} tam sayı olmalı.`)
      else if (val < LIMITS.skill.min || val > LIMITS.skill.max)
        errors.push(`skills.${name} ${LIMITS.skill.min}–${LIMITS.skill.max} aralığında olmalı.`)
    }
    if (adr !== undefined && (adr < LIMITS.adr.min || adr > LIMITS.adr.max))
      errors.push(`skills.adr ${LIMITS.adr.min}–${LIMITS.adr.max} aralığında olmalı.`)
    checkSkill('long_dist',  long_dist)
    checkSkill('heavy',      heavy)
    checkSkill('fragile',    fragile)
    checkSkill('urgent',     urgent)
    checkSkill('mechanical', mechanical)
  }

  return errors.length === 0 ? { ok: true } : { ok: false, errors }
}

// ─────────────────────────────────────────────────────────────
// replaceField  (internal)
// ─────────────────────────────────────────────────────────────
function replaceField(text, fieldName, newValue) {
  const re = new RegExp(`(^\\s*${fieldName}\\s*:\\s*)(-?\\d+)`, 'gm')
  let count = 0
  const result = text.replace(re, (_, prefix) => { count++; return `${prefix}${newValue}` })
  if (count === 0) throw new Error(`replaceField: "${fieldName}" alanı dosyada bulunamadı.`)
  return result
}

// ─────────────────────────────────────────────────────────────
// write
// ─────────────────────────────────────────────────────────────
export function write(originalText, changes) {
  const validation = validateChanges(changes)
  if (!validation.ok)
    throw new Error(`Geçersiz değerler:\n${validation.errors.join('\n')}`)

  let text = originalText

  if (changes.money !== undefined) text = replaceField(text, 'money_account', changes.money)
  if (changes.xp    !== undefined) text = replaceField(text, 'experience_points', changes.xp)

  if (changes.skills) {
    const s = changes.skills
    if (s.adr        !== undefined) text = replaceField(text, 'adr',        s.adr)
    if (s.long_dist  !== undefined) text = replaceField(text, 'long_dist',  s.long_dist)
    if (s.heavy      !== undefined) text = replaceField(text, 'heavy',      s.heavy)
    if (s.fragile    !== undefined) text = replaceField(text, 'fragile',    s.fragile)
    if (s.urgent     !== undefined) text = replaceField(text, 'urgent',     s.urgent)
    if (s.mechanical !== undefined) text = replaceField(text, 'mechanical', s.mechanical)
  }

  if (changes.unlocks) {
    const u = changes.unlocks
    if (u.cities)  text = discoverAllCities(text)
    if (u.dealers) text = unlockAllDealers(text)
    if (u.garages) text = unlockAllGarages(text)
  }

  return text
}

// ─────────────────────────────────────────────────────────────
// applyPreset
// ─────────────────────────────────────────────────────────────
export function applyPreset(originalText, preset) {
  const presetMap = {
    maxMoney:  { money: PRESETS.maxMoney },
    maxXP:     { xp:    PRESETS.maxXP    },
    maxSkills: { skills: { adr: PRESETS.maxADR, long_dist: PRESETS.maxSkill, heavy: PRESETS.maxSkill, fragile: PRESETS.maxSkill, urgent: PRESETS.maxSkill, mechanical: PRESETS.maxSkill } },
    maxAll:    { money: PRESETS.maxMoney, xp: PRESETS.maxXP, skills: { adr: PRESETS.maxADR, long_dist: PRESETS.maxSkill, heavy: PRESETS.maxSkill, fragile: PRESETS.maxSkill, urgent: PRESETS.maxSkill, mechanical: PRESETS.maxSkill } },
  }
  const changes = presetMap[preset]
  if (!changes) throw new Error(`Bilinmeyen preset: "${preset}"`)
  return write(originalText, changes)
}

// ═════════════════════════════════════════════════════════════
// SAFE BLOCK PARSING HELPERS
//
// Blok sınırları brace-depth SAYACI ile tespit edilir.
// Blok içindeki alanlar SADECE depth=0 seviyesinde değiştirilir.
// ═════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────
// findBlockRange
// ─────────────────────────────────────────────────────────────
function findBlockRange(text, headerRegex, fromIndex = 0) {
  headerRegex.lastIndex = fromIndex
  const m = headerRegex.exec(text)
  if (!m) return null

  const headerStart = m.index
  let i = headerStart + m[0].length

  while (i < text.length && text[i] !== '{') {
    if (text[i] !== ' ' && text[i] !== '\t' && text[i] !== '\r' && text[i] !== '\n')
      return null
    i++
  }
  if (i >= text.length) return null

  let depth = 1
  const bodyStart = i + 1
  i++

  while (i < text.length && depth > 0) {
    const ch = text[i]
    if (ch === '{') depth++
    else if (ch === '}') depth--
    i++
  }

  if (depth !== 0) return null

  const bodyEnd  = i - 1
  const blockEnd = i

  return {
    headerStart,
    bodyStart,
    bodyEnd,
    blockEnd,
    body: text.slice(bodyStart, bodyEnd),
    matchedRef: m[1],
  }
}

// ─────────────────────────────────────────────────────────────
// replaceTopLevelField
//
// Blok body'si içinde SADECE depth=0 seviyesindeki
// `fieldName: <sayı>` alanını transformFn ile değiştirir.
// Nested struct'lara dokunmaz.
// ─────────────────────────────────────────────────────────────
function replaceTopLevelField(body, fieldName, transformFn) {
  const lines   = body.split('\n')
  const fieldRe = new RegExp(`^(\\s*${fieldName}\\s*:\\s*)(-?\\d+)\\s*$`)

  let depth = 0
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (depth === 0) {
      const m = line.match(fieldRe)
      if (m) {
        const newVal = transformFn(parseInt(m[2], 10))
        lines[i] = m[1] + newVal
      }
    }

    for (const ch of line) {
      if (ch === '{') depth++
      else if (ch === '}') depth--
    }
  }

  return lines.join('\n')
}

// ─────────────────────────────────────────────────────────────
// setCountAndSlots
//
// Garage body'sinde vehicles / drivers gibi count+slot yapısını
// targetCount'a yükseltir.
//
// Gerçek format (doğrulanmış save örneğinden):
//   vehicles: 5
//   vehicles[0]: _nameless.xxx   ← gerçek araç pointer
//   vehicles[1]: null            ← boş slot
//   ...
//
// Kurallar:
//   - count < target  → count artır, eksik slotları null ile ekle
//   - count >= target → sadece count güncelle, mevcut slotlara dokunma
//   - mevcut pointer'lar (null olmayan) korunur
//   - ASLA mevcut satırları silme
// ─────────────────────────────────────────────────────────────
function setCountAndSlots(body, fieldName, targetCount) {
  const lines    = body.split('\n')
  const headerRe = new RegExp(`^(\\s*${fieldName}\\s*:\\s*)(\\d+)\\s*$`)
  const slotRe   = new RegExp(`^\\s*${fieldName}\\[\\d+\\]\\s*:`)

  // Header satırını bul (depth=0 garantisi için basit arama yeterli,
  // garage body'si düz yapıda)
  let headerIdx = -1
  let indent    = ' '
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(headerRe)
    if (m) {
      headerIdx = i
      indent    = m[1].match(/^\s*/)[0]
      break
    }
  }
  if (headerIdx === -1) return body  // field yok, dokunma

  const currentCount = parseInt(lines[headerIdx].match(headerRe)[2], 10)

  // Count'u güncelle
  lines[headerIdx] = lines[headerIdx].replace(headerRe, `$1${targetCount}`)

  if (currentCount >= targetCount) {
    // Zaten yeterli slot var — sadece count güncellendi, slotlara dokunma
    return lines.join('\n')
  }

  // Mevcut son slot satırının index'ini bul
  let lastSlotIdx = headerIdx
  for (let i = headerIdx + 1; i < lines.length; i++) {
    if (slotRe.test(lines[i])) {
      lastSlotIdx = i
    } else if (lines[i].trim() !== '') {
      break  // slot bloğu bitti
    }
  }

  // Eksik slotları null olarak ekle
  const newSlots = []
  for (let j = currentCount; j < targetCount; j++) {
    newSlots.push(`${indent}${fieldName}[${j}]: null`)
  }
  lines.splice(lastSlotIdx + 1, 0, ...newSlots)

  return lines.join('\n')
}

// ─────────────────────────────────────────────────────────────
// GARAGE_UNLOCK
//
// Doğrulanmış değerler (gerçek save örneğinden):
//   status: 3   → büyük garaj (large garage, max)
//   vehicles: 5 → 5 araç slotu
//   drivers: 5  → 5 sürücü slotu
//
// Locked garage örneği:
//   vehicles: 0, drivers: 0, status: 0
//
// Unlocked garage örneği (oyundan alınan gerçek veri):
//   vehicles: 5
//   vehicles[0]: _nameless.xxx
//   vehicles[1]: null
//   ...
//   drivers: 5
//   drivers[0]: driver.133
//   drivers[1]: null
//   ...
//   status: 3
// ─────────────────────────────────────────────────────────────
const GARAGE_UNLOCK = {
  status:   3,
  vehicles: 5,
  drivers:  5,
}

// ─────────────────────────────────────────────────────────────
// unlockAllGarages
//
// Tüm `garage : garage.<city> { ... }` bloklarını bulur (HQ hariç)
// ve büyük garaja yükseltir:
//   - status   → 3
//   - vehicles → 5 (eksik slotlar null ile doldurulur)
//   - drivers  → 5 (eksik slotlar null ile doldurulur)
//
// trailers / profit_log / productivity → DOKUNULMAZ
// ─────────────────────────────────────────────────────────────
export function unlockAllGarages(text) {
  const headerRe = /\bgarage\s*:\s*garage\.(\w+)\s*/g

  let result     = text
  let searchFrom = 0
  let count      = 0
  let skipped    = 0

  while (true) {
    const block = findBlockRange(result, headerRe, searchFrom)
    if (!block) break

    const cityName = block.matchedRef

    // HQ garajını atla
    if (/hq/i.test(cityName)) {
      skipped++
      searchFrom = block.blockEnd
      continue
    }

    let newBody = block.body
    newBody = setCountAndSlots(newBody,     'vehicles', GARAGE_UNLOCK.vehicles)
    newBody = setCountAndSlots(newBody,     'drivers',  GARAGE_UNLOCK.drivers)
    newBody = replaceTopLevelField(newBody, 'status',   () => GARAGE_UNLOCK.status)

    result =
      result.slice(0, block.bodyStart) +
      newBody +
      result.slice(block.bodyEnd)

    searchFrom = block.bodyStart + newBody.length + 1
    count++
  }

  console.log(`[unlockAllGarages] ${count} garage güncellendi, ${skipped} HQ atlandı.`)
  if (count === 0)
    console.warn('[unlockAllGarages] Hiç garage bloğu bulunamadı. Dosya değiştirilmedi.')

  return result
}

// ─────────────────────────────────────────────────────────────
// discoverAllCities
//
// companies[] listesinden şehir isimlerini toplar ve:
//   1) visited_cities[] listesini yeniden yazar
//   2) visited_cities_count[] listesini yeniden yazar
//   3) company bloklarında discovered: false → true yapar
// ─────────────────────────────────────────────────────────────
export function discoverAllCities(text) {
  const cities = new Set()

  for (const m of text.matchAll(/\bcompanies\[\d+\]\s*:\s*company\.\w+\.\w+\.(\w+)/g))
    cities.add(m[1])

  console.log(`[discoverAllCities] ${cities.size} şehir bulundu:`, [...cities].sort())

  if (cities.size === 0) {
    console.warn('[discoverAllCities] Şehir bulunamadı. Dosya değiştirilmedi.')
    return text
  }

  const list = [...cities].sort()
  let result = text

  // 1) visited_cities[]
  if (/^\s*visited_cities\s*:\s*\d+/m.test(result)) {
    result = result.replace(/^[^\S\n]*visited_cities\[\d+\][^\n]*\n/gm, '')
    const newLines = list.map((c, i) => ` visited_cities[${i}]: ${c}`).join('\n')
    result = result.replace(
      /^([^\S\n]*visited_cities\s*:\s*)\d+/m,
      (_, prefix) => `${prefix}${list.length}\n${newLines}`
    )
    console.log(`[discoverAllCities] visited_cities → ${list.length}`)
  } else {
    console.warn('[discoverAllCities] visited_cities alanı bulunamadı, atlandı.')
  }

  // 2) visited_cities_count[]
  if (/^\s*visited_cities_count\s*:\s*\d+/m.test(result)) {
    result = result.replace(/^[^\S\n]*visited_cities_count\[\d+\][^\n]*\n/gm, '')
    const newCountLines = list.map((_, i) => ` visited_cities_count[${i}]: 1`).join('\n')
    result = result.replace(
      /^([^\S\n]*visited_cities_count\s*:\s*)\d+/m,
      (_, prefix) => `${prefix}${list.length}\n${newCountLines}`
    )
    console.log(`[discoverAllCities] visited_cities_count → ${list.length}`)
  } else {
    console.warn('[discoverAllCities] visited_cities_count alanı bulunamadı, atlandı.')
  }

  // 3) company bloklarında discovered: true
  let discoveredCount = 0
  result = result.replace(
    /(\bcompany\s*:\s*company\.\w+\.\w+\.(\w+)\s*\{[^}]*?\bdiscovered\s*:\s*)(true|false)/gs,
    (fullMatch, prefix, city, _oldVal) => {
      if (!cities.has(city)) return fullMatch
      discoveredCount++
      return `${prefix}true`
    }
  )
  console.log(`[discoverAllCities] ${discoveredCount} company bloğunda discovered: true yapıldı.`)

  return result
}

// ─────────────────────────────────────────────────────────────
// unlockAllDealers
//
// companies[] listesinden şehirleri toplar ve
// unlocked_dealers[] listesini yeniden yazar.
// ─────────────────────────────────────────────────────────────
export function unlockAllDealers(text) {
  const cities = new Set()

  for (const m of text.matchAll(/\bcompanies\[\d+\]\s*:\s*company\.\w+\.\w+\.(\w+)/g))
    cities.add(m[1])

  console.log(`[unlockAllDealers] ${cities.size} şehir bulundu:`, [...cities].sort())

  if (cities.size === 0) {
    console.warn('[unlockAllDealers] Şehir bulunamadı. Dosya değiştirilmedi.')
    return text
  }

  const list = [...cities].sort()

  if (!/^\s*unlocked_dealers\s*:\s*\d+/m.test(text)) {
    console.warn('[unlockAllDealers] unlocked_dealers alanı bulunamadı. Dosya değiştirilmedi.')
    return text
  }

  let result = text.replace(/^[^\S\n]*unlocked_dealers\[\d+\][^\n]*\n/gm, '')

  const newLines = list.map((c, i) => ` unlocked_dealers[${i}]: ${c}`).join('\n')
  result = result.replace(
    /^([^\S\n]*unlocked_dealers\s*:\s*)\d+/m,
    (_, prefix) => `${prefix}${list.length}\n${newLines}`
  )

  console.log(`[unlockAllDealers] unlocked_dealers → ${list.length}`)
  return result
}

// ─────────────────────────────────────────────────────────────
// unlockEverything
// ─────────────────────────────────────────────────────────────
export function unlockEverything(text) {
  console.log('[unlockEverything] Başlıyor...')
  let result = text
  result = unlockAllGarages(result)
  result = discoverAllCities(result)
  result = unlockAllDealers(result)
  console.log('[unlockEverything] Tamamlandı.')
  return result
}