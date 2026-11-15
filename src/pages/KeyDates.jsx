import { useMemo } from 'react'
import { OFFICIAL } from '../data/srmjeee.js'
import { keyDates, toIcs, upcoming } from '../lib/ics.js'
import { nextDeadline } from '../lib/srmjeee.js'
import { Arrow, Footer, SiteHeader } from '../shared.jsx'
import SvcHero from '../ui/SvcHero.jsx'
import '../services.css'
import '../styles/srmjeee.css'
import '../styles/compare.css'

const ext = { target: '_blank', rel: 'noopener noreferrer' }
const NewTab = () => <span className="sr-only"> (opens in a new tab)</span>

/** Hand the visitor a calendar file made in the browser. Nothing is uploaded. */
function download(items, name) {
  const url = URL.createObjectURL(new Blob([toIcs(items)], { type: 'text/calendar;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export default function KeyDates() {
  const all = useMemo(() => keyDates(), [])
  const live = useMemo(() => upcoming(all), [all])
  const next = useMemo(() => nextDeadline(), [])
  const nextId = live[0]?.id

  return (
    <>
      <SiteHeader />
      <main className="interior svc cp-page" id="main" tabIndex={-1}>
        <SvcHero eyebrow="Key dates" title="Never miss an admission date." lede="The SRMJEEE 2027 application deadlines and exam days in one list, with a calendar file you can add to your phone." img="/srmist/campus-lakeview.jpg" pos="50% 50%">
          <nav className="vis-quick" aria-label="On this page">
            <a href="#dates">The dates</a>
            <a href="#calendar">Add to my calendar</a>
            <a href="#more">Other exams</a>
          </nav>
        </SvcHero>

        <section className="svc-wrap vis-grid">
          <div className="vis-block" id="dates">
            <h2>SRMJEEE 2027</h2>
            <p>For B.Tech and M.Tech (Integrated). There are two phases, and each has its own application deadline.</p>
            {next && (
              <div className="sj-count" role="status">
                <b>{next.daysLeft}</b>
                <span>
                  {next.daysLeft === 1 ? 'day' : 'days'} left to apply for <strong>Phase {next.n}</strong> (deadline {next.deadlineLabel})
                </span>
              </div>
            )}
            <ol className="dt-list">
              {all.map((e) => {
                const past = !live.includes(e)
                return (
                  <li key={e.id} className={`dt-item ${e.id === nextId ? 'is-next' : ''} ${past ? 'is-past' : ''}`}>
                    <div className="dt-when">{e.label}</div>
                    <div className="dt-what">
                      <span className="dt-tag dt-tag--kind">{e.kind === 'deadline' ? 'Application deadline' : 'Exam'}</span>
                      <b>
                        {e.title}
                        {e.id === nextId && <span className="dt-tag">Next</span>}
                        {past && <span className="sr-only"> (this date has passed)</span>}
                      </b>
                      <span>{past ? 'This date has passed.' : 'Tentative, as published by SRMIST.'}</span>
                    </div>
                    {!past && (
                      <button type="button" className="svc-btn" onClick={() => download([e], `${e.id}.ics`)}>
                        Add to calendar<span className="sr-only">: {e.title}</span>
                      </button>
                    )}
                  </li>
                )
              })}
            </ol>
            <p className="svc-fine">
              SRMIST marks these dates as tentative, and they may change. Confirm them in the official{' '}
              <a href={OFFICIAL.dates} {...ext}>
                important dates for SRMJEEE UG 2027
                <span className="sr-only"> (PDF, opens in a new tab)</span>
              </a>{' '}
              before you plan around them.
            </p>
          </div>

          <div className="vis-block" id="calendar">
            <h2>Add them all to your calendar</h2>
            <p>One file with every date that is still ahead. It opens in Google Calendar, Apple Calendar and Outlook. The file is made in your browser, so nothing about you is sent anywhere.</p>
            {live.length ? (
              <div className="svc-row">
                <button type="button" className="svc-btn svc-btn--primary" onClick={() => download(live, 'srmjeee-2027-dates.ics')}>
                  Download {live.length} {live.length === 1 ? 'date' : 'dates'} (.ics) <Arrow />
                </button>
                <a className="svc-btn" href="/srmjeee">
                  How to register <Arrow />
                </a>
              </div>
            ) : (
              <p className="cp-empty">Every SRMJEEE 2027 date on this page has passed. Check the official admissions page for the next cycle.</p>
            )}
            <p className="svc-fine">Each calendar entry is labelled tentative and carries the link to the official dates. If SRMIST changes a date, the entry in your calendar will not update by itself, so check back here or on the official page.</p>
          </div>

          <div className="vis-block" id="more">
            <h2>Other exams and deadlines</h2>
            <p>Dates for SRMJEEM (MBA), SRMJEEH (health sciences) and SRMJEEL (law) are published on the official admissions page. They are not listed here because we only show dates we have copied from an official source.</p>
            <div className="svc-row">
              <a className="svc-btn svc-btn--primary" href={OFFICIAL.admissions} {...ext}>
                Admissions for India
                <NewTab />
              </a>
              <a className="svc-btn" href="/admissions">
                Our admissions guide <Arrow />
              </a>
              <a className="svc-btn" href="/compare">
                Compare programmes <Arrow />
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
