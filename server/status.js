// GET /api/status — checks the real SRMIST portals from the server and reports up / slow / down.
//
// Why on the server: browsers cannot read another site's response (CORS), and the site's Content-Security-Policy
// forbids it anyway. The server asks each portal, remembers the answer for a minute so a crowd of students does
// not turn into a crowd of requests to SRM, and keeps a short in-memory history for the little "recent checks" strip.
//
// The list of URLs is fixed in code. Nothing from the request ever reaches fetch(), so this cannot be pointed
// at other hosts (no SSRF).

import { send } from './util.js'

export const SERVICES = [
  { id: 'academia', group: 'Student portals', name: 'Academia', blurb: 'Attendance, marks, timetable and academic services', url: 'https://academia.srmist.edu.in/' },
  { id: 'fees', group: 'Student portals', name: 'Student Portal (fees & finances)', blurb: 'Fee details, hostel and transport information', url: 'https://sp.srmist.edu.in/' },
  { id: 'lms', group: 'Student portals', name: 'LMS', blurb: 'Learning management system for course material', url: 'https://lms.srmist.edu.in/' },
  { id: 'results', group: 'Examinations', name: 'Examinations & results', blurb: 'Controller of Examinations pages, circulars and results', url: 'https://www.srmist.edu.in/controller-of-examinations/' },
  { id: 'connect', group: 'Student portals', name: 'Student Connect', blurb: 'Web portal linked from the official Students page', url: 'https://studentconnect.srmist.edu.in/' },
  { id: 'servicedesk', group: 'Support', name: 'ITKM Service Desk', blurb: 'Official IT help desk for logging technical issues', url: 'https://sd.srmist.edu.in/' },
  { id: 'website', group: 'Website', name: 'Main website', blurb: 'srmist.edu.in', url: 'https://www.srmist.edu.in/' },
]

const SLOW_MS = 3000
const TIMEOUT_MS = 8000
const CACHE_MS = 60_000
const KEEP = 48 // checks remembered per service

const history = new Map(SERVICES.map((s) => [s.id, []]))
let cache = null // { at, payload }
let inflight = null

/**
 * state: up | slow | limited | down
 *  - up       answered normally
 *  - slow     answered, but took longer than SLOW_MS
 *  - limited  the server answered but refuses automated visitors (HTTP 401/403/429). It is running, we just cannot see the page.
 *  - down     no answer, timeout, 5xx or 404
 */
export function classify({ error, code, ms }) {
  if (error) return 'down'
  if (code >= 500 || code === 404 || code === 410) return 'down'
  if (code === 401 || code === 403 || code === 429) return 'limited'
  return ms > SLOW_MS ? 'slow' : 'up'
}

async function probe(s) {
  const started = Date.now()
  try {
    const r = await fetch(s.url, {
      method: 'GET',
      redirect: 'follow',
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; SRMIST-status-concept/0.1)', accept: 'text/html,*/*;q=0.5' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    r.body?.cancel().catch(() => {}) // we only need the status line
    const ms = Date.now() - started
    return { id: s.id, state: classify({ code: r.status, ms }), code: r.status, ms }
  } catch (e) {
    return { id: s.id, state: 'down', code: null, ms: Date.now() - started, error: e?.name === 'TimeoutError' ? 'Timed out' : 'No answer' }
  }
}

export async function checkAll() {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.payload
  if (inflight) return inflight
  inflight = (async () => {
    const results = await Promise.all(SERVICES.map(probe))
    const at = Date.now()
    const services = SERVICES.map((s) => {
      const r = results.find((x) => x.id === s.id)
      const h = history.get(s.id)
      h.push({ t: at, s: r.state })
      if (h.length > KEEP) h.shift()
      return { id: s.id, group: s.group, name: s.name, blurb: s.blurb, url: s.url, state: r.state, code: r.code, ms: r.ms, error: r.error || null, recent: h.map((x) => x.s) }
    })
    const down = services.filter((s) => s.state === 'down').length
    const slow = services.filter((s) => s.state === 'slow').length
    const payload = { checkedAt: new Date(at).toISOString(), overall: down ? (down === services.length ? 'down' : 'partial') : slow ? 'slow' : 'up', services }
    cache = { at, payload }
    return payload
  })().finally(() => {
    inflight = null
  })
  return inflight
}

export async function handleStatus(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, { error: 'Method not allowed' })
  try {
    send(res, 200, await checkAll(), { 'Cache-Control': 'public, max-age=30, s-maxage=60' })
  } catch {
    send(res, 500, { error: 'Could not run the checks.' })
  }
}

/** Keeps history growing while the server runs, even when nobody has the page open. */
export function startStatusSampler(everyMs = 5 * 60_000) {
  const t = setInterval(() => checkAll().catch(() => {}), everyMs)
  t.unref?.()
  checkAll().catch(() => {})
}
