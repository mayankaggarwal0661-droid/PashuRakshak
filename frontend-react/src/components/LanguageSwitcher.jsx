import { Languages } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { languageNames } from '../i18n/translations.js'

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage()

  return (
    <div className="lang-switcher">
      <Languages size={16} />
      <select value={lang} onChange={(e) => setLang(e.target.value)} aria-label="Choose language">
        {Object.entries(languageNames).map(([code, label]) => (
          <option key={code} value={code}>{label}</option>
        ))}
      </select>
    </div>
  )
}
