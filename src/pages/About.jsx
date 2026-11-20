import { useEffect, useRef, useState } from 'react'
import { READ_ON, SECTION_PAGES } from '../data/sections.js'
import { Arrow, Footer, Reveal, SiteHeader } from '../shared.jsx'
import CountUp from '../ui/CountUp.jsx'
import Hero from '../ui/Hero.jsx'
import '../styles/immersive.css'
import '../styles/about.css'

/**
 * About SRMIST. Every figure and sentence here comes from the university's own About, History and Leadership pages
 * (https://www.srmist.edu.in/about-us/ ...), read on the date in READ_ON. The timeline reuses the data of /about/history,
 * so there is one copy of the history to keep right.
 *
 * Founder photo: save the official portrait as public/srmist/paarivendhar.jpg
 * (https://www.srmist.edu.in/wp-content/uploads/2022/02/Chancellor-Sir-SRMIST-img2.jpeg). Until it is there, a monogram shows.
 */

const OFFICIAL = 'https://www.srmist.edu.in/about-us/'
const FOUNDER_PHOTO = '/srmist/paarivendhar.jpg'
const TIMELINE = SECTION_PAGES.history.groups[0]

const HERO = {
  eyebrow: 'About SRMIST',
  h1: 'From one primary school to a university with over 60,000 students.',
  p: 'SRM began in 1969 with a primary school in West Mambalam, Chennai. Today SRM Institute of Science and Technology has campuses in Tamil Nadu, Uttar Pradesh, Haryana, Andhra Pradesh and Sikkim.',
  img: '/srmist/campus-main-building.webp',
  alt: 'The SRMIST main academic building',
}

// the three milestones the official About page itself picks out of the timeline
const KEY = {
  1969: 'Where it began',
  1985: 'The engineering college',
  2002: 'Deemed to be a university',
}

// the backdrop behind the timeline changes with the era (campus photos for atmosphere, not photos of those years)
const ERA_PHOTOS = ['/srmist/campus-lakeview.webp', '/srmist/campus-main-building.webp', '/srmist/campus-panorama.webp']

const NUMBERS = [
  ['1969', 'First school, West Mambalam'],
  ['1985', 'Engineering college, Kattankulathur'],
  ['2002', 'Deemed-to-be university, UGC'],
  ['60,000+', 'Full-time students'],
  ['A++', 'NAAC grade, 2024'],
]

const PLACES = [
  { word: 'Chennai', region: 'In and around Chennai', names: ['Kattankulathur', 'Ramapuram', 'Vadapalani', 'Baburayanpettai'] },
  { word: 'Trichy', region: 'Tamil Nadu', names: ['Tiruchirappalli'] },
  { word: 'Delhi NCR', region: 'Near Delhi NCR', names: ['Modinagar, Uttar Pradesh', 'Sonepat, Haryana'] },
  { word: 'Amaravati', region: 'Andhra Pradesh', names: ['Amaravati'] },
  { word: 'Sikkim', region: 'Sikkim', names: ['Gangtok'] },
]

const FACULTIES = ['Engineering & Technology', 'Management', 'Medicine & Health Sciences', 'Science & Humanities', 'Law', 'Agricultural Sciences']

const MISSION = [
  ['Move up', 'through international alliances and collaborative initiatives to achieve global excellence.'],
  ['Accomplish a process', 'to advance knowledge in a rigorous academic and research environment.'],
  ['Attract and build people', 'in a rewarding and an inspiring environment by fostering freedom, empowerment, creativity and innovation.'],
]

const VALUES = ['Excellence, Integrity and Academic Freedom', 'Global Vision and Local Commitment', 'Inclusiveness, Diversity, Compassion and Mutual Respect']

const NEXT = [
  ['The full timeline', '/about/history', 'Every milestone from 1969 to 2018'],
  ['Leadership and governance', '/about/leadership', 'Who leads SRMIST'],
  ['Recognition', '/about/recognition', 'Accreditation, ratings and awards'],
  ['Admissions 2027', '/admissions', 'Pathways, fees and how to apply'],
]

// the era a given year belongs to: the last era that starts on or before it
const eraIndex = (year) => {
  let idx = 0
  TIMELINE.eras.forEach(([start], i) => {
    if (Number(start) <= Number(year)) idx = i
  })
  return idx
}

