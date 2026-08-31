import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ShieldCheck, PhoneCall, MapPinned, Sparkles } from 'lucide-react'
import Nav from './components/Nav.jsx'
import Footer from './components/Footer.jsx'
import LanguageSwitcher from './components/LanguageSwitcher.jsx'
import HeroIllustration from './components/HeroIllustration.jsx'
import ReportCase from './pages/ReportCase.jsx'
import CaseLedger from './pages/CaseLedger.jsx'
import VetDesk from './pages/VetDesk.jsx'
import VetLocator from './pages/VetLocator.jsx'
import { useLanguage } from './i18n/LanguageContext.jsx'

export default function App() {
  const { t } = useLanguage()
  // Prefer a real photo/illustration dropped at public/images/hero-banner.png
  // (e.g. exported from Canva) and fall back to the built-in SVG if it's
  // not there yet, so the app never breaks waiting on an asset.
  const [photoFailed, setPhotoFailed] = useState(false)

  return (
    <div className="shell">
      <div className="masthead-top">
        <div className="brand">
          <div className="brand-mark">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h1>{t.appName}</h1>
            <div className="subtitle">{t.tagline}</div>
          </div>
        </div>
        <LanguageSwitcher />
      </div>

      <section className="hero">
        <div className="hero-copy">
          <span className="hero-kicker"><Sparkles size={13} /> {t.heroKicker}</span>
          <h2 className="hero-title">{t.appName}</h2>
          <p className="hero-sub">{t.tagline}</p>
          <div className="hero-badges">
            <span className="hero-badge"><ShieldCheck size={14} /> {t.heroBadges.risk}</span>
            <span className="hero-badge"><MapPinned size={14} /> {t.heroBadges.vets}</span>
            <span className="hero-badge"><PhoneCall size={14} /> {t.heroBadges.helpline}</span>
          </div>
        </div>
        {photoFailed ? (
          <HeroIllustration className="hero-illustration" />
        ) : (
          <img
            src="/images/hero-banner.png"
            alt="Illustration of a farmer with healthy livestock and a veterinarian"
            className="hero-illustration"
            onError={() => setPhotoFailed(true)}
          />
        )}
      </section>

      <header className="masthead">
        <Nav />
      </header>

      <Routes>
        <Route path="/" element={<ReportCase />} />
        <Route path="/ledger" element={<CaseLedger />} />
        <Route path="/vets" element={<VetDesk />} />
        <Route path="/find-a-vet" element={<VetLocator />} />
      </Routes>

      <Footer />
    </div>
  )
}
