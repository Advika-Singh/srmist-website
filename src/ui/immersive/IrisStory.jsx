import { useId, useRef, useState } from 'react'
import { useLang } from '../../i18n.jsx'
import { clamp01, smooth } from '../../lib/motion.js'
import { useScrollProgress } from '../../lib/useScrollProgress.js'

/**
 * A pinned full-screen photo story. Each stage's photo opens as an expanding circle (an iris) over the one before,
 * with a slow zoom, while a large word and caption change underneath. `stages` are { word, title, text };
 * `photos` are { src, pos } objects matched to stages by position.
 */
export default function IrisStory({ stages, photos, startBg = 'var(--ink)', endBg = 'var(--paper)', style }) {
  const root = useRef(null)
  const stage = useRef(null)
  const layers = useRef([])
  const last = useRef(-1)
  const [active, setActive] = useState(0)
  const { t } = useLang()
  const uid = useId()
  const n = stages.length

  useScrollProgress(root, (p) => {
    const f = clamp01(p) * (n - 1) // 0..n-1: the whole number is a stage standing still
    layers.current.forEach((node, i) => {
      if (!node) return
      const open = i === 0 ? 1 : smooth(i - 1 + 0.12, i - 0.12, f) // how far this photo's iris has opened
      const r = open * 150
      node.style.clipPath = `circle(${r.toFixed(1)}% at 50% 58%)`
      node.style.visibility = open <= 0 ? 'hidden' : 'visible'
      const img = node.firstElementChild
      if (img) img.style.transform = `scale(${(1.22 - 0.2 * clamp01(f - i + 1)).toFixed(3)})`
    })
    const s = stage.current
    if (s) {
      s.style.setProperty('--iris-in', smooth(0, 0.05, p).toFixed(3))
      s.style.setProperty('--iris-out', (1 - smooth(0.94, 1, p)).toFixed(3))
      s.style.setProperty('--iris-edge', p < 0.5 ? startBg : endBg)
      s.style.setProperty('--iris-p', p.toFixed(3))
    }
    const a = Math.round(f)
    if (a !== last.current) {
      last.current = a
      setActive(a)
    }
  })

  return (
    <section ref={root} className="iris" aria-labelledby={`${uid}-h`} style={{ ...style, '--iris-n': n }}>
      <div ref={stage} className="iris-stage" style={{ '--iris-in': 0, '--iris-out': 1, '--iris-edge': startBg, '--iris-p': 0 }}>
        <div className="iris-photos" aria-hidden="true">
          {stages.map((s, i) => (
            <div key={s.title} ref={(el) => (layers.current[i] = el)} className="iris-layer">
              <img src={photos[i % photos.length].src} alt="" decoding="async" draggable="false" style={{ objectPosition: photos[i % photos.length].pos ?? '50% 50%' }} />
            </div>
          ))}
        </div>
        <div className="iris-shade" aria-hidden="true" />
        <div className="iris-copy">
          <h2 id={`${uid}-h`} className="iris-words">
            {stages.map((s, i) => (
              <span key={s.word} className={i === active ? 'is-on' : ''}>
                {t(s.word)}
              </span>
            ))}
          </h2>
          <div className="iris-text">
            {stages.map((s, i) => (
              <article key={s.title} className={i === active ? 'is-on' : ''} aria-hidden={i !== active}>
                <h3>{t(s.title)}</h3>
                <p>{t(s.text)}</p>
              </article>
            ))}
          </div>
        </div>
        <ol className="iris-dots" aria-hidden="true">
          {stages.map((s, i) => (
            <li key={s.word} className={i === active ? 'is-on' : ''}>
              <span>{String(i + 1).padStart(2, '0')}</span>
            </li>
          ))}
        </ol>
        <div className="iris-bar" aria-hidden="true" />
      </div>
    </section>
  )
}
