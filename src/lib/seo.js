// Per-page title, description and share tags. The app is a single-page app, so this runs in the browser; link
// previews and crawlers that do not run JavaScript still get the defaults in index.html (see docs/ROADMAP.md, prerendering).

import { EYEBROWS } from '../data/routes.js'

export const SITE = 'https://srmist-home-pink.vercel.app'
export const OFFICIAL_SITE = 'https://www.srmist.edu.in/'
export const HOME_TITLE = 'SRMIST — Learn. Leap. Lead.'

// Tab titles for pages that are not in the route table (data/routes.js).
export const PAGE_TITLE = { '/style-guide': 'Design system', '/portal': 'Staff portal', '/portal/login': 'Staff sign-in', '/portal/mine': 'My submissions', '/portal/approvals': 'Approvals', '/portal/logs': 'Portal logs', '/status': 'Service status', '/support': 'Report or track an issue', '/access-map': 'Accessible campus map', '/visitors': 'Visit the campus', '/library': 'University library', '/hostels': 'Hostels', '/students': 'Students', '/day': 'A day at SRM', '/clubs': 'Clubs', '/course-finder': 'Course finder', '/staff-finder': 'Staff finder', '/srmjeee': 'SRMJEEE 2027', '/innovation': 'Student innovation', '/ask-a-student': 'Ask a current student', '/privacy': 'Privacy and cookies', '/terms': 'Terms of use', '/accessibility': 'Accessibility', '/campus-walk': 'Walk the campus', '/parents': 'Parents', '/alumni/chapters': 'Alumni chapters', '/recruiters': 'Recruiters', '/compare': 'Compare programmes', '/dates': 'Key dates', '/events/calendar': 'Events calendar', '/colleges': 'Colleges and schools', '/research/centres': 'Research centres', '/research/initiatives': 'Research output and funding', '/research/partners': 'Research partners and innovation', '/campus-life/student-life': 'Student life', '/campus-life/living': 'Living on campus', '/campus-life/wellbeing': 'Support, safety and inclusion', '/international/global': 'Global SRM', '/international/pathways': 'Study abroad and international admissions', '/about/history': 'History', '/about/leadership': 'Leadership and governance', '/about/recognition': 'Recognition', '/about/offices': 'Offices and directorates', '/contact': 'Contact' }

// The main-menu labels (the same as NAV in shared.jsx), which win over the route table's longer names.
const MENU_LABEL = { '/academics': 'Academics', '/research': 'Research', '/campus-life': 'Campus life', '/about': 'About' }

/** The short name of a page, without the site name. null for the home page and unknown addresses. */
export function labelFor(pathname) {
  if (pathname === '/') return null
  if (pathname.startsWith('/apply')) return 'Apply to SRMIST'
  if (pathname === '/admissions') return 'Admissions 2027'
  return PAGE_TITLE[pathname] ?? MENU_LABEL[pathname] ?? EYEBROWS[pathname.slice(1)] ?? null
}

/** The browser-tab title for an address. */
export function titleFor(pathname) {
  const label = labelFor(pathname)
  if (!label) return HOME_TITLE
  return pathname.startsWith('/apply') ? label : `${label} — SRMIST`
}
const IMAGE = `${SITE}/srmist/campus-main-building.jpg`

const DEFAULT = 'Explore programmes, research, campus life and admissions at SRM Institute of Science and Technology. An independent concept redesign.'

