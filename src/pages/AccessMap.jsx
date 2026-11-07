import { useState } from 'react'
import { Footer, SiteHeader } from '../shared.jsx'
import SvcHero from '../ui/SvcHero.jsx'
import CampusMap, { NAMED_BUILDINGS } from '../ui/CampusMap.jsx'
import '../services.css'

export default function AccessMap() {
  const [layers, setLayers] = useState({ routes: true, barriers: true })
  const [sel, setSel] = useState(null)
  const [q, setQ] = useState('')
  const list = NAMED_BUILDINGS.filter((b) => b.name.toLowerCase().includes(q.trim().toLowerCase()))
  const toggle = (k) => setLayers((l) => ({ ...l, [k]: !l[k] }))
  const reportHref = (place) => `/support?category=${encodeURIComponent('Accessibility barrier')}${place ? `&place=${encodeURIComponent(place)}` : ''}`

  return (
    <>
      <SiteHeader />
      <main className="interior svc" id="main" tabIndex={-1}>
        <SvcHero eyebrow="Accessible campus" title="Step-free routes, ramps and lifts." lede="A map layer for people who use wheelchairs, walkers, prams or simply cannot manage stairs. It shows what is known today, and where nobody has checked yet." img="/srmist/campus-main-building.jpg" pos="50% 55%" />

        <section className="svc-wrap">
          <div className="map-layout">
            <div>
              <fieldset className="map-layers">
                <legend>Layers</legend>
                <label><input type="checkbox" checked={layers.routes} onChange={() => toggle('routes')} /> Step-free routes <i className="swatch swatch--good" aria-hidden="true" /></label>
                <label><input type="checkbox" checked={layers.barriers} onChange={() => toggle('barriers')} /> Steps and barriers <i className="swatch swatch--bad" aria-hidden="true" /></label>
              </fieldset>
              <CampusMap mode="access" layers={layers} selected={sel?.id} onSelect={setSel} label="Accessible campus map of SRMIST Kattankulathur" />
              <ul className="map-legend" aria-label="Legend">
                <li><i className="swatch swatch--bad" aria-hidden="true" /> Steps or a path marked not wheelchair-friendly</li>
                <li><i className="swatch swatch--good" aria-hidden="true" /> Confirmed step-free route (none recorded yet)</li>
                <li><i className="swatch swatch--yes" aria-hidden="true" /> Entrance confirmed wheelchair-accessible</li>
                <li><i className="swatch swatch--unknown" aria-hidden="true" /> Marked, but accessibility unknown</li>
              </ul>
            </div>

            <aside className="map-side" aria-label="Places">
              <label htmlFor="mapq" className="map-find">
                Find a building
                <input id="mapq" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Main Block, Tech Park, hostel…" autoComplete="off" />
              </label>
              {sel && (
                <div className="map-card" role="status">
                  <h3>{sel.name}</h3>
                  <p>{sel.w ? `OpenStreetMap lists wheelchair access here as “${sel.w}”.` : 'Accessibility has not been surveyed for this building.'}</p>
                  <a className="svc-btn svc-btn--primary" href={reportHref(sel.name)}>Report a barrier or confirm a ramp</a>
                </div>
              )}
              <ul className="map-list" aria-label={`${list.length} named buildings`}>
                {list.map((b) => (
                  <li key={b.id}>
                    <button className={sel?.id === b.id ? 'is-on' : ''} onClick={() => setSel(b)} aria-pressed={sel?.id === b.id}>
                      {b.name}
                      <span>{b.w ? `wheelchair: ${b.w}` : 'not surveyed'}</span>
                    </button>
                  </li>
                ))}
                {!list.length && <li className="map-none">No building matches “{q}”.</li>}
              </ul>
            </aside>
          </div>

          <section className="svc-help">
            <h3>Help fill the gaps</h3>
            <p>Students and staff who use these routes every day know them best. Report a ramp, a broken lift or a step with no alternative, and it gets a reference number you can follow. For support with accessibility needs, the university’s Equal Opportunity Cell is the official contact.</p>
            <div className="svc-row">
              <a className="button" href={reportHref('')}>Report an accessibility barrier</a>
              <a className="svc-btn svc-btn--ghost" href="https://www.srmist.edu.in/equal-opportunity-cell/" target="_blank" rel="noopener noreferrer">Equal Opportunity Cell<span className="sr-only"> (opens in a new tab)</span></a>
            </div>
            <p className="svc-fine">To improve the map for everyone, accessibility details (ramps, lifts, step-free entrances) can also be added to OpenStreetMap, and this page picks them up the next time the map data is refreshed.</p>
          </section>
        </section>
      </main>
      <Footer />
    </>
  )
}
