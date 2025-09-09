'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  LanguageIcon,
  CheckIcon,
  GlobeAltIcon 
} from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import { changeLanguage, getCurrentLanguage, getSupportedLanguages } from '@/lib/i18n'

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'toggle' | 'modal'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LanguageSwitcher({ 
  variant = 'dropdown', 
  size = 'md',
  className = '' 
}: LanguageSwitcherProps) {
  const { t, i18n } = useTranslation('common')
  const [isOpen, setIsOpen] = useState(false)
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage())
  const [isChanging, setIsChanging] = useState(false)

  const languages = getSupportedLanguages()
  const currentLanguage = languages.find(lang => lang.code === currentLang)

  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setCurrentLang(lng)
    }

    i18n.on('languageChanged', handleLanguageChange)
    return () => {
      i18n.off('languageChanged', handleLanguageChange)
    }
  }, [i18n])

  const handleLanguageChange = async (langCode: string) => {
    if (langCode === currentLang || isChanging) return

    setIsChanging(true)
    try {
      await changeLanguage(langCode)
      setCurrentLang(langCode)
      setIsOpen(false)
      
      // Update HTML lang attribute
      document.documentElement.lang = langCode
      
      // Save to localStorage
      localStorage.setItem('language', langCode)
    } catch (error) {
      console.error('Failed to change language:', error)
    } finally {
      setIsChanging(false)
    }
  }

  const sizeClasses = {
    sm: 'text-sm p-2',
    md: 'text-base p-3',
    lg: 'text-lg p-4'
  }

  if (variant === 'toggle') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => handleLanguageChange(currentLang === 'en' ? 'vi' : 'en')}
          disabled={isChanging}
          className={`
            ${sizeClasses[size]}
            flex items-center space-x-2 rounded-xl bg-white border border-gray-300 
            hover:bg-gray-50 active:bg-gray-100 transition-all duration-200
            disabled:opacity-50 disabled:pointer-events-none
            touch-target touch-feedback
          `}
        >
          <GlobeAltIcon className="h-5 w-5 text-gray-500" />
          <span className="font-medium text-gray-700">
            {currentLang === 'en' ? 'EN' : 'VI'}
          </span>
          {isChanging && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full"
            />
          )}
        </button>
      </div>
    )
  }

  if (variant === 'modal') {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className={`
            ${sizeClasses[size]} ${className}
            flex items-center space-x-2 rounded-xl bg-white border border-gray-300
            hover:bg-gray-50 active:bg-gray-100 transition-all duration-200
            touch-target touch-feedback
          `}
        >
          <LanguageIcon className="h-5 w-5 text-gray-500" />
          <span className="font-medium text-gray-700">
            {currentLanguage?.nativeName}
          </span>
        </button>

        {/* Modal */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
              onClick={() => setIsOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl p-6 w-full max-w-sm mx-auto"
                onClick={e => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('language.switch')}
                </h3>
                
                <div className="space-y-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      disabled={isChanging}
                      className={`
                        w-full flex items-center justify-between p-3 rounded-xl
                        transition-all duration-200 touch-target
                        ${lang.code === currentLang
                          ? 'bg-primary-50 text-primary-600 border border-primary-200'
                          : 'hover:bg-gray-50 active:bg-gray-100 border border-gray-200'
                        }
                      `}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">
                          {lang.code === 'vi' ? '🇻🇳' : '🇺🇸'}
                        </div>
                        <div className="text-left">
                          <div className="font-medium">{lang.nativeName}</div>
                          <div className="text-sm text-gray-500">{lang.name}</div>
                        </div>
                      </div>
                      
                      {lang.code === currentLang && (
                        <CheckIcon className="h-5 w-5 text-primary-600" />
                      )}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full mt-4 btn-ghost"
                >
                  {t('buttons.close')}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    )
  }

  // Default dropdown variant
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isChanging}
        className={`
          ${sizeClasses[size]}
          flex items-center space-x-2 rounded-xl bg-white border border-gray-300
          hover:bg-gray-50 active:bg-gray-100 transition-all duration-200
          disabled:opacity-50 disabled:pointer-events-none
          touch-target touch-feedback
        `}
      >
        <LanguageIcon className="h-5 w-5 text-gray-500" />
        <span className="font-medium text-gray-700">
          {currentLanguage?.nativeName}
        </span>
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="h-4 w-4 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </motion.svg>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute top-full mt-2 right-0 bg-white rounded-xl shadow-float border border-gray-100 py-2 min-w-48 z-50"
            >
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  disabled={isChanging}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 text-left
                    transition-all duration-200 touch-target
                    ${lang.code === currentLang
                      ? 'bg-primary-50 text-primary-600'
                      : 'hover:bg-gray-50 text-gray-700'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-lg">
                      {lang.code === 'vi' ? '🇻🇳' : '🇺🇸'}
                    </div>
                    <div>
                      <div className="font-medium">{lang.nativeName}</div>
                      <div className="text-xs text-gray-500">{lang.name}</div>
                    </div>
                  </div>
                  
                  {lang.code === currentLang && (
                    <CheckIcon className="h-4 w-4 text-primary-600" />
                  )}
                  
                  {isChanging && lang.code !== currentLang && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-gray-300 border-t-primary-500 rounded-full"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// Mobile-optimized bottom sheet language selector
export function MobileLanguageSwitcher() {
  const { t } = useTranslation('common')
  const [isOpen, setIsOpen] = useState(false)
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage())
  const [isChanging, setIsChanging] = useState(false)

  const languages = getSupportedLanguages()
  const currentLanguage = languages.find(lang => lang.code === currentLang)

  const handleLanguageChange = async (langCode: string) => {
    if (langCode === currentLang || isChanging) return

    setIsChanging(true)
    try {
      await changeLanguage(langCode)
      setCurrentLang(langCode)
      setIsOpen(false)
      document.documentElement.lang = langCode
      localStorage.setItem('language', langCode)
    } catch (error) {
      console.error('Failed to change language:', error)
    } finally {
      setIsChanging(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-3 w-full p-4 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 active:bg-gray-100 transition-colors"
      >
        <GlobeAltIcon className="h-6 w-6 text-gray-500" />
        <div className="flex-1 text-left">
          <div className="font-medium text-gray-900">{t('language.switch')}</div>
          <div className="text-sm text-gray-500">{currentLanguage?.nativeName}</div>
        </div>
        <div className="text-lg">
          {currentLang === 'vi' ? '🇻🇳' : '🇺🇸'}
        </div>
      </button>

      {/* Bottom sheet */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 safe-area-pb"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {t('language.switch')}
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200"
                >
                  <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    disabled={isChanging}
                    className={`
                      w-full flex items-center justify-between p-4 rounded-xl
                      transition-all duration-200 touch-target
                      ${lang.code === currentLang
                        ? 'bg-primary-50 text-primary-600 border-2 border-primary-200'
                        : 'hover:bg-gray-50 active:bg-gray-100 border-2 border-gray-200'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl">
                        {lang.code === 'vi' ? '🇻🇳' : '🇺🇸'}
                      </div>
                      <div className="text-left">
                        <div className="text-lg font-semibold">{lang.nativeName}</div>
                        <div className="text-sm text-gray-500">{lang.name}</div>
                      </div>
                    </div>
                    
                    {lang.code === currentLang && (
                      <CheckIcon className="h-6 w-6 text-primary-600" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Compact flag-only switcher for mobile nav
export function CompactLanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage())
  const [isChanging, setIsChanging] = useState(false)

  const handleToggle = async () => {
    if (isChanging) return
    
    const newLang = currentLang === 'en' ? 'vi' : 'en'
    setIsChanging(true)
    
    try {
      await changeLanguage(newLang)
      setCurrentLang(newLang)
      document.documentElement.lang = newLang
      localStorage.setItem('language', newLang)
    } catch (error) {
      console.error('Failed to change language:', error)
    } finally {
      setIsChanging(false)
    }
  }

  return (
    <motion.button
      onClick={handleToggle}
      disabled={isChanging}
      whileTap={{ scale: 0.95 }}
      className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 active:bg-white/30 transition-all duration-200 touch-target"
    >
      <div className="text-xl">
        {currentLang === 'vi' ? '🇻🇳' : '🇺🇸'}
      </div>
    </motion.button>
  )
}