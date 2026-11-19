import { useEffect, useId, useRef, useState } from 'react'
import { toCalendarItem } from '../../lib/events.js'
import { toIcs } from '../../lib/ics.js'
import { useMotionOk, useScrollProgress } from '../../lib/useScrollProgress.js'
import { Arrow, ArrowUR } from '../../shared.jsx'

/** Hand the visitor a calendar file made in the browser. Nothing is uploaded. */
function download(event) {
  const url = URL.createObjectURL(new Blob([toIcs([toCalendarItem(event)])], { type: 'text/calendar;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `${event.id}.ics`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const isExt = (h) => /^https?:/.test(h)

function Actions({ it }) {
  return (
    <div className="es-actions">
      <a className="es-btn es-btn--gold" href={it.href} {...(isExt(it.href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        {it.cta ?? 'Open'} <span className="sr-only">: {it.title}</span>
        {isExt(it.href) ? <ArrowUR /> : <Arrow />}
        {isExt(it.href) && <span className="sr-only"> (opens in a new tab)</span>}
      </a>
      {it.event && (
        <button type="button" className="es-btn" onClick={() => download(it.event)}>
          Add to calendar<span className="sr-only">: {it.title}</span>
        </button>
      )}
    </div>
  )
}

/**
 * "Coming up" as a pinned stage: while the section is pinned, scrolling steps through the events. Each one opens its photo
 * as a circle that grows from the date, the giant day number rolls over, the title and buttons rise in, and a rail on the
 * right shows where you are in the list. The pointer nudges the photo a little. Wide screens with motion allowed get the
 * stage; everything else gets a plain stack of the same cards.
 * items: [{ id, big, small, range, when?, title, text?, href, cta, img, pos, event? }]
 */
export default function EventStage({ heading, items }) {
  const motionOk = useMotionOk()
  const root = useRef(null)
  const bar = useRef(null)
  const last = useRef(0)
  const [on, setOn] = useState(0)
  const [prev, setPrev] = useState(-1)
  const uid = useId()
  const n = items.length

  useScrollProgress(
    root,
    (p) => {
      const i = Math.min(n - 1, Math.floor(p * n * 0.9999))
      if (i !== last.current) {
        setPrev(last.current)
        last.current = i
        setOn(i)
      }
      bar.current?.style.setProperty('--p', p.toFixed(3))
    },
    motionOk,
  )

  // the pointer nudges the photo a little, on a CSS variable so React does not re-render
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3))
    e.currentTarget.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3))
  }

  // choose an event from the rail: scroll to the part of the pinned length where it takes over
  const go = (i) => {
    const r = root.current
    if (!r) return
    const total = r.offsetHeight - window.innerHeight
    window.scrollTo({ top: r.getBoundingClientRect().top + window.scrollY + ((i + 0.5) / n) * total, behavior: 'auto' })
  }

  // Tab to a link inside the stage while it shows another event: nothing to do, only the open event's links are reachable.
  useEffect(() => {
    if (!motionOk) {
      last.current = 0
      setOn(0)
      setPrev(-1)
    }
  }, [motionOk])

  if (!motionOk) {
    return (
      <section className="es-flat" aria-labelledby={`${uid}-h`}>
        <h2 id={`${uid}-h`}>{heading}</h2>
        <ul>
          {items.map((it) => (
            <li key={it.id} style={{ '--es-img': `url(${it.img})`, '--es-pos': it.pos || '50% 50%' }}>
              <span className="es-flat-date" aria-hidden="true">
                <b>{it.big}</b>
                <i>{it.small}</i>
              </span>
              <div className="es-flat-copy">
                <span className="es-meta">{it.range}</span>
                <h3>{it.title}</h3>
                {it.text && <p>{it.text}</p>}
                <Actions it={it} />
              </div>
            </li>
          ))}
        </ul>
      </section>
    )
  }

  const cur = items[on]
  return (
    <section ref={root} className="es" style={{ '--n': n }} aria-labelledby={`${uid}-h`}>
      <div className="es-stage" onPointerMove={onMove}>
        <div className="es-bg" aria-hidden="true">
          {items.map((it, i) => (
            <div key={it.id} className={`es-photo ${i === on ? 'is-on' : i === prev ? 'is-prev' : ''}`}>
              <img src={it.img} alt="" loading="eager" decoding="async" style={{ objectPosition: it.pos || '50% 50%' }} />
            </div>
          ))}
          <div className="es-shade" />
        </div>

        <header className="es-head">
          <h2 id={`${uid}-h`}>{heading}</h2>
          <span className="es-count" aria-hidden="true">
            {String(on + 1).padStart(2, '0')} <i>/ {String(n).padStart(2, '0')}</i>
          </span>
        </header>

        <div className="es-main">
          <div key={`d${on}`} className="es-date" aria-hidden="true">
            <b>{cur.big}</b>
            <i>{cur.small}</i>
          </div>
          <div key={`c${on}`} className="es-copy" aria-live="polite">
            <span className="es-meta">
              {cur.range}
              {cur.when && <em>{cur.when}</em>}
            </span>
            <h3 className={cur.title.length > 70 ? 'is-long' : ''}>{cur.title}</h3>
            {cur.text && <p>{cur.text}</p>}
            <Actions it={cur} />
          </div>
        </div>

        <ol className="es-rail" aria-label="Choose an event">
          {items.map((it, i) => (
            <li key={it.id} className={i === on ? 'is-on' : ''}>
              <button type="button" aria-current={i === on ? 'true' : undefined} onClick={() => go(i)}>
                <span>
                  {it.big} {it.small}
                </span>
                <b>{it.title}</b>
              </button>
            </li>
          ))}
        </ol>

        <div className="es-bar" ref={bar} aria-hidden="true">
          <i />
        </div>
      </div>
    </section>
  )
}
