import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { INDEX } from '../data/search-index.js'
import { search } from '../lib/search.js'
import { Arrow, Footer, SiteHeader } from '../shared.jsx'
import { openSearch } from '../ui/SmartSearch.jsx'
import { ICONS } from '../ui/SrmSketch.jsx'
import '../styles/notfound.css'

const GO = [
  ['Home', '/', 'Back to the start'],
  ['Admissions 2027', '/admissions', 'Fees, dates and how to apply'],
  ['Course finder', '/course-finder', 'Answer five questions, get a recommendation'],
  ['Staff finder', '/staff-finder', 'Faculty and staff, with photos'],
  ['Campus map', '/visitors', 'Where things are on campus'],
  ['Clubs', '/clubs', 'Fifteen clubs under DSA'],
]

// the icons that drift around the numbers, with how far each one reacts to the pointer
const FLOATERS = ['graduation cap', 'flask', 'atom', 'book', 'light bulb', 'drawing compass', 'leaf', 'gear']
const SPOTS = [
  [8, 22, 0.9], [20, 68, 1.4], [32, 12, 0.6], [14, 88, 1.1], [86, 18, 1.2], [74, 70, 0.7], [90, 62, 1.5], [62, 10, 0.8],
]

const Icon = ({ ic }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {ic.d.map((p, i) => (typeof p === 'string' ? <path key={i} d={p} /> : <path key={i} d={p.d} transform={p.t} />))}
  </svg>
)

function Compass() {
  const ticks = Array.from({ length: 36 }, (_, i) => {
    const a = (i * 10 * Math.PI) / 180
    const r1 = i % 9 === 0 ? 40 : 44
    return `M${50 + r1 * Math.sin(a)} ${50 - r1 * Math.cos(a)}L${50 + 48 * Math.sin(a)} ${50 - 48 * Math.cos(a)}`
  }).join('')
  return (
    <svg className="nf-compass" viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="49" className="nf-ring" pathLength="1" />
      <path d={ticks} className="nf-ticks" />
      <text x="50" y="30" textAnchor="middle" className="nf-n">N</text>
      <g className="nf-needle">
        <path d="M50 18L56 50L50 82L44 50Z" className="nf-needle-body" />
        <path d="M50 18L56 50L44 50Z" className="nf-needle-tip" />
      </g>
      <circle cx="50" cy="50" r="4" className="nf-pin" />
    </svg>
  )
}

export default function NotFound() {
  const { pathname } = useLocation()
  const root = useRef(null)

  // keep the tab title from being overwritten by the app's own title logic
  useLayoutEffect(() => {
    document.body.dataset.nf = '1'
    document.title = 'Page not found — SRMIST'
    return () => {
      delete document.body.dataset.nf
    }
  }, [])

  // icons drift a little toward the pointer, each by its own amount
  useEffect(() => {
    const el = root.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const move = (e) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect()
        el.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3))
        el.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3))
      })
    }
    el.addEventListener('pointermove', move)
    return () => {
      el.removeEventListener('pointermove', move)
      cancelAnimationFrame(raf)
    }
  }, [])

  const wanted = pathname === '/404' ? '' : decodeURIComponent(pathname).replace(/[/_.-]+/g, ' ').trim()
  const near = useMemo(() => (wanted ? search(INDEX, wanted, {}, 3).results.filter((e) => e.type !== 'action') : []), [wanted])

  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="interior nf" ref={root}>
        <div className="nf-orbs" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <div className="nf-grid" aria-hidden="true" />
        {FLOATERS.map((name, i) => {
          const ic = ICONS.find((x) => x.name === name)
          const [x, y, depth] = SPOTS[i]
          return (
            <span key={name} className="nf-float" aria-hidden="true" style={{ left: `${x}%`, top: `${y}%`, '--d': depth, '--i': i }}>
              <Icon ic={ic} />
            </span>
          )
        })}

        <section className="nf-hero">
          <span className="eyebrow">Error 404</span>
          <h1 className="nf-code" aria-label="404">
            <span>4</span>
            <Compass />
            <span>4</span>
          </h1>
          <h2>This page wandered off campus.</h2>
          <p>
            {wanted ? (
              <>
                We could not find <code>{pathname}</code>. It may have moved, or the link may have a typo.
              </>
            ) : (
              'This is what you see when a link leads nowhere. It may have moved, or the address may have a typo.'
            )}
          </p>
          <div className="nf-actions">
            <a className="button" href="/">
              Take me home <Arrow />
            </a>
            <button type="button" className="button button-ghost" onClick={openSearch}>
              Search the site <kbd>Ctrl K</kbd>
            </button>
          </div>
          {near.length > 0 && (
            <div className="nf-mean">
              <span>Did you mean</span>
              {near.map((e) => (
                <a key={e.href} href={e.href}>
                  {e.title}
                </a>
              ))}
            </div>
          )}
        </section>

        <section className="nf-links" aria-label="Popular places">
          <ul>
            {GO.map(([title, href, hint], i) => (
              <li key={href} style={{ '--i': i }}>
                <a href={href}>
                  <b>{title}</b>
                  <span>{hint}</span>
                  <i aria-hidden="true">
                    <Arrow />
                  </i>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Footer />
    </>
  )
}
