import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUR, Footer, SiteHeader } from '../shared.jsx'
import { istNow, makeWeek, statusAt } from '../lib/availability.js'
import StaffIcon from '../ui/StaffIcon.jsx'
import StaffTimetable from '../ui/StaffTimetable.jsx'
import SvcHero from '../ui/SvcHero.jsx'
import '../styles/staff.css'

// Staff come from the official SRMIST staff finder (https://www.srmist.edu.in/staff-finder/), collected by
// scripts/fetch-staff.mjs into public/data/staff.json. Each person links to their official profile; photos load from srmist.edu.in.
const OFFICIAL = 'https://www.srmist.edu.in'
const PAGE = 24

const initials = (name) =>
  name
    .replace(/^(dr|prof|mr|mrs|ms|er)\.?\s+/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')

function Photo({ p }) {
  const [bad, setBad] = useState(!p.photo)
  return (
    <span className="sf-photo" aria-hidden="true">
      {bad ? (
        <span className="sf-initials" style={{ '--h': (p.name.length * 37) % 360 }}>
          {initials(p.name)}
        </span>
      ) : (
        <img src={OFFICIAL + p.photo} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setBad(true)} />
      )}
    </span>
  )
}

function Card({ p, data, onTag, onTimetable }) {
  const dept = p.dept.map((i) => data.departments[i][1])[0]
  const college = p.college.map((i) => data.colleges[i][1])[0]
  const campus = p.campus.map((i) => data.campuses[i][1])[0]
  return (
    <li className="sf-card" data-notranslate>
      <a className="sf-link" href={`${OFFICIAL}/faculty/${p.slug}/`} target="_blank" rel="noopener noreferrer">
        <Photo p={p} />
        <span className="sf-body">
          <b>{p.name}</b>
          <span className="sf-desig">{p.desig}</span>
          {(dept || college) && <span className="sf-dept">{dept || college}</span>}
        </span>
        <ArrowUR />
        <span className="sr-only"> (official profile, opens in a new tab)</span>
      </a>
      <div className="sf-meta">
        {campus && <span className="sf-campus">{campus}</span>}
        {p.areas.slice(0, 3).map((a) => (
          <button key={a} type="button" className="sf-tag" onClick={() => onTag(a)} title={`Search “${a}”`}>
            {a}
          </button>
        ))}
      </div>
      <button type="button" className="sf-tt" onClick={() => onTimetable(p)}>
        Timetable <small>prototype</small>
      </button>
    </li>
  )
}

const AVAIL = [
  ['office', 'In office now'],
  ['busy', 'Teaching now'],
  ['free', 'Free now (office or between sessions)'],
]

// uses a generated week, so it only runs when the filter is on; weeks are remembered per person
const weeks = new Map()
function matchAvail(p, kind, now) {
  let w = weeks.get(p.slug)
  if (!w) weeks.set(p.slug, (w = makeWeek(p.slug)))
  const s = statusAt(w, now).state
  return kind === 'free' ? s === 'office' || s === 'idle' : s === kind
}

