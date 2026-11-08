import { useMemo, useState } from 'react'
import day from '../data/campus-day.json'
import { Arrow, Footer, SiteHeader } from '../shared.jsx'
import SvcHero from '../ui/SvcHero.jsx'
import '../services.css'

const TOUR = 'https://webstor.srmist.edu.in/web_assets/srmist-virtual-tour-vo/index.htm'
const WALK_M_PER_MIN = 80 // an easy walking pace; shown as "about"

// Stops and legs come from the same OpenStreetMap-derived data as /day. The last stop repeats the first, so drop it.
const STOPS = day.stops.slice(0, 5)
const LEGS = day.legs.slice(0, 4)
const BLURB = {
  hostel: 'Where the day starts. Hostel blocks are in the south of the campus.',
  lab: 'Labs and start-ups around the tech park.',
  lunch: 'A food court close to the academic blocks.',
  library: 'The university library: reading rooms, study space and opening hours.',
  sports: 'Grounds and courts at the end of the walk.',
}

const mins = (m) => Math.max(1, Math.round(m / WALK_M_PER_MIN))

/** The route as one SVG line, with the chosen stop lit. Coordinates are the map's own units. */
function RouteMap({ i, onPick }) {
  const [w, h] = day.size
  const all = LEGS.flatMap((l) => l.pts)
  const xs = all.map((p) => p[0])
  const ys = all.map((p) => p[1])
  const pad = 90
  const x0 = Math.min(...xs) - pad
  const y0 = Math.min(...ys) - pad
  const vw = Math.max(...xs) + pad - x0
  const vh = Math.max(...ys) + pad - y0
  return (
    <svg className="cw-map" viewBox={`${x0} ${y0} ${vw} ${vh}`} role="img" aria-label={`Walking route through ${STOPS.length} stops. Stop ${i + 1}: ${STOPS[i].name}.`} data-size={`${w}x${h}`}>
      {LEGS.map((l, n) => (
        <polyline key={n} className={n < i ? 'cw-leg is-done' : 'cw-leg'} points={l.pts.map((p) => p.join(',')).join(' ')} />
      ))}
      {STOPS.map((s, n) => (
        <g key={s.id + n} className={n === i ? 'cw-stop is-on' : 'cw-stop'} transform={`translate(${s.at[0]} ${s.at[1]})`} onClick={() => onPick(n)}>
          <circle r={n === i ? 34 : 24} />
          <text y="9" textAnchor="middle">{n + 1}</text>
        </g>
      ))}
    </svg>
  )
}

export default function CampusWalk() {
  const [i, setI] = useState(0)
  const total = useMemo(() => LEGS.reduce((a, l) => a + l.metres, 0), [])
  const stop = STOPS[i]
  const leg = LEGS[i] // the walk that leaves this stop
  const allConnected = LEGS.every((l) => l.connected)

  return (
    <>
      <SiteHeader />
      <main className="interior svc" id="main" tabIndex={-1}>
        <SvcHero eyebrow="Visit · Kattankulathur campus" title="Walk the campus before you arrive." lede="Five stops, about an hour of an ordinary day, with real walking distances. Use it to picture where things are, then take the official 360° tour for the views." img="/srmist/campus-lakeview.jpg" pos="50% 55%">
          <nav className="vis-quick" aria-label="On this page">
            <a href="#walk">The walk</a>
            <a href="#tour">360° tour</a>
            <a href="/access-map">Accessible map</a>
          </nav>
        </SvcHero>

        <section className="svc-wrap vis-grid">
          <div className="vis-block" id="walk">
            <h2>
              Stop {i + 1} of {STOPS.length}: {stop.name}
            </h2>
            <div className="cw">
              <RouteMap i={i} onPick={setI} />
              <div className="cw-side">
                <ol className="cw-list">
                  {STOPS.map((s, n) => (
                    <li key={s.id + n}>
                      <button type="button" className={n === i ? 'is-on' : ''} aria-current={n === i ? 'step' : undefined} onClick={() => setI(n)}>
                        <span>{n + 1}</span>
                        {s.name}
                      </button>
                    </li>
                  ))}
                </ol>
                <p className="cw-blurb">{BLURB[stop.id]}</p>
                {leg ? (
                  <p className="cw-next">
                    Next: about <b>{mins(leg.metres)} min</b> ({leg.metres} m) to {STOPS[i + 1].name}.
                  </p>
                ) : (
                  <p className="cw-next">End of the walk. About {mins(total)} minutes in all ({(total / 1000).toFixed(1)} km).</p>
                )}
                <div className="cw-buttons">
                  <button type="button" className="button button-light" disabled={i === 0} onClick={() => setI(i - 1)}>
                    Back
                  </button>
                  <button type="button" className="button button-gold" disabled={i === STOPS.length - 1} onClick={() => setI(i + 1)}>
                    Next stop <Arrow />
                  </button>
                </div>
              </div>
            </div>
            <p className="source-note">
              Route and distances are derived from OpenStreetMap paths (© OpenStreetMap contributors, ODbL) and a pace of {WALK_M_PER_MIN} m a minute. {allConnected ? 'Every leg connects by mapped path.' : 'Some legs are not fully connected on the map.'} Step-free status is not tagged for most paths, so check the{' '}
              <a href="/access-map">accessible map</a> before you go.
            </p>
          </div>

          <div className="vis-block" id="tour">
            <h2>See it in 360°</h2>
            <p className="cw-blurb">The university’s own virtual tour shows the campus from the inside. It opens on srmist.edu.in.</p>
            <a className="button button-gold" href={TOUR} target="_blank" rel="noreferrer">
              Open the 360° tour <Arrow />
            </a>
            <p className="source-note">Opens in a new tab. We link to it rather than copy it.</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
