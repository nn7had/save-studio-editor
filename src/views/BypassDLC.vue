<template>
  <div class="bypass-page">

    <!-- Header -->
    <div class="page-header">
      <div class="header-text">
        <h1 class="page-title">{{ t.dlc_title }}</h1>
        <p class="page-sub">{{ t.dlc_desc }}</p>
      </div>
    </div>

    <!-- Profile Picker (sadece profil seçimi yeterli — save gerekmez) -->
    <ProfilePicker :showSave="false" />

    <!-- Action Card -->
    <div class="action-card">

      <!-- Result Banner -->
      <transition name="fade">
        <div v-if="dlcStore.result" class="result-banner"
             :class="dlcStore.result.type">
          <svg v-if="dlcStore.result.type === 'success'" width="15" height="15"
               viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
               stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>
            {{ dlcStore.result.type === 'success' ? t.dlc_success : t.dlc_error }}
          </span>
          <button class="banner-close" @click="dlcStore.clearResult()">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </transition>

      <!-- Bypass Button -->
      <button
        class="btn-bypass"
        :disabled="!selectedProfilePath || dlcStore.loading"
        @click="handleBypass"
      >
        <svg v-if="dlcStore.loading" class="spin" width="16" height="16"
             viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2.5" stroke-linecap="round">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2.3" stroke-linecap="round"
             stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
        </svg>
        {{ dlcStore.loading ? 'İşleniyor…' : t.btn_bypass }}
      </button>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useSaveStore } from '../stores/saveStore'
import { useDlcStore }  from '../stores/dlcStore'
import { useUiStore }   from '../stores/uiStore'
import ProfilePicker    from '../components/ProfilePicker.vue'

const saveStore = useSaveStore()
const dlcStore  = useDlcStore()
const ui        = useUiStore()
const t         = computed(() => ui.t)

// Seçili profilin disk yolu (listProfiles'tan gelen path)
const selectedProfilePath = computed(() => {
  const profile = saveStore.profileList.find(p => p.id === saveStore.selectedProfileId)
  return profile?.path ?? null
})

async function handleBypass() {
  if (!selectedProfilePath.value) return
  await dlcStore.bypassDLCs(selectedProfilePath.value)
}
</script>

<style scoped>
.bypass-page {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* ── Header ─────────────────────────────────────────────── */
.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
}

.header-text { display: flex; flex-direction: column; gap: 4px; }

.page-title { 
  font-size: 32px; 
  font-weight: 700; 
  color: var(--text-primary); 
  letter-spacing: -0.5px; 
  line-height: 1.1; 
}

.page-sub { 
  font-size: 13.5px; 
  color: var(--text-muted); 
  margin-top: 5px; 
  font-weight: 400; 
}

/* ── Action Card ────────────────────────────────────────── */
.action-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 24px 28px;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-top: 8px;
}

/* Target row */
.target-row {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.target-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  flex-shrink: 0;
}

.target-value {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  word-break: break-all;
  font-family: 'Cascadia Code', 'Consolas', monospace;
}

.target-value.muted {
  color: var(--text-muted);
  font-family: inherit;
  font-weight: 400;
  font-style: italic;
}

.card-divider {
  height: 1px;
  background: var(--border);
  margin: 0 -28px;
}

/* Info note */
.info-note {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  font-size: 12.5px;
  color: var(--text-secondary);
  line-height: 1.55;
  background: var(--bg-subtle);
  border-radius: 10px;
  padding: 12px 14px;
}

.info-note svg { flex-shrink: 0; margin-top: 1px; }

.info-note code {
  font-family: 'Cascadia Code', 'Consolas', monospace;
  font-size: 12px;
  background: var(--bg-hover);
  padding: 1px 5px;
  border-radius: 4px;
  color: var(--text-primary);
}

/* Result banner */
.result-banner {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 11px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
}

.result-banner.success {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #15803d;
}

.result-banner.error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
}

[data-theme="dark"] .result-banner.success {
  background: #052e16;
  border-color: #166534;
  color: #86efac;
}

[data-theme="dark"] .result-banner.error {
  background: #2d0a0a;
  border-color: #7f1d1d;
  color: #fca5a5;
}

.banner-close {
  margin-left: auto;
  background: none; border: none;
  color: inherit; cursor: pointer;
  display: flex; align-items: center;
  opacity: 0.55; transition: opacity 0.15s;
  flex-shrink: 0;
}
.banner-close:hover { opacity: 1; }

/* Bypass Button */
.btn-bypass {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 13px 32px;
  background: var(--btn-primary);
  color: var(--bg-app);
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  align-self: flex-start;
  transition: background 0.15s, transform 0.15s, opacity 0.15s;
}

.btn-bypass:hover:not(:disabled) {
  background: var(--btn-primary-hover);
  transform: translateY(-1px);
}

.btn-bypass:active:not(:disabled) {
  transform: scale(0.97);
}

.btn-bypass:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Spinner */
.spin {
  animation: spin 0.85s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

/* Transition */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fade-enter-from  { opacity: 0; transform: translateY(-6px); }
.fade-leave-to    { opacity: 0; transform: translateY(-4px); }
</style>