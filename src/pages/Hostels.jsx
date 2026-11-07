import { useEffect, useMemo, useState } from 'react'
import { AMENITIES_NOTE, COMMON_AMENITIES, DIRECTOR, EATERIES, GROUPS, HOSTELS, MESS_FACTS, MESS_TIMINGS, OFFICIAL, TARGETS, phoneHref } from '../data/hostels.js'
import { ArrowUR, Footer, SiteHeader } from '../shared.jsx'
import SvcHero from '../ui/SvcHero.jsx'
import '../services.css'

const GROUP_LABEL = { men: 'Men', women: 'Women', international: 'International' }

/** A photo from the official site, or (when there is none, or it fails to load) a box saying what belongs there. */
function PhotoBox({ hostel }) {
  const [failed, setFailed] = useState(false)
  if (hostel.photo && !failed) {
    return (
      <img className="hs-photo" src={hostel.photo} alt={`${hostel.name} hostel block`} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setFailed(true)} />
    )
  }
  return (
    <div className="hs-photo hs-ph" role="img" aria-label={`Photo placeholder: ${hostel.name} hostel block`}>
      <span>
        Photo of {hostel.name} hostel block
        <small>Exterior view, ideally taken from the main approach</small>
      </span>
    </div>
  )
}

const Missing = ({ children }) => <span className="hs-missing">[{children}]</span>

