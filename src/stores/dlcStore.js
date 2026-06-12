import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDlcStore = defineStore('dlc', () => {
  // ── State ──────────────────────────────────────────────────
  const loading = ref(false)
  const result  = ref(null)   // { type: 'success' | 'error', message: string } | null

  // ── Actions ────────────────────────────────────────────────
  /**
   * Verilen profil yolu üzerinde DLC bypass işlemini çalıştırır.
   * Electron'un 'profile:bypass-dlc' IPC kanalını tetikler.
   *
   * @param {string} profilePath - Profil klasörünün tam yolu
   */
  async function bypassDLCs(profilePath) {
    loading.value = true
    result.value  = null

    try {
      const res = await window.dlcAPI.bypassDlc(profilePath)

      if (res.success) {
        result.value = { type: 'success', message: res.data?.message ?? 'OK' }
      } else {
        result.value = { type: 'error', message: res.error?.message ?? 'Bilinmeyen hata.' }
      }
    } catch (e) {
      result.value = { type: 'error', message: e.message ?? 'IPC hatası.' }
    } finally {
      loading.value = false
    }
  }

  function clearResult() {
    result.value = null
  }

  return { loading, result, bypassDLCs, clearResult }
})