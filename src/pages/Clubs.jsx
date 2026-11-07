import { useEffect, useMemo, useRef, useState } from 'react'
import { CLUBS, DSA, GROUPS } from '../data/clubs.js'
import { Arrow, ArrowUR, Footer, Reveal, SiteHeader } from '../shared.jsx'
import CountUp from '../ui/CountUp.jsx'
import '../styles/clubs.css'

const ext = { target: '_blank', rel: 'noopener noreferrer' }

/** A club photo from the official site; if it will not load, the smaller version, then a coloured name tile. */
function ClubImg({ club }) {
  const [src, setSrc] = useState(club.img)
  const [dead, setDead] = useState(false)
  if (dead) return <div className="cl-img cl-ph" aria-hidden="true">{club.name}</div>
  return (
    <img
      className="cl-img"
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => (src !== club.thumb ? setSrc(club.thumb) : setDead(true))}
    />
  )
}

/** A card that tilts toward the pointer and carries a light that follows it. */
function ClubCard({ club, index }) {
  const ref = useRef(null)
  const move = (e) => {
    const el = ref.current
    if (!el || e.pointerType === 'touch') return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    el.style.setProperty('--rx', `${((0.5 - y) * 12).toFixed(2)}deg`)
    el.style.setProperty('--ry', `${((x - 0.5) * 14).toFixed(2)}deg`)
    el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`)
    el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`)
  }
  const leave = () => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }
  return (
    <li className="cl-item" style={{ '--i': index }}>
      <article ref={ref} className="cl-card" onPointerMove={move} onPointerLeave={leave}>
        <ClubImg club={club} />
        <span className="cl-num" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
        <div className="cl-shine" aria-hidden="true" />
        <div className="cl-info">
          <h3>{club.name}</h3>
          <p>{club.line}</p>
        </div>
      </article>
    </li>
  )
}

export default function Clubs() {
  const [group, setGroup] = useState('all')
  const heroRef = useRef(null)
  const shown = useMemo(() => CLUBS.filter((c) => group === 'all' || c.group === group), [group])

  // a gentle parallax on the hero words as the page scrolls (skipped for reduced motion)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const on = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const el = heroRef.current
        if (el) el.style.setProperty('--py', String(Math.min(1, window.scrollY / 700)))
      })
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => {
      window.removeEventListener('scroll', on)
      cancelAnimationFrame(raf)
    }
  }, [])

  const names = CLUBS.map((c) => c.name)

  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="clubs">
        <section ref={heroRef} className="cl-hero">
          <div className="cl-orbs" aria-hidden="true">
            <i /><i /><i />
          </div>
          <div className="cl-hero-in">
            <span className="eyebrow">Directorate of Student Affairs</span>
            <h1>
              <span>Find</span> <em>your people.</em>
            </h1>
            <p>Fifteen student-run clubs, eight houses and over a hundred events a year. Pick something you love, or something you have never tried.</p>
            <div className="cl-hero-cta">
              <a className="button" href="#all-clubs">
                Meet the clubs <Arrow />
              </a>
              <a className="button button-ghost" href="#dsa">
                About DSA
              </a>
            </div>
          </div>
          <div className="cl-ticker" aria-hidden="true">
            <div className="cl-ticker-track">
              {[...names, ...names].map((n, i) => (
                <span key={i}>{n}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="cl-dsa" id="dsa" aria-labelledby="dsa-h">
          <Reveal className="cl-dsa-head">
            <span className="eyebrow">{DSA.short}</span>
            <h2 id="dsa-h">{DSA.name}</h2>
            <p className="cl-tag">{DSA.tag}</p>
            <p>{DSA.about}</p>
          </Reveal>
          <ul className="cl-stats">
            {DSA.stats.map(([v, label], i) => (
              <Reveal as="li" key={label} delay={i * 0.08}>
                <b>
                  <CountUp value={v} />
                </b>
                <span>{label}</span>
              </Reveal>
            ))}
          </ul>
          <ul className="cl-pillars">
            {DSA.pillars.map(([title, text], i) => (
              <Reveal as="li" key={title} delay={i * 0.08}>
                <h3>{title}</h3>
                <p>{text}</p>
              </Reveal>
            ))}
          </ul>
        </section>

        <section className="cl-clubs" id="all-clubs" aria-labelledby="clubs-h">
          <Reveal className="cl-clubs-head">
            <span className="eyebrow">Clubs under DSA</span>
            <h2 id="clubs-h">Fifteen ways to spend a Friday evening.</h2>
          </Reveal>
          <div className="cl-filter" role="group" aria-label="Filter clubs">
            {GROUPS.map(([k, label]) => (
              <button key={k} aria-pressed={group === k} className={group === k ? 'is-on' : ''} onClick={() => setGroup(k)}>
                {label}
              </button>
            ))}
          </div>
          <ul className="cl-grid" key={group}>
            {shown.map((club, i) => (
              <ClubCard key={club.id} club={club} index={i} />
            ))}
          </ul>
          <p className="cl-note">Photos and club names come from the official SRMIST clubs page. The short descriptions are general; ask the club convenors for what they are running this term.</p>
        </section>

        <section className="cl-events" aria-labelledby="ev-h">
          <Reveal>
            <span className="eyebrow">Our events</span>
            <h2 id="ev-h">Where the clubs come together.</h2>
          </Reveal>
          <ul className="cl-event-list">
            {DSA.events.map(([name, text], i) => (
              <Reveal as="li" key={name} delay={i * 0.05}>
                <b>{name}</b>
                <span>{text}</span>
              </Reveal>
            ))}
          </ul>
        </section>

        <section className="cl-join" aria-labelledby="join-h">
          <Reveal>
            <h2 id="join-h">Joining is easy.</h2>
            <p>Find a club that fits, then talk to its convenors or the Directorate of Student Affairs.</p>
            <ul className="cl-people">
              {DSA.people.map(([n, role, mail]) => (
                <li key={mail}>
                  <b>{n}</b>
                  <span>{role}, Directorate of Student Affairs</span>
                  <a href={`mailto:${mail}`}>{mail}</a>
                </li>
              ))}
            </ul>
            <div className="cl-hero-cta">
              <a className="button" href={DSA.clubsOfficial} {...ext}>
                Official clubs page <ArrowUR />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <a className="button button-ghost" href={DSA.official} {...ext}>
                Directorate of Student Affairs <ArrowUR />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  )
}