function HostelCard({ h }) {
  return (
    <article className="hs-card" id={`h-${h.id}`}>
      <PhotoBox hostel={h} />
      <div className="hs-body">
        <p className="hs-kicker">{GROUP_LABEL[h.group]} hostel</p>
        <h3>{h.name}</h3>
        <ul className="hs-tags" aria-label="Key facts">
          <li>{h.ac ?? 'AC or Non-AC to be confirmed'}</li>
          <li>{h.floors ?? 'Floors to be confirmed'}</li>
          <li>{h.sharing ?? 'Room sharing to be confirmed'}</li>
          {h.washroom && <li>{h.washroom}</li>}
          {h.facing && <li>Faces {h.facing.toLowerCase()}</li>}
        </ul>
        <h4>Features</h4>
        <ul className="hs-feat">
          {h.features.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
        <h4>Distance from</h4>
        {h.dist ? (
          <dl className="hs-dist">
            {TARGETS.map(([k, label]) => (
              <div key={k}>
                <dt>{label}</dt>
                <dd>{h.dist[k]} m</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="hs-note">
            <Missing>Distance from the University Building, Tech Park, Main Block and Java Green to be measured. This building is not yet named on the campus map.</Missing>
          </p>
        )}
        <div className="hs-actions">
          {h.plan ? (
            <a className="svc-btn" href={h.plan} target="_blank" rel="noopener noreferrer">
              Floor plan (PDF)
              <ArrowUR />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ) : (
            <Missing>Floor plan PDF for {h.name} to be added</Missing>
          )}
          <a className="svc-link" href={`mailto:${h.email}`}>
            Email the warden
          </a>
          <a className="svc-link" href={phoneHref(h.phone)}>
            {h.phone}
          </a>
        </div>
      </div>
    </article>
  )
}

export default function Hostels() {
  const [group, setGroup] = useState('all')
  const list = useMemo(() => HOSTELS.filter((h) => group === 'all' || h.group === group), [group])

  // /hostels#men, #women, #international and #mess from the menus
  useEffect(() => {
    const id = location.hash.slice(1)
    if (!id) return
    if (GROUP_LABEL[id]) setGroup(id)
    const t = setTimeout(() => document.getElementById(id === 'men' || id === 'women' || id === 'international' ? 'hostel-list' : id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 350)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <SiteHeader />
      <main className="interior svc" id="main" tabIndex={-1}>
        <SvcHero eyebrow="Hostels · Kattankulathur campus" title="A home on campus." lede="Every hostel block in one place: what it is like inside, how far it is from the places you will use most, what the mess serves, and who to call." img="/srmist/campus-panorama.jpg" pos="50% 50%">
  <nav className="vis-quick" aria-label="On this page">
              <a href="#hostel-list">All hostels</a>
              <a href="#rooms">Room types &amp; floor plans</a>
              <a href="#distances">Distances</a>
              <a href="#mess">Mess</a>
              <a href="#contacts">Contacts</a>
            </nav>
        </SvcHero>

        <section className="svc-wrap vis-grid">
          <div className="vis-block" id="hostel-list">
            <h2>Our hostels</h2>
            <p>
              {HOSTELS.filter((h) => h.group === 'men').length} boys’ blocks, {HOSTELS.filter((h) => h.group === 'women').length} girls’ blocks and {HOSTELS.filter((h) => h.group === 'international').length} international hostels. Details are from the official{' '}
              <a href={OFFICIAL} target="_blank" rel="noopener noreferrer">
                SRM Hostels pages<span className="sr-only"> (opens in a new tab)</span>
              </a>
              . Items shown in <Missing>square brackets</Missing> are not published yet and describe what is meant to go there.
            </p>
            <div className="svc-row" role="group" aria-label="Show hostels for" style={{ marginTop: 0, marginBottom: 18 }}>
              {GROUPS.map(([k, label]) => (
                <button key={k} className={`svc-btn ${group === k ? 'svc-btn--primary' : ''}`} aria-pressed={group === k} onClick={() => setGroup(k)}>
                  {label}
                </button>
              ))}
            </div>
            <div className="hs-grid" id={group === 'all' ? undefined : group}>
              {list.map((h) => (
                <HostelCard key={h.id} h={h} />
              ))}
            </div>

            <div className="hs-common">
              <h3>Amenities</h3>
              <ul className="vis-places">
                {COMMON_AMENITIES.map((a) => (
                  <li key={a}>
                    <span style={{ color: 'var(--text)' }}>{a}</span>
                  </li>
                ))}
              </ul>
              <p className="svc-fine">{AMENITIES_NOTE}</p>
            </div>
          </div>

          <div className="vis-block" id="rooms">
            <h2>Room types &amp; floor plans</h2>
            <p>Air-conditioning, how many students share a room, and the washroom type, for every block. Floor plans open the official PDFs.</p>
            <div style={{ overflowX: 'auto' }}>
              <table className="lib-hours hs-table">
                <caption className="sr-only">Room types by hostel</caption>
                <thead>
                  <tr>
                    <th scope="col">Hostel</th>
                    <th scope="col">Air conditioning</th>
                    <th scope="col">Sharing</th>
                    <th scope="col">Washrooms</th>
                    <th scope="col">Floors</th>
                    <th scope="col">Floor plan</th>
                  </tr>
                </thead>
                <tbody>
                  {HOSTELS.map((h) => (
                    <tr key={h.id}>
                      <th scope="row">
                        {h.name}
                        <small> · {GROUP_LABEL[h.group]}</small>
                      </th>
                      <td>{h.ac ?? <Missing>AC / Non-AC</Missing>}</td>
                      <td>{h.sharing ?? <Missing>rooms and sharing</Missing>}</td>
                      <td>{h.washroom ?? <Missing>washroom type</Missing>}</td>
                      <td>{h.floors ?? <Missing>floors</Missing>}</td>
                      <td>
                        {h.plan ? (
                          <a href={h.plan} target="_blank" rel="noopener noreferrer">
                            PDF<span className="sr-only"> floor plan of {h.name} (opens in a new tab)</span>
                          </a>
                        ) : (
                          <Missing>floor plan</Missing>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="vis-block" id="distances">
            <h2>Distance from prominent buildings</h2>
            <p>Straight-line distance between building centres on the campus map, rounded to 10 metres. Walking distance will be longer.</p>
            <div style={{ overflowX: 'auto' }}>
              <table className="lib-hours hs-table">
                <caption className="sr-only">Distance of each hostel from prominent buildings</caption>
                <thead>
                  <tr>
                    <th scope="col">Hostel</th>
                    {TARGETS.map(([k, label]) => (
                      <th key={k} scope="col">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {HOSTELS.map((h) => (
                    <tr key={h.id}>
                      <th scope="row">{h.name}</th>
                      {TARGETS.map(([k]) => (
                        <td key={k}>{h.dist ? `${h.dist[k]} m` : <Missing>distance</Missing>}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="svc-fine">
              Hostels without a figure are not named on the campus map yet. See the{' '}
              <a href="/visitors#layout">campus layout</a> for where everything is.
            </p>
          </div>

          <div className="vis-block" id="mess">
            <h2>Mess food &amp; timings</h2>
            <p>Each hostel runs its own mess. Meal times are the same across blocks.</p>
            <div style={{ overflowX: 'auto' }}>
              <table className="lib-hours">
                <caption className="sr-only">Mess timings</caption>
                <thead>
                  <tr>
                    <th scope="col">Meal</th>
                    <th scope="col">Working days</th>
                    <th scope="col">Holidays</th>
                  </tr>
                </thead>
                <tbody>
                  {MESS_TIMINGS.map(([meal, w, hol]) => (
                    <tr key={meal}>
                      <th scope="row">{meal}</th>
                      <td>{w}</td>
                      <td>{hol}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="hs-menu-ph" role="note">
              <h3>Weekly menu</h3>
              <p>
                <Missing>Monday to Sunday menu for breakfast, lunch, tea/snacks and dinner, in a table, with the North Indian and South Indian options for each meal. The menu is displayed on each mess notice board and is not published online yet.</Missing>
              </p>
            </div>

            <h3 style={{ marginTop: 26 }}>How the mess works</h3>
            <ul className="vis-places">
              {MESS_FACTS.map((f) => (
                <li key={f}>
                  <span style={{ color: 'var(--text)' }}>{f}</span>
                </li>
              ))}
            </ul>
            <h3 style={{ marginTop: 26 }}>Eateries near the hostels</h3>
            <ul className="vis-places">
              {EATERIES.map(([name, when, what]) => (
                <li key={name}>
                  <b>{name}</b>
                  <span>{when}</span>
                  <span>{what}</span>
                </li>
              ))}
            </ul>
            <p className="svc-fine">
              More on the official{' '}
              <a href="https://www.srmist.edu.in/srm-hostels/dining-eateries/" target="_blank" rel="noopener noreferrer">
                Dining &amp; Eateries page<span className="sr-only"> (opens in a new tab)</span>
              </a>
              , including the full mess rules.
            </p>
          </div>

          <div className="vis-block" id="contacts">
            <h2>Hostel contacts</h2>
            <div className="lib-two">
              <div className="lib-card">
                <span className="eyebrow">Director of Hostels</span>
                <h3>{DIRECTOR.name}</h3>
                <p>{DIRECTOR.role}</p>
                <dl>
                  <div>
                    <dt>Email</dt>
                    <dd>
                      <a href={`mailto:${DIRECTOR.email}`}>{DIRECTOR.email}</a>
                    </dd>
                  </div>
                  <div>
                    <dt>Phone</dt>
                    <dd>
                      <a href={phoneHref(DIRECTOR.phone)}>{DIRECTOR.phone}</a>
                    </dd>
                  </div>
                </dl>
              </div>
              <div className="lib-card">
                <span className="eyebrow">Book a hostel</span>
                <h3>Allotment</h3>
                <p>Hostel booking and allotment run through the student portal.</p>
                <dl>
                  <div>
                    <dt>Student portal</dt>
                    <dd>
                      <a href="https://sp.srmist.edu.in/srmiststudentportal" target="_blank" rel="noopener noreferrer">
                        sp.srmist.edu.in<span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt>Booking schedule and warden details</dt>
                    <dd>
                      <Missing>Allotment dates and counselling schedule for the coming year</Missing>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            <div style={{ overflowX: 'auto', marginTop: 20 }}>
              <table className="lib-hours hs-table">
                <caption className="sr-only">Warden contact details by hostel</caption>
                <thead>
                  <tr>
                    <th scope="col">Hostel</th>
                    <th scope="col">Warden email</th>
                    <th scope="col">Mobile</th>
                  </tr>
                </thead>
                <tbody>
                  {HOSTELS.map((h) => (
                    <tr key={h.id}>
                      <th scope="row">{h.name}</th>
                      <td>
                        <a href={`mailto:${h.email}`}>{h.email}</a>
                      </td>
                      <td>
                        <a href={phoneHref(h.phone)}>{h.phone}</a>
                        {h.phone2 && (
                          <>
                            {' · '}
                            <a href={phoneHref(h.phone2)}>{h.phone2}</a>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="svc-fine">Contact details are copied from the official hostel pages. The same mobile number is listed there for both Manoranjitham and Malligai, so check before relying on it.</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