export const PAGE_DESC = {
  '/': DEFAULT,
  '/admissions': 'Admissions 2027: fees, dates and how to apply to SRMIST. Estimate your costs and start your application.',
  '/srmjeee': 'SRMJEEE 2027 dates, phases and how to register, with a countdown to the deadline.',
  '/course-finder': 'Answer five quick questions and get a programme recommendation.',
  '/staff-finder': 'Find SRMIST faculty and staff, with photos and departments.',
  '/placements': 'Careers and placements: companies, packages and the Career Centre.',
  '/library': 'The university library: opening hours, contacts and what is inside.',
  '/hostels': 'Hostel blocks, mess timings, distances and who to call.',
  '/visitors': 'Visiting the Kattankulathur campus: layout, where to stay and where to eat.',
  '/campus-walk': 'A five-stop walk across the Kattankulathur campus with real walking distances, plus a link to the 360° tour.',
  '/access-map': 'An accessible campus map with entrances and routes from OpenStreetMap.',
  '/innovation': 'Sourced stories of student innovation at SRMIST.',
  '/ask-a-student': 'Answers from current students, only where consented or sourced.',
  '/clubs': 'Student clubs and the Directorate of Student Affairs.',
  '/parents': 'Parent portal, fees and loans, safety, hostels and ways to stay in touch, with links to the official pages.',
  '/alumni': 'The SRMIST alumni community: how to stay connected, give back and keep learning.',
  '/alumni/chapters': 'Alumni chapters and meetups across India, the alumni portal and the Directorate of Alumni Affairs.',
  '/recruiters': 'Hire from SRMIST: how campus recruitment works, who has recruited and how to contact the Career Centre.',
  '/status': 'Check whether the student portals are reachable right now: Academia, fees, results and the LMS.',
  '/support': 'Report a problem and follow it with a reference number. A prototype tracker, not connected to SRMIST systems.',
  '/students': 'For current students: portals, fees, exams, academic calendars and student life, with links to the official pages.',
  '/day': 'Follow a student across the Kattankulathur campus from morning to night, on a map built from OpenStreetMap paths.',
  '/colleges': 'The colleges and health-science schools of SRMIST, each with a short description and a link to its official page.',
  '/research/centres': 'Research wings and shared facilities at SRMIST, such as nanotechnology, high performance computing and the central instrumentation facility.',
  '/research/initiatives': 'An index of SRMIST research output: publications, patents, projects, Ph.D awards, funding calls, regulations and research events.',
  '/research/partners': 'How SRMIST research connects outward: collaborations, industry connect, incubation, entrepreneurship and the FAB LAB.',
  '/campus-life/student-life': 'Arts and culture, sports, NCC, NSS, Tamil Perayam, the Milan festival and community service at SRMIST.',
  '/campus-life/living': 'Transport, facilities, safety, religious life, diversity and the Muthucharam community radio at SRMIST.',
  '/campus-life/wellbeing': 'Counselling, anti-ragging, anti-discrimination, the women’s grievance committee and the Equal Opportunity Cell at SRMIST.',
  '/international/global': 'SRMIST’s International Advisory Board, global university partnerships, visiting foreign faculty and international alumni network.',
  '/international/pathways': 'Semester abroad, twinning, dual degrees and global immersion for SRMIST students, and admissions for international applicants.',
  '/about/history': 'The history of SRM from the first school in 1969 to the 2018 college of agriculture, drawn from the university’s own timeline.',
  '/about/leadership': 'SRMIST’s apex leadership, the governing bodies and links to the administrative and academic heads.',
  '/about/recognition': 'SRMIST’s NAAC A++ accreditation, QS I-GAUGE ratings, THE Impact Rankings and awards, each with its year and source.',
  '/about/offices': 'The offices of SRMIST: IQAC, ITKM, online and distance education, communications and alumni affairs.',
  '/contact': 'How to reach SRMIST: the Kattankulathur address, main phone numbers and the admissions information centre numbers.',
  '/events/calendar': 'Conferences, workshops, programmes and festivals at SRMIST, month by month, copied from the official events page, with a calendar file for each.',
  '/compare': 'Compare up to three fields of study side by side: levels, typical length, example programmes and entrance exam.',
  '/style-guide': 'What is the same on every page, and the short list of ways a page may differ: colours, type, hero looks, buttons and radii.',
  '/portal': 'Staff portal for posting announcements and events, reviewed by an approver before they appear.',
  '/portal/login': 'Sign in to the staff portal with your university Google account to post announcements and events.',
  '/portal/mine': 'Your announcements and events, and whether each one is pending, approved or rejected.',
  '/portal/approvals': 'Approvers review pending announcements and events, then approve or reject each with a reason.',
  '/portal/logs': 'The permanent record of every portal action: who posted, who approved or rejected, and when.',
  '/announcements': 'Announcements posted by university staff and approved before they appear.',
  '/dates': 'SRMJEEE 2027 application deadlines and exam days in one list, with a calendar file to add them to your phone.',
  '/privacy': 'What this site collects, what stays in your browser, and how to ask us to change or delete data.',
  '/terms': 'Plain-language terms for using this concept redesign.',
  '/accessibility': 'What accessibility features are built in, the known gaps, and how to report a barrier.',
}

export const cleanPath = (pathname) => pathname.replace(/\/+$/, '') || '/'
export const descFor = (pathname) => PAGE_DESC[cleanPath(pathname)] ?? DEFAULT
export const urlFor = (pathname) => `${SITE}${cleanPath(pathname)}`

/**
 * Structured data (schema.org JSON-LD) for an address. The home page describes this site and says plainly that it is about
 * SRMIST, not run by it; every other page gets a breadcrumb trail. Facts here are limited to names and official addresses.
 */
export function jsonLd(pathname) {
  const path = cleanPath(pathname)
  if (path === '/') {
    return [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'SRMIST concept redesign',
        url: `${SITE}/`,
        description: DEFAULT,
        inLanguage: 'en-IN',
        about: { '@type': 'CollegeOrUniversity', name: 'SRM Institute of Science and Technology', alternateName: 'SRMIST', url: OFFICIAL_SITE },
      },
    ]
  }
  const label = labelFor(path)
  if (!label) return []
  const trail = [['Home', `${SITE}/`]]
  if (path === '/alumni/chapters') trail.push(['Alumni', `${SITE}/alumni`])
  if (path.startsWith('/apply/')) trail.push(['Apply to SRMIST', `${SITE}/apply`])
  trail.push([label, urlFor(path)])
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: trail.map(([name, item], i) => ({ '@type': 'ListItem', position: i + 1, name, item })),
    },
  ]
}

/** JSON for a script tag: "<" is written as < so the text can never close the tag early. */
export const ldText = (pathname) => JSON.stringify(jsonLd(pathname)).replaceAll('<', '\\u003c')

function setMeta(selector, attr, key, value) {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', value)
}

/** Update description, canonical, Open Graph and Twitter tags for the current route. Title is set by App.jsx. */
export function applyMeta(pathname, title) {
  const desc = descFor(pathname)
  const url = urlFor(pathname)
  setMeta('meta[name="description"]', 'name', 'description', desc)
  setMeta('meta[property="og:title"]', 'property', 'og:title', title)
  setMeta('meta[property="og:description"]', 'property', 'og:description', desc)
  setMeta('meta[property="og:url"]', 'property', 'og:url', url)
  setMeta('meta[property="og:image"]', 'property', 'og:image', IMAGE)
  setMeta('meta[property="og:type"]', 'property', 'og:type', 'website')
  setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image')
  let link = document.head.querySelector('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'canonical'
    document.head.appendChild(link)
  }
  link.href = url
  let ld = document.head.querySelector('script#ld-json')
  if (!ld) {
    ld = document.createElement('script')
    ld.type = 'application/ld+json'
    ld.id = 'ld-json'
    document.head.appendChild(ld)
  }
  ld.textContent = ldText(pathname)
}
