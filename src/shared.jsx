import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { AUX, CAMPUSES, MENUS, STRIP } from './data/nav.js'
import { useLang } from './i18n.jsx'
import Preferences from './ui/Preferences.jsx'
import { ChatCards, cardsFor } from './ui/chatCards.jsx'
import { openSearch } from './ui/SmartSearch.jsx'
import SrmSketch from './ui/SrmSketch.jsx'
import StaffIcon from './ui/StaffIcon.jsx'

/* ---------- images ---------- */
const img = (id, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=88`

export const IMG = {
  walking: '/srmist/sports.jpg',
  campus: '/srmist/hero.webp',
  campusAlt: '/srmist/campus-main-building.jpg',
  classroom: '/srmist/students.jpg',
  collab: '/srmist/admission-india.jpg',
  lab: '/srmist/labs.jpg',
  urban: '/srmist/tech-park.jpg',
}

/* ---------- responsive images ---------- */
const withParams = (url, w, q) =>
  url.replace(/([?&])w=\d+/, `$1w=${w}`).replace(/([?&])q=\d+/, `$1q=${q}`)

const DEFAULT_WIDTHS = [480, 800, 1200, 1600]

/**
 * Responsive photo: several widths so phones don't download desktop-sized files,
 * lower quality (Unsplash serves WebP/AVIF through auto=format), lazy loading by default,
 * and width/height so the browser reserves space and the page doesn't jump.
 */
export function Photo({ src, alt, sizes = '100vw', widths = DEFAULT_WIDTHS, quality = 70, size = [1600, 1066], priority = false, ...rest }) {
  const remote = /images\.unsplash\.com/.test(src)
  const srcSet = remote ? widths.map((w) => `${withParams(src, w, quality)} ${w}w`).join(', ') : undefined
  return (
    <img
      src={remote ? withParams(src, widths[Math.min(1, widths.length - 1)], quality) : src}
      srcSet={srcSet}
      sizes={remote ? sizes : undefined}
      alt={alt}
      width={size[0]}
      height={size[1]}
      loading={priority ? 'eager' : 'lazy'}
      fetchpriority={priority ? 'high' : undefined}
      decoding="async"
      {...rest}
    />
  )
}

/** Warm the cache with the same candidate the <Photo> will pick. */
export function preloadPhoto(src, sizes = '100vw', widths = DEFAULT_WIDTHS, quality = 70) {
  const im = new Image()
  im.sizes = sizes
  im.srcset = widths.map((w) => `${withParams(src, w, quality)} ${w}w`).join(', ')
  im.src = withParams(src, widths[Math.min(1, widths.length - 1)], quality)
}

/* ---------- links ---------- */
export const B = 'https://www.srmist.edu.in'

// Pages we have built live at "/…". Everything that has no page of its own
// here points at the matching page on the official site.
export const LINK = {
  home: '/',
  about: '/about',
  academics: '/academics',
  programmes: '/programmes',
  research: '/research',
  admissions: '/admissions',
  apply: '/apply',
  international: '/international',
  placements: '/placements',
  rankings: '/rankings',
  scholarships: '/scholarships',
  events: '/events',
  library: '/library',
  departments: '/departments',
  examinations: '/examinations',
  alumni: '/alumni',
  campusLife: '/campus-life',
  // official site
  officialHome: `${B}/`,
  students: `${B}/students/`,
  // standalone pages in this project (full page loads, not router routes)
  faculty: '/teach.html',
  staffFinder: '/staff-finder',
  parents: `${B}/parents/`,
  alumniSite: 'https://alumni.srmist.edu.in/',
  contact: `${B}/contact-us/`,
  swift: `${B}/srmist-student-named-distinguished-winner-at-apples-swift-student-challenge-2026/`,
  camber: `${B}/srmists-team-camber-racing-claims-national-title-at-formula-bharat-2026/`,
  convocation: `${B}/srmist-22nd-convocation/`,
  technoblizz: `${B}/events/technoblizz-2026-12th-edition/`,
  alumniDay: `${B}/events/alumni-day-2026/`,
}

export const OFFICIAL = {
  site: `${B}/`,
  nirf: `${B}/srmist-ranked-22nd-overall-and-11th-among-universities-in-nirf-2025/`,
  rankings: `${B}/about-us/accreditations-and-rankings/`,
}

// External links open in a new tab; our own pages stay in the same tab.
const ext = { target: '_blank', rel: 'noreferrer' }
export const ex = (href = '') => (/^https?:/.test(href) ? ext : {})

/* ---------- icons ---------- */
export const Arrow = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12h14m-5-5 5 5-5 5" />
  </svg>
)
export const ArrowUR = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
)

/* ---------- scroll reveal ---------- */
/** Adds .motion-in once an element scrolls into view. */
export function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const ref = useRef(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return setSeen(true)
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true)
          io.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <Tag
      ref={ref}
      className={`motion-reveal ${seen ? 'motion-in' : ''} ${className}`.trim()}
      style={{ '--reveal-delay': `${delay}s` }}
      {...rest}
    >
      {children}
    </Tag>
  )
}

/* ---------- cursor glow ---------- */
export function CursorLight() {
  const ref = useRef(null)
  useEffect(() => {
    if (!window.matchMedia('(pointer:fine)').matches) return
    const move = (e) => {
      if (ref.current) ref.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`
    }
    window.addEventListener('pointermove', move)
    return () => window.removeEventListener('pointermove', move)
  }, [])
  return <div className="cursor-light" ref={ref} aria-hidden="true" />
}

