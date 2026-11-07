import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import ScrollTunnel from './ScrollTunnel.jsx'
import { PROGRAMMES } from './data/programmes.js'
import AudienceSwitch, { useAudience } from './ui/AudienceSwitch.jsx'
import { neighbours, orderFor } from './data/audiences.js'
import { NIRF_RANKS as nirfRanks, RANK_STATS as rankStats } from './data/rankings.js'
import { useLang } from './i18n.jsx'
import CountUp from './ui/CountUp.jsx'
import FieldIcon from './ui/FieldIcons.jsx'
import NewsRun from './ui/NewsRun.jsx'
import { useScrollScenes } from './lib/useScrollScenes.js'
import { useMotionOk } from './lib/useScrollProgress.js'
import { Arrow, ArrowUR, B, Footer, IMG, LINK, MainNav, Photo, Reveal, ex, preloadPhoto, prefersReducedMotion } from './shared.jsx'

// The splash + photo shuffle only plays the first time the home page opens.
let introPlayed = false

// Order the original flips through while the hero card "shuffles".
// Full-screen hero photos of the Kattankulathur campus, in the order they rotate (large files only: they fill the screen).
// To add one, put the file in public/srmist/ and list it here with the card frame it should start from.
const HERO_CYCLE = [
  [IMG.campus, 'frame-low-right'],
  [IMG.campusAlt, 'frame-center'],
  ['/srmist/tech-park.jpg', 'frame-low-right'],
  ['/srmist/campus-panorama.jpg', 'frame-center'],
]

// Everything SRMIST teaches, shown around the wordmark so a visitor sees the breadth at a glance.
// Names come from the official site's college and health-science menus.
const DISCIPLINES_TOP = ['Engineering', 'Medicine', 'Dentistry', 'Pharmacy', 'Nursing', 'Physiotherapy', 'Public Health']
const DISCIPLINES_BOTTOM = ['Management', 'Law', 'Architecture', 'Science & Humanities', 'Agricultural Sciences', 'Hotel Management']

// Background of each home section, so the Learn · Leap · Lead corridor can blend into whatever sits above and below it.
const SECTION_BG = { about: 'var(--blue)', rankings: 'var(--sand)', fields: 'var(--paper)', research: 'var(--paper)', news: 'var(--blue)' }
const edgeBg = (key) => SECTION_BG[key] ?? 'var(--blue)'

const SHUFFLE = [IMG.walking, IMG.lab, IMG.classroom, IMG.urban, IMG.collab, IMG.campus, IMG.campusAlt]

// Intro → cinematic hero timeline (ms after mount), measured from the published site.
const IDENT_MS = 4350 // identity splash finishes
const SHUFFLE_START_MS = 4450 // card begins flicking through photos
const SHUFFLE_STEP_MS = 110 // one photo every ~110ms
const SHUFFLE_FLIPS = 10 // flips before the final photo locks in and expands
const FRAME_CYCLE_MS = 4500 // cinematic hero moves to the next campus photo this often

const disciplines = [
  ['Engineering & Technology', LINK.academics],
  ['Medicine & Health', LINK.academics],
  ['Management', LINK.academics],
  ['Science & Humanities', LINK.academics],
  ['Law', LINK.academics],
  ['Architecture', LINK.academics],
  ['Agricultural Sciences', LINK.academics],
  ['Hotel Management', LINK.academics],
]

// Figures below come from srmist.edu.in (home page, accreditations page and the
// NIRF 2025 announcement), checked on 2026-11-05.
const globalStats = [
  ['200+', 'Students sponsored abroad every year'],
  ['35+', 'Foreign universities'],
  ['2003', 'International Advisory Board constituted'],
]

const globalPartners = ['MIT', 'Carnegie Mellon', 'UC Davis', 'Warwick', 'Western Australia']

const campuses = [
  ['Kattankulathur', 'Chennai, Tamil Nadu', LINK.officialHome],
  ['Ramapuram', 'Chennai, Tamil Nadu', 'https://srmrmp.edu.in/ramapuram-campus/'],
  ['Vadapalani', 'Chennai, Tamil Nadu', 'https://www.srmistvdp.edu.in/'],
  ['Tiruchirappalli', 'Tamil Nadu', 'https://srmtrichy.edu.in/'],
  ['Delhi-NCR', 'Delhi National Capital Region', 'https://www.srmimt.net/'],
  ['Baburayanpettai', 'Acharapakkam, Chengalpattu', `${B}/baburayanpettai-campus/`],
]

