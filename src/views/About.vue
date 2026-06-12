<template>
  <div class="about">
    <div class="page-header">
      <h1 class="page-title">{{ t.about_title }}</h1>
      <p class="page-sub">{{ t.about_sub }}</p>
    </div>

    <div class="card app-card">
      <div class="app-header">
        <div class="app-logo-wrap">
          <img :src="logoUrl" alt="Save Studio" class="app-logo-img" />
        </div>
        <div class="app-meta">
          <h2 class="app-name"> Save Studio Editor</h2>
        </div>
      </div>
      <p class="app-desc">{{ t.about_desc }}</p>

      <div class="link-row">
        <button
          v-for="link in links"
          :key="link.label"
          @click="openExternal(link.url)"
          class="link-btn"
        >
          <span class="link-icon">
            <img :src="link.icon" :alt="link.label" class="social-icon-img" />
          </span>
          <span>{{ link.label }}</span>
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUiStore } from '../stores/uiStore'

const ui = useUiStore()
const t  = computed(() => ui.t)

const logoUrl = new URL('../assets/logo.png', import.meta.url).href

// Harici tarayıcıda açma fonksiyonu
function openExternal(url) {
  if (window.electronAPI && window.electronAPI.openExternal) {
    window.electronAPI.openExternal(url)
  } else {
    window.open(url, '_blank')
  }
}

// Klasöre eklediğin SVG'leri tam yollarıyla buraya bağlıyoruz:
const links = [
  {
    label: 'Discord',
    url: 'https://discord.gg/f7yFaC4KGH',
    icon: new URL('../assets/ui/discord.svg', import.meta.url).href
  },
  {
    label: 'GitHub',
    url: 'https://github.com/nn7had',
    icon: new URL('../assets/ui/github.svg', import.meta.url).href
  },
  {
    label: 'YouTube',
    url: 'https://www.youtube.com/@DizelWorksTM',
    icon: new URL('../assets/ui/youtube.svg', import.meta.url).href
  }
]
</script>

<style scoped>
.about { max-width: 580px; }

/* Header */
.page-header { margin-bottom: 28px; }
.page-title  { font-size: 32px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.5px; line-height: 1.1; }
.page-sub    { font-size: 13.5px; color: var(--text-muted); margin-top: 5px; font-weight: 400; }

/* Card */
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 24px;
  box-shadow: var(--shadow);
  margin-bottom: 16px;
}

/* App card */
.app-card    { display: flex; flex-direction: column; gap: 16px; }
.app-header  { display: flex; align-items: center; gap: 14px; }
.app-logo-wrap {
  width: 52px; height: 52px;
  background: var(--bg-subtle);
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}
.app-logo-img {
  width: 36px; height: 36px;
  object-fit: contain;
}
.app-meta    { display: flex; flex-direction: column; gap: 5px; }
.app-name    { font-size: 16px; font-weight: 700; color: var(--text-primary); line-height: 1.2; }
.app-desc {
  font-size: 13.5px;
  color: var(--text-secondary);
  line-height: 1.7;
  border-top: 1px solid var(--border);
  padding-top: 14px;
}

/* Link butonları */
.link-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  border-top: 1px solid var(--border);
  padding-top: 14px;
}
.link-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: var(--bg-subtle);
  border: 1.5px solid var(--border);
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  text-decoration: none;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, transform 0.15s;
  font-family: inherit;
}
.link-btn:hover {
  background: var(--bg-hover);
  border-color: var(--border-focus);
  transform: translateY(-1px);
}
.link-btn:active { transform: scale(0.97); }

.link-icon {
  display: flex; 
  align-items: center; 
  justify-content: center;
  width: 16px;
  height: 16px;
}

/* Klasörden gelen sosyal medya ikonlarının boyutu */
.social-icon-img {
  width: 16px;
  height: 16px;
  display: block;
  object-fit: contain;
}

/* Dark mod aktif olduğunda klasörden gelen siyah ikonları jilet gibi beyaz yapar */
[data-theme="dark"] .social-icon-img {
  filter: brightness(0) invert(1);
}
</style>