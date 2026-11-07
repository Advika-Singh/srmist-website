import { Fragment, useEffect, useMemo, useState } from 'react'
import ScrollTriplet from './ScrollTriplet.jsx'
import { Arrow, ArrowUR, B, Footer, IMG, LINK, MainNav, Photo, Reveal, ex, preloadPhoto, prefersReducedMotion } from './shared.jsx'

// The splash + photo shuffle only plays the first time the home page opens.
let introPlayed = false

// Order the original flips through while the hero card "shuffles".
const SHUFFLE = [IMG.walking, IMG.lab, IMG.classroom, IMG.urban, IMG.collab, IMG.campus, IMG.campusAlt]

// Intro → cinematic hero timeline (ms after mount), measured from the published site.
const IDENT_MS = 3650 // identity splash finishes
const SHUFFLE_START_MS = 3750 // card begins flicking through photos
const SHUFFLE_STEP_MS = 110 // one photo every ~110ms
const SHUFFLE_FLIPS = 10 // flips before the final photo locks in and expands
const FRAME_CYCLE_MS = 2800 // cinematic hero alternates frames this often

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

const pathways = [
  ['Admissions India', 'Undergraduate, postgraduate and doctoral programmes across every college.', LINK.apply],
  ['Medical & Dental', 'NEET-based admissions and dedicated pathways for health sciences.', LINK.apply],
  ['International', 'A global community with application, visa and arrival support.', LINK.apply],
]

// Figures below come from srmist.edu.in (home page, accreditations page and the
// NIRF 2025 announcement), checked on 2026-11-05.
const rankStats = [
  ['A++', 'NAAC, 4th cycle · valid to 2031'],
  ['11', 'NIRF University 2025'],
  ['980+', 'Companies visited, 2023–24'],
  ['52 LPA', 'Highest CTC, 2023–24'],
]

// NIRF 2025, as listed on the university's announcement.
const nirfRanks = [
  ['22', 'Overall'],
  ['14', 'Engineering'],
  ['18', 'Medical'],
  ['10', 'Pharmacy'],
  ['25', 'Research'],
  ['4', 'SDG'],
]

const placementStats = [
  ['980+', 'Companies visited'],
  ['5,546+', 'Offers made'],
  ['2,232+', 'High-paying offers'],
  ['7.19 LPA', 'Average CTC'],
]

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

const marqueeWords = ['Learn', 'Question', 'Build', 'Discover', 'Lead']

function Ident({ onDone }) {
  return (
    <div className="srm-ident" aria-label="SRMIST">
      <div className="ident-ambient" aria-hidden="true" />
      <div className="ident-mark">
        <span>S</span>
        <span>R</span>
        <span>M</span>
      </div>
      <p>Learn · Leap · Lead</p>
      <button onClick={onDone}>Skip intro</button>
    </div>
  )
}

