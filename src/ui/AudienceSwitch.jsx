import { useCallback, useState } from 'react'
import { AUDIENCES, isAudience, parseAudience } from '../data/audiences.js'
import { useLang } from '../i18n.jsx'
import { track } from '../lib/experiments.js'

const KEY = 'srm-audience'
const read = () => {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

/** The chosen audience, remembered on this device. ?for=parent in the URL wins on load. */
export function useAudience() {
  const [audience, set] = useState(() => parseAudience(typeof location === 'undefined' ? '' : location.search, read()))
  const change = useCallback((id) => {
    if (!isAudience(id)) return
    set(id)
    try {
      localStorage.setItem(KEY, id)
    } catch {
      /* storage blocked: the choice lasts until the page is closed */
    }
    track('audience_selected', { audience: id })
  }, [])
  return [audience, change]
}

const isApp = (href) => href.startsWith('/')

export default function AudienceSwitch({ audience, onChange }) {
  const { t } = useLang()
  const current = AUDIENCES.find((a) => a.id === audience) ?? AUDIENCES[0]
  const [announce, setAnnounce] = useState('') // empty until the person actually changes it, so nothing is read out on load

  return (
    <section className="aud" aria-label="Show me what matters to me">
      <fieldset className="aud-pills">
        <legend>{t('I’m a')}</legend>
        {AUDIENCES.map((a) => (
          <label key={a.id} className={`aud-pill ${a.id === current.id ? 'is-on' : ''}`}>
            <input
              type="radio"
              name="audience"
              value={a.id}
              checked={a.id === current.id}
              onChange={() => {
                onChange(a.id)
                setAnnounce(`Showing the ${a.label.toLowerCase()} view`)
              }}
            />
            <span>{t(a.label)}</span>
          </label>
        ))}
      </fieldset>
      <ul className="aud-links" aria-label={`Quick links for ${current.label.toLowerCase()}s`}>
        {current.links.map(([label, href]) => (
          <li key={href + label}>
            <a href={href} {...(isApp(href) ? {} : { target: '_blank', rel: 'noopener noreferrer' })}>
              {t(label)}
              {!isApp(href) && <span className="sr-only"> (opens in a new tab)</span>}
            </a>
          </li>
        ))}
      </ul>
      <p className="sr-only" role="status" aria-live="polite">
        {announce}
      </p>
    </section>
  )
}
