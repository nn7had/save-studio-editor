<template>
  <aside class="sidebar">
    <div class="logo-area">
      <img :src="logoUrl" alt="Save Studio" class="logo-img" />
    </div>
    <nav class="nav">
      <button
        v-for="item in items"
        :key="item.id"
        class="nav-item"
        :class="{ active: current === item.id }"
        @click="$emit('navigate', item.id)"
      >
        <span class="nav-icon-wrap">
          <img :src="item.iconUrl" :alt="item.label" class="nav-icon-img" />
        </span>
        <span class="nav-label">{{ item.label }}</span>
      </button>
    </nav>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useUiStore } from '../stores/uiStore'

defineProps({ current: String })
defineEmits(['navigate'])

const ui = useUiStore()

const logoUrl = new URL('../assets/logo.png', import.meta.url).href

const iconUrls = {
  editor:     new URL('../assets/ui/edit.svg',      import.meta.url).href,
  settings:   new URL('../assets/ui/settings.svg',  import.meta.url).href,
  about:      new URL('../assets/ui/about.svg',     import.meta.url).href,
  bypass_dlc: new URL('../assets/ui/bypass.svg',    import.meta.url).href,
}

const items = computed(() => {
  const t = ui.t
  return [
    { id: 'editor',     label: t.nav_editor,     iconUrl: iconUrls.editor    },
    { id: 'bypass_dlc', label: t.nav_bypass_dlc || 'DLC Bypasser', iconUrl: iconUrls.bypass_dlc },
    { id: 'settings',   label: t.nav_settings,   iconUrl: iconUrls.settings  },
    { id: 'about',      label: t.nav_about,      iconUrl: iconUrls.about     },
  ]
})
</script>

<style scoped>
.sidebar {
  width: 230px;
  background: var(--bg-card);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  box-shadow: 2px 0 12px rgba(0,0,0,0.04);
}

.logo-area {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 22px 20px 0;
  border-bottom: 1px solid var(--border);
}
.logo-img {
  height: 46px; width: auto;
  object-fit: contain;
  margin-bottom: 25px;
}

.nav {
  display: flex; flex-direction: column;
  gap: 2px; padding: 16px 12px; flex: 1;
}

.nav-item {
  position: relative;
  display: flex; align-items: center;
  gap: 11px; padding: 10px 14px;
  border-radius: 10px; border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer; font-size: 13.5px;
  font-family: inherit; font-weight: 500;
  text-align: left; width: 100%;
  transition: background 0.15s, color 0.15s;
}

.nav-item::before {
  content: '';
  position: absolute; left: 0; top: 50%;
  transform: translateY(-50%) scaleY(0);
  width: 3px; height: 60%;
  background: var(--text-primary);
  border-radius: 0 3px 3px 0;
  transition: transform 0.2s ease;
}

.nav-item:hover { background: var(--bg-subtle); color: var(--text-primary); }
.nav-item:hover .nav-icon-wrap { background: var(--bg-hover); }

.nav-item.active {
  background: var(--bg-subtle);
  color: var(--text-primary);
  font-weight: 600;
}
.nav-item.active::before { transform: translateY(-50%) scaleY(1); }
.nav-item.active .nav-icon-wrap { background: var(--bg-hover); }

.nav-icon-wrap {
  width: 32px; height: 32px;
  background: var(--bg-subtle);
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: background 0.15s;
}
.nav-icon-img {
  width: 17px; height: 17px;
  display: block; object-fit: contain;
  filter: none;
}

[data-theme="dark"] .nav-icon-img {
  filter: brightness(0) invert(1);
}

.nav-label { line-height: 1; }
</style>