import { NavLink } from 'react-router-dom'
import { ClipboardList, BookOpen, Stethoscope, MapPinned } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext.jsx'

export default function Nav() {
  const { t } = useLanguage()
  const links = [
    { to: '/', label: t.nav.report, end: true, Icon: ClipboardList },
    { to: '/ledger', label: t.nav.ledger, Icon: BookOpen },
    { to: '/vets', label: t.nav.vets, Icon: Stethoscope },
    { to: '/find-a-vet', label: t.nav.map, Icon: MapPinned },
  ]
  return (
    <nav className="tabs">
      {links.map((l) => (
        <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'active' : '')}>
          <l.Icon size={15} style={{ marginRight: 6, verticalAlign: -3 }} />
          {l.label}
        </NavLink>
      ))}
    </nav>
  )
}
