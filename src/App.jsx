import { lazy, Suspense, useEffect } from 'react'
import { flushSync } from 'react-dom'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import Home from './Home.jsx'
import { SECTION_PATHS, SLUGS } from './data/routes.js'
import { AdmissionsFab, Assistant, CursorLight, prefersReducedMotion } from './shared.jsx'
import SmartSearch from './ui/SmartSearch.jsx'
import { startPageFx } from './lib/pageFx.js'
import { useScrollScenes } from './lib/useScrollScenes.js'
import { useMotionOk } from './lib/useScrollProgress.js'
import { applyMeta, titleFor } from './lib/seo.js'

// The landing page loads up front; everything else is fetched when it is first visited.
const loadInterior = () => import('./pages/Interior.jsx')
const loadApply = () => import('./pages/Apply.jsx')
const Interior = lazy(loadInterior)
const loadAdmissions = () => import('./pages/Admissions.jsx')
const Apply = lazy(loadApply)
const Admissions = lazy(loadAdmissions)
const Status = lazy(() => import('./pages/Status.jsx'))
const Support = lazy(() => import('./pages/Support.jsx'))
const AccessMap = lazy(() => import('./pages/AccessMap.jsx'))
const Visitors = lazy(() => import('./pages/Visitors.jsx'))
const Library = lazy(() => import('./pages/Library.jsx'))
const Hostels = lazy(() => import('./pages/Hostels.jsx'))
const Students = lazy(() => import('./pages/Students.jsx'))
const Day = lazy(() => import('./pages/Day.jsx'))
const Clubs = lazy(() => import('./pages/Clubs.jsx'))
const CourseFinder = lazy(() => import('./pages/CourseFinder.jsx'))
const StaffFinder = lazy(() => import('./pages/StaffFinder.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))
const Placements = lazy(() => import('./pages/Placements.jsx'))
const Srmjeee = lazy(() => import('./pages/Srmjeee.jsx'))
const Innovation = lazy(() => import('./pages/Innovation.jsx'))
const StudentVoices = lazy(() => import('./pages/StudentVoices.jsx'))
const Privacy = lazy(() => import('./pages/Privacy.jsx'))
const Terms = lazy(() => import('./pages/Terms.jsx'))
const Accessibility = lazy(() => import('./pages/Accessibility.jsx'))
const CampusWalk = lazy(() => import('./pages/CampusWalk.jsx'))
const Parents = lazy(() => import('./pages/Parents.jsx'))
const AlumniChapters = lazy(() => import('./pages/AlumniChapters.jsx'))
const Recruiters = lazy(() => import('./pages/Recruiters.jsx'))
const Compare = lazy(() => import('./pages/Compare.jsx'))
const KeyDates = lazy(() => import('./pages/KeyDates.jsx'))
const Section = lazy(() => import('./pages/Section.jsx'))
const EventsCalendar = lazy(() => import('./pages/EventsCalendar.jsx'))
const About = lazy(() => import('./pages/About.jsx'))

/** Our own pages are navigated in-app; .html pages and external links are left to the browser. */
// A backslash is refused too: some browsers read "/\host" as "//host", which is how the open-redirect advisory for react-router 6 works.
const isAppLink = (href) => !!href && href.startsWith('/') && !href.startsWith('//') && !href.includes('\\') && !/\.html([?#]|$)/.test(href)

/** Start fetching a page's code as soon as someone points at its link, so the transition never waits. */
function prefetch(href) {
  const path = href.split(/[?#]/)[0]
  if (SECTION_PATHS.includes(path)) import('./pages/Section.jsx')
  else if (path.startsWith('/apply')) loadApply()
  else if (path === '/admissions') loadAdmissions()
  else if (['/status', '/support', '/access-map', '/visitors', '/library', '/hostels', '/students', '/day', '/clubs', '/course-finder', '/staff-finder', '/srmjeee', '/placements', '/innovation', '/ask-a-student', '/privacy', '/terms', '/accessibility', '/campus-walk', '/parents', '/alumni/chapters', '/recruiters', '/compare', '/dates', '/events/calendar'].includes(path)) import(`./pages/${PAGE_FILE[path]}.jsx`)
  else if (path !== '/') loadInterior()
}

const PAGE_FILE = { '/status': 'Status', '/support': 'Support', '/access-map': 'AccessMap', '/visitors': 'Visitors', '/library': 'Library', '/hostels': 'Hostels', '/students': 'Students', '/day': 'Day', '/clubs': 'Clubs', '/course-finder': 'CourseFinder', '/staff-finder': 'StaffFinder', '/srmjeee': 'Srmjeee', '/placements': 'Placements', '/innovation': 'Innovation', '/ask-a-student': 'StudentVoices', '/privacy': 'Privacy', '/terms': 'Terms', '/accessibility': 'Accessibility', '/campus-walk': 'CampusWalk', '/parents': 'Parents', '/alumni/chapters': 'AlumniChapters', '/recruiters': 'Recruiters', '/compare': 'Compare', '/dates': 'KeyDates', '/events/calendar': 'EventsCalendar' }

const APPLY_STEPS = ['/apply', '/apply/programme', '/apply/details', '/apply/review']

export default function App() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  // Links to our own pages navigate without a full reload, with a smooth cross-fade where supported.
  useEffect(() => {
    // Browsers without the View Transitions API get a simple fade-in instead (see index.css).
    if (!document.startViewTransition) document.documentElement.classList.add('no-vt')

    const go = (href) => {
      const path = href.split(/[?#]/)[0]
      const still = prefersReducedMotion() || document.body.classList.contains('motion-paused')
      // No transition when the tab is in the background (nothing would be drawn) or motion is off.
      if (!document.startViewTransition || still || document.visibilityState === 'hidden' || path === window.location.pathname) {
        return navigate(href)
      }
      let updated = false
      const transition = document.startViewTransition(() => {
        updated = true
        flushSync(() => navigate(href)) // commit the new page inside the transition
        window.scrollTo(0, 0)
      })
      // A skipped or interrupted transition is normal (for example a second click mid-animation).
      for (const p of [transition.ready, transition.finished, transition.updateCallbackDone]) p.catch(() => {})
      // Safety net: if the browser holds the transition back, still change the page.
      setTimeout(() => {
        if (updated) return
        transition.skipTransition()
        setTimeout(() => {
          if (!updated) navigate(href)
        }, 300)
      }, 1000)
    }

    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = e.target.closest('a')
      if (!a || a.target) return
      const href = a.getAttribute('href')
      if (!isAppLink(href)) return
      e.preventDefault()
      go(href)
    }
    const onIntent = (e) => {
      const href = e.target.closest?.('a')?.getAttribute('href')
      if (isAppLink(href)) prefetch(href)
    }

    document.addEventListener('click', onClick)
    for (const type of ['pointerover', 'focusin', 'touchstart']) document.addEventListener(type, onIntent, { passive: true })
    // warm the shared sub-page code once the browser is idle
    const idle = window.requestIdleCallback ? window.requestIdleCallback(loadInterior) : setTimeout(loadInterior, 3000)
    return () => {
      document.removeEventListener('click', onClick)
      for (const type of ['pointerover', 'focusin', 'touchstart']) document.removeEventListener(type, onIntent)
      window.cancelIdleCallback ? window.cancelIdleCallback(idle) : clearTimeout(idle)
    }
  }, [navigate])

  useEffect(() => startPageFx(), [])

  // the reading-progress line and scroll-linked photo motion run on every page, not only the landing page
  useScrollScenes(useMotionOk())

  useEffect(() => {
    if (!document.body.dataset.nf) document.title = titleFor(pathname) // the 404 page sets its own title
    applyMeta(pathname, document.title)
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname])

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <CursorLight />
      <Suspense fallback={<div className="route-loading" role="status" aria-live="polite">Loading…</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admissions" element={<Admissions />} />
          <Route path="/status" element={<Status />} />
          <Route path="/support" element={<Support />} />
          <Route path="/access-map" element={<AccessMap />} />
          <Route path="/visitors" element={<Visitors />} />
          <Route path="/library" element={<Library />} />
          <Route path="/hostels" element={<Hostels />} />
          <Route path="/students" element={<Students />} />
          <Route path="/day" element={<Day />} />
          <Route path="/clubs" element={<Clubs />} />
          <Route path="/course-finder" element={<CourseFinder />} />
          <Route path="/staff-finder" element={<StaffFinder />} />
          <Route path="/srmjeee" element={<Srmjeee />} />
          <Route path="/innovation" element={<Innovation />} />
          <Route path="/ask-a-student" element={<StudentVoices />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/accessibility" element={<Accessibility />} />
          <Route path="/campus-walk" element={<CampusWalk />} />
          <Route path="/parents" element={<Parents />} />
          <Route path="/alumni/chapters" element={<AlumniChapters />} />
          <Route path="/recruiters" element={<Recruiters />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/dates" element={<KeyDates />} />
          <Route path="/events/calendar" element={<EventsCalendar />} />
          {SECTION_PATHS.map((p) => (
            <Route key={p} path={p} element={<Section path={p} />} />
          ))}
          <Route path="/placements" element={<Placements />} />
          <Route path="/about" element={<About />} />
          {SLUGS.filter((slug) => !['admissions', 'library', 'placements', 'about'].includes(slug)).map((slug) => (
            <Route key={slug} path={`/${slug}`} element={<Interior slug={slug} />} />
          ))}
          {APPLY_STEPS.map((p) => (
            <Route key={p} path={p} element={<Apply path={p} />} />
          ))}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <AdmissionsFab />
      <SmartSearch />
      <Assistant />
    </>
  )
}
