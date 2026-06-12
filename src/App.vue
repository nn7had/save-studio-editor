<template>
  <div class="app">
    <Sidebar :current="currentView" @navigate="currentView = $event" />
    
    <main class="content">
      <Editor v-if="currentView === 'editor'" />
      <BypassDLC v-else-if="currentView === 'bypass_dlc'" />
      <Settings v-else-if="currentView === 'settings'" />
      <About v-else-if="currentView === 'about'" />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Sidebar from './components/Sidebar.vue'
import Editor from './views/Editor.vue'
import BypassDLC from './views/BypassDLC.vue'
import Settings from './views/Settings.vue'
import About from './views/About.vue'

const currentView = ref('editor')
</script>

<style>
/* ── CSS Variables — Light (default) ── */
:root {
  --bg-app: #f8fafc;
  --bg-card: #ffffff;
  --bg-subtle: #f3f4f6;
  --bg-hover: #e5e7eb;
  --border: #e5e7eb;
  --border-focus: #1f2937;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --text-muted: #9ca3af;
  --scrollbar: #d1d5db;
  --btn-primary: #1f2937;
  --btn-primary-hover: #111827;
  --dot-filled: #1f2937;
  --progress-fill: #1f2937;
  --xp-bar-bg: #f3f4f6;
  --input-bg: #f9fafb;
  --input-border: #e5e7eb;
  --shadow: 0 1px 4px rgba(0,0,0,0.04);
}

/* ── CSS Variables — Dark ── */
[data-theme="dark"] {
  --bg-app: #0f1117;
  --bg-card: #1a1d27;
  --bg-subtle: #22263a;
  --bg-hover: #2a2f45;
  --border: #2e3348;
  --border-focus: #e5e7eb;
  --text-primary: #f3f4f6;
  --text-secondary: #9ca3af;
  --text-muted: #6b7280;
  --scrollbar: #3a3f58;
  --btn-primary: #e5e7eb;
  --btn-primary-hover: #f3f4f6;
  --dot-filled: #e5e7eb;
  --progress-fill: #e5e7eb;
  --xp-bar-bg: #22263a;
  --input-bg: #22263a;
  --input-border: #2e3348;
  --shadow: 0 1px 4px rgba(0,0,0,0.3);
}

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background: var(--bg-app);
  color: var(--text-primary);
  font-family: 'Segoe UI', Inter, system-ui, sans-serif;
  font-size: 14px;
  -webkit-font-smoothing: antialiased;
  transition: background 0.2s, color 0.2s;
}

.app {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--bg-app);
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 36px 40px;
  background: var(--bg-app);
}

.content::-webkit-scrollbar {
  width: 6px;
}
.content::-webkit-scrollbar-track {
  background: transparent;
}
.content::-webkit-scrollbar-thumb {
  background: var(--scrollbar);
  border-radius: 3px;
}
</style>