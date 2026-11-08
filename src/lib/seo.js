// Per-page title, description and share tags. The app is a single-page app, so this runs in the browser; link
// previews and crawlers that do not run JavaScript still get the defaults in index.html (see docs/ROADMAP.md, prerendering).

export const SITE = 'https://srmist-home-pink.vercel.app'
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
  '/privacy': 'What this site collects, what stays in your browser, and how to ask us to change or delete data.',
  '/terms': 'Plain-language terms for using this concept redesign.',
  '/accessibility': 'What accessibility features are built in, the known gaps, and how to report a barrier.',
}

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
  const clean = pathname.replace(/\/+$/, '') || '/'
  const desc = PAGE_DESC[clean] ?? DEFAULT
  const url = `${SITE}${clean === '/' ? '/' : clean}`
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
}
