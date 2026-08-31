import { Phone } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext.jsx'

export default function Footer() {
  const { t } = useLanguage()
  return (
    <footer className="site-footer">
      <div>
        <strong>{t.appName}</strong> — {t.footer.disclaimer}
      </div>
      <a href="tel:1962" className="helpline-pill">
        <Phone size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
        {t.footer.helpline}: 1962
      </a>
    </footer>
  )
}
