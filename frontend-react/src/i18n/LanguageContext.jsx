import { createContext, useContext, useState } from 'react'
import { translations } from './translations.js'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(localStorage.getItem('pashurakshak_lang') || 'en')

  const changeLang = (next) => {
    setLang(next)
    localStorage.setItem('pashurakshak_lang', next)
  }

  const t = translations[lang] || translations.en

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider')
  return ctx
}
