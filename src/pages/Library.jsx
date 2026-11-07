import { useEffect, useState } from 'react'
import pages from '../data/pages.json'
import { kitFor } from '../data/page-kits.js'
import { ArrowUR, Footer, Photo, SiteHeader } from '../shared.jsx'
import '../styles/immersive.css'
import CinematicHero from '../ui/immersive/CinematicHero.jsx'
import '../services.css'

// Everything below comes from the library's own site, https://library.srmist.edu.in (read 2026-11-06).
const LIB = 'https://library.srmist.edu.in'
const HOURS = [
  { lib: 'University Central Library', rows: [
    { id: 'wk', when: 'Monday – Friday (weekdays)', open: ['8:00 AM', '12:00 Midnight'], tx: ['8:00 AM', '11:30 PM'], days: [1, 2, 3, 4, 5], mins: [480, 1440] },
    { id: 'we', when: 'Saturday – Sunday (weekends)', open: ['9:00 AM', '7:00 PM'], tx: ['9:00 AM', '6:30 PM'], days: [0, 6], mins: [540, 1140] },
    { id: 'su', when: 'Summer holidays (May – July)', open: ['9:00 AM', '6:00 PM'], tx: ['9:00 AM', '5:30 PM'], days: [], mins: [540, 1080] },
  ] },
  { lib: 'Architecture Library', rows: [{ id: 'ar', when: 'Monday – Friday', open: ['8:30 AM', '4:30 PM'], tx: ['8:30 AM', '4:00 PM'] }] },
  { lib: 'Law Library', rows: [{ id: 'lw', when: 'Monday – Friday', open: ['8:30 AM', '4:30 PM'], tx: ['8:30 AM', '4:00 PM'] }] },
  { lib: 'School of Management Library', rows: [{ id: 'mg', when: 'Monday – Friday', open: ['8:30 AM', '4:30 PM'], tx: ['8:30 AM', '4:00 PM'] }] },
]
const FACILITIES = [
  'Fully air-conditioned and automated with RFID technology',
  'Fire alarms and CCTV security',
  '17 OPAC (online catalogue) terminals',
  'Browsing centre with 50 systems, open 8:00 AM – 10:00 PM',
  'Photocopying: two Canon IR 3225 machines at a nominal cost',
  'Laptop lending and reprographics services',
  'SWAYAM PRABHA educational TV channels, plus NPTEL video lectures from a local server',
]
const TOOLS = [
  ['Search the catalogue (OPAC)', '/opac-search'],
  ['Live seat availability', '/live-seat-matrix'],
  ['E-journals', '/e-journals'],
  ['E-books', '/ebooks'],
  ['E-databases', '/e-database'],
  ['New arrivals', '/new-arrivals'],
  ['Renew a book online', '/e-renewal'],
  ['Plagiarism checking', '/plagiarism-checking'],
]
// If the library publishes a floor plan, put the image in public/srmist/ and set its path here.
const FLOOR_PLAN = null // e.g. { src: '/srmist/library-floor-plan.png', alt: '…', floors: [['Ground floor', '…'], …] }

/** Is the central library open right now? Uses India time, whatever the visitor's clock says. */
function openNow() {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false, month: 'numeric' }).formatToParts(new Date())
  const get = (t) => parts.find((p) => p.type === t)?.value
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'))
  const mins = (Number(get('hour')) % 24) * 60 + Number(get('minute'))
  const month = Number(get('month'))
  const row = month >= 5 && month <= 7 ? HOURS[0].rows[2] : day === 0 || day === 6 ? HOURS[0].rows[1] : HOURS[0].rows[0]
  return { open: mins >= row.mins[0] && mins < row.mins[1], row }
}

