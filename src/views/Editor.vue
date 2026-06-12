<template>
  <div class="editor">

    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t.editor_title }}</h1>
        <p class="page-sub">{{ t.editor_sub }}</p>
      </div>
    </div>

    <ProfilePicker />

    <div v-if="store.saveMsg" class="banner" :class="store.saveMsg.type === 'ok' ? 'banner-ok' : 'banner-error'">
      <svg v-if="store.saveMsg.type === 'ok'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      {{ store.saveMsg.text }}
    </div>

    <div v-if="store.error" class="banner banner-error">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <strong>{{ store.error.code }}</strong> — {{ store.error.message }}
      <button class="banner-close" @click="store.error = null">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>

    <template v-if="store.isLoaded">

      <div class="twin-row">

        <section class="card">
          <div class="card-header">
            <div class="card-icon">
              <img :src="moneyIconUrl" :alt="t.money" class="card-icon-img" />
            </div>
            <h2 class="card-title">{{ t.money }}</h2>
            <span class="card-badge">€</span>
          </div>
          <div class="field-label-text">{{ t.balance }}</div>
          <div class="input-group">
            <input
              class="field-input"
              type="number"
              v-model.number="store.money"
              :min="-999999999"
              :max="999999999"
              @change="store.markDirty()"
            />
            <button class="btn-max" @click="store.setMaxMoney()">MAX</button>
          </div>
        </section>

        <section class="card">
          <div class="card-header">
            <div class="card-icon">
              <img :src="awardIconUrl" :alt="t.experience" class="card-icon-img" />
            </div>
            <h2 class="card-title">{{ t.experience }}</h2>
            <span class="deneyim-seviye-rozet">{{ t.level }} {{ store.level }}</span>
          </div>
          <div class="field-label-text">{{ t.xp_points }}</div>
          <div class="input-group">
            <input
              class="field-input"
              type="number"
              v-model.number="store.xp"
              :min="0"
              :max="99999999"
              @change="store.markDirty()"
            />
            <button class="btn-max" @click="store.setMaxXP()">MAX</button>
          </div>
          <div class="xp-progress-wrap">
            <div class="xp-progress-bar">
              <div class="xp-progress-fill" :style="{ width: (store.levelProgress * 100).toFixed(1) + '%' }"></div>
            </div>
            <span class="xp-percent">{{ (store.levelProgress * 100).toFixed(0) }}%</span>
          </div>
          <div class="xp-info-row">
            <span class="xp-level-info">{{ t.level }} {{ store.level }} → {{ t.level }} {{ store.level + 1 }}</span>
            <span class="xp-remaining">{{ store.xpToNext?.toLocaleString() ?? 0 }} {{ t.xp_left }}</span>
          </div>
        </section>

      </div>

      <section class="card section-card">
        <div class="section-header">
          <div class="card-icon">
            <img :src="bulkIconUrl" :alt="t.bulk_title" class="card-icon-img" />
          </div>
          <h2 class="card-title">{{ t.bulk_title }}</h2>
        </div>

        <div class="checkbox-list">
          <label class="checkbox-row">
            <div class="checkbox-left-group">
              <div class="checkbox-icon-wrap">
                <img :src="sehirIconUrl" :alt="t.bulk_cities" class="checkbox-icon-img" />
              </div>
              <span class="checkbox-label">{{ t.bulk_cities }}</span>
            </div>
            <input
              type="checkbox"
              :checked="store.unlockOptions.cities"
              :disabled="!store.isLoaded || store.loading"
              @change="store.setUnlockOption('cities', $event.target.checked)"
            />
            <span class="checkbox-custom">
              <svg v-if="store.unlockOptions.cities" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </span>
          </label>

          <label class="checkbox-row">
            <div class="checkbox-left-group">
              <div class="checkbox-icon-wrap">
                <img :src="galeriIconUrl" :alt="t.bulk_dealers" class="checkbox-icon-img" />
              </div>
              <span class="checkbox-label">{{ t.bulk_dealers }}</span>
            </div>
            <input
              type="checkbox"
              :checked="store.unlockOptions.dealers"
              :disabled="!store.isLoaded || store.loading"
              @change="store.setUnlockOption('dealers', $event.target.checked)"
            />
            <span class="checkbox-custom">
              <svg v-if="store.unlockOptions.dealers" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </span>
          </label>

          <label class="checkbox-row">
            <div class="checkbox-left-group">
              <div class="checkbox-icon-wrap">
                <img :src="garajIconUrl" :alt="t.bulk_garages" class="checkbox-icon-img" />
              </div>
              <span class="checkbox-label">{{ t.bulk_garages }}</span>
            </div>
            <input
              type="checkbox"
              :checked="store.unlockOptions.garages"
              :disabled="!store.isLoaded || store.loading"
              @change="store.setUnlockOption('garages', $event.target.checked)"
            />
            <span class="checkbox-custom">
              <svg v-if="store.unlockOptions.garages" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </span>
          </label>
        </div>
      </section>

      <section class="card section-card">
        <div class="section-header">
          <div class="card-icon">
            <img :src="skillsIconUrl" :alt="t.skills" class="card-icon-img" />
          </div>
          <h2 class="card-title">{{ t.skills }}</h2>
          <span class="section-note">(0 – 6)</span>
        </div>

        <div class="skills-grid">
          <div v-for="skill in skillFields" :key="skill.key" class="skill-row">
            <div class="skill-icon-wrap">
              <img :src="skill.iconUrl" :alt="t[skill.labelKey]" class="skill-icon-img" />
            </div>
            <span class="skill-name">{{ t[skill.labelKey] }}</span>
            <button class="step-btn" @click="stepSkill(skill.key, -1)" :disabled="getSkillDisplay(skill.key) <= 0">−</button>
            <span class="skill-val">{{ getSkillDisplay(skill.key) }}</span>
            <button class="step-btn" @click="stepSkill(skill.key, +1)" :disabled="getSkillDisplay(skill.key) >= 6">+</button>
            <div class="skill-dots">
              <span
                v-for="n in 6" :key="n"
                class="dot"
                :class="{ filled: n <= getSkillDisplay(skill.key) }"
                @click="setSkill(skill.key, n)"
              ></span>
            </div>
            <span class="skill-fraction">{{ getSkillDisplay(skill.key) }} / 6</span>
          </div>
        </div>
      </section>

      <section class="card section-card">
        <div class="section-header">
          <div class="card-icon">
            <img :src="adrTitleIconUrl" alt="ADR" class="card-icon-img" />
          </div>
          <h2 class="card-title">{{ t.adr_classes }}</h2>
        </div>

        <div class="adr-grid">
          <label
            v-for="(cls, i) in adrClasses"
            :key="i"
            class="adr-item"
            :class="{ checked: store.adrFlags[i] }"
          >
            <input
              type="checkbox"
              :checked="store.adrFlags[i]"
              @change="store.setAdrFlag(i, $event.target.checked)"
            />
            <div class="adr-icon-wrap">
              <img :src="getAdrIconUrl(i)" :alt="t[`adr_${i}`]" class="adr-custom-icon" />
            </div>
            <span class="adr-label">{{ t[`adr_${i}`] }}</span>
            <div class="adr-check" :class="{ active: store.adrFlags[i] }">
              <svg v-if="store.adrFlags[i]" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
          </label>
        </div>
      </section>

    </template>

    <div v-else class="empty-state">
      <div class="empty-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="12" y1="18" x2="12" y2="12"/>
          <line x1="9" y1="15" x2="15" y2="15"/>
        </svg>
      </div>
      <p class="empty-title">{{ t.empty_title }}</p>
      <p class="empty-sub">{{ t.empty_sub }}</p>
    </div>

  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useSaveStore } from '../stores/saveStore'