/* ---------- local "AI" answers (no backend is wired up) ---------- */
const REPLIES = [
  {
    match: /(programme|course|study|choose|branch|b\.?tech|degree|computer)/i,
    text: 'Start with the Programme Finder — it groups every course by field so you can compare options side by side.',
    links: [
      ['Programme Finder', 'Find your course', LINK.programmes],
      ['Academics', 'Colleges and fields of study', LINK.academics],
    ],
  },
  {
    match: /(scholar|aid|fee|fund)/i,
    text: 'Scholarships and financial aid are listed by category, with eligibility and deadlines for each.',
    links: [
      ['Scholarships', 'Opportunity', LINK.scholarships],
      ['Admissions', 'Ways to begin', LINK.admissions],
    ],
  },
  {
    match: /(international|visa|abroad|foreign)/i,
    text: 'International applicants get application, visa and arrival support from one team.',
    links: [
      ['International', 'Connect globally', LINK.international],
      ['Apply now', 'Start an application', LINK.apply],
    ],
  },
  {
    match: /(placement|job|career|recruit|salary)/i,
    text: 'Placement outcomes, recruiters and career support are collected on the Placements page.',
    links: [
      ['Placements', 'Build your future', LINK.placements],
      ['Alumni', 'Lifelong community', LINK.alumni],
    ],
  },
  {
    match: /(hostel|campus|life|club|sport)/i,
    text: 'Campus life covers hostels, clubs, sport and everything around the classroom.',
    links: [['Campus life', 'Life at SRM', LINK.campusLife]],
  },
]
const FALLBACK = {
  text: 'I can point you to programmes, admissions pathways, scholarships, research and campus life. Try one of those.',
  links: [
    ['Programme Finder', 'Find your course', LINK.programmes],
    ['Admissions', 'Ways to begin', LINK.admissions],
  ],
}
export const answerFor = (q) => REPLIES.find((r) => r.match.test(q)) || FALLBACK

/* ---------- "DAAS" assistant (Gemini, via the /api/chat proxy) ---------- */
/** Sends the conversation to our server, which holds the API key and talks to Gemini. */
export async function askGuide(messages) {
  const r = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ messages: messages.map(({ role, text }) => ({ role, text })), lang: document.documentElement.getAttribute('lang') || 'en' }),
  })
  const data = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(data.error || 'SRM Guide is unavailable right now.')
  return data // { answer, links: [{ label, reason, href }] }
}

const inline = (t) =>
  t.split(/(\*\*[^*]+\*\*)/g).map((s, i) =>
    s.startsWith('**') && s.endsWith('**') && s.length > 4 ? <strong key={i}>{s.slice(2, -2)}</strong> : s,
  )

/** Minimal, safe formatting for replies: paragraphs, "- " bullets and **bold**. */
function Rich({ text }) {
  const out = []
  let list = []
  const flush = () => {
    if (list.length) {
      out.push(
        <ul key={`u${out.length}`}>
          {list.map((t, i) => (
            <li key={i}>{inline(t)}</li>
          ))}
        </ul>,
      )
      list = []
    }
  }
  text
    .split('\n')
    .filter((l) => l.trim())
    .forEach((l) => {
      const m = l.match(/^\s*[-*•]\s+(.*)$/)
      if (m) list.push(m[1])
      else {
        flush()
        out.push(<p key={`p${out.length}`}>{inline(l)}</p>)
      }
    })
  flush()
  return out
}