export default function Library() {
  const [now, setNow] = useState(null)
  useEffect(() => {
    setNow(openNow())
    const t = setInterval(() => setNow(openNow()), 60_000)
    return () => clearInterval(t)
  }, [])

  return (
    <>
      <SiteHeader />
      <main className="interior svc" id="main" tabIndex={-1}>
        <CinematicHero hero={pages.library.hero} accent={kitFor('library').accent} crop={kitFor('library').crop} />
        <section className="svc-hero lib-bar">
          <p>Opening hours, the librarian, how to reach the team and what is inside. Searching the catalogue, journals and your account happens on the library’s own site.</p>
          <div className="svc-row">
            <a className="button" href={LIB} target="_blank" rel="noopener noreferrer">
              Go to library.srmist.edu.in <ArrowUR />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            {now && (
              <span className={`lib-now ${now.open ? 'lib-now--open' : 'lib-now--closed'}`} role="status">
                {now.open ? '● Central Library is open now' : '○ Central Library is closed now'}
                <span className="svc-opt"> · today {now.row.open[0]} – {now.row.open[1]}</span>
              </span>
            )}
          </div>
        </section>

        <section className="svc-wrap vis-grid">
          <div className="vis-block" id="timings">
            <h2>Opening hours</h2>
            <p>“Working” is when the building is open. “Transactions” is when books can be issued and returned. Times are India time.</p>
            <div style={{ overflowX: 'auto' }}>
              <table className="lib-hours">
                <caption className="sr-only">Library opening hours</caption>
                <thead>
                  <tr>
                    <th scope="col">Library</th>
                    <th scope="col">Days</th>
                    <th scope="col">Working</th>
                    <th scope="col">Transactions</th>
                  </tr>
                </thead>
                <tbody>
                  {HOURS.flatMap((g) =>
                    g.rows.map((r, i) => (
                      <tr key={r.id} className={now && g.lib === HOURS[0].lib && now.row.id === r.id ? 'is-today' : undefined}>
                        {i === 0 && (
                          <th scope="rowgroup" rowSpan={g.rows.length}>
                            {g.lib}
                          </th>
                        )}
                        <td>{r.when}</td>
                        <td>{r.open[0]} – {r.open[1]}</td>
                        <td>{r.tx[0]} – {r.tx[1]}</td>
                      </tr>
                    )),
                  )}
                </tbody>
              </table>
            </div>
            <p className="svc-fine">Hours can change for exams and holidays. The latest schedule is on <a href={`${LIB}/library-hours`} target="_blank" rel="noopener noreferrer">the library’s hours page<span className="sr-only"> (opens in a new tab)</span></a>.</p>
          </div>

          <div className="lib-two">
            <div className="lib-card" id="librarian">
              <span className="eyebrow">University Librarian</span>
              <h3>Dr. P. Rajendran</h3>
              <p>Leads the University Central Library and its team.</p>
              <dl>
                <div><dt>Email</dt><dd><a href="mailto:librarian@srmist.edu.in">librarian@srmist.edu.in</a></dd></div>
              </dl>
              <p className="svc-fine">The full team, including the Deputy Librarian, is listed on <a href={`${LIB}/team`} target="_blank" rel="noopener noreferrer">the library’s team page<span className="sr-only"> (opens in a new tab)</span></a>.</p>
            </div>
            <div className="lib-card" id="contact">
              <span className="eyebrow">Contact</span>
              <h3>University Central Library</h3>
              <dl>
                <div><dt>Phone</dt><dd><a href="tel:+914427456274">044 – 2745 6274</a></dd></div>
                <div><dt>Email</dt><dd><a href="mailto:librarian@srmist.edu.in">librarian@srmist.edu.in</a></dd></div>
                <div><dt>Address</dt><dd>SRM Nagar, Kattankulathur, Chennai – 603203, Tamil Nadu</dd></div>
                <div><dt>Online enquiry form</dt><dd><a href={`${LIB}/contact-us`} target="_blank" rel="noopener noreferrer">library.srmist.edu.in/contact-us<span className="sr-only"> (opens in a new tab)</span></a></dd></div>
              </dl>
            </div>
          </div>

          <div className="vis-block" id="floors">
            <h2>Floor map</h2>
            {FLOOR_PLAN ? (
              <>
                <p>Where to find things inside the building.</p>
                <figure className="lib-floor">
                  <img src={FLOOR_PLAN.src} alt={FLOOR_PLAN.alt} loading="lazy" />
                  <ul className="vis-places" style={{ marginTop: 14 }}>
                    {FLOOR_PLAN.floors.map(([f, what]) => (
                      <li key={f}><b>{f}</b><span>{what}</span></li>
                    ))}
                  </ul>
                </figure>
              </>
            ) : (
              <div className="lib-floor" role="note">
                <p>
                  <b>The library has not published a floor plan online.</b> I checked the library’s own site and found none, and I would rather show nothing than post one that sends you to the wrong floor.
                </p>
                <p className="svc-fine">Until then, ask at the issue counter, or phone 044 – 2745 6274.</p>
              </div>
            )}
          </div>

          <div className="vis-block" id="facilities">
            <h2>Inside the library</h2>
            <ul className="vis-places">
              {FACILITIES.map((f) => (
                <li key={f}><span style={{ color: 'var(--text)' }}>{f}</span></li>
              ))}
            </ul>
          </div>

          <div className="vis-block" id="tools">
            <h2>Search and services</h2>
            <p>These open the library’s own site, where you sign in with your library account.</p>
            <div className="vis-quick">
              {TOOLS.map(([label, path]) => (
                <a key={path} href={`${LIB}${path}`} target="_blank" rel="noopener noreferrer">
                  {label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ))}
            </div>
          </div>

          <figure>
            <Photo src="/srmist/library.jpg" alt="Entrance gates of the SRMIST library" sizes="(max-width: 900px) 100vw, 1100px" widths={[600, 900, 1200]} size={[1200, 700]} />
          </figure>
        </section>
      </main>
      <Footer />
    </>
  )
}
