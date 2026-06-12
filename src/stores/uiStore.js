import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// ── Çeviri tablosu ──────────────────────────────────────────────────────────
const translations = {
  tr: {
    // Sidebar
    nav_editor:    'Editör',
    nav_dashboard: 'Panel',
    nav_settings:  'Ayarlar',
    nav_about:     'Hakkında',
    nav_bypass_dlc: 'DLC Geçici',

    // ProfilePicker
    profile:          'Profil',
    save:             'Save',
    select_profile:   'Profil seçin',
    select_save:      'Save seçin',
    select_profile_first: 'Önce profil seçin',
    loading:          'Yükleniyor…',
    save_btn:         'Kaydet',
    saving:           'Kaydediliyor…',

    // Editor
    editor_title:     'Save Studio Editör',
    editor_sub:       'Profil istatistiklerinizi, yeteneklerinizi ve harita ilerlemenizi özelleştirebilirsiniz.',
    money:            'Para',
    balance:          'Bakiye',
    experience:       'Deneyim',
    xp_points:        'Deneyim Puanı',
    level:            'Seviye',
    skills:           'Yetenekler',
    adr_classes:      'ADR Sınıfları',
    long_dist:        'Uzun Mesafe',
    urgent:           'Zamanında Teslimat',
    heavy:            'Yük Taşıma',
    mechanical:       'Yakıt Ekonomisi',
    fragile:          'Hasar Kırılgan',
    adr_skill:        'Tehlikeli Yük',
    xp_left:          'XP kaldı',
    empty_title:      'Profil ve save seçildiğinde editör otomatik açılır.',
    empty_sub:        'Yukarıdaki Profile ve Save alanlarından seçim yapın.',

    // ADR
    adr_0: 'Patlayıcılar',
    adr_1: 'Gazlar',
    adr_2: 'Yanıcı Sıvılar',
    adr_3: 'Katı Yanıcı Maddeler',
    adr_4: 'Oksitleyiciler',
    adr_5: 'Zehirli Maddeler',

    // Toplu İşlemler
    bulk_title:   'Hızlı Geliştirme',
    bulk_cities:  'Tüm şehirleri aç',
    bulk_dealers: 'Tüm galerileri aç',
    bulk_garages: 'Tüm garajları aç',

    // Settings
    settings_title:   'Ayarlar',
    settings_sub:     'Uygulama tercihlerini buradan yönetebilirsiniz',
    lang_title:       'Dil',
    lang_sub:         'Arayüz dilini seçin',
    theme_title:      'Tema',
    theme_sub:        'Arayüz görünümünü seçin',
    theme_light:      'Açık Tema',
    theme_dark:       'Koyu Tema',

    // About
    about_title:      'Hakkında',
    about_sub:        'Uygulama bilgileri ve bağlantılar',
    about_desc:       'Save Studio Editor, Euro Truck Simulator 2 oyuncularının profil verilerini kolayca yönetebilmesi için geliştirilmiş modern bir masaüstü uygulamasıdır. Para, deneyim, yetenekler ve diğer oyun verilerini hızlı ve güvenli şekilde düzenlemenizi sağlar.',
    tech_stack:       'Teknoloji Stack',

    // DLC Bypass Patch
    dlc_title:        'Eksik DLC Ekranını Geç',
    dlc_desc:         'Sahip olmadığınız DLC\'ler yüzünden açılmayan profilleri bu araçla kurtarabilirsiniz.',
    btn_bypass:       'DLC Kontrolünü Baypas Et',
    dlc_success:      'DLC\'ler başarıyla baypas edildi!',
    dlc_error:        'İşlem sırasında bir hata oluştu!'
  },

  en: {
    // Sidebar
    nav_editor:    'Editor',
    nav_dashboard: 'Dashboard',
    nav_settings:  'Settings',
    nav_about:     'About',
    nav_bypass_dlc: 'DLC Bypasser',

    // ProfilePicker
    profile:          'Profile',
    save:             'Save',
    select_profile:   'Select profile',
    select_save:      'Select save',
    select_profile_first: 'Select profile first',
    loading:          'Loading…',
    save_btn:         'Save',
    saving:           'Saving…',

    // Editor
    editor_title:     'Save Studio Editor',
    editor_sub:       'You can customize your profile statistics, skills, and map progress.',
    money:            'Money',
    balance:          'Balance',
    experience:       'Experience',
    xp_points:        'Experience Points',
    level:            'Level',
    skills:           'Skills',
    adr_classes:      'ADR Classes',
    long_dist:        'Long Distance',
    urgent:           'Timely Delivery',
    heavy:            'Heavy Cargo',
    mechanical:       'Fuel Economy',
    fragile:          'Fragile Cargo',
    adr_skill:        'Hazardous Cargo',
    xp_left:          'XP remaining',
    empty_title:      'Select a profile and save file to open the editor.',
    empty_sub:        'Use the Profile and Save fields above.',

    // ADR
    adr_0: 'Explosives',
    adr_1: 'Gases',
    adr_2: 'Flammable Liquids',
    adr_3: 'Flammable Solids',
    adr_4: 'Oxidizers',
    adr_5: 'Toxic Substances',

    // Bulk Actions
    bulk_title:   'Quick Progression',
    bulk_cities:  'Unlock all cities',
    bulk_dealers: 'Unlock all dealers',
    bulk_garages: 'Unlock all garages',

    // Settings
    settings_title:   'Settings',
    settings_sub:     'Manage your application preferences',
    lang_title:       'Language',
    lang_sub:         'Choose interface language',
    theme_title:      'Theme',
    theme_sub:        'Choose interface appearance',
    theme_light:      'Light Theme',
    theme_dark:       'Dark Theme',

    // About
    about_title:      'About',
    about_sub:        'Application info and links',
    about_desc:       'Save Studio Editor is a modern desktop application developed to help Euro Truck Simulator 2 players easily manage their profile data. Edit money, experience, skills and other game data quickly and safely.',
    tech_stack:       'Tech Stack',

    // DLC Bypass Patch
    dlc_title:        'Bypass Missing DLCs',
    dlc_desc:         'Fix and load profiles that won\'t open due to missing DLCs using this tool.',
    btn_bypass:       'Bypass DLC Check',
    dlc_success:      'DLCs successfully bypassed!',
    dlc_error:        'An error occurred during the process!'
  },

  de: {
    // Sidebar
    nav_editor:    'Editor',
    nav_dashboard: 'Dashboard',
    nav_settings:  'Einstellungen',
    nav_about:     'Über',
    nav_bypass_dlc: 'DLC Bypass',

    // ProfilePicker
    profile:          'Profil',
    save:             'Speichern',
    select_profile:   'Profil wählen',
    select_save:      'Speicherstand wählen',
    select_profile_first: 'Zuerst Profil wählen',
    loading:          'Laden…',
    save_btn:         'Speichern',
    saving:           'Speichern…',

    // Editor
    editor_title:     'Save Studio Editor',
    editor_sub:       'Sie können Ihre Profilstatistiken, Fähigkeiten und den Kartenfortschritt anpassen.',
    money:            'Geld',
    balance:          'Kontostand',
    experience:       'Erfahrung',
    xp_points:        'Erfahrungspunkte',
    level:            'Level',
    skills:           'Fähigkeiten',
    adr_classes:      'ADR-Klassen',
    long_dist:        'Langstrecke',
    urgent:           'Pünktliche Lieferung',
    heavy:            'Schwertransport',
    mechanical:       'Kraftstoffeffizienz',
    fragile:          'Zerbrechliche Fracht',
    adr_skill:        'Gefahrgut',
    xp_left:          'XP verbleibend',
    empty_title:      'Wähle Profil und Speicherstand, um den Editor zu öffnen.',
    empty_sub:        'Nutze die Felder Profil und Speicherstand oben.',

    // ADR
    adr_0: 'Explosivstoffe',
    adr_1: 'Gase',
    adr_2: 'Entzündbare Flüssigkeiten',
    adr_3: 'Entzündbare Feststoffe',
    adr_4: 'Oxidationsmittel',
    adr_5: 'Giftige Stoffe',

    // Massenaktionen
    bulk_title:   'Schneller Fortschritt',
    bulk_cities:  'Alle Städte freischalten',
    bulk_dealers: 'Alle LKW-Händler freischalten',
    bulk_garages: 'Alle Garagen freischalten',

    // Settings
    settings_title:   'Einstellungen',
    settings_sub:     'Anwendungseinstellungen verwalten',
    lang_title:       'Sprache',
    lang_sub:         'Oberflächensprache wählen',
    theme_title:      'Design',
    theme_sub:        'Erscheinungsbild wählen',
    theme_light:      'Helles Design',
    theme_dark:       'Dunkles Design',

    // About
    about_title:      'Über',
    about_sub:        'Anwendungsinfo und Links',
    about_desc:       'Save Studio Editor ist eine moderne Desktop-Anwendung, die Euro Truck Simulator 2-Spielern hilft, ihre Profildaten einfach zu verwalten.',
    tech_stack:       'Technologie-Stack',

    // DLC Bypass Patch
    dlc_title:        'Fehlende DLCs überspringen',
    dlc_desc:         'Repariere Profile, die sich wegen fehlender DLCs nicht öffnen lassen.',
    btn_bypass:       'DLC-Prüfung umgehen',
    dlc_success:      'DLCs erfolgreich umgangen!',
    dlc_error:        'Beim Vorgang ist ein Fehler aufgetreten!'
  },

  ru: {
    // Sidebar
    nav_editor:    'Редактор',
    nav_dashboard: 'Панель',
    nav_settings:  'Настройки',
    nav_about:     'О программе',
    nav_bypass_dlc: 'Обход DLC',

    // ProfilePicker
    profile:          'Профиль',
    save:             'Сохранить',
    select_profile:   'Выберите профиль',
    select_save:      'Выберите сохранение',
    select_profile_first: 'Сначала выберите профиль',
    loading:          'Загрузка…',
    save_btn:         'Сохранить',
    saving:           'Сохранение…',

    // Editor
    editor_title:     'Редактор Save Studio',
    editor_sub:       'Вы можете настроить статистику профиля, навыки и прогресс на карте.',
    money:            'Деньги',
    balance:          'Баланс',
    experience:       'Опыт',
    xp_points:        'Очки опыта',
    level:            'Уровень',
    skills:           'Навыки',
    adr_classes:      'Классы АДР',
    long_dist:        'Дальние перевозки',
    urgent:           'Срочная доставка',
    heavy:            'Тяжёлый груз',
    mechanical:       'Экономия топлива',
    fragile:          'Хрупкий груз',
    adr_skill:        'Опасный груз',
    xp_left:          'XP осталось',
    empty_title:      'Выберите профиль и сохранение, чтобы открыть редактор.',
    empty_sub:        'Используйте поля Профиль и Сохранение выше.',

    // ADR
    adr_0: 'Взрывчатые вещества',
    adr_1: 'Газы',
    adr_2: 'Легковоспламеняющиеся жидкости',
    adr_3: 'Легковоспламеняющиеся твёрдые вещества',
    adr_4: 'Окислители',
    adr_5: 'Токсичные вещества',

    // 
    bulk_title:   'Быстрый прогресс',
    bulk_cities:  'Открыть все города',
    bulk_dealers: 'Открыть все автосалоны',
    bulk_garages: 'Открыть все гаражи',

    // Settings
    settings_title:   'Настройки',
    settings_sub:     'Управление настройками приложения',
    lang_title:       'Язык',
    lang_sub:         'Выберите язык интерфейса',
    theme_title:      'Тема',
    theme_sub:        'Выберите внешний вид',
    theme_light:      'Светлая тема',
    theme_dark:       'Тёмная тема',

    // About
    about_title:      'О программе',
    about_sub:        'Информация и ссылки',
    about_desc:       'Save Studio Editor — современное настольное приложение для удобного управления данными профиля Euro Truck Simulator 2.',
    tech_stack:       'Технологический стек',

    // DLC Bypass Patch
    dlc_title:        'Пропустить экран отсутствующих DLC',
    dlc_desc:         'Исправьте профили, которые не открываются из-за отсутствующих DLC.',
    btn_bypass:       'Обойти проверку DLC',
    dlc_success:      'DLC успешно обойдены!',
    dlc_error:        'В процессе произошла ошибка!'
  }
}

export const useUiStore = defineStore('ui', () => {
  const theme = ref(localStorage.getItem('ss_theme') || 'light')
  const lang  = ref(localStorage.getItem('ss_lang')  || 'tr')

  const t = computed(() => translations[lang.value] || translations.tr)

  function setTheme(val) {
    theme.value = val
    localStorage.setItem('ss_theme', val)
    applyTheme(val)
  }

  function setLang(val) {
    lang.value = val
    localStorage.setItem('ss_lang', val)
  }

  function applyTheme(val) {
    const root = document.documentElement
    if (val === 'dark') {
      root.setAttribute('data-theme', 'dark')
    } else {
      root.removeAttribute('data-theme')
    }
  }

  // Uygulama ilk açıldığında kaydedilmiş temayı uygula
  applyTheme(theme.value)

  return { theme, lang, t, setTheme, setLang }
})