function buildRows() {
  const rows = []
  let last = -1
  for (const it of TIMELINE.items) {
    const idx = eraIndex(it.year)
    if (idx !== last) {
      rows.push({ type: 'era', year: TIMELINE.eras[idx][0], name: TIMELINE.eras[idx][1], idx })
      last = idx
    }
    rows.push({ type: 'item', ...it, era: TIMELINE.eras[idx][1], idx })
  }
  return rows
}

function Timeline() {
  const root = useRef(null)
  const rows = useRef(buildRows()).current
  const [active, setActive] = useState({ year: rows[0].year, era: rows[0].name, idx: 0 })

  // the large year on the left follows whichever entry is crossing the middle of the screen
  useEffect(() => {
    const el = root.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      (list) => {
        for (const e of list) {
          if (e.isIntersecting) setActive({ year: e.target.dataset.year, era: e.target.dataset.era, idx: Number(e.target.dataset.idx) })
        }
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    el.querySelectorAll('[data-year]').forEach((n) => io.observe(n))
    return () => io.disconnect()
  }, [])

  // the gold line fills down the spine as the section is read
  useEffect(() => {
    const el = root.current
    if (!el) return
    let raf = 0
    const update = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      const p = (window.innerHeight * 0.55 - r.top) / Math.max(1, r.height)
      el.style.setProperty('--fill', Math.min(1, Math.max(0, p)).toFixed(3))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <section ref={root} className="ab-tl" id="story" aria-labelledby="ab-tl-h" style={{ '--fill': 0 }}>
      <div className="ab-tl-bg" aria-hidden="true">
        {ERA_PHOTOS.map((src, i) => (
          <img key={src} src={src} alt="" loading="lazy" decoding="async" className={i === active.idx ? 'on' : ''} />
        ))}
        <i />
      </div>
      <header className="ab-head">
        <span className="eyebrow">The story</span>
        <h2 id="ab-tl-h">One school, then a university, year by year.</h2>
        <p>Each line is a milestone the university lists for that year.</p>
      </header>
      <div className="ab-tl-grid">
        <div className="ab-tl-year" aria-hidden="true">
          <span className={`ab-tl-num ${KEY[active.year] ? 'is-key' : ''}`}>{active.year}</span>
          <small>{active.era}</small>
        </div>
        <ol className="ab-tl-list">
          {rows.map((r, i) =>
            r.type === 'era' ? (
              <li key={`e${i}`} className="ab-era" data-year={r.year} data-era={r.name} data-idx={r.idx}>
                <span>{r.name}</span>
              </li>
            ) : (
              <li key={`${r.year}-${i}`} className={`ab-item ${KEY[r.year] ? 'is-key' : ''}`} data-year={r.year} data-era={r.era} data-idx={r.idx}>
                <Reveal>
                  <b>{r.year}</b>
                  {KEY[r.year] && <em>{KEY[r.year]}</em>}
                  <p>{r.text}</p>
                </Reveal>
              </li>
            ),
          )}
        </ol>
      </div>
      <p className="ab-note">
        The university’s leadership page dates the founding of the SRM Group to 1968; its history timeline begins with the school’s inception in 1969. Source:{' '}
        <a href={TIMELINE.source} target="_blank" rel="noreferrer">
          srmist.edu.in/about-us/history<span className="sr-only"> (opens in a new tab)</span>
        </a>
        .
      </p>
    </section>
  )
}

function Founder() {
  const [missing, setMissing] = useState(false)
  return (
    <section className="ab-founder" id="leadership" aria-labelledby="ab-founder-h">
      <figure className={`ab-founder-ph ${missing ? 'is-missing' : ''}`}>
        {!missing && <img src={FOUNDER_PHOTO} alt="Dr. T. R. Paarivendhar, Founder Chancellor of SRMIST" loading="lazy" decoding="async" onError={() => setMissing(true)} />}
        {missing && <span aria-hidden="true">TRP</span>}
      </figure>
      <Reveal className="ab-founder-copy">
        <span className="eyebrow">Founder Chancellor</span>
        <h2 id="ab-founder-h">Dr. T. R. Paarivendhar</h2>
        <p>He founded the SRM Group in 1968 and served in Parliament, representing the Perambalur Lok Sabha constituency in Tamil Nadu, according to the university’s leadership page.</p>
        <a className="text-link" href="/about/leadership">
          Leadership and governance <Arrow />
        </a>
      </Reveal>
    </section>
  )
}

function Places() {
  return (
    <section className="ab-places" aria-labelledby="ab-places-h">
      <header className="ab-head">
        <span className="eyebrow">Where we are</span>
        <h2 id="ab-places-h">Campuses across five states.</h2>
        <p>As listed on the official About page.</p>
      </header>
      <div className="ab-places-grid">
        {PLACES.map((p) => (
          <div key={p.region} className="ab-place">
            <span>{p.region}</span>
            <ul>
              {p.names.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function About() {
  return (
    <>
      <SiteHeader />
      <main className="interior ab idv-quarter" id="main" tabIndex={-1}>
        <Hero layout="photo" eyebrow={HERO.eyebrow} title={HERO.h1} lede={HERO.p} img={HERO.img} alt={HERO.alt} accent="#3b82f6" pos="50% 38%" />

        <section className="ab-nums" aria-label="SRMIST at a glance">
          <dl>
            {NUMBERS.map(([v, k]) => (
              <div key={k}>
                <dt>{/^\d{4}$/.test(v) ? v : <CountUp value={v} />}</dt>
                <dd>{k}</dd>
              </div>
            ))}
          </dl>
        </section>

        <Timeline />

        <section className="ab-stand" id="stand" aria-labelledby="ab-stand-h">
          <Reveal className="ab-stand-in">
            <span className="eyebrow">What we stand for</span>
            <h2 id="ab-stand-h" className="sr-only">Vision, mission and core values</h2>
            <p className="ab-label">Vision</p>
            <blockquote>
              <p>To emerge as a World – Class University in creating and disseminating knowledge and providing students a unique learning experience in Science, Technology, Medicine, Management and other areas of Scholarship that will best serve the world and for the betterment of mankind.</p>
            </blockquote>
            <p className="ab-label">Mission</p>
            <ol className="ab-mission">
              {MISSION.map(([h, p], i) => (
                <li key={h}>
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  <b>{h}</b> <em>{p}</em>
                </li>
              ))}
            </ol>
            <p className="ab-label">Core values</p>
            <ul className="ab-values">
              {VALUES.map((v) => (
                <li key={v}>{v}</li>
              ))}
            </ul>
          </Reveal>
        </section>

        <Founder />

        <Places />

        <section className="ab-fac" id="places" aria-labelledby="ab-fac-h">
          <header className="ab-head">
            <span className="eyebrow">Faculties</span>
            <h2 id="ab-fac-h">Six faculties, one university.</h2>
            <p>The faculties are as listed on the official About page.</p>
          </header>
          <ul className="ab-chips" aria-label="The six faculties">
            {FACULTIES.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </section>

        <section className="ab-rec" id="recognition" aria-labelledby="ab-rec-h">
          <header className="ab-head">
            <span className="eyebrow">Recognition</span>
            <h2 id="ab-rec-h">What others say.</h2>
          </header>
          <div className="ab-rec-grid">
            <Reveal className="ab-rec-card">
              <b>A++</b>
              <span>NAAC accreditation</span>
              <p>The highest grade, awarded in 2024 according to the university’s About page.</p>
              <a className="text-link" href="/about/recognition">
                Accreditation, ratings and awards <Arrow />
              </a>
            </Reveal>
            <Reveal className="ab-rec-card">
              <b>11th</b>
              <span>NIRF 2025, universities</span>
              <p>As announced by SRMIST. Ranks across categories are on the rankings page.</p>
              <a className="text-link" href="/rankings">
                See the rankings <Arrow />
              </a>
            </Reveal>
          </div>
        </section>

        <section className="ab-next" aria-labelledby="ab-next-h">
          <h2 id="ab-next-h">Keep going</h2>
          <ul>
            {NEXT.map(([t, href, hint]) => (
              <li key={href}>
                <a href={href}>
                  <b>{t}</b>
                  <span>{hint}</span>
                  <Arrow />
                </a>
              </li>
            ))}
          </ul>
          <p className="ab-note">
            Figures and wording from{' '}
            <a href={OFFICIAL} target="_blank" rel="noreferrer">
              srmist.edu.in/about-us<span className="sr-only"> (opens in a new tab)</span>
            </a>
            , read on {READ_ON}. This is an independent concept redesign.
          </p>
        </section>
      </main>
      <Footer />
    </>
  )
}
