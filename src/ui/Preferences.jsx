import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { LANGS } from '../data/translations.js'
import { useLang } from '../i18n.jsx'

const write = (key, value) => {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* storage blocked: the choice lasts until the page is closed */
  }
}

const WAVES = 6 // ripples on the edge of the spreading circle
const FRAMES = 36

/** Polygon points for a wavy circle of radius r centred on (cx, cy); same point count every frame so the browser can tween it. */
const ring = (cx, cy, r, amp, phase) =>
  Array.from({ length: 72 }, (_, i) => {
    const a = (i / 72) * Math.PI * 2
    const rr = r + amp * Math.sin(a * WAVES + phase)
    return `${(cx + rr * Math.cos(a)).toFixed(1)}px ${(cy + rr * Math.sin(a)).toFixed(1)}px`
  }).join(',')

/** Swap the theme with a wave that spreads from the toggle. Falls back to an instant swap without the API or with reduced motion. */
function switchTheme(next, from, apply) {
  const root = document.documentElement
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!document.startViewTransition || calm) return apply()
  const r = from.getBoundingClientRect()
  const cx = r.left + r.width / 2
  const cy = r.top + r.height / 2
  const reach = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy)) + 120
  root.classList.add('theme-wave')
  const vt = document.startViewTransition(() => {
    flushSync(apply)
    root.setAttribute('data-theme', next)
  })
  vt.ready
    .then(() => {
      const ease = (t) => 1 - Math.pow(1 - t, 3)
      const keyframes = Array.from({ length: FRAMES + 1 }, (_, i) => {
        const t = i / FRAMES
        const amp = 46 * Math.sin(Math.PI * Math.min(1, t * 1.15)) // ripples swell mid-way, flatten at the end
        return { clipPath: `polygon(${ring(cx, cy, reach * ease(t), amp, t * 9)})` }
      })
      root.animate(keyframes, { duration: 1100, easing: 'linear', pseudoElement: '::view-transition-new(root)' })
    })
    .catch(() => {})
  vt.finished.finally(() => root.classList.remove('theme-wave'))
}

/** Language (English / தமிழ் / हिन्दी) and dark theme. Saved on this device only; prefs-init.js applies the theme before first paint. */
export default function Preferences({ className = '', part = 'all' }) {
  const { lang, setLang, t } = useLang()
  const [dark, setDark] = useState(() => document.documentElement.getAttribute('data-theme') === 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    write('srm-theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <div className={`prefs ${className}`} role="group" aria-label="Display settings">
      {part !== 'theme' && (
      <div className="prefs-lang" role="group" aria-label="Language">
        {LANGS.map(([code, label]) => (
          <button key={code} lang={code} onClick={() => setLang(code)} aria-pressed={lang === code}>
            {label}
          </button>
        ))}
      </div>
      )}
      {part !== 'lang' && (
      <button
        className="prefs-theme theme-switch"
        onClick={(e) => switchTheme(dark ? 'light' : 'dark', e.currentTarget, () => setDark((d) => !d))}
        aria-pressed={dark}
        aria-label={dark ? t('Switch to light theme') : t('Switch to dark theme')}
        title={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      >
        <span className="ts-track" aria-hidden="true">
          <i className="ts-knob" />
          <svg className="ts-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" />
          </svg>
          <svg className="ts-moon" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round">
            <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />
          </svg>
        </span>
      </button>
      )}
    </div>
  )
}
