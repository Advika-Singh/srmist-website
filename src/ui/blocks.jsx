import { useId, useRef, useState } from 'react'
import { Arrow } from '../shared.jsx'

/**
 * Table that never scrolls sideways. On wide screens it is a normal table; below 720px each row
 * becomes a stacked card whose cells are labelled from their column header (see .rt in redesign.css).
 * Explicit ARIA roles keep it a table for screen readers after CSS changes the display type.
 */
export function ResponsiveTable({ caption, columns, rows }) {
  return (
    <table className="rt" role="table">
      <caption>{caption}</caption>
      <thead>
        <tr role="row">
          {columns.map((c) => (
            <th key={c.key} role="columnheader" scope="col">
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} role="row">
            {columns.map((c, j) =>
              j === 0 ? (
                <th key={c.key} role="rowheader" scope="row" data-label={c.label}>
                  {r[c.key]}
                </th>
              ) : (
                <td key={c.key} role="cell" data-label={c.label}>
                  {r[c.key]}
                </td>
              ),
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/** Accessible tabs (WAI-ARIA tabs pattern): arrow keys, Home/End, only the active panel is rendered. */
export function Tabs({ tabs, label, initial = 0, onChange }) {
  const [i, setI] = useState(initial)
  const base = useId()
  const refs = useRef([])
  const go = (n) => {
    const next = (n + tabs.length) % tabs.length
    setI(next)
    onChange?.(tabs[next].id)
    refs.current[next]?.focus()
  }
  return (
    <div className="tabs">
      <div className="tab-list" role="tablist" aria-label={label}>
        {tabs.map((t, n) => (
          <button
            key={t.id}
            ref={(el) => (refs.current[n] = el)}
            role="tab"
            id={`${base}-t${n}`}
            aria-selected={i === n}
            aria-controls={`${base}-p${n}`}
            tabIndex={i === n ? 0 : -1}
            onClick={() => go(n)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') (e.preventDefault(), go(n + 1))
              else if (e.key === 'ArrowLeft') (e.preventDefault(), go(n - 1))
              else if (e.key === 'Home') (e.preventDefault(), go(0))
              else if (e.key === 'End') (e.preventDefault(), go(tabs.length - 1))
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="tab-panel" role="tabpanel" id={`${base}-p${i}`} aria-labelledby={`${base}-t${i}`} tabIndex={0}>
        {tabs[i].render()}
      </div>
    </div>
  )
}

/** Horizontal scroll-snap carousel. Native scrolling (touch, trackpad, keyboard) plus prev/next buttons. */
export function Carousel({ label, children }) {
  const track = useRef(null)
  const by = (dir) => {
    const el = track.current
    if (!el) return
    const step = el.firstElementChild ? el.firstElementChild.getBoundingClientRect().width + 16 : el.clientWidth * 0.8
    el.scrollBy({ left: dir * step, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }
  return (
    <div className="carousel">
      <div className="carousel-ctrl">
        <button onClick={() => by(-1)} aria-label={`Previous ${label}`}>
          <span aria-hidden="true" style={{ display: 'inline-flex', transform: 'scaleX(-1)' }}><Arrow /></span>
        </button>
        <button onClick={() => by(1)} aria-label={`Next ${label}`}>
          <Arrow />
        </button>
      </div>
      <div className="carousel-track" ref={track} role="region" aria-label={label} tabIndex={0}>
        {children}
      </div>
    </div>
  )
}

/** The university's formal status, set large so it can't be missed (used on Home and About). */
export function AboutDeemed({ headingLevel: H = 'h2' }) {
  return (
    <section className="about-d" id="about" aria-labelledby="about-d-h">
      <div className="about-d-badge">
        <span className="about-d-seal" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="m12 3 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.3 6.8 19.1l1-5.8L3.5 9.2l5.9-.9L12 3Z" /></svg>
        </span>
        <div>
          <b>Deemed to be University</b>
          <small>Under Section 3 of the UGC Act, 1956</small>
        </div>
      </div>
      <H id="about-d-h" className="about-d-title">
        SRM Institute of Science and Technology
      </H>
      <p className="about-d-lead">
        A multidisciplinary university in Chennai, serving learners since 1985 across engineering, medicine, management, law,
        science, architecture, agriculture and hospitality.
      </p>
      <dl className="about-d-facts">
        <div><dt>Accreditation</dt><dd>NAAC A++</dd></div>
        <div><dt>NIRF 2025</dt><dd>11th, universities</dd></div>
        <div><dt>Campuses</dt><dd>Six</dd></div>
        <div><dt>Since</dt><dd>1985</dd></div>
      </dl>
      <a className="about-d-link" href="/about">
        About SRMIST <Arrow />
      </a>
    </section>
  )
}
