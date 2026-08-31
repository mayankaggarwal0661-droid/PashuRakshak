// Original, hand-authored illustration — no external image assets, so
// there's nothing to license and it always renders instantly. Depicts a
// simple pastoral scene: fields, a grazing animal, and a caduceus-style
// mark for veterinary care.
export default function HeroIllustration({ className }) {
  return (
    <svg className={className} viewBox="0 0 480 280" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustration of pastureland with a healthy cow under veterinary watch">
      <rect x="0" y="0" width="480" height="280" rx="24" fill="#EEF6EE" />
      <path d="M0 190 Q120 150 240 185 T480 175 V280 H0 Z" fill="#CFE8D2" />
      <path d="M0 215 Q140 185 260 210 T480 205 V280 H0 Z" fill="#1F7A4D" opacity="0.85" />

      <circle cx="400" cy="60" r="34" fill="#F6C453" opacity="0.9" />

      <g transform="translate(60,150)">
        <ellipse cx="70" cy="78" rx="72" ry="16" fill="#0F5132" opacity="0.12" />
        <rect x="20" y="30" width="100" height="46" rx="20" fill="#FFFFFF" stroke="#0F5132" strokeWidth="3" />
        <circle cx="34" cy="60" r="10" fill="#1B2B22" />
        <circle cx="106" cy="60" r="10" fill="#1B2B22" />
        <path d="M108 20 q22 -18 34 2 q-16 10 -34 -2z" fill="#FFFFFF" stroke="#0F5132" strokeWidth="3" />
        <circle cx="30" cy="16" r="18" fill="#FFFFFF" stroke="#0F5132" strokeWidth="3" />
        <circle cx="24" cy="14" r="2.5" fill="#1B2B22" />
        <path d="M8 6 q6 -10 16 -6" stroke="#0F5132" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M40 4 q8 -6 14 2" stroke="#0F5132" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M8 30 q-4 20 6 34" stroke="#0F5132" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M120 34 q6 18 -2 32" stroke="#0F5132" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>

      <g transform="translate(300,60)">
        <circle cx="40" cy="40" r="40" fill="#FFFFFF" stroke="#E8871E" strokeWidth="3" />
        <path d="M40 18 v44 M22 34 h36" stroke="#E8871E" strokeWidth="6" strokeLinecap="round" />
      </g>
    </svg>
  )
}
