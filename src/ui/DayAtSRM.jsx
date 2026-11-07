import { useId, useMemo, useRef, useState } from 'react'
import day from '../data/campus-day.json'
import map from '../data/campus-map.json'
import { useLang } from '../i18n.jsx'
import { clock, hourAt, mix, pointAt, polylineLength, progressAtStop, shade, skyFor, timeline } from '../lib/day.js'
import { smooth } from '../lib/motion.js'
import { useMotionOk, useScrollProgress } from '../lib/useScrollProgress.js'
import '../styles/day.css'

/**
 * "A day at SRM": a pinned scene. The real campus (OpenStreetMap shapes we already drew) is tilted into 3D, the buildings
 * are lifted, and as you scroll a student walks the real campus paths from the hostel to the lab, lunch, the library and the
 * sports ground and back, while the clock runs and the light changes from dawn to night.
 * Phones, short screens and reduced motion get a flat map with the same stops listed beside it.
 */

// What happens at each stop. Hours and distances are real (official pages, OpenStreetMap); the day itself is illustrative.
const COPY = {
  hostel: { part: 'Morning', short: 'Wake up', title: 'Wake up in your hostel', text: 'Paari Block is one of the hostel blocks, 170 m from the University Building and 300 m from the Tech Park. Breakfast in the mess runs 7:00 to 9:00 AM.' },
  lab: { part: 'Morning', short: 'Tech Park', title: 'Classes and labs at the Tech Park', text: 'About a 460 m walk along the campus paths takes you to the SRM Tech Park for the morning’s classes and labs.' },
  lunch: { part: 'Midday', short: 'Java Green', title: 'Lunch at Java Green', text: 'A food court near the clock tower with around 20 stalls, open 7:30 AM to 8:00 PM.' },
  library: { part: 'Afternoon', short: 'Library', title: 'An afternoon in the library', text: 'SRM Library sits beside the University Building. The central library is open 8:00 AM to midnight on weekdays.' },
  sports: { part: 'Evening', short: 'Sports ground', title: 'Sports ground at five', text: 'Pitches and playgrounds lie just north of the University Building. Hostel students can use the gym, playground and indoor games.' },
  night: { part: 'Night', short: 'Dinner', title: 'Dinner, then back to your block', text: 'Dinner in the hostel mess runs 7:30 to 9:00 PM. Then a short walk home, about 370 m from the sports ground.' },
}

// the buildings the day visits stand taller and glow
const HERO_BUILDINGS = new Set(['Paari Hostel', 'SRM Tech Park', 'Java Food Court', 'SRM University Building'])
const PAD = 380 // metres of campus shown around the stops
const xs = day.stops.map((s) => s.at[0])
const ys = day.stops.map((s) => s.at[1])
const R = { x: Math.min(...xs) - PAD, y: Math.min(...ys) - PAD, w: Math.max(...xs) - Math.min(...xs) + PAD * 2, h: Math.max(...ys) - Math.min(...ys) + PAD * 2 }
const inRegion = (x, y) => x > R.x - 40 && x < R.x + R.w + 40 && y > R.y - 40 && y < R.y + R.h + 40
const rel = (p) => [p[0] - R.x, p[1] - R.y]
const LEG_LEN = day.legs.map((l) => polylineLength(l.pts))
const TOTAL_M = day.legs.reduce((s, l) => s + l.metres, 0)

const VIEWBOX = `0 0 ${R.w} ${R.h}`
// path data moved so the cropped region starts at 0,0
const shift = (d) => d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (_, x, y) => `${(+x - R.x).toFixed(1)} ${(+y - R.y).toFixed(1)}`)
const nearRegion = (c) => inRegion(c[0], c[1])

const SHAPES = (() => {
  const buildings = map.buildings.map((b) => ({ id: b.id, d: shift(b.d), hero: HERO_BUILDINGS.has(b.n) }))
  const roads = map.roads.filter((r) => r.k !== 'steps').map((r) => ({ id: r.id, k: r.k, d: shift(r.d) }))
  const grounds = day.grounds.map((g) => ({ id: g.id, k: g.k, d: shift(g.d) }))
  return { buildings, roads, grounds }
})()

