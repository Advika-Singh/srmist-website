import { useEffect, useRef, useState } from 'react'
import { WORDMARK_D } from './srmWordmark.js'

// The sketch at the foot of every page: "SRM" in the logo's own lettering in the middle, with rays, rings and little
// subject icons (study, labs, medicine, law, design, farming, hospitality, ideas) emerging from it.
// It draws itself once, in order, as it scrolls into view.

const CX = 800
const CY = 350
const rad = (deg) => (deg * Math.PI) / 180
const pt = (r, deg) => [CX + r * Math.cos(rad(deg)), CY - r * Math.sin(rad(deg))]
const f = (n) => n.toFixed(1)

// ---- the lettering: the logo's own "SRM" outlines (bounding box 197..599 x 10..143), scaled and centred on the burst ----
const WM_SCALE = 0.95
const WM_TRANSFORM = `translate(${f(CX - 398 * WM_SCALE)} ${f(CY - 76.5 * WM_SCALE)}) scale(${WM_SCALE})`

// ---- rays and rings that emerge from the letters (upper half-circle) ----
const RAYS = Array.from({ length: 25 }, (_, k) => {
  const deg = k * 7.5
  const [x1, y1] = pt(215, deg)
  const [x2, y2] = pt(215 + (k % 2 ? 34 : 66), deg)
  return { d: `M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}`, delay: 0.9 + (Math.abs(k - 12) / 12) * 0.5, gold: k % 6 === 0 }
})
const arc = (r) => {
  const [x1, y1] = pt(r, 180)
  const [x2, y2] = pt(r, 0)
  return `M${f(x1)} ${f(y1)}A${r} ${r} 0 0 1 ${f(x2)} ${f(y2)}`
}

// ---- icons (24 x 24 line drawings), placed around the halo ----
export const ICONS = [
  { name: 'graduation cap', gold: true, d: ['M2 9l10-5 10 5-10 5z', 'M6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5', 'M22 9v6'] },
  { name: 'book', d: ['M3 5c3-1 6-1 9 1 3-2 6-2 9-1v14c-3-1-6-1-9 1-3-2-6-2-9-1z', 'M12 6v14'] },
  { name: 'flask', d: ['M9 3h6', 'M10 3v6l-5 9c-1 2 0 3 2 3h10c2 0 3-1 2-3l-5-9V3', 'M7.5 15h9'] },
  { name: 'atom', d: ['M12 12m-1.4 0a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0-2.8 0', 'M2 12a10 4 0 1 0 20 0a10 4 0 1 0-20 0', { d: 'M2 12a10 4 0 1 0 20 0a10 4 0 1 0-20 0', t: 'rotate(60 12 12)' }, { d: 'M2 12a10 4 0 1 0 20 0a10 4 0 1 0-20 0', t: 'rotate(-60 12 12)' }] },
  { name: 'stethoscope', gold: true, d: ['M6 3v6a4 4 0 0 0 8 0V3', 'M10 13v2a5 5 0 0 0 10 0v-2', 'M20 11.5a1.8 1.8 0 1 0 0.01 0', 'M6 3H4M14 3h2'] },
  { name: 'gear', d: ['M10 2h4l.6 2.4 1.9.8 2.1-1.3 2.8 2.8-1.3 2.1.8 1.9L22 10v4l-2.4.6-.8 1.9 1.3 2.1-2.8 2.8-2.1-1.3-1.9.8L14 22h-4l-.6-2.4-1.9-.8-2.1 1.3-2.8-2.8 1.3-2.1-.8-1.9L2 14v-4l2.4-.6.8-1.9L3.9 5.4l2.8-2.8 2.1 1.3 1.9-.8z', 'M12 9a3 3 0 1 0 0.01 0'] },
  { name: 'light bulb', gold: true, d: ['M9 18h6M10 21h4', 'M12 3a6 6 0 0 0-3.5 10.9c.9.7 1.5 1.6 1.5 2.6V17h4v-.5c0-1 .6-1.9 1.5-2.6A6 6 0 0 0 12 3z'] },
  { name: 'laptop', d: ['M4 6h16v10H4z', 'M2 19h20', 'M9 16v3M15 16v3'] },
  { name: 'scales', d: ['M12 3v18M6 21h12M4 7h16', 'M4 7l-3 7a3 3 0 0 0 6 0z', 'M20 7l-3 7a3 3 0 0 0 6 0z'] },
  { name: 'drawing compass', d: ['M12 3v4', 'M12 7l-6 14M12 7l6 14', 'M8.5 15h7', 'M12 3a1.2 1.2 0 1 0 0.01 0'] },
  { name: 'leaf', d: ['M5 19C5 9 11 4 21 3c0 10-5 16-15 16', 'M5 19c3-5 6-8 11-11'] },
  { name: 'service bell', gold: true, d: ['M3 17h18', 'M5 17a7 7 0 0 1 14 0', 'M12 10V8M10 8h4', 'M2 20h20'] },
]
const ICON_SCALE = 2.5
const PLACED = ICONS.map((ic, i) => {
  const deg = 14 + i * (152 / (ICONS.length - 1))
  const [x, y] = pt(i % 2 ? 292 : 312, deg)
  return { ...ic, x: x - 12 * ICON_SCALE, y: y - 12 * ICON_SCALE, delay: 1.5 + i * 0.12 }
})

const Icon = ({ ic }) => (
  <g transform={`translate(${ic.x.toFixed(1)} ${ic.y.toFixed(1)}) scale(${ICON_SCALE})`}>
    <g className="sk-bob ic" style={{ '--b': `${(ic.delay * 1.7).toFixed(2)}s` }}>
      {ic.d.map((p, i) => {
        const d = typeof p === 'string' ? p : p.d
        return <path key={i} d={d} transform={typeof p === 'string' ? undefined : p.t} pathLength="1" className={ic.gold ? 'sk sk--gold' : 'sk'} style={{ '--d': `${ic.delay + i * 0.08}s` }} />
      })}
    </g>
  </g>
)

export default function SrmSketch() {
  const ref = useRef(null)
  const [drawn, setDrawn] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return setDrawn(true)
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setDrawn(true)
          io.disconnect()
        }
      },
      { threshold: 0.2 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} className={`sketch ${drawn ? 'is-drawn' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 1600 460" preserveAspectRatio="xMidYMax meet" focusable="false">
        {/* rings and rays emerge outward from the letters */}
        <path d={arc(250)} pathLength="1" className="sk sk--dash" style={{ '--d': '1.0s' }} />
        <path d={arc(335)} pathLength="1" className="sk sk--dash" style={{ '--d': '1.2s' }} />
        {RAYS.map((r, i) => (
          <path key={i} d={r.d} pathLength="1" className={r.gold ? 'sk sk--gold' : 'sk'} style={{ '--d': `${r.delay}s` }} />
        ))}
        {PLACED.map((ic) => (
          <Icon key={ic.name} ic={ic} />
        ))}

        {/* SRM in the logo's lettering: an offset gold echo, the outline drawing itself, then the fill settling in */}
        <g transform={WM_TRANSFORM}>
          <path d={WORDMARK_D} transform="translate(5 5)" pathLength="1" className="sk sk--echo" style={{ '--d': '0.3s' }} />
          <path d={WORDMARK_D} pathLength="1" className="sk sk--bold" style={{ '--d': '0.1s' }} />
          <path d={WORDMARK_D} className="sk-fill" />
        </g>
        <path d="M470 440H1130" pathLength="1" className="sk sk--dash" style={{ '--d': '1.8s' }} />
      </svg>
      <span className="sketch-cap">SRMIST</span>
    </div>
  )
}
