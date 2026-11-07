import { useId, useRef, useState } from 'react'
import { useLang } from '../../i18n.jsx'
import { clamp01, smooth } from '../../lib/motion.js'
import { useScrollProgress } from '../../lib/useScrollProgress.js'

/**
 * A pinned, dark collage of facility photos. As you scroll, the photos drift across the stage at slightly
 * different speeds; the one nearest the focus point scales up and turns from grey to full colour while the
 * heading on the left follows it. `items` are { src, name, kicker, text, ratio?, pos? }.
 * The caller decides when to use it (motion allowed) and what to show otherwise.
 */
const FOCUS_X = 60 // % of the stage width where the focused photo rests
const GAP = 34 // % of the stage width between neighbouring photos
const LANE = [-15, 14, -4, 17, -17, 8, -9, 15] // vertical lanes (% of stage height) so photos stagger

export default function FacilityCollage({ heading, items, startBg = 'var(--ink)', endBg = 'var(--paper)', style }) {
  const root = useRef(null)
  const stage = useRef(null)
  const cards = useRef([])
  const last = useRef(-1)
  const [active, setActive] = useState(0)
  const { t } = useLang()
  const uid = useId()
  const n = items.length

  useScrollProgress(root, (p) => {
    const f = clamp01(p * 1.02 - 0.01) * (n - 1)
    items.forEach((_, i) => {
      const node = cards.current[i]
      if (!node) return
      const d = i - f
      const w = Math.exp(-(d * d) / 0.32) // 1 when this photo is the focus, falling away quickly
      const speed = 0.9 + ((i * 37) % 5) * 0.06 // slight parallax between photos
      const x = FOCUS_X + d * GAP * speed
      const y = 50 + LANE[i % LANE.length] * (1 - 0.55 * w)
      const gone = Math.abs(d) > 2.6
      node.style.visibility = gone ? 'hidden' : 'visible'
      node.style.opacity = String(gone ? 0 : (0.5 + 0.5 * w) * (1 - smooth(1.8, 2.6, Math.abs(d))))
      node.style.zIndex = String(Math.round(w * 10))
      node.style.transform = `translate3d(${x}cqw, ${y}cqh, 0) translate(-50%, -50%) scale(${(0.7 + 0.45 * w).toFixed(3)})`
      node.style.filter = `grayscale(${(1 - w).toFixed(2)}) brightness(${(0.85 + 0.15 * w).toFixed(2)})`
    })
    const s = stage.current
    if (s) {
      s.style.setProperty('--fcl-fade', (1 - smooth(0.93, 1, p)).toFixed(3))
      s.style.setProperty('--fcl-edge', p < 0.5 ? startBg : endBg)
      s.style.setProperty('--fcl-in', smooth(0, 0.06, p).toFixed(3))
    }
    const a = Math.round(f)
    if (a !== last.current) {
      last.current = a
      setActive(a)
    }
  })

  return (
    <section ref={root} className="fcl" aria-labelledby={`${uid}-h`} style={{ ...style, '--fcl-n': n }}>
      <div ref={stage} className="fcl-stage" style={{ '--fcl-fade': 1, '--fcl-in': 0, '--fcl-edge': startBg }}>
        <div className="fcl-panel">
          <div className="fcl-copy">
            <span className="eyebrow">{t('Facilities & laboratories')}</span>
            <h2 id={`${uid}-h`}>{t(heading)}</h2>
            <div className="fcl-now">
              {items.map((it, i) => (
                <article key={it.name} className={i === active ? 'is-on' : ''} aria-hidden={i !== active}>
                  <b>{t(it.name)}</b>
                  <p>{t(it.text)}</p>
                </article>
              ))}
            </div>
            <span className="fcl-count" aria-hidden="true">
              {String(active + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
            </span>
          </div>
          <div className="fcl-field" aria-hidden="true">
            {items.map((it, i) => (
              <figure key={it.name} ref={(el) => (cards.current[i] = el)} className="fcl-card" style={{ aspectRatio: it.ratio ?? 1.45 }}>
                <img src={it.src} alt="" decoding="async" draggable="false" style={{ objectPosition: it.pos ?? '50% 50%' }} />
                <figcaption>{t(it.kicker)}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