import { useUiStore }   from '../stores/uiStore'
import { ADR_CLASSES }  from '../utils/constants'
import ProfilePicker    from '../components/ProfilePicker.vue'

const store = useSaveStore()

const uiStore = useUiStore()
const { t } = storeToRefs(uiStore)

const adrClasses = ADR_CLASSES

// ── UI ikonları ──────────────────────────────────────────────────────────────
const moneyIconUrl    = new URL('../assets/ui/money.svg',  import.meta.url).href
const awardIconUrl    = new URL('../assets/ui/award.svg',  import.meta.url).href
const skillsIconUrl   = new URL('../assets/ui/skills.svg', import.meta.url).href
const adrTitleIconUrl = new URL('../assets/ui/adr.svg',    import.meta.url).href

// ── Hızlı Geliştirme İkonları ────────────────────────────────────────────────
const bulkIconUrl     = new URL('../assets/ui/bulk.svg',  import.meta.url).href
const sehirIconUrl    = new URL('../assets/ui/city.svg',  import.meta.url).href
const galeriIconUrl   = new URL('../assets/ui/dealer.svg', import.meta.url).href
const garajIconUrl    = new URL('../assets/ui/garage.svg', import.meta.url).href

// ── Yetenek satırları ────────────────────────────────────────────────────────
const skillFields = [
  { key: 'long_dist',  labelKey: 'long_dist',  iconUrl: new URL('../assets/skills/route.svg',          import.meta.url).href },
  { key: 'urgent',     labelKey: 'urgent',     iconUrl: new URL('../assets/skills/alarm-clock.svg',    import.meta.url).href },
  { key: 'heavy',      labelKey: 'heavy',      iconUrl: new URL('../assets/skills/gem.svg',            import.meta.url).href },
  { key: 'mechanical', labelKey: 'mechanical', iconUrl: new URL('../assets/skills/fuel.svg',           import.meta.url).href },
  { key: 'fragile',    labelKey: 'fragile',    iconUrl: new URL('../assets/skills/fragile.svg',        import.meta.url).href },
  { key: 'adr',        labelKey: 'adr_skill',  iconUrl: new URL('../assets/skills/triangle_alert.svg', import.meta.url).href },
]