function Layers({ prefix }) {
  // flat ground: land, sports grounds, roads and paths
  return (
    <svg className="day-layer day-ground" viewBox={VIEWBOX} width={R.w} height={R.h} aria-hidden="true">
      <rect x={-300} y={-300} width={R.w + 600} height={R.h + 600} className="d-land" />
      {SHAPES.grounds.map((g) => (
        <path key={g.id} d={g.d} className={`d-field d-field--${g.k}`} />
      ))}
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {SHAPES.roads.filter((r) => r.k === 'service').map((r) => <path key={r.id} d={r.d} className="d-service" strokeWidth="1.4" />)}
        {SHAPES.roads.filter((r) => r.k === 'road').map((r) => <path key={`c${r.id}`} d={r.d} className="d-casing" strokeWidth="4.4" />)}
        {SHAPES.roads.filter((r) => r.k === 'road').map((r) => <path key={r.id} d={r.d} className="d-road" strokeWidth="3" />)}
        {SHAPES.roads.filter((r) => r.k === 'path').map((r) => <path key={r.id} d={r.d} className="d-path" strokeWidth="1.6" strokeDasharray="4 3" />)}
      </g>
    </svg>
  )
}

export default function DayAtSRM({ style, startBg = 'var(--blue)', endBg = 'var(--blue)', standalone = false }) {
  const motionOk = useMotionOk()
  const { t } = useLang()
  const uid = useId()
  const [active, setActive] = useState(0)
  const root = useRef(null)
  const stage = useRef(null)
  const cam = useRef(null)
  const legPaths = useRef([])
  const dot = useRef(null)
  const lastStop = useRef(-1)
  const hud = useRef({})

  const legD = useMemo(() => day.legs.map((l) => 'M' + l.pts.map((p) => `${(p[0] - R.x).toFixed(1)} ${(p[1] - R.y).toFixed(1)}`).join('L')), [])
  const n = day.stops.length

  useScrollProgress(
    root,
    (p) => {
      const tl = timeline(p, n)
      const hour = hourAt(tl)
      const sky = skyFor(hour)

      // where the student is, and what the camera looks at
      let pos
      let walked = 0
      if (tl.phase === 'travel') {
        pos = pointAt(day.legs[tl.leg].pts, tl.t)
        walked = day.legs.slice(0, tl.leg).reduce((s, l) => s + l.metres, 0) + day.legs[tl.leg].metres * tl.t
      } else {
        pos = day.stops[tl.stop].at
        walked = day.legs.slice(0, tl.stop).reduce((s, l) => s + l.metres, 0)
      }
      // zoom in at a stop, pull out between stops; open and close on the whole campus
      const dip = tl.phase === 'travel' ? Math.sin(Math.PI * tl.t) : 0
      let scale = 2.9 - 1.1 * dip
      let cx = pos[0]
      let cy = pos[1]
      const open = 1 - smooth(0, 0.07, p)
      const close = smooth(0.93, 1, p)
      const overview = Math.max(open, close)
      scale = scale + (1.15 - scale) * overview
      cx = cx + (R.x + R.w / 2 - cx) * overview
      cy = cy + (R.y + R.h / 2 - cy) * overview
      if (cam.current) cam.current.style.transform = `scale3d(${scale},${scale},${scale}) translate3d(${-(cx - R.x)}px,${-(cy - R.y)}px,0)`

      // route: finished legs full, the current one partly, the rest hidden
      day.legs.forEach((_, i) => {
        const el = legPaths.current[i]
        if (!el) return
        const done = tl.phase === 'travel' ? (i < tl.leg ? 1 : i === tl.leg ? tl.t : 0) : i < tl.stop ? 1 : 0
        el.style.strokeDasharray = LEG_LEN[i]
        el.style.strokeDashoffset = String(LEG_LEN[i] * (1 - done))
      })
      const rp = rel(pos)
      if (dot.current) dot.current.setAttribute('transform', `translate(${rp[0]} ${rp[1]})`)

      // light: sky, ground, buildings
      const s = stage.current
      if (s) {
        const set = (k, v) => s.style.setProperty(k, v)
        set('--d-sky', sky.sky)
        set('--d-ground', sky.ground)
        set('--d-road', sky.road)
        set('--d-casing', shade(sky.road, 0.62))
        set('--d-glow', sky.glow)
        set('--d-b0', shade(sky.building, 0.5))
        set('--d-b1', shade(sky.building, 0.66))
        set('--d-b2', shade(sky.building, 0.82))
        set('--d-b3', mix(sky.building, sky.glow, (1 - sky.light) * 0.35))
        set('--d-hero', mix(sky.glow, '#ffffff', 0.15))
        set('--d-light', sky.light.toFixed(2))
        set('--d-open', overview.toFixed(3))
        set('--day-edge', p < 0.5 ? startBg : endBg)
        set('--d-fade', standalone ? (1 - smooth(0.985, 1, p)).toFixed(3) : (smooth(0, 0.04, p) * (1 - smooth(0.97, 1, p))).toFixed(3))
      }
      const h = hud.current
      if (h.clock) h.clock.textContent = clock(hour)
      if (h.walked) h.walked.textContent = `${Math.round(walked)} m`
      if (h.bar) h.bar.style.transform = `scaleX(${(walked / TOTAL_M).toFixed(3)})`

      const stop = tl.phase === 'travel' && tl.t > 0.5 ? tl.leg + 1 : tl.stop
      if (stop !== lastStop.current) {
        lastStop.current = stop
        setActive(stop)
      }
    },
    motionOk,
  )

  const jump = (i) => {
    const r = root.current
    if (!r) return
    const total = r.offsetHeight - window.innerHeight
    window.scrollTo({ top: r.getBoundingClientRect().top + window.scrollY + progressAtStop(i, n) * total, behavior: 'smooth' })
  }

  if (!motionOk) return <FlatDay style={style} />

  return (
    <section ref={root} className="day" style={{ ...style, height: '620vh' }} aria-labelledby={`${uid}-h`}>
      <div ref={stage} className="day-stage">
        <div className="day-world" aria-hidden="true">
          <div className="day-plane">
            <div ref={cam} className="day-cam" style={{ width: R.w, height: R.h }}>
              <Layers />
              <svg className="day-layer day-route" viewBox={VIEWBOX} width={R.w} height={R.h}>
                <g fill="none" strokeLinecap="round" strokeLinejoin="round">
                  {legD.map((d, i) => (
                    <path key={`g${i}`} d={d} className="d-route-ghost" strokeWidth="2.2" />
                  ))}
                  {legD.map((d, i) => (
                    <path key={i} ref={(el) => (legPaths.current[i] = el)} d={d} className="d-route" strokeWidth="3.2" />
                  ))}
                </g>
                {day.stops.slice(0, 5).map((s) => {
                  const p = rel(s.at)
                  return (
                    <g key={s.id} transform={`translate(${p[0]} ${p[1]})`}>
                      <circle r="9" className="d-pin-ring" />
                      <circle r="3.4" className="d-pin" />
                    </g>
                  )
                })}
                <g ref={dot}>
                  <circle r="11" className="d-dot-halo" />
                  <circle r="4.6" className="d-dot" />
                </g>
              </svg>
              {[6, 12, 18, 24].map((z, k) => (
                <svg key={z} className="day-layer day-bld" viewBox={VIEWBOX} width={R.w} height={R.h} style={{ transform: `translateZ(${z}px)` }}>
                  {SHAPES.buildings.map((b) => (
                    <path key={b.id} d={b.d} className={`d-b d-b${k}`} />
                  ))}
                </svg>
              ))}
              {[30, 36, 42, 48].map((z, k) => (
                <svg key={z} className="day-layer day-bld" viewBox={VIEWBOX} width={R.w} height={R.h} style={{ transform: `translateZ(${z}px)` }}>
                  {SHAPES.buildings.filter((b) => b.hero).map((b) => (
                    <path key={b.id} d={b.d} className={`d-b d-hero${k === 3 ? ' d-hero-top' : ''}`} />
                  ))}
                </svg>
              ))}
            </div>
          </div>
        </div>
        <div className="day-haze" aria-hidden="true" />

        <div className="day-hud">
          <div className="day-top">
            <div>
              <span className="eyebrow">{t('A day at SRM')}</span>
              <h2 id={`${uid}-h`} className="day-title">
                One student. One day. <em>The real campus.</em>
              </h2>
            </div>
            <div className="day-clockbox" aria-hidden="true">
              <b ref={(el) => (hud.current.clock = el)}>06:45</b>
              <span>{COPY[day.stops[active].id].part}</span>
            </div>
          </div>

          <div className="day-cards">
            {day.stops.map((s, i) => {
              const c = COPY[s.id]
              return (
                <article key={`${s.id}-${i}`} className={`day-card ${i === active ? 'is-on' : ''}`} aria-hidden={i !== active}>
                  <span className="day-step">
                    Stop {i + 1} of {n}
                  </span>
                  <h3>{c.title}</h3>
                  <p>{c.text}</p>
                </article>
              )
            })}
          </div>

          <div className="day-foot">
            <div className="day-walk" aria-hidden="true">
              <span>
                Walked <b ref={(el) => (hud.current.walked = el)}>0 m</b> of {(TOTAL_M / 1000).toFixed(1)} km
              </span>
              <i>
                <u ref={(el) => (hud.current.bar = el)} />
              </i>
            </div>
            <ol className="day-steps" aria-label="Jump to a stop">
              {day.stops.map((s, i) => (
                <li key={`${s.id}-${i}`}>
                  <button className={i === active ? 'is-on' : ''} onClick={() => jump(i)} aria-current={i === active ? 'step' : undefined}>
                    <span>{clock(i === n - 1 ? 20.25 : [6.75, 9, 12.5, 14.5, 17][i])}</span>
                    {COPY[s.id].short}
                  </button>
                </li>
              ))}
            </ol>
            <p className="day-note">An illustrative day. Times are for the story, not a timetable; hours and distances are real. Map © OpenStreetMap contributors.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

/** Phones, short screens and reduced motion: the same map, flat, with the route drawn and the stops listed. */
function FlatDay({ style }) {
  const { t } = useLang()
  const legD = day.legs.map((l) => 'M' + l.pts.map((p) => `${(p[0] - R.x).toFixed(1)} ${(p[1] - R.y).toFixed(1)}`).join('L'))
  const sky = skyFor(12)
  return (
    <section className="day-flat" style={{ ...style, '--d-ground': sky.ground, '--d-road': sky.road, '--d-casing': shade(sky.road, 0.62), '--d-b3': sky.building, '--d-glow': '#f2c84b' }} aria-labelledby="day-flat-h">
      <span className="eyebrow">{t('A day at SRM')}</span>
      <h2 id="day-flat-h">
        One student. One day. <em>The real campus.</em>
      </h2>
      <div className="day-flat-map">
        <svg viewBox={VIEWBOX} role="img" aria-label="Map of the campus with the route from the hostel to the Tech Park, Java Green, the library, the sports ground and back">
          <rect width={R.w} height={R.h} className="d-land" />
          {SHAPES.grounds.map((g) => (
            <path key={g.id} d={g.d} className={`d-field d-field--${g.k}`} />
          ))}
          <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            {SHAPES.roads.filter((r) => r.k === 'road').map((r) => <path key={r.id} d={r.d} className="d-road" strokeWidth="3" />)}
            {SHAPES.roads.filter((r) => r.k === 'path').map((r) => <path key={r.id} d={r.d} className="d-path" strokeWidth="1.6" strokeDasharray="4 3" />)}
          </g>
          {SHAPES.buildings.map((b) => (
            <path key={b.id} d={b.d} className="d-b d-b3" />
          ))}
          <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            {legD.map((d, i) => (
              <path key={i} d={d} className="d-route" strokeWidth="3.2" />
            ))}
          </g>
          {day.stops.slice(0, 5).map((s, i) => {
            const p = rel(s.at)
            return (
              <g key={s.id} transform={`translate(${p[0]} ${p[1]})`}>
                <circle r="11" className="d-pin-ring d-pin-ring--flat" />
                <text textAnchor="middle" dominantBaseline="central" className="d-pin-num" fontSize="12">
                  {i + 1}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
      <ol className="day-flat-list">
        {day.stops.map((s, i) => (
          <li key={`${s.id}-${i}`}>
            <span className="day-step">{clock(i === day.stops.length - 1 ? 20.25 : [6.75, 9, 12.5, 14.5, 17][i])}</span>
            <h3>{COPY[s.id].title}</h3>
            <p>{COPY[s.id].text}</p>
          </li>
        ))}
      </ol>
      <p className="day-note">An illustrative day, {(TOTAL_M / 1000).toFixed(1)} km of walking in all. Times are for the story; hours and distances are real. Map © OpenStreetMap contributors.</p>
    </section>
  )
}
