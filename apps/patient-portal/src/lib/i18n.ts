import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import Backend from 'i18next-resources-to-backend'

// Import translation files
import enCommon from '@/locales/en/common.json'
import enPhysiotherapy from '@/locales/en/physiotherapy.json'
import viCommon from '@/locales/vi/common.json'
import viPhysiotherapy from '@/locales/vi/physiotherapy.json'

export const defaultNS = 'common'
export const resources = {
  en: {
    common: enCommon,
    physiotherapy: enPhysiotherapy,
  },
  vi: {
    common: viCommon,
    physiotherapy: viPhysiotherapy,
  },
}

// Language detection options
const detectionOptions = {
  // Order and from where user language should be detected
  order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
  
  // Cache user language on
  caches: ['localStorage'],
  
  // Optional expire and domain for set cookie
  cookieMinutes: 160,
  cookieDomain: 'localhost',
  
  // Optional htmlTag with lang attribute
  htmlTag: document.documentElement,
  
  // Only detect languages that are in the whitelist
  checkWhitelist: true,
}

i18n
  // Load translation using dynamic imports
  .use(Backend((language: string, namespace: string) => {
    return import(`../locales/${language}/${namespace}.json`)
  }))
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
    ns: ['common', 'physiotherapy'],
    
    // Language detection
    detection: detectionOptions,
    
    // Debug mode (disable in production)
    debug: process.env.NODE_ENV === 'development',
    
    // Resources (static imports as fallback)
    resources,
    
    // Interpolation options
    interpolation: {
      escapeValue: false, // React already does escaping
      formatSeparator: ',',
    },
    
    // React options
    react: {
      useSuspense: false, // Set to false for SSR
    },
    
    // Backend options
    backend: {
      // Path where resources get loaded from
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    
    // Common options
    load: 'languageOnly', // Remove region code (en-US -> en)
    preload: ['en', 'vi'], // Preload languages
    
    // Key separator (set to false to allow dots in keys)
    keySeparator: '.',
    
    // Namespace separator
    nsSeparator: ':',
    
    // Pluralization
    pluralSeparator: '_',
    contextSeparator: '_',
    
    // Missing key behavior
    saveMissing: process.env.NODE_ENV === 'development',
    missingKeyHandler: (lng: string[], ns: string, key: string) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation: ${lng[0]}:${ns}:${key}`)
      }
    },
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

// Format functions for locale-specific formatting
export const formatDate = (date: Date, locale?: string) => {
  const currentLocale = locale || getCurrentLanguage()
  
  // Vietnamese date format: DD/MM/YYYY
  // English date format: MM/DD/YYYY
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }
  
  return new Intl.DateTimeFormat(
    currentLocale === 'vi' ? 'vi-VN' : 'en-US',
    options
  ).format(date)
}

export const formatDateTime = (date: Date, locale?: string) => {
  const currentLocale = locale || getCurrentLanguage()
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: currentLocale !== 'vi', // 24-hour format for Vietnamese
  }
  
  return new Intl.DateTimeFormat(
    currentLocale === 'vi' ? 'vi-VN' : 'en-US',
    options
  ).format(date)
}

export const formatNumber = (number: number, locale?: string) => {
  const currentLocale = locale || getCurrentLanguage()
  
  return new Intl.NumberFormat(
    currentLocale === 'vi' ? 'vi-VN' : 'en-US'
  ).format(number)
}

export const formatCurrency = (amount: number, currency: string = 'VND', locale?: string) => {
  const currentLocale = locale || getCurrentLanguage()
  
  // Use VND for Vietnamese locale, USD for English
  const defaultCurrency = currentLocale === 'vi' ? 'VND' : 'USD'
  
  return new Intl.NumberFormat(
    currentLocale === 'vi' ? 'vi-VN' : 'en-US',
    {
      style: 'currency',
      currency: currency || defaultCurrency,
      minimumFractionDigits: currency === 'VND' ? 0 : 2,
    }
  ).format(amount)
}

export const formatPhone = (phone: string, locale?: string) => {
  const currentLocale = locale || getCurrentLanguage()
  
  if (currentLocale === 'vi') {
    // Vietnamese phone format: +84 xxx xxx xxx or 0xxx xxx xxx
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.startsWith('84')) {
      return `+84 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`
    } else if (cleaned.startsWith('0')) {
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`
    }
    return phone
  } else {
    // US phone format: (xxx) xxx-xxxx
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
    }
    return phone
  }
}

// Cultural adaptations
export const getCulturalSettings = (locale?: string) => {
  const currentLocale = locale || getCurrentLanguage()
  
  if (currentLocale === 'vi') {
    return {
      // Vietnamese cultural settings
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      weekStart: 1, // Monday
      currency: 'VND',
      units: {
        weight: 'kg',
        height: 'cm',
        temperature: '°C',
      },
      names: {
        order: 'familyGiven', // Family name first
        titles: ['Ông', 'Bà', 'Anh', 'Chị', 'Em'],
      },
    }
  } else {
    return {
      // English/US cultural settings
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      weekStart: 0, // Sunday
      currency: 'USD',
      units: {
        weight: 'lbs',
        height: 'ft/in',
        temperature: '°F',
      },
      names: {
        order: 'givenFamily', // Given name first
        titles: ['Mr.', 'Mrs.', 'Ms.', 'Dr.'],
      },
    }
  }
}

// Validation helpers for locale-specific formats
export const validatePhone = (phone: string, locale?: string) => {
  const currentLocale = locale || getCurrentLanguage()
  
  if (currentLocale === 'vi') {
    // Vietnamese phone validation
    const vnPhoneRegex = /^(\+84|84|0)?[1-9][0-9]{8}$/
    return vnPhoneRegex.test(phone.replace(/\s/g, ''))
  } else {
    // US phone validation
    const usPhoneRegex = /^(\+1|1)?[2-9]\d{9}$/
    return usPhoneRegex.test(phone.replace(/\D/g, ''))
  }
}

export const validatePostalCode = (code: string, locale?: string) => {
  const currentLocale = locale || getCurrentLanguage()
  
  if (currentLocale === 'vi') {
    // Vietnamese postal code (6 digits)
    return /^\d{6}$/.test(code)
  } else {
    // US ZIP code (5 or 9 digits)
    return /^\d{5}(-\d{4})?$/.test(code)
  }
}