// ── ADR ikon isimleri ────────────────────────────────────────────────────────
const adrIconNames = [
  'patlayici.svg',
  'gazlar.svg',
  'yanici.svg',
  'kati_yanici.svg',
  'oksitleyici.svg',
  'zehirli_maddeler.svg',
]

function getAdrIconUrl(i) {
  return new URL(`../assets/adr/${adrIconNames[i]}`, import.meta.url).href
}

// ── ADR bit hesaplamaları ────────────────────────────────────────────────────
function adrBitsToCount(bits) {
  let count = 0
  for (let i = 0; i < 6; i++) if ((bits >> i) & 1) count++
  return count
}

function getSkillDisplay(key) {
  if (key === 'adr') return adrBitsToCount(store.skills.adr)
  return store.skills[key]
}

// ── Skill adım fonksiyonları ─────────────────────────────────────────────────
function stepSkill(key, delta) {
  if (key === 'adr') {
    const cur  = adrBitsToCount(store.skills.adr)
    const next = Math.min(6, Math.max(0, cur + delta))
    store.skills.adr = (1 << next) - 1
  } else {
    store.skills[key] = Math.min(6, Math.max(0, store.skills[key] + delta))
  }
  store.markDirty()
}

function setSkill(key, val) {
  if (key === 'adr') {
    const store = useSaveStore()
    store.skills.adr = (1 << val) - 1
  } else {
    store.skills[key] = val
  }
  store.markDirty()
}
</script>

<style scoped>
.editor { max-width: 900px; }

/* Header */
.page-header { margin-bottom: 28px; }
.page-title  { font-size: 32px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.5px; line-height: 1.1; }
.page-sub    { font-size: 13.5px; color: var(--text-muted); margin-top: 5px; font-weight: 400; }

/* Banners */
.banner {
  display: flex; align-items: center; gap: 8px;
  padding: 11px 16px; border-radius: 10px; margin-bottom: 16px; font-size: 13px;
}
.banner-error { background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; }
.banner-ok    { background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; }
.banner-close {
  margin-left: auto; background: none; border: none; color: inherit;
  cursor: pointer; display: flex; align-items: center; opacity: 0.6; transition: opacity 0.15s;
}
.banner-close:hover { opacity: 1; }

/* Card */
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 18px; padding: 22px 24px;
  box-shadow: var(--shadow);
}
.section-card { margin-bottom: 16px; }

.twin-row {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 16px; margin-bottom: 16px;
}

/* Card header */
.card-header    { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; }
.section-header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
.section-note   { font-size: 13px; color: var(--text-muted); font-weight: 400; }