const groupInstitutions = [
  ['SRM University AP, Andhra Pradesh', 'https://srmap.edu.in/'],
  ['SRM University Haryana', 'https://srmuniversity.ac.in/'],
  ['SRM University Sikkim', 'https://srmus.ac.in/'],
]

const upcomingEvents = [
  ['12–13 Nov', 'TECHNOBLIZZ 2026', LINK.technoblizz],
  ['19 Dec', 'Alumni Day 2026', LINK.alumniDay],
]

const destinations = [
  [LINK.programmes, IMG.classroom, 'Students working at computers in an SRMIST lab', 'Find your course', 'Programme Finder'],
  [LINK.international, IMG.collab, 'International and Indian students on the SRMIST campus', 'Connect globally', 'International'],
  [LINK.placements, IMG.walking, 'An SRMIST sports team on the ground', 'Build your future', 'Placements'],
]

const quick = [
  [LINK.rankings, 'Recognition', 'Rankings & accreditation'],
  [LINK.scholarships, 'Opportunity', 'Scholarships & financial aid'],
  [LINK.events, 'Community', 'News & events'],
]

const services = [
  [LINK.library, 'Study & research', 'University Library'],
  [LINK.departments, 'Academic directory', 'Departments A–Z'],
  [LINK.examinations, 'Schedules & results', 'Examinations'],
  [LINK.alumni, 'Lifelong community', 'Alumni Network'],
  [LINK.faculty, 'Teaching & research staff', 'Faculty & staff'],
]

const stories = [
  [LINK.swift, 'Innovation', 'SRMIST student recognised at Apple’s Swift Student Challenge'],
  [LINK.camber, 'Campus', 'Team Camber Racing claims a national Formula Bharat title'],
  [LINK.convocation, 'Community', 'Convocation celebrates the next generation of leaders'],
]

const newsTop = [
  { kind: 'photo', href: LINK.campusLife, ext: ex(LINK.campusLife), tag: 'Student achievement · 4 min read', title: 'Ideas become prototypes—and prototypes become something bigger.', img: IMG.collab, alt: 'International and Indian students on the SRMIST campus' },
  ...stories.map(([href, tag, title]) => ({ kind: 'story', href, ext: ex(href), tag, title })),
]
const newsBottom = [
  ...upcomingEvents.map(([date, title, href]) => ({ kind: 'event', href, ext: ex(href), date, title })),
  ...stories.slice().reverse().map(([href, tag, title]) => ({ kind: 'story', href, ext: ex(href), tag, title })),
]

const marqueeWords = ['Learn', 'Question', 'Build', 'Discover', 'Lead']

const easeOutCubic = (p) => 1 - Math.pow(1 - p, 3)
const easeInOutCubic = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2)

/**
 * The splash word: SRM drops in, IST slides in beside it, then the whole word glides onto the hero's SRMIST
 * wordmark. Each move is driven from one easing curve, and the blur is a real directional motion blur
 * (an SVG blur along the direction of travel) whose strength follows the speed: sharp at rest, smeared in flight.
 */
