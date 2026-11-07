import { useId, useRef, useState } from 'react'
import { Arrow } from '../../shared.jsx'

/**
 * A chooser: pick a step on the left (click, tap, or arrow keys) and its panel opens on the right.
 * Used where the person decides the path (scholarship type, exam stage), so it never depends on scrolling.
 * steps: [{ title, text?, items?, links?: [label, href][] }]
 */
export default function Stepper({ heading, intro, steps }) {
  const [on, setOn] = useState(0)
  const uid = useId()
  const btns = useRef([])

  const onKey = (e) => {
    const move = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0
    if (!move) return
    e.preventDefault()
    const n = (on + move + steps.length) % steps.length
    setOn(n)
    btns.current[n]?.focus()
  }

  return (
    <section className="sp" aria-labelledby={`${uid}-h`}>
      <div className="sp-head">
        <h2 id={`${uid}-h`}>{heading}</h2>
        {intro && <p>{intro}</p>}
      </div>
      <div className="sp-grid">
        <div className="sp-tabs" role="tablist" aria-label={heading} onKeyDown={onKey}>
          {steps.map((s, i) => (
            <button
              key={s.title}
              ref={(n) => (btns.current[i] = n)}
              role="tab"
              id={`${uid}-t${i}`}
              aria-selected={i === on}
              aria-controls={`${uid}-p${i}`}
              tabIndex={i === on ? 0 : -1}
              className={i === on ? 'is-on' : ''}
              onClick={() => setOn(i)}
            >
              <span>{String(i + 1).padStart(2, '0')}</span>
              {s.title}
            </button>
          ))}
        </div>
        {steps.map((s, i) => (
          <div key={s.title} role="tabpanel" id={`${uid}-p${i}`} aria-labelledby={`${uid}-t${i}`} hidden={i !== on} className="sp-panel">
            <h3>{s.title}</h3>
            {s.text && <p>{s.text}</p>}
            {s.items && (
              <ul className="sk-chips">
                {s.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            )}
            {s.links && (
              <ul className="sp-links">
                {s.links.map(([label, href]) => (
                  <li key={href}>
                    <a href={href} target="_blank" rel="noopener noreferrer">
                      {label} <Arrow />
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
