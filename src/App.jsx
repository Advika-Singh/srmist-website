import { lazy, Suspense, useEffect } from 'react'
import { flushSync } from 'react-dom'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import Home from './Home.jsx'
import { EYEBROWS, SLUGS } from './data/routes.js'
import { AdmissionsFab, Assistant, CursorLight, NAV, prefersReducedMotion } from './shared.jsx'
import SmartSearch from './ui/SmartSearch.jsx'
import { startPageFx } from './lib/pageFx.js'

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

/** Our own pages are navigated in-app; .html pages and external links are left to the browser. */
const isAppLink = (href) => !!href && href.startsWith('/') && !href.startsWith('//') && !/\.html([?#]|$)/.test(href)

/** Start fetching a page's code as soon as someone points at its link, so the transition never waits. */
function prefetch(href) {
  const path = href.split(/[?#]/)[0]
  if (path.startsWith('/apply')) loadApply()
  else if (path === '/admissions') loadAdmissions()
  else if (['/status', '/support', '/access-map', '/visitors', '/library', '/hostels', '/students', '/day', '/clubs', '/course-finder', '/staff-finder', '/srmjeee', '/placements'].includes(path)) import(`./pages/${PAGE_FILE[path]}.jsx`)
  else if (path !== '/') loadInterior()
}

const PAGE_FILE = { '/status': 'Status', '/support': 'Support', '/access-map': 'AccessMap', '/visitors': 'Visitors', '/library': 'Library', '/hostels': 'Hostels', '/students': 'Students', '/day': 'Day', '/clubs': 'Clubs', '/course-finder': 'CourseFinder', '/staff-finder': 'StaffFinder', '/srmjeee': 'Srmjeee', '/placements': 'Placements' }
const PAGE_TITLE = { '/status': 'Service status', '/support': 'Report or track an issue', '/access-map': 'Accessible campus map', '/visitors': 'Visit the campus', '/library': 'University library', '/hostels': 'Hostels', '/students': 'Students', '/day': 'A day at SRM', '/clubs': 'Clubs', '/course-finder': 'Course finder', '/staff-finder': 'Staff finder', '/srmjeee': 'SRMJEEE 2027' }

const APPLY_STEPS = ['/apply', '/apply/programme', '/apply/details', '/apply/review']

function titleFor(pathname) {
  if (pathname === '/') return 'SRMIST — Learn. Leap. Lead.'
  if (pathname.startsWith('/apply')) return 'Apply to SRMIST'
  if (pathname === '/admissions') return 'Admissions 2027 — SRMIST'
  if (PAGE_TITLE[pathname]) return `${PAGE_TITLE[pathname]} — SRMIST`
  const label = NAV.find((n) => n.path === pathname)?.label ?? EYEBROWS[pathname.slice(1)]
  return label ? `${label} — SRMIST` : 'SRMIST — Learn. Leap. Lead.'
}

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

  useEffect(() => {
    if (!document.body.dataset.nf) document.title = titleFor(pathname) // the 404 page sets its own title
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
          <Route path="/placements" element={<Placements />} />
          {SLUGS.filter((slug) => !['admissions', 'library', 'placements'].includes(slug)).map((slug) => (
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
