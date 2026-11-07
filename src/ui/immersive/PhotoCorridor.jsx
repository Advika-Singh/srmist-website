import { useId, useMemo, useRef, useState } from 'react'
import { useLang } from '../../i18n.jsx'
import { clamp01, smooth } from '../../lib/motion.js'
import { useScrollProgress } from '../../lib/useScrollProgress.js'
import { Arrow } from '../../shared.jsx'

/**
 * A scroll-driven 3D corridor of photos (the home page's Learn · Leap · Lead moment, made reusable).
 * Photos start on the centre line facing you, then swing out to the walls as they fly past the camera.
 * `stages` are the headline texts that change as you scroll; `photos` are image paths.
 * The caller decides when to use it (motion allowed) and what to show otherwise.
 */
const ASPECT = {
  '/srmist/campus-main-building.jpg': 1.5,
  '/srmist/students.jpg': 1.6,
  '/srmist/tech-park.jpg': 0.8,
  '/srmist/labs.jpg': 1.5,
  '/srmist/hero.webp': 1.78,
  '/srmist/sports.jpg': 1.5,
  '/srmist/library.jpg': 2.2,
  '/srmist/admission-india.jpg': 1.5,
  '/srmist/research.jpg': 1.5,
}

const COUNT = 30
const STEP = 480
const WALL = 720
const NEAR = 760
const FAR = 6200
const TRAVEL = (COUNT - 1) * (STEP / 2) + 420
const PERSPECTIVE = 1050

export default function PhotoCorridor({ stages, photos, startBg = 'var(--blue)', endBg = 'var(--blue)', style, label }) {
  const root = useRef(null)
  const stage = useRef(null)
  const panels = useRef([])
  const lastActive = useRef(-1)
  const [active, setActive] = useState(0)
  const { t } = useLang()
  const uid = useId()

  const layout = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => {
        const src = photos[(i * 5) % photos.length]
        const h = 380
        return { src, side: i % 2 === 0 ? -1 : 1, w: Math.min(600, h * (ASPECT[src] ?? 1.5)), h, z: -i * (STEP / 2), y: ((i * 97) % 5) * 5 - 10, shift: ((i * 71) % 90) - 45 }
      }),
    [photos],
  )

  useScrollProgress(root, (current) => {
    const cam = current * TRAVEL
    layout.forEach((p, i) => {
      const node = panels.current[i]
      if (!node) return
      const z = p.z + cam
      const depth = -z
      if (depth > FAR || z > NEAR) {
        node.style.opacity = '0'
        node.style.visibility = 'hidden'
        return
      }
      const fadeIn = 1 - smooth(FAR * 0.84, FAR, depth)
      const fadeOut = 1 - smooth(NEAR - 520, NEAR, z)
      const near = clamp01(1 - depth / FAR)
      const turn = 64 * smooth(0.22, 0.85, near)
      const spread = 0.08 + 0.92 * smooth(0.05, 0.8, near)
      node.style.visibility = 'visible'
      node.style.opacity = String(Math.min(fadeIn, fadeOut))
      node.style.transform = `translate3d(${p.side * (WALL + p.shift) * spread}px, ${p.y}px, ${z}px) translate(-50%, -50%) rotateY(${-p.side * turn}deg)`
    })
    const s = stage.current
    if (s) {
      s.style.setProperty('--tn-dark', (smooth(0, 0.1, current) * (1 - smooth(0.88, 1, current))).toFixed(3))
      s.style.setProperty('--tn-edge', current < 0.5 ? startBg : endBg)
      s.style.setProperty('--tn-fade', (1 - smooth(0.9, 1, current)).toFixed(3))
    }
    const a = Math.min(stages.length - 1, Math.floor(current * stages.length * 0.999))
    if (a !== lastActive.current) {
      lastActive.current = a
      setActive(a)
    }
  })

  return (
    <section ref={root} className="tn" aria-labelledby={`${uid}-h`} style={{ ...style, '--tn-start': startBg, '--tn-end': endBg }}>
      <div ref={stage} className="tn-stage" style={{ '--tn-dark': 0, '--tn-fade': 1 }}>
        <div className="tn-world" style={{ perspective: `${PERSPECTIVE}px` }} aria-hidden="true">
          {layout.map((p, i) => (
            <figure key={i} ref={(n) => (panels.current[i] = n)} className="tn-panel" style={{ width: p.w, height: p.h }}>
              <img src={p.src} alt="" decoding="async" draggable="false" />
            </figure>
          ))}
        </div>
        <div className="tn-copy">
          <h2 id={`${uid}-h`} className="tn-words">
            {stages.every((s) => s.word)
              ? stages.map((s, i) => (
                  <span key={s.word} className={i === active ? 'is-on' : ''}>
                    {t(s.word)}
                    {i < stages.length - 1 && <i aria-hidden="true"> · </i>}
                  </span>
                ))
              : (label ?? '')}
          </h2>
          <div className="tn-stack">
            {stages.map((s, i) => (
              <article key={s.title} className={`tn-stage-text ${i === active ? 'is-on' : ''}`} aria-hidden={i !== active}>
                <h3>{t(s.title)}</h3>
                <p>{t(s.text)}</p>
                {s.href && (
                  <a href={s.href} tabIndex={i === active ? 0 : -1}>
                    {t(s.cta ?? 'Explore')} <Arrow />
                  </a>
                )}
              </article>
            ))}
          </div>
          <span className="tn-count" aria-hidden="true">
            0{active + 1} / 0{stages.length}
          </span>
        </div>
        <div className="tn-vignette" aria-hidden="true" />
      </div>
    </section>
  )
}
