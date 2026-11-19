import { useEffect, useRef, useState } from 'react'
import Tilt from 'react-parallax-tilt'
import { ArrowUR, Reveal, prefersReducedMotion } from '../shared.jsx'
import LinkCards from './LinkCards.jsx'

// One visual treatment per kind of section page. Each component gets the items of a group (src/data/sections.js) and
// renders them as a list with real links, so the content reads the same with the effect switched off.

const isExt = (h) => /^https?:/.test(h)
const pad = (n) => String(n).padStart(2, '0')
const still = () => typeof window === 'undefined' || prefersReducedMotion()

/** A link to an official page (new tab, announced) or to one of our own pages. */
function Go({ it, className = 'fx-link', children }) {
  const ext = isExt(it.href)
  return (
    <a className={className} href={it.href} {...(ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
      {children}
      {ext && <span className="sr-only"> (opens in a new tab)</span>}
    </a>
  )
}

/** The call to action under a description: says whether the page is official or ours, and names the item for screen readers. */
function More({ it }) {
  return (
    <Go it={it}>
      {it.ours ? 'Open our page' : 'Official page'}
      <span className="sr-only">: {it.title}</span> <ArrowUR />
    </Go>
  )
}

const Pic = ({ it }) => <img src={it.img} alt="" loading="lazy" decoding="async" style={{ objectPosition: it.pos || '50% 50%' }} />

/** Opens the item whose id is in the address (#pharmacy), so menu links land on the right panel. */
function useHashIndex(items, set) {
  useEffect(() => {
    const apply = () => {
      const i = items.findIndex((x) => `#${x.id}` === window.location.hash)
      if (i >= 0) set(i)
    }
    apply()
    window.addEventListener('hashchange', apply)
    return () => window.removeEventListener('hashchange', apply)
  }, [items, set])
}

/* ---- Colleges: photo panels that open like a fan ---- */
export function Panels({ items }) {
  const [open, setOpen] = useState(0)
  useHashIndex(items, setOpen)
  return (
    <ul className="fx-panels">
      {items.map((it, i) => (
        <li key={it.id} id={it.id} className={i === open ? 'is-open' : ''} onMouseEnter={() => setOpen(i)}>
          <Pic it={it} />
          <div className="fx-panel-in">
            <h3 className="fx-panel-h">
              <button type="button" aria-expanded={i === open} onClick={() => setOpen(i)} onFocus={() => setOpen(i)}>
                <span className="fx-num">{pad(i + 1)}</span>
                <span className="fx-panel-t">{it.title}</span>
              </button>
            </h3>
            <div className="fx-panel-more">
              <p>{it.text}</p>
              <More it={it} />
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

/* ---- Research centres: cards lit by the pointer ---- */
export function Spotlight({ items }) {
  const move = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
  }
  return (
    <ul className="fx-spot">
      {items.map((it) => (
        <li key={it.id} id={it.id} onPointerMove={move}>
          <span className="fx-meta">{it.meta}</span>
          <h3>{it.title}</h3>
          <p>{it.text}</p>
          <More it={it} />
        </li>
      ))}
    </ul>
  )
}

/* ---- Research index: a list with a photo that follows your pointer down the list ---- */
export function HoverIndex({ items }) {
  const [on, setOn] = useState(0)
  useHashIndex(items, setOn)
  return (
    <div className="fx-index">
      <ol className="fx-index-list">
        {items.map((it, i) => (
          <li key={it.id} id={it.id} className={i === on ? 'is-on' : ''} onMouseEnter={() => setOn(i)}>
            <Go it={it} className="fx-index-row">
              <span className="fx-num">{pad(i + 1)}</span>
              <span className="fx-index-body">
                <b>{it.title}</b>
                <span>{it.text}</span>
              </span>
              <ArrowUR />
            </Go>
          </li>
        ))}
      </ol>
      <figure className="fx-index-fig" aria-hidden="true">
        {items.map((it, i) => (
          <img key={it.id} src={it.img} alt="" loading="lazy" decoding="async" className={i === on ? 'is-on' : ''} style={{ objectPosition: it.pos || '50% 50%' }} />
        ))}
      </figure>
    </div>
  )
}

/* ---- Research partners: photo cards that tilt and catch the light ---- */
export function TiltCards({ items }) {
  const off = still()
  return (
    <ul className="fx-tilt">
      {items.map((it) => (
        <li key={it.id} id={it.id}>
          <Tilt tiltEnable={!off} glareEnable={!off} glareMaxOpacity={0.3} scale={off ? 1 : 1.03} tiltMaxAngleX={7} tiltMaxAngleY={7} className="fx-tilt-wrap">
            <article className="fx-tilt-card">
              <Pic it={it} />
              <div className="fx-tilt-in">
                <h3>{it.title}</h3>
                <p>{it.text}</p>
                <More it={it} />
              </div>
            </article>
          </Tilt>
        </li>
      ))}
    </ul>
  )
}

/* ---- Student life: sliced photos that straighten and gain colour ---- */
export function Tiles({ items }) {
  return (
    <ul className="fx-tiles">
      {items.map((it, i) => (
        <li key={it.id} id={it.id} className={`fx-tile fx-tile--${i % 3}`}>
          <Go it={it} className="fx-tile-a">
            <Pic it={it} />
            <span className="fx-tile-cap">
              <b>{it.title}</b>
              <span>{it.text}</span>
              <em>{it.ours ? 'Our page' : 'Official page'}</em>
            </span>
          </Go>
        </li>
      ))}
    </ul>
  )
}

/* ---- Living on campus: a sticky photo that changes with each chapter ---- */
export function Chapters({ items }) {
  const [on, setOn] = useState(0)
  const refs = useRef([])
  useHashIndex(items, setOn)
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setOn(Number(e.target.dataset.i))
      },
      { rootMargin: '-42% 0px -42% 0px' },
    )
    refs.current.forEach((el) => el && io.observe(el))
    return () => io.disconnect()
  }, [items])
  return (
    <div className="fx-chap">
      <figure className="fx-chap-fig" aria-hidden="true">
        {items.map((it, i) => (
          <img key={it.id} src={it.img} alt="" loading="lazy" decoding="async" className={i === on ? 'is-on' : ''} style={{ objectPosition: it.pos || '50% 50%' }} />
        ))}
        <figcaption>{items[on]?.title}</figcaption>
      </figure>
      <ol className="fx-chap-list">
        {items.map((it, i) => (
          <li key={it.id} id={it.id} data-i={i} ref={(el) => (refs.current[i] = el)} className={i === on ? 'is-on' : ''}>
            <Pic it={it} />
            <span className="fx-num">{pad(i + 1)}</span>
            <h3>{it.title}</h3>
            <p>{it.text}</p>
            <More it={it} />
          </li>
        ))}
      </ol>
    </div>
  )
}

/* ---- Support: a filter and calm cards with a slow ripple ---- */
export function HelpFinder({ items, group }) {
  const [cat, setCat] = useState('all')
  const shown = items.filter((i) => cat === 'all' || i.cat === cat)
  const names = Object.fromEntries(group.cats)
  return (
    <div className="fx-help">
      <div className="fx-chips" role="group" aria-label="Type of help">
        {group.cats.map(([id, label]) => (
          <button key={id} type="button" aria-pressed={cat === id} className={cat === id ? 'is-on' : ''} onClick={() => setCat(id)}>
            {label}
          </button>
        ))}
      </div>
      <p className="fx-count" role="status">
        Showing {shown.length} of {items.length}.
      </p>
      <ul className="fx-help-list">
        {shown.map((it) => (
          <li key={it.id} id={it.id}>
            <span className="fx-ripple" aria-hidden="true" />
            <span className="fx-meta">{names[it.cat]}</span>
            <h3>{it.title}</h3>
            <p>{it.text}</p>
            <More it={it} />
            {it.ours && <small className="fx-proto">Prototype, part of our redesign</small>}
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ---- Global SRM: passport stamps that thump into place ---- */
export function Stamps({ items }) {
  return (
    <ul className="fx-stamps">
      {items.map((it, i) => (
        <Reveal as="li" key={it.id} id={it.id} delay={(i % 3) * 0.12}>
          <div className="fx-stamp">
            <span className="fx-seal" aria-hidden="true">
              {it.stamp}
            </span>
            <h3>{it.title}</h3>
            <p>{it.text}</p>
            <More it={it} />
          </div>
        </Reveal>
      ))}
    </ul>
  )
}

/* ---- Pathways: a route with a drawn line and numbered stops ---- */
export function Journey({ items, group }) {
  const split = group.split ?? items.length
  const lanes = group.lanes ?? []
  return (
    <ol className="fx-journey">
      {items.map((it, i) => (
        <Reveal as="li" key={it.id} id={it.id} delay={(i % 4) * 0.1} className={i < split ? 'is-out' : 'is-in'}>
          {(i === 0 || i === split) && lanes[i === 0 ? 0 : 1] && <span className="fx-lane">{lanes[i === 0 ? 0 : 1]}</span>}
          <span className="fx-stop" aria-hidden="true">
            {i + 1}
          </span>
          <h3>{it.title}</h3>
          <p>{it.text}</p>
          <More it={it} />
        </Reveal>
      ))}
    </ol>
  )
}

/* ---- History: a film strip of outlined years you scroll sideways ---- */
export function Timeline({ items, group }) {
  const ref = useRef(null)
  const eras = group.eras ?? []
  const eraOf = (y) => eras.reduce((k, e, i) => (Number(y) >= Number(e[0]) ? i : k), 0)
  const go = (dir) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: still() ? 'auto' : 'smooth' })
  return (
    <div className="fx-tl-wrap">
      <div className="fx-tl-bar">
        <button type="button" className="svc-btn" onClick={() => go(-1)}>
          <span aria-hidden="true">←</span> Earlier
        </button>
        <button type="button" className="svc-btn" onClick={() => go(1)}>
          Later <span aria-hidden="true">→</span>
        </button>
      </div>
      <div className="fx-tl-scroll" ref={ref} role="region" aria-label="History timeline, scrolls sideways" tabIndex={0}>
        <ol className="fx-tl">
          {items.map((it, i) => {
            const k = eraOf(it.year)
            const first = i === 0 || eraOf(items[i - 1].year) !== k
            return (
              <li key={it.year} className={first ? 'is-era' : ''}>
                {first && <span className="fx-era">{eras[k]?.[1]}</span>}
                <b className="fx-year">{it.year}</b>
                <p>{it.text}</p>
              </li>
            )
          })}
        </ol>
      </div>
      {group.source && (
        <p className="svc-fine">
          Source:{' '}
          <a href={group.source} target="_blank" rel="noopener noreferrer">
            the university’s history page<span className="sr-only"> (opens in a new tab)</span>
          </a>
          .
        </p>
      )}
    </div>
  )
}

/* ---- Leadership: a roll of names in large type ---- */
export function Roll({ items }) {
  return (
    <div className="fx-roll-wrap">
      <ul className="fx-roll">
        {items.map((it, i) => (
          <Reveal as="li" key={it.id} delay={i * 0.08}>
            <span className="fx-role">{it.role}</span>
            <b>{it.title}</b>
            {it.text && <span className="fx-roll-note">{it.text}</span>}
          </Reveal>
        ))}
      </ul>
      <Go it={items[0]} className="svc-btn svc-btn--primary">
        See the official leadership page <ArrowUR />
      </Go>
    </div>
  )
}

/* ---- Plain cards (reused from the other pages) ---- */
export function Cards({ items }) {
  return <LinkCards items={items.map((it) => [it.title, it.href, it.text])} />
}

/* ---- Recognition: foil cards with a light that follows the pointer ---- */
function Stars({ n, of = 5 }) {
  return (
    <span className="fx-stars" role="img" aria-label={`${n} of ${of} stars`}>
      {Array.from({ length: of }, (_, i) => (
        <i key={i} className={i < n ? 'is-on' : ''} />
      ))}
    </span>
  )
}

export function Foil({ items }) {
  const move = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--fx', `${((e.clientX - r.left) / r.width) * 100}%`)
    e.currentTarget.style.setProperty('--fy', `${((e.clientY - r.top) / r.height) * 100}%`)
  }
  return (
    <ul className="fx-foil">
      {items.map((it) => (
        <li key={it.id} id={it.id} onPointerMove={move}>
          <span className="fx-big">{it.big}</span>
          <h3>{it.title}</h3>
          <p>{it.text}</p>
          {it.rows && (
            <ul className="fx-rows">
              {it.rows.map(([k, n]) => (
                <li key={k}>
                  <span>{k}</span>
                  <Stars n={n} />
                </li>
              ))}
            </ul>
          )}
          {it.bands && (
            <ul className="fx-rows">
              {it.bands.map(([k, v]) => (
                <li key={k}>
                  <span>{k}</span>
                  <b>{v}</b>
                </li>
              ))}
            </ul>
          )}
          <More it={it} />
        </li>
      ))}
    </ul>
  )
}

/* ---- Offices: file folders with tabs ---- */
export function Folders({ items }) {
  return (
    <ul className="fx-folders">
      {items.map((it) => (
        <li key={it.id} id={it.id}>
          <span className="fx-tab">{it.tab}</span>
          <div className="fx-folder-body">
            <h3>{it.title}</h3>
            <p>{it.text}</p>
            <More it={it} />
          </div>
        </li>
      ))}
    </ul>
  )
}

/* ---- Contact: numbers you can call or copy ---- */
export function Contact({ items, group }) {
  const [said, setSaid] = useState('')
  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setSaid(`Copied ${text}.`)
    } catch {
      setSaid('Select the text and copy it from the page.')
    }
  }
  const tel = (v) => `tel:${v.replace(/[^\d+]/g, '')}`
  return (
    <div className="fx-contact">
      <dl>
        {items.map((it) => (
          <div key={it.id} id={it.id}>
            <dt>{it.label}</dt>
            <dd>
              {[it.value, it.alt].filter(Boolean).map((v) => (
                <span key={v} className="fx-num-row">
                  {it.tel ? <a href={tel(v)}>{v}</a> : <span>{v}</span>}
                  <button type="button" className="svc-btn" onClick={() => copy(v)}>
                    Copy<span className="sr-only"> {v}</span>
                  </button>
                </span>
              ))}
            </dd>
          </div>
        ))}
      </dl>
      <p className="fx-count" role="status">
        {said}
      </p>
      <Go it={{ href: group.href }} className="svc-btn svc-btn--primary">
        Open the official contact page <ArrowUR />
      </Go>
    </div>
  )
}

export const FX = {
  panels: Panels,
  spotlight: Spotlight,
  index: HoverIndex,
  tilt: TiltCards,
  tiles: Tiles,
  chapters: Chapters,
  help: HelpFinder,
  stamps: Stamps,
  journey: Journey,
  timeline: Timeline,
  roll: Roll,
  cards: Cards,
  foil: Foil,
  folders: Folders,
  contact: Contact,
}