function Hero({ cinematic, frame, photo, settled }) {
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

      <h1 aria-label="SRMIST">
        {letters.map((l, i) => (
          <span key={i} style={{ animationDelay: `${1.4 + i * 0.07}s` }}>
            {l}
          </span>
        ))}
      </h1>

      <div className="cinematic-copy">
        <span>Est. 1985 · Chennai, India</span>
        <h2>
          A university.
          <br />A city of ideas.
        </h2>
        <p>Six campuses. Hundreds of programmes. One community learning how to shape what comes next.</p>
        <a href={LINK.about}>
          Enter SRMIST <Arrow />
        </a>
      </div>

      <div className="campus-coordinate">
        <span>Kattankulathur</span>
        <span>12.8231° N · 80.0444° E</span>
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

  // After settling, alternate between the two campus frames.
  useEffect(() => {
    if (!cinematic || prefersReducedMotion()) return
    let center = false
    const id = setInterval(() => {
      if (document.body.classList.contains('motion-paused')) return
      center = !center
      setPhoto(center ? IMG.campusAlt : IMG.campus)
      setFrame(center ? 'frame-center' : 'frame-low-right')
    }, FRAME_CYCLE_MS)
    return () => clearInterval(id)
  }, [cinematic])

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
      .map(([name, url], i) => ({ name, url, n: i + 1 }))
      .filter((d) => d.name.toLowerCase().includes(q))
  }, [query])

  const marquee = [...marqueeWords, ...marqueeWords]

  return (
    <div id="top">
      {identOn && <Ident onDone={() => setIdentOn(false)} />}

      <MainNav variant="overlay" hidden={scrolled} light={cinematic} />

      <nav className={`home-pill ${scrolled ? 'show' : ''}`} aria-label="Quick navigation">
        <a href={LINK.programmes} {...ex(LINK.programmes)}>Programmes</a>
        <a href={LINK.research} {...ex(LINK.research)}>Research</a>
        <a className="pill-apply" href={LINK.apply}>
          Apply now
        </a>
      </nav>

      <Hero cinematic={cinematic} frame={frame} photo={photo} settled={settled} />

      <main className="home-curtain" id="main" tabIndex={-1}>
        <section className="intro-panel" id="about">
          <Reveal>
            <span className="eyebrow">SRMIST · Since 1985</span>
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

        <Reveal as="section" className="campus-image">
          <Photo src={IMG.campus} alt="Aerial view of the SRMIST campus" sizes="94vw" widths={[640, 960, 1400, 1800]} size={[1800, 857]} />
          <div>
            <span>Kattankulathur campus</span>
            <span>12.8231° N · 80.0444° E</span>
          </div>
        </Reveal>

        <section className="idea-marquee" aria-label="Learning at SRMIST">
          <div>
            {marquee.concat(marquee).map((w, i) => (
              <Fragment key={i}>
                <span>{w}</span>
                <i />
              </Fragment>
            ))}
          </div>
        </section>

        <ScrollTriplet />

        <section className="study-finder" id="programmes">
          <Reveal className="section-heading">
            <span className="eyebrow">Find your direction</span>
            <h2>What do you want to study?</h2>
          </Reveal>
          <label className="finder-input">
            <svg viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="6.5" />
              <path d="m16 16 4 4" />
            </svg>
            <input
              placeholder="Search a field of study"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <div className="discipline-list">
            {filtered.map((d) => (
              <a key={d.name} href={d.url} {...ex(d.url)}>
                <span>{String(d.n).padStart(2, '0')}</span>
                <b>{d.name}</b>
                <ArrowUR />
              </a>
            ))}
            {filtered.length === 0 && <p className="empty-state">No fields match “{query}”.</p>}
          </div>
        </section>

        <section className="pathways" id="apply">
          <Reveal className="section-heading light-heading">
            <span className="eyebrow">Choose your pathway</span>
            <h2>
              Your ambition.
              <br />
              Your route.
            </h2>
          </Reveal>
          <div className="pathway-grid">
            {pathways.map(([title, text, url], i) => (
              <a key={title} href={url} {...ex(url)}>
                <span>{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
                <Arrow />
              </a>
            ))}
          </div>
        </section>

        <section className="rankings">
          <Reveal className="rank-copy">
            <span className="eyebrow">Recognition</span>
            <h2>Among India’s best, by every measure that matters.</h2>
            <p>National recognition, global partnerships and outcomes built on four decades of work.</p>
            <ul className="nirf-ranks" aria-label="NIRF 2025 ranks">
              {nirfRanks.map(([n, label]) => (
                <li key={label}>
                  <b>{n}</b>
                  <span>{label}</span>
                </li>
              ))}
            </ul>
            <small className="source-note">NIRF 2025 ranks, as announced by SRMIST.</small>
            <a href={LINK.rankings} className="button">
              Explore our impact
              <Arrow />
            </a>
          </Reveal>
          <Reveal className="rank-grid" delay={0.12}>
            {rankStats.map(([n, label]) => (
              <div key={label}>
                <b>{n}</b>
                <span>{label}</span>
              </div>
            ))}
          </Reveal>
        </section>

        <section className="stats-band">
          <Reveal className="section-heading light-heading">
            <span className="eyebrow">Placement highlights 2023–24</span>
            <h2>Careers, by the numbers.</h2>
          </Reveal>
          <Reveal className="page-stats" delay={0.1}>
            {placementStats.map(([n, label]) => (
              <div key={label}>
                <b>{n}</b>
                <span>{label}</span>
              </div>
            ))}
          </Reveal>
        </section>

        <section className="next-destinations">
          <Reveal className="section-heading">
            <span className="eyebrow">Go further</span>
            <h2>More ways into SRM.</h2>
          </Reveal>
          <div className="destination-grid">
            {destinations.map(([href, src, alt, kicker, title], i) => (
              <Reveal as="a" key={title} href={href} {...ex(href)} delay={i * 0.1}>
                <span className="destination-index">{String(i + 1).padStart(2, '0')}</span>
                <Photo src={src} alt={alt} sizes="(max-width: 600px) 100vw, 33vw" widths={[480, 720, 1000]} size={[800, 1000]} />
                <div>
                  <span>{kicker}</span>
                  <h3>{title}</h3>
                  <ArrowUR />
                </div>
              </Reveal>
            ))}
          </div>
          <div className="quick-discoveries">
            {quick.map(([href, label, title]) => (
              <a key={title} href={href} {...ex(href)}>
                <span>{label}</span>
                <b>{title}</b>
                <ArrowUR />
              </a>
            ))}
          </div>
        </section>

        <section className="global-section" id="international">
          <Reveal className="rank-copy">
            <span className="eyebrow">Global opportunities</span>
            <h2>A degree that reaches across borders.</h2>
            <p>
              Every year SRMIST sponsors students to study at partner universities abroad, including{' '}
              {globalPartners.join(', ')}, and runs a Semester Abroad Programme.
            </p>
          </Reveal>
          <Reveal className="rank-grid" delay={0.12}>
            {globalStats.map(([n, label]) => (
              <div key={label}>
                <b>{n}</b>
                <span>{label}</span>
              </div>
            ))}
          </Reveal>
        </section>

        <section className="service-gateway">
          <Reveal className="service-gateway-copy">
            <span className="eyebrow">University services</span>
            <h2>
              Find what you need.
              <br />
              Keep moving.
            </h2>
            <p>
              Direct routes into the academic services and communities students use throughout their
              SRM journey.
            </p>
          </Reveal>
          <Reveal className="service-links" delay={0.12}>
            {services.map(([href, small, title], i) => (
              <a key={title} href={href} {...ex(href)}>
                <span>{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <small>{small}</small>
                  <b>{title}</b>
                </div>
                <ArrowUR />
              </a>
            ))}
          </Reveal>
        </section>

        <section className="campuses">
          <Reveal className="section-heading light-heading">
            <span className="eyebrow">Our campuses</span>
            <h2>
              Six campuses.
              <br />
              One community.
            </h2>
          </Reveal>
          <div className="pathway-grid">
            {campuses.map(([name, place, url], i) => (
              <a key={name} href={url} {...ex(url)}>
                <span>{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{name}</h3>
                  <p>{place}</p>
                </div>
                <ArrowUR />
              </a>
            ))}
          </div>
          <p className="group-note">
            <span className="eyebrow">Group institutions</span>
            {groupInstitutions.map(([label, url], i) => (
              <span key={label}>
                {i > 0 && '  ·  '}
                <a href={url} {...ex(url)}>
                  {label}
                </a>
              </span>
            ))}
          </p>
        </section>

        <section className="feature-story" id="research">
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

        <section className="happenings">
          <Reveal className="section-heading">
            <span className="eyebrow">From the community</span>
            <h2>What’s happening</h2>
          </Reveal>
          <div className="story-grid">
            <Reveal as="article" className="story story-main">
              <a href={LINK.campusLife} {...ex(LINK.campusLife)}>
                <Photo src={IMG.collab} alt="International and Indian students on the SRMIST campus" sizes="(max-width: 900px) 100vw, 55vw" widths={[600, 900, 1200]} size={[1200, 984]} />
                <span>Student achievement · 4 min read</span>
                <h3>Ideas become prototypes—and prototypes become something bigger.</h3>
              </a>
            </Reveal>
            <div className="story-stack">
              {stories.map(([href, tag, title], i) => (
                <Reveal as="article" key={title} delay={i * 0.1}>
                  <span>{tag}</span>
                  <h3>{title}</h3>
                  <a href={href} {...ex(href)}>
                    Read story <Arrow />
                  </a>
                </Reveal>
              ))}
            </div>
          </div>
          <div className="quick-discoveries">
            {upcomingEvents.map(([date, name, url]) => (
              <a key={name} href={url} {...ex(url)}>
                <span>Coming up · {date}</span>
                <b>{name}</b>
                <ArrowUR />
              </a>
            ))}
          </div>
        </section>
      </main>

      <Footer />

    </div>
  )
}