const STORE = 'srm-guide-chat'
const loadChat = () => {
  try {
    return JSON.parse(sessionStorage.getItem(STORE)) || []
  } catch {
    return []
  }
}
const saveChat = (m) => {
  try {
    sessionStorage.setItem(STORE, JSON.stringify(m.slice(-30)))
  } catch {
    /* storage unavailable: chat still works, it just isn't remembered */
  }
}

const PROMPTS = [
  'How much does B.Tech cost with a hostel?',
  'Tell me about MBBS',
  'I want to apply for management',
  'Please arrange a call back',
]

export function Assistant() {
  const [open, setOpen] = useState(false)
  const [everOpened, setEverOpened] = useState(false)
  const [messages, setMessages] = useState(loadChat)
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [pending, setPending] = useState(null)
  const endRef = useRef(null)

  useEffect(() => {
    saveChat(messages)
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [messages, loading, open])

  const send = async (text, base = messages) => {
    const question = text.trim()
    if (!question || loading) return
    const next = [...base, { role: 'user', text: question }]
    // Cards are picked on the device, so they show up even if the AI service is slow or down.
    const cards = cardsFor(question)
    // The cards go in straight away as a placeholder reply; the written answer fills in when it arrives.
    setMessages(cards.length ? [...next, { role: 'bot', text: '', cards, waiting: true }] : next)
    setQ('')
    setLoading(true)
    const settle = (reply) =>
      setMessages((m) => (cards.length ? [...m.slice(0, -1), { ...reply, cards }] : [...m, reply]))
    try {
      const r = await askGuide(next.filter((m) => !m.error))
      settle({ role: 'bot', text: r.answer, links: r.links })
    } catch (e) {
      const local = answerFor(question)
      settle(
        cards.length
          ? { role: 'bot', text: local.text, links: local.links.map(([label, reason, href]) => ({ label, reason, href })) }
          : { role: 'bot', text: e.message || 'SRM Guide is unavailable right now.', error: true, retry: question },
      )
    } finally {
      setLoading(false)
    }
  }

  // The ⌘K search hands unanswered questions here ("srm:ask"), optionally with the text to send.
  useEffect(() => {
    const onAsk = (e) => {
      setOpen(true)
      setEverOpened(true)
      if (e.detail) setPending(e.detail)
    }
    window.addEventListener('srm:ask', onAsk)
    return () => window.removeEventListener('srm:ask', onAsk)
  }, [])
  useEffect(() => {
    if (pending && !loading) {
      send(pending)
      setPending(null)
    }
  }, [pending]) // eslint-disable-line react-hooks/exhaustive-deps

  const retry = (question) => {
    // drop the failed exchange, then ask again
    const base = messages.slice(0, -2)
    setMessages(base)
    send(question, base)
  }

  return (
    <div className={`ai-assistant ${open ? 'ai-open' : ''}`}>
      <button
        className="ai-launcher"
        aria-expanded={open}
        onClick={() => {
          setOpen((o) => !o)
          setEverOpened(true)
        }}
      >
        <span className="ai-spark" aria-hidden="true" />
        <span>DAAS</span>
      </button>
      <section className="ai-panel" aria-label="SRM intelligent assistant" aria-hidden={!open}>
        <div className="ai-panel-head">
          <div className="ai-head-id">
            {everOpened && (
              <img src="/brand/srm-logo-white.svg" alt="SRM Institute of Science and Technology" width="89" height="30" decoding="async" />
            )}
            <span>
              <b>SRM Guide</b>
              <small>AI assistant · powered by Gemini</small>
            </span>
          </div>
          <div className="ai-head-actions">
            {messages.length > 0 && (
              <button className="ai-new" aria-label="Start a new chat" onClick={() => setMessages([])}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                New chat
              </button>
            )}
            <button className="ai-close" aria-label="Close assistant" onClick={() => setOpen(false)}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>
        </div>
        <div className="ai-conversation" aria-live="polite">
          {messages.length === 0 && !loading && (
            <>
              <h2>Where would you like to go next?</h2>
              <p>Ask about programmes, fees, applications or careers. I answer with cards you can act on: apply, estimate costs or book a call back.</p>
              <div className="ai-prompts">
                {PROMPTS.map((p) => (
                  <button key={p} onClick={() => send(p)}>
                    {p}
                  </button>
                ))}
              </div>
            </>
          )}
          <div className="ai-thread">
            {messages.map((m, i) =>
              m.role === 'user' ? (
                <div key={i} className="ai-msg user">
                  <p>{m.text}</p>
                </div>
              ) : (
                <div key={i} className={`ai-msg bot ${m.error ? 'error' : ''}`}>
                  <Rich text={m.text} />
                  <ChatCards cards={m.cards} />
                  {m.links?.length > 0 && (
                    <div className="ai-recommendations">
                      <span>Suggested next steps</span>
                      {m.links.map((l) => (
                        <a key={l.href} href={l.href} {...ex(l.href)}>
                          <div>
                            <b>{l.label}</b>
                            {l.reason && <small>{l.reason}</small>}
                          </div>
                          <span>→</span>
                        </a>
                      ))}
                    </div>
                  )}
                  {m.error && (
                    <button className="ai-follow-up" onClick={() => retry(m.retry)}>
                      Try again
                    </button>
                  )}
                </div>
              ),
            )}
            {loading && (
              <div className="ai-thinking">
                <i />
                <i />
                <i />
                <span>Finding the best route…</span>
              </div>
            )}
          </div>
          <div ref={endRef} />
        </div>
        <form
          className="ai-form"
          onSubmit={(e) => {
            e.preventDefault()
            send(q)
          }}
        >
          <input
            aria-label="Ask DAAS a question"
            placeholder="Ask DAAS…"
            maxLength={800}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            disabled={loading}
          />
          <button type="submit" disabled={!q.trim() || loading} aria-label="Send question">
            <Arrow />
          </button>
        </form>
        <small className="ai-disclaimer">AI can make mistakes. Verify important admission details.</small>
      </section>
    </div>
  )
}

/* ---------- header for every page except the home page ---------- */
export const NAV = [
  { label: 'Academics', path: '/academics' },
  { label: 'Admissions', path: '/admissions' },
  { label: 'Research', path: '/research' },
  { label: 'Campus life', path: '/campus-life' },
  { label: 'About', path: '/about' },
]

const Chevron = () => (
  <svg className="snav-chev" viewBox="0 0 24 24" aria-hidden="true">
    <path d="m6 9 6 6 6-6" />
  </svg>
)

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4 4" />
  </svg>
)

