import { useEffect, useMemo, useRef, useState } from 'react'
import { DAYS, describe, fmt, makeWeek, statusAt, toMin } from '../lib/availability.js'

const FROM = 8 * 60 + 30
const TO = 17 * 60
const STATE_LABEL = { office: 'In office', busy: 'Teaching', idle: 'Between sessions', off: 'Off now' }
const KINDS = [
  ['class', 'Lecture'],
  ['lab', 'Lab'],
  ['meeting', 'Meeting'],
  ['office', 'Office hours'],
]

/** The invented weekly timetable of one person, with a live "where are they" line. PROTOTYPE: see lib/availability.js. */
export default function StaffTimetable({ person, photoSrc, now, onClose }) {
  const week = useMemo(() => makeWeek(person.slug), [person.slug])
  const st = statusAt(week, now)
  const close = useRef(null)
  const hours = Array.from({ length: 9 }, (_, i) => 9 + i) // gutter labels 9 am … 5 pm

  useEffect(() => {
    const prev = document.activeElement
    close.current?.focus()
    const key = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', key)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', key)
      document.body.style.overflow = ''
      prev?.focus?.()
    }
  }, [onClose])

  const [broken, setBroken] = useState(!photoSrc)
  return (
    <div className="tt-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="tt" role="dialog" aria-modal="true" aria-labelledby="tt-name" data-notranslate>
        <button ref={close} type="button" className="tt-x" onClick={onClose} aria-label="Close timetable">
          ×
        </button>
        <div className="tt-proto" role="note">
          <b>Prototype.</b> This timetable is randomly generated to show the idea. It is not this person’s real schedule: SRMIST does not publish staff timetables or office hours.
        </div>
        <header>
          {!broken && <img src={photoSrc} alt="" onError={() => setBroken(true)} referrerPolicy="no-referrer" />}
          <div>
            <h2 id="tt-name">{person.name}</h2>
            <p>{person.desig}</p>
          </div>
          <span className={`av-pill av-pill--${st.state}`}>{STATE_LABEL[st.state]}</span>
        </header>
        <p className="tt-line">{describe(st)}</p>
        {st.state !== 'office' && st.next && (
          <p className="tt-next">
            Next office hours: <b>{DAYS[st.next.day]} {fmt(st.next.start)}–{fmt(st.next.end)}</b>
          </p>
        )}
        <div className="av-week" role="table" aria-label="Weekly timetable (randomly generated)">
          <div className="av-gutter" aria-hidden="true">
            {hours.slice(0, -1).map((h) => (
              <span key={h} style={{ top: `${((h * 60 - FROM) / (TO - FROM)) * 100}%` }}>
                {fmt(h * 60)}
              </span>
            ))}
          </div>
          {DAYS.map((d, di) => (
            <div key={d} className={`av-day ${now.day === di ? 'is-today' : ''}`} role="row">
              <b role="columnheader">{d}</b>
              <div className="av-col">
                {(week[d] ?? []).map((s, i) => {
                  const a = toMin(s.start)
                  const b = toMin(s.end)
                  return (
                    <div key={i} role="cell" className={`av-slot av-${s.kind}`} style={{ top: `${((a - FROM) / (TO - FROM)) * 100}%`, height: `${((b - a) / (TO - FROM)) * 100}%` }}>
                      <small>
                        {fmt(a)}–{fmt(b)}
                      </small>
                      <span>{s.label ?? 'Office hours'}</span>
                    </div>
                  )
                })}
                {now.day === di && now.minutes >= FROM && now.minutes <= TO && <i className="av-now" style={{ top: `${((now.minutes - FROM) / (TO - FROM)) * 100}%` }} aria-hidden="true" />}
              </div>
            </div>
          ))}
        </div>
        <ul className="av-legend" aria-label="Key">
          {KINDS.map(([k, l]) => (
            <li key={k}>
              <i className={`av-key av-${k}`} aria-hidden="true" /> {l}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
