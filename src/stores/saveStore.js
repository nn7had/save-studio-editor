import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSaveStore = defineStore('save', () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const filePath      = ref(null)
  const rawText       = ref(null)
  const loading       = ref(false)
  const error         = ref(null)
  const saveMsg       = ref(null)
  const isDirty       = ref(false)

  const money         = ref(0)
  const xp            = ref(0)
  const level         = ref(1)
  const levelProgress = ref(0)
  const xpToNext      = ref(0)

  const skills = ref({
    adr: 0, long_dist: 0, heavy: 0, fragile: 0, urgent: 0, mechanical: 0,
  })

  // ── YENİ: fileInfo — re-encrypt için wasEncrypted + originalIv ─────────────
  // _file objesinden gelir, tüm IPC çağrılarına iletilir.
  const fileInfo = ref(null)   // { wasEncrypted: bool, originalIv: string|null, format: string }

  // Profil / Save seçim state
  const selectedProfileId = ref('')
  const selectedSaveId    = ref('')
  const profileList       = ref([])
  const saveList          = ref([])

  // ── YENİ: Toplu Unlock Checkbox State ───────────────────────────────────────
  // Editor ekranındaki "City Unlock / Dealer Unlock / Garage Upgrade"
  // checkbox'larının seçili durumunu tutar. "Kaydet" butonuna basıldığında
  // bu bayraklara göre game.sii üzerinde ilgili işlemler uygulanır.
  const unlockOptions = ref({
    cities:  false,  // Tüm şehirleri keşfet (City Unlock)
    dealers: false,  // Tüm truck dealer galerilerini aç (Dealer Unlock)
    garages: false,  // Sahip olunan tüm garajları büyük garaja yükselt (Garage Upgrade)
  })

  // ── Computed ───────────────────────────────────────────────────────────────
  const isLoaded = computed(() => filePath.value !== null)
  const fileName = computed(() =>
    filePath.value ? filePath.value.split(/[\\/]/).pop() : null
  )
  const adrFlags = computed(() => {
    const v = skills.value.adr
    return Array.from({ length: 6 }, (_, i) => !!(v & (1 << i)))
  })

  // ── Internal ───────────────────────────────────────────────────────────────
  function _applyData(data) {
    filePath.value      = data._file?.path ?? data.filePath
    rawText.value       = data._rawText    ?? data.rawText
    money.value         = data.money
    xp.value            = data.xp
    level.value         = data.level
    levelProgress.value = data.levelProgress
    xpToNext.value      = data.xpToNext
    skills.value        = { ...data.skills }
    isDirty.value       = false
    error.value         = null

    // YENİ: fileInfo'yu sakla — re-encrypt için kritik
    if (data._file) {
      fileInfo.value = {
        wasEncrypted: data._file.wasEncrypted ?? false,
        originalIv:   data._file.originalIv   ?? null,
        format:       data._file.format        ?? 'text',
      }
    }
  }

  function _setSuccess(text) {
    saveMsg.value = { type: 'ok', text }
    setTimeout(() => { saveMsg.value = null }, 3000)
  }

  function _setError(e) {
    error.value = typeof e === 'string' ? { code: 'ERR_UNKNOWN', message: e } : e
  }

  // ── saveFile ───────────────────────────────────────────────────────────────
  async function saveFile() {
    if (!isLoaded.value) return
    loading.value = true
    saveMsg.value = null
    try {
      const changes = {
        money:  money.value,
        xp:     xp.value,
        skills: JSON.parse(JSON.stringify(skills.value)),
      }
      // YENİ: fileInfo eklendi
      const res = await window.saveAPI.write(
        filePath.value,
        rawText.value,
        changes,
        fileInfo.value          // ← re-encrypt için
      )
      if (!res.success) {
        saveMsg.value = { type: 'error', text: res.error.message }
        return false
      }
      isDirty.value = false
      _setSuccess('Kaydedildi ✓')
      return true
    } finally {
      loading.value = false
    }
  }

  // ── Hızlı setler ──────────────────────────────────────────────────────────
  function setMaxMoney() { money.value = 999_999_999; isDirty.value = true }
  function setMaxXP()    { xp.value    = 13_368_000;  isDirty.value = true }
  function setMaxAll() {
    setMaxMoney(); setMaxXP()
    skills.value = { adr: 63, long_dist: 6, heavy: 6, fragile: 6, urgent: 6, mechanical: 6 }
    isDirty.value = true
  }
  function setAdrFlag(bit, val) {
    const cur = skills.value.adr
    skills.value.adr = val ? (cur | (1 << bit)) : (cur & ~(1 << bit))
    isDirty.value = true
  }
  function markDirty() { isDirty.value = true }

  // ── YENİ: Unlock checkbox toggle ────────────────────────────────────────────
  function setUnlockOption(key, val) {
    if (!(key in unlockOptions.value)) return
    unlockOptions.value[key] = val
    isDirty.value = true
  }

  // ── unlockSetting (tekil) ─────────────────────────────────────────────────
  async function unlockSetting(setting) {
    if (!isLoaded.value) return
    loading.value = true
    saveMsg.value = null
    error.value   = null

    try {
      // YENİ: fileInfo eklendi
      const res = await window.unlockAPI.unlock(
        filePath.value,
        rawText.value,
        setting,
        fileInfo.value          // ← re-encrypt için
      )
      if (!res.success) { _setError(res.error); return false }

      rawText.value = res.data._rawText
      _setSuccess(_unlockSuccessMsg(setting))
      return true
    } catch (e) {
      _setError({ code: 'ERR_UNLOCK', message: e.message })
      return false
    } finally {
      loading.value = false
    }
  }

  // ── unlockAll (toplu) ─────────────────────────────────────────────────────
  async function unlockAll() {
    if (!isLoaded.value) return
    loading.value = true
    saveMsg.value = null
    error.value   = null

    try {
      // YENİ: fileInfo eklendi
      const res = await window.unlockAPI.unlockAll(
        filePath.value,
        rawText.value,
        fileInfo.value          // ← re-encrypt için
      )
      if (!res.success) { _setError(res.error); return false }

      rawText.value = res.data._rawText
      _setSuccess('Tüm garajlar, şehirler ve galeriler açıldı ✓')
      return true
    } catch (e) {
      _setError({ code: 'ERR_UNLOCK_ALL', message: e.message })
      return false
    } finally {
      loading.value = false
    }
  }

  // ── YENİ: applySelectedUnlocks ──────────────────────────────────────────────
  // Editor ekranındaki checkbox seçimlerine ("City Unlock", "Dealer Unlock",
  // "Garage Upgrade") göre, seçili olan unlock işlemlerini sırayla uygular.
  //
  // Mevcut `unlockSetting()` action'ı tek bir IPC round-trip ile bir seçeneği
  // işler ve rawText'i günceller. Burada checkbox'lara göre seçilenleri
  // sırayla `unlockSetting()` ile çalıştırıyoruz — böylece yeni bir IPC
  // kanalı açmaya gerek kalmaz, mevcut 'save:unlock' handler'ı reuse edilir.
  //
  // Hiçbir checkbox seçili değilse hiçbir şey yapmaz ve true döner.
  async function applySelectedUnlocks() {
    if (!isLoaded.value) return false

    const opts = unlockOptions.value
    const selected = []
    if (opts.cities)  selected.push('cities')
    if (opts.dealers) selected.push('dealers')
    if (opts.garages) selected.push('garages')

    if (selected.length === 0) return true

    loading.value = true
    saveMsg.value = null
    error.value   = null

    try {
      for (const setting of selected) {
        const res = await window.unlockAPI.unlock(
          filePath.value,
          rawText.value,
          setting,
          fileInfo.value
        )
        if (!res.success) { _setError(res.error); return false }
        rawText.value = res.data._rawText
      }

      _setSuccess(_selectedUnlocksSuccessMsg(selected))
      return true
    } catch (e) {
      _setError({ code: 'ERR_UNLOCK_SELECTED', message: e.message })
      return false
    } finally {
      loading.value = false
    }
  }

  // ── saveFileWithUnlocks ─────────────────────────────────────────────────────
  // "Kaydet" butonuna basıldığında: önce normal alan değişikliklerini
  // (money/xp/skills) kaydeder, ardından seçili unlock checkbox'larını uygular.
  // Mevcut saveFile() ve applySelectedUnlocks() akışlarını sırayla çalıştırır,
  // böylece tek tıkla hem stat değişiklikleri hem de unlock işlemleri
  // game.sii üzerine yazılır.
  async function saveFileWithUnlocks() {
    if (!isLoaded.value) return false

    const statsOk = await saveFile()
    if (!statsOk) return false

    const unlocksOk = await applySelectedUnlocks()
    return unlocksOk
  }

  function _unlockSuccessMsg(setting) {
    if (setting === 'garages') return 'Tüm garajlar açıldı ✓'
    if (setting === 'cities')  return 'Tüm şehirler keşfedildi ✓'
    if (setting === 'dealers') return 'Tüm galeriler açıldı ✓'
    return 'İşlem tamamlandı ✓'
  }

  // ── YENİ: Seçili unlock işlemleri için başarı mesajı ────────────────────────
  function _selectedUnlocksSuccessMsg(selected) {
    const labels = {
      cities:  'Şehirler',
      dealers: 'Galeriler',
      garages: 'Garajlar',
    }
    const names = selected.map((s) => labels[s]).join(', ')
    return `${names} güncellendi ✓`
  }

  return {
    // State
    filePath, rawText, loading, error, saveMsg, isDirty,
    money, xp, level, levelProgress, xpToNext, skills,
    fileInfo,   // YENİ — dışarıdan okunabilir (debug için)
    unlockOptions, // YENİ — checkbox state
    // Computed
    isLoaded, fileName, adrFlags,
    // Profil/save seçim
    selectedProfileId, selectedSaveId, profileList, saveList,
    // Actions
    saveFile,
    setMaxMoney, setMaxXP, setMaxAll, setAdrFlag, markDirty,
    unlockSetting,
    unlockAll,
    setUnlockOption,        // YENİ
    applySelectedUnlocks,   // YENİ
    saveFileWithUnlocks,    // YENİ
    _applyDataPublic: _applyData,
  }
})