function NavLink({ href, children, ...rest }) {
  const { pathname } = useLocation()
  return (
    <a href={href} {...ex(href)} aria-current={href === pathname ? 'page' : undefined} {...rest}>
      {children}
    </a>
  )
}

/**
 * Header modelled on srmist.edu.in: utility strip, logo + quick links, main menu with
 * large dropdowns. `overlay` sits on top of the home-page hero; `solid` is for inner pages.
 */
export function MainNav({ variant = 'solid', hidden = false, light = false }) {
  const { pathname } = useLocation()
  const { t } = useLang()
  const strip = STRIP.map(([l, h]) => [t(l), h, l])
  const aux = AUX.map(([l, h]) => [t(l), h])
  const menus = MENUS.map((m) => ({ ...m, key: m.label, label: t(m.label) }))
  const [open, setOpen] = useState(null) // "Academics", "Campuses", …
  const [mobile, setMobile] = useState(false)
  const [section, setSection] = useState(null)
  const closeTimer = useRef(null)

  const enter = (key) => {
    clearTimeout(closeTimer.current)
    setOpen(key)
  }
  const leave = () => {
    clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setOpen(null), 140)
  }

  useEffect(() => {
    setOpen(null)
    setMobile(false)
  }, [pathname])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(null)
        setMobile(false)
      }
    }
    const onDown = (e) => {
      if (!e.target.closest?.('.snav-item, .snav-campuses')) setOpen(null)
    }
    window.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [])

  return (
    <>
      <header className={`snav snav--${variant} ${hidden ? 'is-hidden' : ''}`}>
        {/* 1 · utility strip */}
        <div className="snav-strip">
          <div className="snav-strip-left">
            <Preferences part="lang" />
          </div>
          <nav className="snav-strip-links" aria-label="For students, faculty, parents and visitors">
            {strip.map(([label, href, en]) => (
              <NavLink key={en} href={href} className={en === 'Faculty & Staff' ? 'is-faculty' : undefined}>
                {label}
              </NavLink>
            ))}
            <div
              className={`snav-campuses ${open === 'Campuses' ? 'open' : ''}`}
              onMouseEnter={() => enter('Campuses')}
              onMouseLeave={leave}
              onFocus={() => enter('Campuses')}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) leave()
              }}
            >
              <button aria-expanded={open === 'Campuses'} onClick={() => setOpen('Campuses')}>
                {t('Campuses')} <Chevron />
              </button>
              <div className="snav-drop">
                {CAMPUSES.map(([label, href]) => (
                  <NavLink key={label} href={href}>
                    {label}
                  </NavLink>
                ))}
              </div>
            </div>
          </nav>
          <div className="snav-strip-right">
            <Preferences part="theme" />
            <a className="snav-srmjee" href="/srmjeee">
              SRMJEEE
            </a>
            <a className="snav-admit snav-admit-top" href="/admissions">
              {t('Admissions 2027')}
            </a>
          </div>
        </div>

        {/* 2 · logo, quick links, main menu */}
        <div className="snav-bar">
          <a className="snav-brand" href="/" aria-label="SRM Institute of Science and Technology — home">
            <img
              src="/brand/srm-logo.svg"
              alt="SRM Institute of Science and Technology"
              width="160"
              height="54"
              fetchpriority="high"
              decoding="async"
            />
          </a>

          <div className="snav-right">
            <nav className="snav-aux" aria-label="Quick links">
              {aux.map(([label, href]) => (
                <NavLink key={label} href={href}>
                  {label}
                </NavLink>
              ))}
            </nav>
            <nav className="snav-menu" aria-label="Main navigation">
              {menus.map((m) => (
                <div
                  key={m.label}
                  className={`snav-item ${open === m.label ? 'open' : ''} ${pathname === m.to ? 'active' : ''}`}
                  onMouseEnter={() => enter(m.label)}
                  onMouseLeave={leave}
                  onFocus={() => enter(m.label)}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget)) leave()
                  }}
                >
                  <button aria-expanded={open === m.label} onClick={() => setOpen(m.label)}>
                    {m.label} <Chevron />
                  </button>
                  <div className="snav-mega">
                    <div className="snav-lead">
                      <span className="eyebrow">{m.label}</span>
                      <p>{m.blurb}</p>
                      <NavLink href={m.to} className="snav-lead-link">
                        Explore {m.label.toLowerCase()} <Arrow />
                      </NavLink>
                    </div>
                    {m.cols.map((c) => (
                      <div className="snav-col" key={c.title}>
                        <h4>{c.title}</h4>
                        {c.links.map(([label, href]) => (
                          <NavLink key={label} href={href}>
                            {label}
                          </NavLink>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button className="snav-search" aria-label="Open search" onClick={openSearch}>
                <SearchIcon />
              </button>
            </nav>
          </div>

          <div className="snav-mobile-actions">
            <a className="snav-admit-m" href="/admissions">
              {t('Admissions')} <b>2027</b>
            </a>
            <button className="snav-search" aria-label="Open search" onClick={openSearch}>
              <SearchIcon />
            </button>
            <button
              className="snav-burger"
              aria-label="Toggle menu"
              aria-expanded={mobile}
              onClick={() => setMobile((m) => !m)}
            >
              <span />
              <span />
            </button>
          </div>
        </div>

        {/* mobile menu */}
        <div className={`snav-mobile ${mobile ? 'open' : ''}`}>
          <a className="snav-srmjee-m" href="/srmjeee">
            SRMJEEE 2027 registration
          </a>
          <Preferences />
          <div className="snav-mobile-strip">
            {strip.map(([label, href]) => (
              <NavLink key={label} href={href}>
                {label}
              </NavLink>
            ))}
          </div>
          {menus.map((m) => (
            <div key={m.label} className={`snav-mobile-group ${section === m.label ? 'open' : ''}`}>
              <button onClick={() => setSection((s) => (s === m.label ? null : m.label))}>
                {m.label} <Chevron />
              </button>
              <div className="snav-mobile-links">
                <NavLink href={m.to}>Explore {m.label.toLowerCase()}</NavLink>
                {m.cols.map((c) => (
                  <div key={c.title}>
                    <h5>{c.title}</h5>
                    {c.links.map(([label, href]) => (
                      <NavLink key={label} href={href}>
                        {label}
                      </NavLink>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="snav-mobile-strip snav-mobile-aux">
            {aux.map(([label, href]) => (
              <NavLink key={label} href={href}>
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      </header>

    </>
  )
}

/** Header used on every page except the home page. */
export function SiteHeader() {
  return <MainNav variant="solid" />
}

/* ---------- pause / play animations (WCAG 2.2.2) ---------- */
const MOTION_KEY = 'srm-motion-paused'
const prefersReducedMotion = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export function MotionToggle() {
  const [paused, setPaused] = useState(() => {
    try {
      const saved = sessionStorage.getItem(MOTION_KEY)
      return saved === null ? prefersReducedMotion() : saved === '1'
    } catch {
      return prefersReducedMotion()
    }
  })
  useEffect(() => {
    document.body.classList.toggle('motion-paused', paused)
    try {
      sessionStorage.setItem(MOTION_KEY, paused ? '1' : '0')
    } catch {
      /* storage unavailable: the choice just isn't remembered */
    }
  }, [paused])
  return (
    <button className="motion-toggle" aria-pressed={paused} onClick={() => setPaused((p) => !p)}>
      {paused ? 'Play animations' : 'Pause animations'}
    </button>
  )
}

export { prefersReducedMotion }

/* ---------- footer ---------- */
const contacts = [
  ['Engineering, Agriculture & Architecture admissions', '+91 70 2645 2645', '+917026452645'],
  ['Other programmes admissions', '+91 70 2647 2647', '+917026472647'],
  ['University enquiries', '+91 44 2741 7000', '+914427417000'],
]

export function Footer() {
  return (
    <footer>
      <div className="footer-lead">
        <span className="eyebrow">Your next chapter</span>
        <h2>Let’s build what’s next.</h2>
        <a href="/apply" className="button button-light">
          Start your application
          <Arrow />
        </a>
      </div>
      <div className="footer-grid">
        <div>
          <a className="footer-brand" href="/" aria-label="SRM Institute of Science and Technology — home">
            <img src="/brand/srm-logo-white.svg" alt="SRM Institute of Science and Technology" width="190" height="64" loading="lazy" decoding="async" />
          </a>
          <p>Kattankulathur, Chennai, Tamil Nadu 603203</p>
        </div>
        <div>
          <b>Discover</b>
          {[
            ['Programmes', LINK.programmes],
            ['Research', LINK.research],
            ['International', LINK.international],
            ['Placements', LINK.placements],
            ['Rankings', LINK.rankings],
            ['Scholarships', LINK.scholarships],
            ['Events', LINK.events],
            ['Library', LINK.library],
            ['Departments A–Z', LINK.departments],
            ['Examinations', LINK.examinations],
            ['Alumni', LINK.alumni],
            ['Campus life', LINK.campusLife],
            ['About SRM', LINK.about],
          ].map(([l, url]) => (
            <a key={l} href={url}>
              {l}
            </a>
          ))}
        </div>
        <div>
          <b>Connect</b>
          <a href="/admissions">Admissions India</a>
          <a href="/admissions">International students</a>
          <a href="/apply">Apply online</a>
          <a href={OFFICIAL.site} {...ex(OFFICIAL.site)}>
            Official website
          </a>
          <a href={LINK.contact} {...ex(LINK.contact)}>
            Contact us
          </a>
          {contacts.map(([label, shown, tel]) => (
            <a key={tel} href={`tel:${tel}`} className="footer-contact">
              <small>{label}</small>
              {shown}
            </a>
          ))}
        </div>
        <div>
          <b>For you</b>
          <a href={LINK.students} {...ex(LINK.students)}>
            Students
          </a>
          <a href={LINK.faculty}>Faculty &amp; staff</a>
          <a className="footer-icon-link" href={LINK.staffFinder}>
            <StaffIcon /> Staff finder
          </a>
          <a href={LINK.alumniSite} {...ex(LINK.alumniSite)}>
            Alumni
          </a>
          <a href={LINK.parents} {...ex(LINK.parents)}>
            Parents
          </a>
        </div>
      </div>
      <SrmSketch />
      <div className="legal">
        <span>Concept redesign · 2026</span>
        <span className="legal-mid">
          <MotionToggle />
          <a className="legal-404" href="/404">
            Lost? See our 404 page
          </a>
        </span>
        <span>Learn · Leap · Lead</span>
      </div>
    </footer>
  )
}


/* ---------- admissions portal toggle ---------- */
/** Floating entry to the separate Admissions screen. Hidden on the portal itself and during the application. */
export function AdmissionsFab() {
  const { pathname } = useLocation()
  if (pathname === '/admissions' || pathname.startsWith('/apply')) return null
  return (
    <a className="adm-fab" href="/admissions" aria-label="Open the Admissions portal">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 9.5 12 5l9 4.5-9 4.5L3 9.5Z" />
        <path d="M7 12v4.2c0 1 2.2 2.3 5 2.3s5-1.3 5-2.3V12" />
      </svg>
      <span>Admissions</span>
    </a>
  )
}
