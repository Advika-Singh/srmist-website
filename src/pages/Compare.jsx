import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PROGRAMMES, programmeById } from '../data/programmes.js'
import { OFFICIAL } from '../data/srmjeee.js'
import { MAX_COMPARE, clearShortlist, columns, idsFromQuery, queryFor, readShortlist, toggleId, toggleShortlist } from '../lib/compare.js'
import { Arrow, Footer, SiteHeader } from '../shared.jsx'
import Hero from '../ui/Hero.jsx'
import '../services.css'
import '../styles/compare.css'

const ext = { target: '_blank', rel: 'noopener noreferrer' }
const NewTab = () => <span className="sr-only"> (opens in a new tab)</span>

const store = () => {
  try {
    return window.localStorage
  } catch {
    return { getItem: () => null, setItem() {}, removeItem() {} }
  }
}

export default function Compare() {
  const [params, setParams] = useSearchParams()
  const ids = useMemo(() => idsFromQuery(params.toString()), [params])
  const cols = useMemo(() => columns(ids), [ids])
  const [saved, setSaved] = useState([])
  const [copied, setCopied] = useState('')
  const full = ids.length >= MAX_COMPARE

  useEffect(() => setSaved(readShortlist(store())), [])

  const setIds = (next) => {
    setCopied('')
    setParams(next.length ? { fields: next.join(',') } : {}, { replace: true, preventScrollReset: true })
  }
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/compare${queryFor(ids)}`)
      setCopied('Link copied.')
    } catch {
      setCopied('Copy the address from your browser’s address bar.')
    }
  }

  const ROWS = [
    ['Study levels', (c) => c.levels],
    [
      'Typical length',
      (c) => (
        <ul className="cp-plain">
          {c.duration.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      ),
    ],
    [
      'Example programmes',
      (c) => (
        <ul className="cp-plain">
          {c.examples.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      ),
    ],
    [
      'Entrance exam',
      (c) =>
        c.guide ? (
          <a href={c.guide}>{c.entrance}</a>
        ) : (
          <>
            {c.entrance}
            {c.entrance.startsWith('See') && (
              <>
                {': '}
                <a href={OFFICIAL.admissions} {...ext}>
                  Admissions for India
                  <NewTab />
                </a>
              </>
            )}
          </>
        ),
    ],
    [
      'Official page',
      (c) => (
        <a href={c.official} {...ext}>
          {c.officialIsField ? 'Open on srmist.edu.in' : 'Admissions on srmist.edu.in'}
          <NewTab />
        </a>
      ),
    ],
  ]

  return (
    <>
      <SiteHeader />
      <main className="interior svc cp-page idv-slats" id="main" tabIndex={-1}>
        <Hero layout="band" eyebrow="Compare programmes" title="Put fields of study side by side." lede="Choose up to three fields and see their levels, typical length, example programmes and entrance exam in one table, then save the ones you like." img="/srmist/students.webp" pos="50% 35%">
          <nav className="vis-quick" aria-label="On this page">
            <a href="#choose">Choose fields</a>
            <a href="#table">Comparison</a>
            <a href="#shortlist">My shortlist</a>
          </nav>
        </Hero>

        <section className="svc-wrap vis-grid">
          <div className="vis-block" id="choose">
            <h2>Choose up to three</h2>
            <p>Tap a field to add it to the table, and tap again to remove it.</p>
            <div className="cp-chips" role="group" aria-label="Fields of study">
              {PROGRAMMES.map((p) => {
                const on = ids.includes(p.id)
                return (
                  <button key={p.id} type="button" className={on ? 'is-on' : ''} aria-pressed={on} disabled={!on && full} onClick={() => setIds(toggleId(ids, p.id))}>
                    {p.field}
                  </button>
                )
              })}
            </div>
            <p className="svc-fine" role="status">
              {ids.length} of {MAX_COMPARE} chosen.{full ? ' Remove one to choose a different field.' : ''}
            </p>
          </div>

          <div className="vis-block" id="table">
            <h2>Side by side</h2>
            {cols.length === 0 ? (
              <p className="cp-empty">Nothing chosen yet. Pick a field above to start the table.</p>
            ) : (
              <>
                <div className="cp-scroll" role="region" aria-label="Programme comparison table" tabIndex={0}>
                  <table className="cp-table" style={{ '--cp-n': cols.length }}>
                    <caption className="sr-only">Comparison of {cols.map((c) => c.field).join(', ')}</caption>
                    <thead>
                      <tr>
                        <td />
                        {cols.map((c) => (
                          <th key={c.id} scope="col">
                            <span className="cp-field">{c.field}</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ROWS.map(([label, cell]) => (
                        <tr key={label}>
                          <th scope="row">{label}</th>
                          {cols.map((c) => (
                            <td key={c.id}>{cell(c)}</td>
                          ))}
                        </tr>
                      ))}
                      <tr>
                        <th scope="row">Next step</th>
                        {cols.map((c) => {
                          const on = saved.includes(c.id)
                          return (
                            <td key={c.id}>
                              <div className="cp-actions">
                                <a className="svc-btn svc-btn--primary" href={c.apply}>
                                  Apply<span className="sr-only"> for {c.field}</span> <Arrow />
                                </a>
                                <button type="button" className="svc-btn" aria-pressed={on} onClick={() => setSaved(toggleShortlist(store(), c.id))}>
                                  {on ? 'Saved' : 'Save'}
                                  <span className="sr-only"> {c.field} {on ? 'in' : 'to'} my shortlist</span>
                                </button>
                                <button type="button" className="cp-x" onClick={() => setIds(toggleId(ids, c.id))}>
                                  Remove<span className="sr-only"> {c.field}</span> from table
                                </button>
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="svc-row">
                  <button type="button" className="svc-btn" onClick={copy}>
                    Copy a link to this comparison
                  </button>
                  <a className="svc-btn" href="/admissions#fees">
                    Estimate fees <Arrow />
                  </a>
                  <span className="cp-status" role="status">
                    {copied}
                  </span>
                </div>
              </>
            )}
            <p className="svc-fine">
              Lengths are the usual length of each degree in India. The exact list of programmes, their eligibility and their fees are on the official site:{' '}
              <a href={OFFICIAL.admissions} {...ext}>
                Admissions for India
                <NewTab />
              </a>
              . Not sure where to start? Try the <a href="/course-finder">course finder</a>.
            </p>
          </div>

          <div className="vis-block" id="shortlist">
            <h2>My shortlist</h2>
            <p>Fields you save are kept in this browser only. Nothing is sent to us, and you can clear the list at any time.</p>
            {saved.length === 0 ? (
              <p className="cp-empty">Your shortlist is empty. Use “Save” in the table to keep a field here.</p>
            ) : (
              <>
                <ul className="cp-saved">
                  {saved.map((id) => {
                    const p = programmeById(id)
                    return (
                      <li key={id}>
                        <div>
                          <b>{p.field}</b>
                          <span>{p.duration}</span>
                        </div>
                        <div className="cp-actions">
                          <a className="svc-btn" href={`/apply/programme?field=${encodeURIComponent(p.field)}`}>
                            Apply<span className="sr-only"> for {p.field}</span> <Arrow />
                          </a>
                          <button type="button" className="svc-btn" onClick={() => setSaved(toggleShortlist(store(), id))}>
                            Remove<span className="sr-only"> {p.field} from my shortlist</span>
                          </button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
                <div className="svc-row">
                  <button type="button" className="svc-btn svc-btn--primary" onClick={() => setIds(saved.slice(0, MAX_COMPARE))}>
                    Compare {saved.length > MAX_COMPARE ? `the first ${MAX_COMPARE}` : 'my shortlist'}
                  </button>
                  <button type="button" className="svc-btn" onClick={() => setSaved(clearShortlist(store()))}>
                    Clear the shortlist
                  </button>
                </div>
              </>
            )}
            <p className="svc-fine">
              How this is stored is explained in the <a href="/privacy">privacy notice</a>. For application deadlines, see <a href="/dates">key dates</a>.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
