<template>
  <div class="picker">
    <div v-if="error" class="banner error">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      {{ error }}
      <button class="banner-close" @click="error = null">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>

    <div class="picker-card">
      <div class="picker-field">
        <div class="field-icon">
          <img :src="profileIconUrl" alt="Profil" class="field-icon-img" />
        </div>
        <div class="field-body">
          <span class="field-label">{{ t.profile }}</span>
          <div class="select-wrapper">
            <select
              class="select"
              v-model="store.selectedProfileId"
              :disabled="store.profileList.length === 0 || loadingProfiles"
              @change="onProfileChange"
            >
              <option value="" disabled>
                {{ loadingProfiles ? t.loading : t.select_profile }}
              </option>
              <option v-for="p in store.profileList" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
            <svg class="select-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>
      </div>

      <div class="picker-divider"></div>

      <div class="picker-field">
        <div class="field-icon">
          <img :src="saveIconUrl" alt="Save" class="field-icon-img" />
        </div>
        <div class="field-body">
          <span class="field-label">{{ t.save }}</span>
          <div class="select-wrapper">
            <select
              class="select"
              v-model="store.selectedSaveId"
              :disabled="store.saveList.length === 0 || loadingSaves"
              @change="onSaveChange"
            >
              <option value="" disabled>
                {{ loadingSaves ? t.loading : store.saveList.length === 0 ? t.select_profile_first : t.select_save }}
              </option>
              <option v-for="s in store.saveList" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
            <svg class="select-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>
      </div>

      <div v-if="loading" class="loading-indicator">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
      </div>

      <button v-if="showSave !== false" class="btn-kaydet" :disabled="store.loading || !store.isDirty" @click="handleSave">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
          <polyline points="17 21 17 13 7 13 7 21"/>
          <polyline points="7 3 7 8 15 8"/>
        </svg>
        {{ store.loading ? t.saving : t.save_btn }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useSaveStore } from '../stores/saveStore'
import { useUiStore }   from '../stores/uiStore'

// Sadece dışarıdan gelen showSave görünürlük ayarını yakalamak için eklendi
defineProps({
  showSave: {
    type: Boolean,
    default: true
  }
})

const store = useSaveStore()

// storeToRefs ile t reaktif olarak store'a bağlanır;
// dil değiştiğinde template anında güncellenir.
const uiStore = useUiStore()
const { t } = storeToRefs(uiStore)

const profileIconUrl = new URL('../assets/ui/profile.svg', import.meta.url).href
const saveIconUrl    = new URL('../assets/ui/save.svg',    import.meta.url).href

const loadingProfiles = ref(false)
const loadingSaves    = ref(false)
const loading         = ref(false)
const error           = ref(null)

const selectedSavePath = computed(() =>
  store.saveList.find(s => s.id === store.selectedSaveId)?.gameSiiPath ?? null
)

async function loadProfiles() {
  if (store.profileList.length > 0) return
  loadingProfiles.value = true
  error.value = null
  try {
    const res = await window.profileAPI.listProfiles()
    if (!res.success) { error.value = res.error.message; return }
    store.profileList = res.data
    if (store.profileList.length === 1) {
      store.selectedProfileId = store.profileList[0].id
      await loadSaves(store.profileList[0].path)
    }
  } finally { loadingProfiles.value = false }
}

async function onProfileChange() {
  store.selectedSaveId = ''
  store.saveList = []
  const profile = store.profileList.find(p => p.id === store.selectedProfileId)
  if (profile) await loadSaves(profile.path)
}

async function loadSaves(profilePath) {
  loadingSaves.value = true
  error.value = null
  try {
    const res = await window.profileAPI.listSaves(profilePath)
    if (!res.success) { error.value = res.error.message; return }
    store.saveList = res.data
    if (store.saveList.length === 1) {
      store.selectedSaveId = store.saveList[0].id
      await handleOpen()
    }
  } finally { loadingSaves.value = false }
}

async function onSaveChange() {
  if (selectedSavePath.value) await handleOpen()
}

async function handleOpen() {
  if (!selectedSavePath.value) return
  loading.value = true
  error.value   = null
  try {
    const res = await window.profileAPI.openSave(selectedSavePath.value)
    if (!res.success) { error.value = res.error.message; return }
    store._applyDataPublic({
      filePath:      res.data._file.path,
      rawText:       res.data._rawText,
      money:         res.data.money,
      xp:            res.data.xp,
      level:         res.data.level,
      levelProgress: res.data.levelProgress,
      xpToNext:      res.data.xpToNext,
      skills:        res.data.skills,
    })
  } finally { loading.value = false }
}

async function handleSave() { await store.saveFileWithUnlocks() }

onMounted(loadProfiles)
</script>

<style scoped>
.picker { margin-bottom: 24px; }

.picker-card {
  display: flex; align-items: center;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px; padding: 16px 20px;
  box-shadow: var(--shadow);
}

.picker-field { display: flex; align-items: center; gap: 12px; flex: 1; }

.picker-divider {
  width: 1px; height: 40px;
  background: var(--border);
  margin: 0 20px; flex-shrink: 0;
}

.field-icon {
  width: 36px; height: 36px;
  background: var(--bg-subtle);
  border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.field-icon-img {
  width: 18px; height: 18px;
  display: block; object-fit: contain;
}
[data-theme="dark"] .field-icon-img { filter: brightness(0) invert(1); }

.field-body { display: flex; flex-direction: column; gap: 3px; flex: 1; }
.field-label {
  font-size: 11px; font-weight: 600;
  color: var(--text-muted);
  letter-spacing: 0.04em; text-transform: uppercase;
}

.select-wrapper { position: relative; display: flex; align-items: center; }
.select {
  appearance: none; background: transparent; border: none;
  color: var(--text-primary); padding: 0 22px 0 0;
  font-size: 14px; font-family: inherit; font-weight: 600;
  outline: none; cursor: pointer; width: 100%;
}
.select:disabled { opacity: 0.4; cursor: not-allowed; }
.select-chevron { position: absolute; right: 0; color: var(--text-muted); pointer-events: none; }

.loading-indicator { display: flex; align-items: center; margin: 0 12px; }
.loading-indicator svg { animation: spin 0.9s linear infinite; color: var(--text-secondary); }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.btn-kaydet {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 28px;
  background: var(--btn-primary);
  color: var(--bg-app);
  font-size: 14px; font-weight: 600;
  font-family: inherit; border: none;
  border-radius: 12px; cursor: pointer;
  flex-shrink: 0; margin-left: 20px;
  transition: background 0.15s, transform 0.15s, opacity 0.15s;
}
.btn-kaydet:hover:not(:disabled) { background: var(--btn-primary-hover); transform: translateY(-1px); }
.btn-kaydet:active:not(:disabled) { transform: scale(0.97); }
.btn-kaydet:disabled { opacity: 0.45; cursor: not-allowed; }

.banner {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 14px; border-radius: 10px;
  margin-bottom: 12px; font-size: 13px;
  background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c;
}
.banner-close {
  margin-left: auto; background: none; border: none;
  color: inherit; cursor: pointer; display: flex;
  align-items: center; opacity: 0.6; transition: opacity 0.15s;
}
.banner-close:hover { opacity: 1; }
</style>