import { useEffect, useMemo, useState } from 'react'
import { EVENTS, EVENTS_READ_ON, EVENTS_SOURCE } from '../data/events.js'
import { daysUntil, formatRange, groupByMonth, istToday, monthKey, monthLabel, monthsOf, toCalendarItem, upcoming } from '../lib/events.js'
import { toIcs } from '../lib/ics.js'
import { Arrow, ArrowUR, Footer, SiteHeader } from '../shared.jsx'
import SvcHero from '../ui/SvcHero.jsx'
import '../services.css'
import '../styles/events.css'

const ext = { target: '_blank', rel: 'noopener noreferrer' }
const NewTab = () => <span className="sr-only"> (opens in a new tab)</span>

/** Hand the visitor a calendar file made in the browser. Nothing is uploaded. */
function download(items, name) {
  const url = URL.createObjectURL(new Blob([toIcs(items.map(toCalendarItem))], { type: 'text/calendar;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function When({ e, today }) {
  const d = daysUntil(e.start, today)
  if (d <= 0) return <span className="ev-when ev-when--now">Happening now</span>
  if (d === 1) return <span className="ev-when">Tomorrow</span>
  if (d <= 14) return <span className="ev-when">In {d} days</span>
  return null
}

export default function EventsCalendar() {
  const today = useMemo(() => istToday(), [])
  const [staff, setStaff] = useState([])
  useEffect(() => {
    let live = true
    fetch('/api/public/items?type=event')
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d) => live && setStaff((d.items || []).map((i) => ({ id: `staff-${i.id}`, title: i.title, start: i.event_date, end: i.event_date, time: `${i.start_time} – ${i.end_time}`, venue: i.venue, href: i.link || '', staff: true }))))
      .catch(() => {})
    return () => { live = false }
  }, [])
  const all = useMemo(() => upcoming([...EVENTS, ...staff]), [staff])
  const months = useMemo(() => monthsOf(all), [all])
  const [month, setMonth] = useState('all')
  const shown = month === 'all' ? all : all.filter((e) => monthKey(e) === month)
  const groups = groupByMonth(shown)
  const next = all[0]

  return (
    <>
      <SiteHeader />
      <main className="interior svc ev-page" id="main" tabIndex={-1}>
        <SvcHero eyebrow="Events calendar" title="What is on at SRMIST, month by month." lede="Conferences, workshops, programmes and festivals from the official events page, with a calendar file for each one." img="/srmist/campus-panorama.webp" pos="50% 50%">
          <nav className="vis-quick" aria-label="On this page">
            <a href="#calendar">The calendar</a>
            <a href="#notes">About these dates</a>
          </nav>
        </SvcHero>

        <section className="svc-wrap vis-grid">
          <div className="vis-block" id="calendar">
            <h2>Coming up</h2>
            {next ? (
              <p>
                {all.length} {all.length === 1 ? 'event' : 'events'} listed. Next: <strong>{next.title}</strong>, {formatRange(next.start, next.end)}.
              </p>
            ) : (
              <p className="ev-empty">Nothing is listed right now. The official events page may have newer items.</p>
            )}

            {months.length > 0 && (
              <div className="ev-ribbon" role="group" aria-label="Show events from">
                <button type="button" aria-pressed={month === 'all'} className={month === 'all' ? 'is-on' : ''} onClick={() => setMonth('all')}>
                  All
                </button>
                {months.map((m) => (
                  <button key={m} type="button" aria-pressed={month === m} className={month === m ? 'is-on' : ''} onClick={() => setMonth(m)}>
                    {monthLabel(m)}
                  </button>
                ))}
              </div>
            )}
            <p className="ev-count" role="status">
              Showing {shown.length} of {all.length}.
            </p>

            {groups.map(([key, list]) => (
              <section className="ev-month" key={key} aria-label={monthLabel(key)}>
                <h3 className="ev-month-h">{monthLabel(key)}</h3>
                <ol className="ev-list">
                  {list.map((e) => {
                    const [, m, d] = e.start.split('-')
                    return (
                      <li key={e.id} className="ev-item">
                        <div className="ev-tile" aria-hidden="true">
                          <b>{Number(d)}</b>
                          <span>{monthLabel(`${e.start.slice(0, 4)}-${m}`).slice(0, 3)}</span>
                        </div>
                        <div className="ev-body">
                          <h4>{e.title}</h4>
                          <p className="ev-meta">
                            {formatRange(e.start, e.end)}
                            {e.time ? ` · ${e.time}` : ''}
                            {e.venue ? ` · ${e.venue}` : ''}
                            {e.staff && <span className="ev-when"> Posted by university staff</span>}
                            <When e={e} today={today} />
                          </p>
                          <div className="ev-actions">
                            <button type="button" className="svc-btn" onClick={() => download([e], `${e.id}.ics`)}>
                              Add to calendar<span className="sr-only">: {e.title}</span>
                            </button>
                            {e.href && (
                              <a className="svc-btn" href={e.href} {...ext}>
                                {e.staff ? 'Registration link' : 'Official page'}<span className="sr-only">: {e.title}</span> <ArrowUR />
                                <NewTab />
                              </a>
                            )}
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ol>
              </section>
            ))}

            {shown.length > 0 && (
              <div className="svc-row">
                <button type="button" className="svc-btn svc-btn--primary" onClick={() => download(shown, `srmist-events-${month}.ics`)}>
                  Download {shown.length} {shown.length === 1 ? 'event' : 'events'} (.ics) <Arrow />
                </button>
              </div>
            )}
          </div>

          <div className="vis-block" id="notes">
            <h2>About these dates</h2>
            <p>
              Every event, date and time here was copied from the university’s own events pages on {EVENTS_READ_ON}. Events the university adds later will not appear until this list is updated, so the official page is the one to trust.
            </p>
            <p>The calendar files are made in your browser; nothing about you is sent anywhere. A file will not update by itself if an event changes.</p>
            <div className="svc-row">
              <a className="svc-btn svc-btn--primary" href={EVENTS_SOURCE} {...ext}>
                Official events page
                <NewTab /> <ArrowUR />
              </a>
              <a className="svc-btn" href="/dates">
                Admission dates <Arrow />
              </a>
              <a className="svc-btn" href="/events">
                News and events overview <Arrow />
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