function Sel({ label, list, all, value, onChange }) {
  return (
    <label className="sf-field">
      <span>{label}</span>
      <select value={value} onChange={onChange}>
        <option value="">{all}</option>
        {list.map(([id, name]) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </select>
    </label>
  )
}

export default function StaffFinder() {
  const [data, setData] = useState(null)
  const [err, setErr] = useState(false)
  const [q, setQ] = useState(() => new URLSearchParams(location.search).get('q') ?? '')
  const [f, setF] = useState({ campus: '', college: '', dept: '', type: '', role: '' })
  const [photoOnly, setPhotoOnly] = useState(false)
  const [sort, setSort] = useState('az')
  const [avail, setAvail] = useState('')
  const [tt, setTt] = useState(null)
  const [now, setNow] = useState(() => istNow())
  const [shown, setShown] = useState(PAGE)
  const top = useRef(null)

  useEffect(() => {
    const id = setInterval(() => setNow(istNow()), 30_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    let live = true
    fetch('/data/staff.json')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        if (!live) return
        // unpack the compact rows into objects once
        const people = d.people.map(([name, slug, desig, spec, photo, role, campus, college, dept, type]) => ({
          name,
          slug,
          desig,
          photo,
          role,
          campus,
          college,
          dept,
          type,
          areas: spec ? spec.split(/\s*[,;]\s*/).filter(Boolean) : [],
          hay: `${name} ${desig} ${spec} ${dept.map((i) => d.departments[i][1]).join(' ')} ${college.map((i) => d.colleges[i][1]).join(' ')}`.toLowerCase(),
        }))
        setData({ ...d, people })
      })
      .catch(() => live && setErr(true))
    return () => {
      live = false
    }
  }, [])

  const results = useMemo(() => {
    if (!data) return []
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean)
    const out = data.people.filter(
      (p) =>
        terms.every((t) => p.hay.includes(t)) &&
        (!f.campus || p.campus.includes(+f.campus)) &&
        (!f.college || p.college.includes(+f.college)) &&
        (!f.dept || p.dept.includes(+f.dept)) &&
        (!f.type || p.type.includes(+f.type)) &&
        (f.role === '' || p.role === +f.role) &&
        (!photoOnly || p.photo) &&
        (!avail || matchAvail(p, avail, now)),
    )
    if (sort === 'za') out.sort((a, b) => b.name.localeCompare(a.name))
    else if (sort === 'senior') out.sort((a, b) => a.role - b.role || a.name.localeCompare(b.name))
    else out.sort((a, b) => a.name.localeCompare(b.name))
    return out
  }, [data, q, f, photoOnly, sort, avail, now.day, now.minutes])

  useEffect(() => setShown(PAGE), [q, f, photoOnly, sort, avail])

  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }))
  const active = q || photoOnly || avail || Object.values(f).some((v) => v !== '')
  const reset = () => {
    setQ('')
    setF({ campus: '', college: '', dept: '', type: '', role: '' })
    setPhotoOnly(false)
    setAvail('')
  }
  const chips = data
    ? [
        q && ['Search', q, () => setQ('')],
        f.campus && ['Campus', data.campuses.find((c) => c[0] === +f.campus)?.[1], () => setF((x) => ({ ...x, campus: '' }))],
        f.college && ['College', data.colleges.find((c) => c[0] === +f.college)?.[1], () => setF((x) => ({ ...x, college: '' }))],
        f.dept && ['Department', data.departments.find((c) => c[0] === +f.dept)?.[1], () => setF((x) => ({ ...x, dept: '' }))],
        f.type && ['Type', data.types.find((c) => c[0] === +f.type)?.[1], () => setF((x) => ({ ...x, type: '' }))],
        f.role !== '' && ['Role', data.roles[+f.role], () => setF((x) => ({ ...x, role: '' }))],
        photoOnly && ['Photo', 'With photo', () => setPhotoOnly(false)],
        avail && ['Availability', AVAIL.find((a) => a[0] === avail)[1], () => setAvail('')],
      ].filter(Boolean)
    : []

  return (
    <>
      <SiteHeader />
      <main className="interior svc" id="main" tabIndex={-1}>
        <SvcHero
          eyebrow="Staff finder"
          title="Find anyone at SRMIST."
          lede={data ? `${data.people.length.toLocaleString('en-IN')} faculty and staff profiles from the official SRMIST staff finder. Search by name or research area, or narrow by campus, college, department, type and role.` : 'Faculty and staff profiles from the official SRMIST staff finder.'}
          img="/srmist/campus-main-building.jpg"
          pos="50% 60%"
        />
        <section className="svc-wrap sf-wrap" ref={top}>
          <div className="sf-filters" role="search">
            <label className="sf-search">
              <StaffIcon />
              <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a name, department or research area (try “cybersecurity”, “law”, “cardiology”)" aria-label="Search staff" />
            </label>
            {data && (
              <div className="sf-selects">
                {data.campuses.length > 1 && <Sel label="Campus" list={data.campuses} all="All campuses" value={f.campus} onChange={set('campus')} />}
                <Sel label="College" list={data.colleges} all="All colleges" value={f.college} onChange={set('college')} />
                <Sel label="Department" list={data.departments} all="All departments" value={f.dept} onChange={set('dept')} />
                <Sel label="Faculty type" list={data.types} all="All types" value={f.type} onChange={set('type')} />
                <Sel label="Role" list={data.roles.map((r, i) => [i, r])} all="All roles" value={f.role} onChange={set('role')} />
                <label className="sf-field">
                  <span>Availability (prototype)</span>
                  <select value={avail} onChange={(e) => setAvail(e.target.value)}>
                    <option value="">Anyone</option>
                    {AVAIL.map(([k, l]) => (
                      <option key={k} value={k}>
                        {l}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="sf-field">
                  <span>Sort</span>
                  <select value={sort} onChange={(e) => setSort(e.target.value)}>
                    <option value="az">Name A–Z</option>
                    <option value="za">Name Z–A</option>
                    <option value="senior">Most senior first</option>
                  </select>
                </label>
                <label className="sf-check">
                  <input type="checkbox" checked={photoOnly} onChange={(e) => setPhotoOnly(e.target.checked)} /> With photo only
                </label>
              </div>
            )}
          </div>

          <div className="sf-bar" aria-live="polite">
            <p>
              {data ? (
                <>
                  <b>{results.length.toLocaleString('en-IN')}</b> {results.length === 1 ? 'person' : 'people'} found
                </>
              ) : err ? (
                'The staff list could not be loaded. Try again, or use the official finder.'
              ) : (
                'Loading the staff list…'
              )}
            </p>
            <ul className="sf-chips">
              {chips.map(([k, v, clear]) => (
                <li key={k}>
                  <button type="button" onClick={clear} aria-label={`Remove filter ${k}: ${v}`}>
                    <span>{k}:</span> {v} <i aria-hidden="true">×</i>
                  </button>
                </li>
              ))}
            </ul>
            {active && (
              <button type="button" className="svc-link" onClick={reset}>
                Reset all
              </button>
            )}
          </div>

          {data && results.length > 0 && (
            <>
              <ul className="sf-grid">
                {results.slice(0, shown).map((p) => (
                  <Card key={p.slug} p={p} data={data} onTag={(a) => { setQ(a); top.current?.scrollIntoView({ behavior: 'smooth' }) }} onTimetable={setTt} />
                ))}
              </ul>
              {shown < results.length && (
                <div className="sf-more">
                  <button type="button" className="svc-btn svc-btn--primary" onClick={() => setShown((n) => n + PAGE * 2)}>
                    Show more ({Math.min(PAGE * 2, results.length - shown)} of {(results.length - shown).toLocaleString('en-IN')} remaining)
                  </button>
                </div>
              )}
            </>
          )}
          {data && results.length === 0 && (
            <div className="sf-empty">
              <h3>No one matches that.</h3>
              <p>Try fewer filters or a shorter search. Some people are listed only under their department, not their research area.</p>
              <button type="button" className="svc-btn" onClick={reset}>
                Reset all
              </button>
            </div>
          )}

          <p className="svc-fine">
            <b>Prototype:</b> the timetables and the availability filter use randomly generated schedules to show the idea. They are not real. Source: the official{' '}
            <a href={`${OFFICIAL}/staff-finder/`} target="_blank" rel="noopener noreferrer">
              SRMIST staff finder<span className="sr-only"> (opens in a new tab)</span>
            </a>
            {data && `, collected ${data.updated}`}. Names, designations, research areas and photos are as the university publishes them; contact details are on each person’s official profile. If something is wrong or missing, it needs correcting there.
          </p>
        </section>
      </main>
      {tt && <StaffTimetable person={tt} photoSrc={tt.photo ? OFFICIAL + tt.photo : null} now={now} onClose={() => setTt(null)} />}
      <Footer />
    </>
  )
}
