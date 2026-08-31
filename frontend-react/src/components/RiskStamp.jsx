import { useLanguage } from '../i18n/LanguageContext.jsx'
import { riskLevels } from '../i18n/translations.js'

export default function RiskStamp({ level }) {
  const { lang } = useLanguage()
  if (!level) return null
  const label = (riskLevels[lang] || riskLevels.en)[level] || level
  return <span className={`risk-stamp risk-${level}`}>{label}</span>
}
