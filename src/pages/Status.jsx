import { useCallback, useEffect, useState } from 'react'
import { ArrowUR, Footer, SiteHeader } from '../shared.jsx'
import SvcHero from '../ui/SvcHero.jsx'
import '../services.css'

const STATE = {
  up: { label: 'Operational', note: 'Answering normally.' },
  slow: { label: 'Slow', note: 'Answering, but slower than usual.' },
  limited: { label: 'Reachable', note: 'The server is running. It does not let our automated check see the page itself.' },
  down: { label: 'Not responding', note: 'Did not answer our check.' },
}

const BANNER = {
  up: ['All services are running', 'Every portal answered our latest check.'],
  slow: ['Some services are slow', 'They are answering, but taking longer than usual. Give them a minute.'],
  partial: ['Some services are not responding', 'If you are trying one of these, try again later or report it so the team knows.'],
  down: ['No portal answered', 'This can mean a wider outage, or that our checker cannot reach SRMIST right now.'],
}

function Icon({ state }) {
  // shape as well as colour, so the state never depends on colour alone
  const p = { up: 'M5 12.5l4.5 4.5L19 7.5', slow: 'M12 6v6.5l4 2.5', limited: 'M12 7v6M12 16.5v.5', down: 'M6 6l12 12M18 6L6 18' }[state]
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={p} />
    </svg>
  )
}

const ago = (iso) => {
  const s = Math.max(0, Math.round((Date.now() - new Date(iso)) / 1000))
  if (s < 10) return 'just now'
  if (s < 60) return `${s} seconds ago`
  return `${Math.round(s / 60)} min ago`
}

export default function Status() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [, tick] = useState(0)

  const load = useCallback(async () => {
    setBusy(true)
    try {
      const r = await fetch('/api/status', { headers: { accept: 'application/json' } })
      if (!r.ok) throw new Error()
      setData(await r.json())
      setError('')
    } catch {
      setError('We could not run the checks just now. This is a problem with this website, not necessarily with the portals.')
    } finally {
      setBusy(false)
    }
  }, [])

  useEffect(() => {
    load()
    const every = setInterval(() => document.visibilityState === 'visible' && load(), 60_000)
    const clock = setInterval(() => tick((n) => n + 1), 15_000) // keeps "x seconds ago" honest
    return () => {
      clearInterval(every)
      clearInterval(clock)
    }
  }, [load])

  const groups = data ? [...new Set(data.services.map((s) => s.group))] : []
  const [head, sub] = data ? BANNER[data.overall] : ['Checking the portals…', 'This takes a few seconds.']

  return (
    <>
      <SiteHeader />
      <main className="interior svc" id="main" tabIndex={-1}>
        <SvcHero eyebrow="Service status" title="Is it down, or is it just you?" lede="Live checks of the portals students use most. We ask each one from our server every minute, so you can tell an outage from a bad connection before you spend an hour refreshing." img="/srmist/tech-park.jpg" pos="50% 40%" />

        <section className="svc-wrap" aria-labelledby="svc-banner">
          <div className={`svc-banner svc-banner--${data?.overall ?? 'wait'}`} role="status" aria-live="polite">
            <div>
              <h2 id="svc-banner">{head}</h2>
              <p>{error || sub}</p>
            </div>
            <div className="svc-banner-meta">
              {data && <small>Checked {ago(data.checkedAt)}</small>}
              <button className="svc-btn" onClick={load} disabled={busy}>
                {busy ? 'Checking…' : 'Check again'}
              </button>
            </div>
          </div>

          {error && !data && (
            <p className="svc-note" role="alert">
              {error}
            </p>
          )}

          {groups.map((g) => (
            <section key={g} className="svc-group" aria-label={g}>
              <h3>{g}</h3>
              <ul className="svc-list">
                {data.services
                  .filter((s) => s.group === g)
                  .map((s) => {
                    const up = s.recent.filter((x) => x === 'up' || x === 'limited' || x === 'slow').length
                    return (
                      <li key={s.id} className={`svc-card svc-card--${s.state}`}>
                        <div className="svc-card-top">
                          <div>
                            <h4>{s.name}</h4>
                            <p>{s.blurb}</p>
                          </div>
                          <span className={`svc-pill svc-pill--${s.state}`}>
                            <Icon state={s.state} />
                            {STATE[s.state].label}
                          </span>
                        </div>
                        <p className="svc-detail">
                          {STATE[s.state].note}
                          {s.state !== 'down' && s.ms != null && <> Answered in {s.ms < 1000 ? `${s.ms} ms` : `${(s.ms / 1000).toFixed(1)} s`}.</>}
                          {s.error && <> ({s.error}.)</>}
                        </p>
                        <div className="svc-strip" role="img" aria-label={`Last ${s.recent.length} checks: ${up} answered, ${s.recent.length - up} did not.`}>
                          {s.recent.map((x, i) => (
                            <i key={i} className={`svc-tick svc-tick--${x}`} />
                          ))}
                        </div>
                        <a className="svc-open" href={s.url} target="_blank" rel="noopener noreferrer">
                          Open {s.url.replace(/^https:\/\//, '').replace(/\/$/, '')} <ArrowUR />
                          <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                      </li>
                    )
                  })}
              </ul>
            </section>
          ))}

          <aside className="svc-help">
            <h3>Portal shows operational but you still cannot get in?</h3>
            <p>A portal can answer our check and still reject your login or fail on one page. Tell us what happened and you get a reference number to follow it.</p>
            <a className="button" href="/support?category=Portal%20or%20website%20problem">
              Report a portal problem
            </a>
            <p className="svc-fine">
              About these checks: they only test whether a portal answers a web request from our server. They cannot see inside your account, and they are not an official SRMIST service. History is kept in server memory and starts over when the server restarts.
            </p>
          </aside>
        </section>
      </main>
      <Footer />
    </>
  )
}
