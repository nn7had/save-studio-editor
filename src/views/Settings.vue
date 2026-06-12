<template>
  <div class="settings">
    <div class="page-header">
      <h1 class="page-title">{{ t.settings_title }}</h1>
      <p class="page-sub">{{ t.settings_sub }}</p>
    </div>

    <!-- Dil Seçimi -->
    <div class="card setting-card">
      <div class="setting-row">
        <div class="setting-info">
          <span class="setting-label">{{ t.lang_title }}</span>
          <span class="setting-desc">{{ t.lang_sub }}</span>
        </div>
        <div class="lang-btns">
          <button
            v-for="l in langs"
            :key="l.code"
            class="lang-btn"
            :class="{ active: ui.lang === l.code }"
            @click="ui.setLang(l.code)"
          >
            {{ l.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Tema Seçimi -->
    <div class="card setting-card">
      <div class="setting-row">
        <div class="setting-info">
          <span class="setting-label">{{ t.theme_title }}</span>
          <span class="setting-desc">{{ t.theme_sub }}</span>
        </div>
        <div class="theme-btns">
          <button
            class="theme-btn"
            :class="{ active: ui.theme === 'light' }"
            @click="ui.setTheme('light')"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
            {{ t.theme_light }}
          </button>
          <button
            class="theme-btn"
            :class="{ active: ui.theme === 'dark' }"
            @click="ui.setTheme('dark')"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
            {{ t.theme_dark }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUiStore } from '../stores/uiStore'

const ui = useUiStore()
const t  = computed(() => ui.t)

const langs = [
  { code: 'tr', label: 'TR' },
  { code: 'en', label: 'EN' },
  { code: 'de', label: 'DE' },
  { code: 'ru', label: 'RU' },
]
</script>

<style scoped>
.settings { max-width: 580px; }

.page-header { margin-bottom: 28px; }
.page-title  { font-size: 32px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.5px; line-height: 1.1; }
.page-sub    { font-size: 13.5px; color: var(--text-muted); margin-top: 5px; font-weight: 400; }

.card {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: 18px; padding: 20px 24px;
  box-shadow: var(--shadow); margin-bottom: 14px;
}

.setting-card { }
.setting-row  {
  display: flex; align-items: center;
  justify-content: space-between; gap: 20px;
}
.setting-info { display: flex; flex-direction: column; gap: 3px; }
.setting-label { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.setting-desc  { font-size: 12.5px; color: var(--text-muted); }

/* Dil butonları */
.lang-btns {
  display: flex; gap: 6px; flex-shrink: 0;
}
.lang-btn {
  padding: 7px 14px;
  background: var(--bg-subtle); border: 1.5px solid var(--border);
  border-radius: 8px; font-size: 12.5px; font-weight: 600;
  color: var(--text-secondary); cursor: pointer;
  font-family: inherit;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}
.lang-btn:hover { background: var(--bg-hover); color: var(--text-primary); }
.lang-btn.active {
  background: var(--btn-primary);
  border-color: var(--btn-primary);
  color: var(--bg-card);
}

/* Tema butonları */
.theme-btns {
  display: flex; gap: 6px; flex-shrink: 0;
}
.theme-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 14px;
  background: var(--bg-subtle); border: 1.5px solid var(--border);
  border-radius: 8px; font-size: 12.5px; font-weight: 600;
  color: var(--text-secondary); cursor: pointer;
  font-family: inherit;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}
.theme-btn:hover { background: var(--bg-hover); color: var(--text-primary); }
.theme-btn.active {
  background: var(--btn-primary);
  border-color: var(--btn-primary);
  color: var(--bg-card);
}
</style>