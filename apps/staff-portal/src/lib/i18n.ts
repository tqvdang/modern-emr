import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import translation files
import enCommon from '@/locales/en/common.json'
import viCommon from '@/locales/vi/common.json'

export const defaultNS = 'common'
export const resources = {
  en: {
    common: enCommon,
  },
  vi: {
    common: viCommon,
  },
}

// Language detection options
const detectionOptions = {
  // Order and from where user language should be detected
  order: ['localStorage', 'navigator', 'htmlTag'],

  // Cache user language on
  caches: ['localStorage'],

  // Only detect languages that are in the whitelist
  checkWhitelist: true,
}

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    // Set default language
    lng: 'en',
    fallbackLng: 'en',

    // Define namespaces
    defaultNS,
    ns: ['common'],

    // Language detection
    detection: detectionOptions,

    // Debug mode (disable in production)
    debug: process.env.NODE_ENV === 'development',

    // Resources
    resources,

    // Interpolation options
    interpolation: {
      escapeValue: false, // React already does escaping
    },

    // React options
    react: {
      useSuspense: false, // Set to false for SSR
    },

    // Common options
    load: 'languageOnly', // Remove region code (en-US -> en)
    preload: ['en', 'vi'], // Preload languages

    // Key separator
    keySeparator: '.',

    // Namespace separator
    nsSeparator: ':',
  })

export default i18n

// Helper functions
export const getCurrentLanguage = () => i18n.language || 'en'

export const changeLanguage = (lng: string) => {
  return i18n.changeLanguage(lng)
}

export const getSupportedLanguages = () => {
  return [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  ]
}