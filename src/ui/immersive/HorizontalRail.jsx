import { useEffect, useId, useRef } from 'react'
import { clamp01 } from '../../lib/motion.js'
import { useMotionOk, useScrollProgress } from '../../lib/useScrollProgress.js'
import { Arrow } from '../../shared.jsx'

/**
 * Vertical scroll becomes sideways travel of a row of big cards while the section is pinned (max 200vh of scroll).
 * Without motion the same row is a normal sideways-scrolling strip. Cards with no content show a dashed placeholder.
 * items: [{ title, meta?, text?, href?, cta?, placeholder? }]
 */
export default function HorizontalRail({ heading, items }) {
  const motionOk = useMotionOk()
  const root = useRef(null)
  const track = useRef(null)
  const travel = useRef(0)
  const uid = useId()

  // how far the row has to travel, and how tall the section must be to give it that much scroll
  useEffect(() => {
    if (!motionOk) return
    const measure = () => {
      const t = track.current
      const r = root.current
      if (!t || !r) return
      travel.current = Math.max(0, t.scrollWidth - window.innerWidth + 0.12 * window.innerWidth)
      r.style.height = `${window.innerHeight + Math.min(travel.current, window.innerHeight * 1.6)}px`
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [motionOk, items.length])

  useScrollProgress(
    root,
    (p) => {
      if (track.current) track.current.style.transform = `translate3d(${-p * travel.current}px,0,0)`
    },
    motionOk,
  )

  // Tab to a card that is off screen: scroll the page so the row brings it into view
  const onFocus = (e) => {
    if (!motionOk) return
    const card = e.target.closest('.rl-card')
    const r = root.current
    if (!card || !r) return
    const total = r.offsetHeight - window.innerHeight
    const p = clamp01((card.offsetLeft - 0.08 * window.innerWidth) / Math.max(1, travel.current))
    window.scrollTo({ top: r.getBoundingClientRect().top + window.scrollY + p * total, behavior: 'auto' })
  }

  const cards = items.map((it, i) => (
    <li key={it.title + i} className="rl-card">
      {it.meta && <span className="rl-meta">{it.meta}</span>}
      <h3>{it.title}</h3>
      {it.text && <p>{it.text}</p>}
      {it.placeholder && <p className="hs-missing">[{it.placeholder}]</p>}
      {it.href && (
        <a className="rl-link" href={it.href} {...(/^https?:/.test(it.href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
          {it.cta ?? 'Open'} <Arrow />
        </a>
      )}
    </li>
  ))

  if (!motionOk) {
    return (
      <section className="rl-flat" aria-labelledby={`${uid}-h`}>
        <h2 id={`${uid}-h`}>{heading}</h2>
        <ul className="rl-track rl-track--flat">{cards}</ul>
      </section>
    )
  }
  return (
    <section ref={root} className="rl" aria-labelledby={`${uid}-h`}>
      <div className="rl-stage">
        <h2 id={`${uid}-h`} className="rl-heading">
          {heading}
        </h2>
        <ul ref={track} className="rl-track" onFocusCapture={onFocus}>
          {cards}
        </ul>
      </div>
    </section>
  )
}