function Ident({ onDone }) {
  const mark = useRef(null)
  const blurs = useRef({})

  useLayoutEffect(() => {
    const m = mark.current
    if (!m) return
    const srm = m.querySelector('.ident-srm')
    const ist = m.querySelector('.ident-ist')
    const target = document.querySelector('.opening-brand h1')
    const vh = window.innerHeight
    const vw = window.innerWidth
    // Measured right before the landing starts (not at mount): by then the web font is in, so sizes are final.
    // The scale comes from the two font sizes (same font, same letter-spacing in em), which is exact; the offset
    // comes from where each box's top-left corner sits.
    const prepareLanding = (mv) => {
      const goalEl = document.querySelector('.opening-brand h1')
      if (!goalEl) return
      const keep = m.style.transform
      m.style.transform = 'none'
      const rest = m.getBoundingClientRect()
      const goal = goalEl.getBoundingClientRect()
      const fs = parseFloat(getComputedStyle(goalEl).fontSize) / parseFloat(getComputedStyle(m).fontSize)
      m.style.transform = keep
      mv.to = [goal.left - rest.left, goal.top - rest.top]
      mv.scale = [1, fs]
    }

    // a move: position goes from `from` to `to` along an easing curve; blur follows the speed along each axis
    const moves = [
      { el: srm, filter: 'srm', delay: 150, ms: 1150, ease: easeOutCubic, from: [0, -0.16 * vh], to: [0, 0], fade: true },
      { el: ist, filter: 'ist', delay: 1450, ms: 1050, ease: easeOutCubic, from: [0.55 * vw, 0], to: [0, 0], fade: true },
      { el: m, filter: 'mark', delay: 3000, ms: 1300, ease: easeInOutCubic, from: [0, 0], to: [0, 0], scale: [1, 1], prepare: prepareLanding, last_: true },
    ]
    moves.forEach((mv) => {
      mv.el.style.willChange = 'transform, filter, opacity'
      mv.el.style.transform = `translate(${mv.from[0]}px, ${mv.from[1]}px)`
      if (mv.fade) mv.el.style.opacity = '0'
      mv.last = [mv.from[0], mv.from[1]]
    })

    const t0 = performance.now()
    let raf = 0
    const frame = (now) => {
      const t = now - t0
      let live = false
      for (const mv of moves) {
        const p = Math.min(1, Math.max(0, (t - mv.delay) / mv.ms))
        if (p < 1) live = true
        if (t < mv.delay) continue
        if (mv.prepare && !mv.ready) {
          mv.ready = true
          mv.prepare(mv)
        }
        const e = mv.ease(p)
        const x = mv.from[0] + (mv.to[0] - mv.from[0]) * e
        const y = mv.from[1] + (mv.to[1] - mv.from[1]) * e
        const s = mv.scale ? mv.scale[0] + (mv.scale[1] - mv.scale[0]) * e : 1
        mv.el.style.transformOrigin = '0 0'
        mv.el.style.transform = `translate(${x}px, ${y}px)${mv.scale ? ` scale(${s})` : ''}`
        if (mv.fade) mv.el.style.opacity = String(Math.min(1, p * 4))
        // speed this frame (px) along each axis decides how far to smear in that direction
        const bx = Math.min(30, Math.abs(x - mv.last[0]) * 1.0)
        const by = Math.min(30, Math.abs(y - mv.last[1]) * 1.0)
        mv.last = [x, y]
        const node = blurs.current[mv.filter]
        if (node) node.setAttribute('stdDeviation', `${bx.toFixed(2)} ${by.toFixed(2)}`)
        mv.el.style.filter = bx + by > 0.4 ? `url(#mb-${mv.filter})` : 'none'
      }
      if (live) raf = requestAnimationFrame(frame)
      else onDone() // landed: remove the splash and reveal the real wordmark in the same commit, so there is no blank frame
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const blurNode = (key) => (node) => {
    if (node) blurs.current[key] = node
  }
  return (
    <div className="srm-ident" aria-label="SRMIST">
      <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: 'absolute' }}>
        {['srm', 'ist', 'mark'].map((k) => (
          <filter key={k} id={`mb-${k}`} x="-30%" y="-60%" width="160%" height="220%" colorInterpolationFilters="sRGB">
            <feGaussianBlur ref={blurNode(k)} stdDeviation="0 0" />
          </filter>
        ))}
      </svg>
      <div className="ident-ambient" aria-hidden="true" />
      <div className="ident-mark" aria-hidden="true" ref={mark}>
        <div className="ident-srm">
          <span>S</span>
          <span>R</span>
          <span>M</span>
        </div>
        <b className="ident-ist">IST</b>
      </div>
      <p>Learn · Leap · Lead</p>
      <button onClick={onDone}>Skip intro</button>
    </div>
  )
}

function Hero({ cinematic, frame, photo, settled }) {
  const { t } = useLang()
  const letters = 'SRMIST'.split('')
  return (
    <section className={`opening ${cinematic ? 'cinematic' : ''}`}>
      <div className="opening-copy">
        <p>One university. Infinite directions.</p>
        <span>Chennai · India</span>
      </div>

      <div className="learning-doodles" aria-hidden="true">
        <svg className="doodle doodle-book" viewBox="0 0 120 90">
          <path d="M13 62c17-8 32-6 47 3 15-9 30-11 47-3V20c-17-7-32-5-47 5-15-10-30-12-47-5v42Z" />
          <path d="M60 25v40M22 31c10-3 20-2 29 3M22 42c10-3 20-2 29 3M69 34c9-5 19-6 29-3M69 45c9-5 19-6 29-3" />
        </svg>
        <svg className="doodle doodle-student" viewBox="0 0 100 130">
          <circle cx="50" cy="25" r="13" />
          <path d="m30 59 20-12 20 12v38H30V59Zm0 10L15 93m55-24 15 24M41 97l-6 25m24-25 6 25M35 20l15-10 15 10-15 8-15-8Zm30 0v12" />
        </svg>
        <svg className="doodle doodle-flask" viewBox="0 0 90 110">
          <path d="M34 10h22M40 10v35L17 87c-4 7 1 13 9 13h38c8 0 13-6 9-13L50 45V10M28 76h34M36 61h18" />
          <circle cx="40" cy="84" r="3" />
          <circle cx="53" cy="91" r="2" />
        </svg>
        <svg className="doodle doodle-pencil" viewBox="0 0 120 45">
          <path d="m10 34 8-22 87 1 7 10-8 10-86 1-8 6v-6Zm8-22v22m86-21v20m-94 21 8-7" />
        </svg>
        <svg className="doodle doodle-laptop" viewBox="0 0 120 90">
          <rect x="22" y="10" width="76" height="55" rx="4" />
          <path d="M12 72h96l-8 8H20l-8-8Zm38 0h20" />
        </svg>
      </div>

      <div className={`opening-photo ${settled ? 'settled' : ''} ${frame}`.trim()}>
        {/* keyed so every swap remounts the <img> and replays the blur-in animation */}
        <Photo key={photo} src={photo} alt="Life, learning and research at SRMIST" sizes={cinematic ? '100vw' : '430px'} quality={cinematic ? 72 : 60} size={[1600, 1200]} priority />
      </div>

      <div className="opening-brand">
        <ul className="disc-row" aria-label="Health and technology disciplines">
          {DISCIPLINES_TOP.map((d) => (
            <li key={d}>{t(d)}</li>
          ))}
        </ul>
        <h1 aria-label="SRMIST">
          {letters.map((l, i) => (
            <span key={i} style={{ animationDelay: `${1.4 + i * 0.07}s` }}>
              {l}
            </span>
          ))}
        </h1>
        <ul className="disc-row" aria-label="Business, law, design and science disciplines">
          {DISCIPLINES_BOTTOM.map((d) => (
            <li key={d}>{t(d)}</li>
          ))}
        </ul>
      </div>

      <div className="cinematic-copy">
        <span>{t('NAAC A++ · NIRF 2025 · Chennai, India')}</span>
        <h2>
          {t('A university.')}
          <br />
          {t('A city of ideas.')}
        </h2>
        <a href={LINK.about}>
          {t('Enter SRMIST')} <Arrow />
        </a>
      </div>

      <div className="scroll-cue">
        <span>Scroll to discover</span>
        <i />
      </div>
    </section>
  )
}

export default function Home() {
  // People who prefer reduced motion skip the splash and the photo shuffle entirely.
  const played = introPlayed || prefersReducedMotion()
  const [identOn, setIdentOn] = useState(!played)
  const [photo, setPhoto] = useState(played ? IMG.campus : IMG.walking)
  const [settled, setSettled] = useState(played)
  const [cinematic, setCinematic] = useState(played)
  const [frame, setFrame] = useState(played ? 'frame-low-right' : '')
  const [scrolled, setScrolled] = useState(false)
  const [query, setQuery] = useState('')
  const [audience, setAudience] = useAudience()
  const { t } = useLang()
  const at = (key) => ({ order: orderFor(audience, key) }) // where each section sits for this audience

  // Intro sequence: identity splash → photo swaps → full-bleed cinematic hero.
  useEffect(() => {
    if (played) return
    introPlayed = true
    // Warm the cache during the splash so the flicker never shows an empty card.
    // The card is small, so the flicker frames only need small files.
    SHUFFLE.forEach((src) => preloadPhoto(src, '430px', undefined, 60))
    // The two full-bleed frames are fetched at the size the hero will actually use.
    setTimeout(() => {
      preloadPhoto(IMG.campus, '100vw', undefined, 72)
      preloadPhoto(IMG.campusAlt, '100vw', undefined, 72)
    }, 800)
    const timers = [setTimeout(() => setIdentOn(false), IDENT_MS)]
    for (let i = 1; i <= SHUFFLE_FLIPS; i++) {
      timers.push(
        setTimeout(() => setPhoto(SHUFFLE[i % SHUFFLE.length]), SHUFFLE_START_MS + i * SHUFFLE_STEP_MS),
      )
    }
    // The card then locks onto the campus photo and grows to full-bleed.
    timers.push(
      setTimeout(() => {
        setPhoto(IMG.campus)
        setFrame('frame-low-right')
        setSettled(true)
        setCinematic(true)
      }, SHUFFLE_START_MS + (SHUFFLE_FLIPS + 1) * SHUFFLE_STEP_MS),
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  // After settling, rotate through the campus photos.
  useEffect(() => {
    if (!cinematic || prefersReducedMotion()) return
    HERO_CYCLE.forEach(([src]) => preloadPhoto(src, '100vw', undefined, 72))
    let i = 0
    const id = setInterval(() => {
      if (document.body.classList.contains('motion-paused')) return
      i = (i + 1) % HERO_CYCLE.length
      setPhoto(HERO_CYCLE[i][0])
      setFrame(HERO_CYCLE[i][1])
    }, FRAME_CYCLE_MS)
    return () => clearInterval(id)
  }, [cinematic])

  useLayoutEffect(() => {
    document.body.classList.toggle('ident-on', identOn) // the hero wordmark waits until the splash word lands on it
    return () => document.body.classList.remove('ident-on')
  }, [identOn])

  useEffect(() => {
    document.body.classList.add('home-white-nav')
    return () => document.body.classList.remove('home-white-nav')
  }, [])

  useEffect(() => {
    document.body.classList.toggle('cinematic-home', cinematic)
    return () => document.body.classList.remove('cinematic-home')
  }, [cinematic])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.6)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return disciplines
      .map(([name, url], i) => ({ name, url, n: i + 1, examples: PROGRAMMES.find((p) => p.field === name)?.examples ?? '' }))
      .filter((d) => d.name.toLowerCase().includes(q) || t(d.name).toLowerCase().includes(q))
  }, [query, t])

  const marquee = [...marqueeWords, ...marqueeWords]
  const sceneMotion = useMotionOk()
  useScrollScenes(sceneMotion)

  return (
    <div id="top">
      {identOn && <Ident onDone={() => setIdentOn(false)} />}

      <MainNav variant="solid" />

      <Hero cinematic={cinematic} frame={frame} photo={photo} settled={settled} />

      <main className="home-curtain" id="main" tabIndex={-1}>
        <div style={{ order: -1 }}>
          <AudienceSwitch audience={audience} onChange={setAudience} />
        </div>
        <section className="intro-panel" id="about" style={at('about')}>
          <Reveal>
            <span className="eyebrow">NAAC A++ · NIRF 2025</span>
            <h2>
              A place to learn, question, make and <em>move forward.</em>
            </h2>
          </Reveal>
          <Reveal className="intro-side" delay={0.15}>
            <p>
              Engineers, doctors, lawyers, designers, scientists and entrepreneurs learning side by
              side—on a campus built for possibility.
            </p>
            <div className="intro-buttons">
              <a href={LINK.about} {...ex(LINK.about)} className="button button-light">
                Discover SRMIST
                <Arrow />
              </a>
              <a href={LINK.faculty} className="button button-light">
                Faculty &amp; staff
                <Arrow />
              </a>
            </div>
          </Reveal>
        </section>

        <ScrollTunnel style={at('triplet')} startBg={edgeBg(neighbours(audience, 'triplet').prev)} endBg={edgeBg(neighbours(audience, 'triplet').next)} />

        <section className="rankings" aria-labelledby="rank-heading" style={at('rankings')}>
          <Reveal className="rank-copy">
            <span className="eyebrow">{t('Recognition')}</span>
            <h2 id="rank-heading">{t('Among India’s best, by every measure that matters.')}</h2>
            <p>{t('National recognition, global partnerships and outcomes built on four decades of work.')}</p>
            <ul className="nirf-ranks" aria-label="NIRF 2025 ranks">
              {nirfRanks.map(([n, label], i) => (
                <li key={label} style={{ '--i': i }}>
                  <b>
                    <CountUp value={n} duration={1100} />
                  </b>
                  <span>{t(label)}</span>
                </li>
              ))}
            </ul>
            <small className="source-note">NIRF 2025 ranks, as announced by SRMIST.</small>
            <a href={LINK.rankings} className="button button-gold">
              {t('Explore our impact')}
              <Arrow />
            </a>
          </Reveal>
          <div className="rank-grid">
            {rankStats.map(([n, label], i) => (
              <Reveal key={label} className="rank-cell" delay={0.1 + i * 0.12}>
                <b>
                  <CountUp value={n} />
                </b>
                <span>{label}</span>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="study-finder" id="programmes" style={at('fields')}>
          <Reveal className="section-heading">
            <span className="eyebrow">{t('Find your direction')}</span>
            <h2>{t('What do you want to study?')}</h2>
          </Reveal>
          <label className="finder-input">
            <svg viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="6.5" />
              <path d="m16 16 4 4" />
            </svg>
            <input
              placeholder={t('Search a field of study')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <a className="finder-cta" href="/course-finder">
            <span>
              <b>Not sure what to study?</b>
              <small>Answer five quick questions and get a recommendation.</small>
            </span>
            <i aria-hidden="true">
              <Arrow />
            </i>
          </a>
          <div className="discipline-list" data-sx>
            {filtered.map((d) => (
              <a key={d.name} href={d.url} {...ex(d.url)} className="field-card" style={{ '--i': d.n }}>
                <span className="field-top">
                  <span className="field-badge">
                    <FieldIcon name={d.name} />
                  </span>
                  <span className="field-n">{String(d.n).padStart(2, '0')}</span>
                </span>
                <b>{t(d.name)}</b>
                <small>{d.examples}</small>
                <span className="field-go">
                  {t('Explore')} <ArrowUR />
                </span>
              </a>
            ))}
            {filtered.length === 0 && <p className="empty-state">No fields match “{query}”.</p>}
          </div>
          <div className="words-band" data-sx aria-hidden="true">
            <div className="wb-row wb-a">
              {[...marqueeWords, ...marqueeWords, ...marqueeWords].map((w, i) => (
                <span key={i}>{w}</span>
              ))}
            </div>
            <div className="wb-row wb-b">
              {[...marqueeWords, ...marqueeWords, ...marqueeWords].reverse().map((w, i) => (
                <span key={i}>{w}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="feature-story" id="research" style={at('research')} data-sx>
          <div className="feature-photo">
            <Photo src={IMG.lab} alt="Researchers with laboratory equipment at SRMIST" sizes="(max-width: 900px) 100vw, 50vw" widths={[600, 900, 1200]} size={[1200, 1400]} />
          </div>
          <Reveal className="feature-copy">
            <span className="eyebrow">Research &amp; innovation</span>
            <h2>
              Every question can become a <em>breakthrough.</em>
            </h2>
            <p>
              Central laboratories, cross-disciplinary research and an incubation ecosystem bring
              ambitious ideas closer to the people who need them.
            </p>
            <div className="mini-stats">
              <span>
                <b>920+</b>Patents
              </span>
              <span>
                <b>47K+</b>Publications
              </span>
              <span>
                <b>₹250 Cr+</b>Funding
              </span>
            </div>
            <a href={LINK.research} {...ex(LINK.research)} className="button">
              Explore research
              <Arrow />
            </a>
          </Reveal>
        </section>

        <section className="happenings" style={at('news')}>
          <Reveal className="section-heading">
            <span className="eyebrow">From the community</span>
            <h2>What’s happening</h2>
          </Reveal>
          <NewsRun top={newsTop} bottom={newsBottom} />
        </section>
      </main>

      <Footer />

    </div>
  )
}