.card-icon {
  width: 36px; height: 36px;
  background: var(--bg-subtle);
  border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.card-icon-img {
  width: 18px; height: 18px;
  display: block; object-fit: contain;
}
[data-theme="dark"] .card-icon-img { filter: brightness(0) invert(1); }

.card-title { font-size: 17px; font-weight: 600; color: var(--text-primary); flex: 1; }
.card-badge {
  font-size: 13px; font-weight: 600; color: var(--text-secondary);
  background: var(--bg-subtle); border: 1px solid var(--border);
  border-radius: 8px; padding: 3px 10px;
}
.deneyim-seviye-rozet {
  font-size: 13px; font-weight: 600;
  padding: 3px 10px; border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg-subtle);
  color: var(--text-primary);
  display: inline-block;
}

/* Input */
.field-label-text {
  font-size: 12px; font-weight: 500; color: var(--text-muted);
  margin-bottom: 8px; letter-spacing: 0.02em;
}
.input-group {
  display: flex; align-items: center;
  border: 1.5px solid var(--input-border); border-radius: 12px;
  overflow: hidden; background: var(--input-bg); transition: border-color 0.15s;
}
.input-group:focus-within { border-color: var(--border-focus); background: var(--bg-card); }
.field-input {
  flex: 1; background: transparent; border: none; color: var(--text-primary);
  padding: 11px 14px; font-size: 15px; font-weight: 600;
  font-family: inherit; outline: none; min-width: 0;
}
.btn-max {
  background: var(--btn-primary); border: none; color: var(--bg-app);
  padding: 11px 16px; font-size: 12px; font-weight: 700;
  font-family: inherit; cursor: pointer; letter-spacing: 0.04em;
  transition: background 0.15s, transform 0.15s; flex-shrink: 0;
}
.btn-max:hover  { background: var(--btn-primary-hover); }
.btn-max:active { transform: scale(0.96); }

/* XP */
.xp-progress-wrap { display: flex; align-items: center; gap: 10px; margin-top: 14px; }
.xp-progress-bar  { flex: 1; height: 8px; background: var(--xp-bar-bg); border-radius: 4px; overflow: hidden; }
.xp-progress-fill { height: 100%; background: var(--progress-fill); border-radius: 4px; transition: width 0.3s ease; }
.xp-percent       { font-size: 12px; font-weight: 600; color: var(--text-primary); min-width: 32px; text-align: right; }
.xp-info-row      { display: flex; justify-content: space-between; margin-top: 7px; }
.xp-level-info    { font-size: 12px; color: var(--text-secondary); }
.xp-remaining     { font-size: 12px; color: var(--text-muted); }

/* Skills */
.skills-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 24px; }
.skill-row   { display: flex; align-items: center; gap: 10px; }

