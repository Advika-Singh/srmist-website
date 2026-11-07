import { useId, useRef, useState } from 'react'
import { smooth, stageIndex } from '../../lib/motion.js'
import { useMotionOk, useScrollProgress } from '../../lib/useScrollProgress.js'
import { Arrow } from '../../shared.jsx'

/**
 * A pinned story: the page holds still while the text (left) and a big visual (right) change stage by stage as you scroll.
 * Phones, short screens and reduced motion get the same stages stacked one after another.
 * stages: [{ kicker?, title, text, big?, items?, href?, cta? }]   (`big` is the large figure shown on the right)
 */
export default function StickyStory({ stages, startBg = 'var(--blue)', endBg = 'var(--blue)', heading }) {
  const motionOk = useMotionOk()
  const root = useRef(null)
  const stage = useRef(null)
  const last = useRef(-1)
  const [active, setActive] = useState(0)
  const uid = useId()

  useScrollProgress(
    root,
    (p) => {
      const s = stage.current
      if (s) {
        s.style.setProperty('--sk-dark', (smooth(0, 0.08, p) * (1 - smooth(0.92, 1, p))).toFixed(3))
        s.style.setProperty('--sk-edge', p < 0.5 ? startBg : endBg)
        s.style.setProperty('--sk-p', p.toFixed(3))
      }
      const a = stageIndex(p, stages.length)
      if (a !== last.current) {
        last.current = a
        setActive(a)
      }
    },
    motionOk,
  )

  if (!motionOk) {
    return (
      <section className="sk-flat" aria-label={heading}>
        {stages.map((s) => (
          <article key={s.title} className="sk-flat-item">
            {s.kicker && <span className="eyebrow">{s.kicker}</span>}
            <h3>{s.title}</h3>
            <p>{s.text}</p>
            {s.big && <p className="sk-flat-big">{s.big}</p>}
            {s.items && <ul className="sk-chips">{s.items.map((i) => <li key={i}>{i}</li>)}</ul>}
            {s.href && (
              <a className="text-link" href={s.href}>
                {s.cta ?? 'Explore'} <Arrow />
              </a>
            )}
          </article>
        ))}
      </section>
    )
  }

  const height = `${Math.min(260, 100 + stages.length * 70)}vh`
  return (
    <section ref={root} className="sk" style={{ height }} aria-labelledby={heading ? `${uid}-h` : undefined}>
      <div ref={stage} className="sk-stage" style={{ '--sk-dark': 0, '--sk-edge': startBg }}>
        {heading && (
          <h2 id={`${uid}-h`} className="sk-heading">
            {heading}
          </h2>
        )}
        <div className="sk-grid">
          <div className="sk-texts">
            {stages.map((s, i) => (
              <article key={s.title} className={`sk-text ${i === active ? 'is-on' : ''}`} aria-hidden={i !== active}>
                {s.kicker && <span className="eyebrow">{s.kicker}</span>}
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                {s.items && (
                  <ul className="sk-chips">
                    {s.items.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>
                )}
                {s.href && (
                  <a className="sk-link" href={s.href} tabIndex={i === active ? 0 : -1}>
                    {s.cta ?? 'Explore'} <Arrow />
                  </a>
                )}
              </article>
            ))}
          </div>
          <div className="sk-visual" aria-hidden="true">
            {stages.map((s, i) => (
              <div key={s.title} className={`sk-big ${i === active ? 'is-on' : ''}`}>
                {s.big ?? String(i + 1).padStart(2, '0')}
              </div>
            ))}
          </div>
        </div>
        <ol className="sk-rail" aria-hidden="true">
          {stages.map((s, i) => (
            <li key={s.title} className={i <= active ? 'is-on' : ''} />
          ))}
        </ol>
      </div>
    </section>
  )
}