.skill-icon-wrap {
  width: 32px; height: 32px;
  background: var(--bg-subtle);
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.skill-icon-img { width: 16px; height: 16px; display: block; object-fit: contain; }
[data-theme="dark"] .skill-icon-img { filter: brightness(0) invert(1); }

.skill-name {
  font-size: 13px; color: var(--text-primary); font-weight: 500; flex: 1;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.step-btn {
  width: 26px; height: 26px; background: var(--input-bg);
  border: 1.5px solid var(--border); border-radius: 7px; color: var(--text-primary);
  cursor: pointer; font-size: 15px; display: flex; align-items: center;
  justify-content: center; transition: background 0.12s, border-color 0.12s, transform 0.12s;
  line-height: 1; flex-shrink: 0; font-family: inherit;
}
.step-btn:hover:not(:disabled)  { background: var(--bg-hover); border-color: var(--border-focus); transform: scale(1.08); }
.step-btn:active:not(:disabled) { transform: scale(0.94); }
.step-btn:disabled               { opacity: 0.3; cursor: not-allowed; }

.skill-val      { width: 18px; text-align: center; font-weight: 700; color: var(--text-primary); font-size: 14px; flex-shrink: 0; }
.skill-dots     { display: flex; gap: 4px; flex-shrink: 0; }
.dot {
  width: 11px; height: 11px; border-radius: 50%;
  background: var(--bg-hover); border: 1.5px solid var(--border);
  cursor: pointer; transition: background 0.1s, border-color 0.1s, transform 0.1s; flex-shrink: 0;
}
.dot.filled { background: var(--dot-filled); border-color: var(--dot-filled); }
.dot:hover  { border-color: var(--border-focus); transform: scale(1.2); }
.skill-fraction { font-size: 12px; color: var(--text-muted); font-weight: 500; min-width: 28px; text-align: right; flex-shrink: 0; }

/* ADR */
.adr-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
}
.adr-item {
  display: flex; flex-direction: column; align-items: center;
  gap: 12px; padding: 20px 12px 16px;
  background: var(--input-bg); border: 1.5px solid var(--border);
  border-radius: 14px; cursor: pointer;
  transition: border-color 0.15s, background 0.15s, transform 0.15s;
  text-align: center; position: relative;
}
.adr-item:hover   { transform: translateY(-1px); border-color: var(--text-muted); background: var(--bg-subtle); }
.adr-item.checked { border-color: var(--border-focus); background: var(--bg-subtle); }
.adr-item input   { display: none; }

.adr-icon-wrap {
  width: 56px; height: 56px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.adr-custom-icon { width: 56px; height: 56px; display: block; object-fit: contain; }

.adr-label { font-size: 13px; font-weight: 700; color: var(--text-primary); line-height: 1.3; }

.adr-check {
  width: 22px; height: 22px; border-radius: 50%;
  border: 1.5px solid var(--border); background: var(--bg-card);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: all 0.15s; color: var(--bg-card);
}
.adr-check.active { background: var(--btn-primary); border-color: var(--btn-primary); }

/* Empty state */
.empty-state {
  margin-top: 60px; text-align: center;
  display: flex; flex-direction: column; align-items: center; gap: 12px;
}
.empty-icon {
  width: 72px; height: 72px; background: var(--bg-subtle);
  border: 1.5px solid var(--border); border-radius: 20px;
  display: flex; align-items: center; justify-content: center;
  color: var(--text-muted);
}
.empty-title { font-size: 15px; font-weight: 600; color: var(--text-primary); }
.empty-sub   { font-size: 13px; color: var(--text-muted); }

/* Toplu İşlemler — Checkbox Stilleri */
.checkbox-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.checkbox-row {
  display: flex;
  align-items: center;
  justify-content: space-between; /* İkonu sola, Checkbox kutusunu en sağa iter */
  padding: 13px 16px;
  background: var(--input-bg);
  border: 1.5px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

/* Satırın üzerine gelindiğinde hem satır hem de sağdaki kutu parlasın */
.checkbox-row:hover {
  border-color: var(--text-muted);
  background: var(--bg-subtle);
}

.checkbox-row:hover .checkbox-custom {
  border-color: var(--border-focus);
}

.checkbox-row input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

/* İkon ve Yazıyı bir arada tutan sol grup */
.checkbox-left-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* YENİLENEN ALAN: Kutunun hatları belirginleştirildi ve hafif gölge eklendi */
.checkbox-custom {
  width: 22px;         /* Boyut hafifçe büyütüldü */
  height: 22px;
  border-radius: 7px;  /* Köşeler daha modern ve yumuşak */
  border: 2px solid var(--text-muted); /* Kenarlık rengi daha görünür yapıldı */
  background: var(--bg-card);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); /* Kutuyu belirginleştiren hafif gölge */
}

/* Kutunun seçili (Checked) durumu */
.checkbox-row input:checked + .checkbox-custom {
  background: var(--btn-primary);
  border-color: var(--btn-primary);
  color: #ffffff; /* İçindeki SVG tık işaretinin net beyaz görünmesini sağlar */
}

.checkbox-row input:disabled {
  cursor: not-allowed;
}

.checkbox-row:has(input:disabled) {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Checkbox İkon Bölümü */
.checkbox-icon-wrap {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.checkbox-icon-img {
  width: 18px;
  height: 18px;
  display: block;
  object-fit: contain;
}

/* Karanlık modda yeni ikonların da beyaza dönmesi için filtre */
[data-theme="dark"] .checkbox-icon-img {
  filter: brightness(0) invert(1);
}

.checkbox-label {
  font-size: 13.5px;
  font-weight: 500;
  color: var(--text-primary);
}
</style>