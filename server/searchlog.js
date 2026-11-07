// POST /api/search-log — one line per search or assistant answer, so the launch plan can be measured.
//
//   { q, lang, results, clicked, helpful? }
//
// Nothing is stored. Each event is written to the server log as a single JSON line (Vercel keeps these in its logs), with the
// query redacted of emails and phone numbers. Same defences as the enquiry endpoint: same-origin, custom header, JSON only,
// size cap, per-IP limit.

import { redact } from '../src/lib/searchStats.js'
import { sameOrigin } from './security.js'
import { clientIp, makeLimiter, readJson, send } from './util.js'

const LANGS = ['en', 'ta', 'hi']
const limited = makeLimiter(60, 10 * 60_000) // sixty events per ten minutes per address

/** Returns { ok: true, value } or { ok: false }. Exported for tests. */
export function validateEvent(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { ok: false }
  const value = {
    q: redact(body.q),
    lang: LANGS.includes(body.lang) ? body.lang : 'en',
    results: Math.min(999, Math.max(0, Number.parseInt(body.results, 10) || 0)),
    clicked: body.clicked === true,
  }
  if (typeof body.helpful === 'boolean') value.helpful = body.helpful
  return { ok: true, value }
}

export async function handleSearchLog(req, res, env = process.env) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' })
  if (!sameOrigin(req)) return send(res, 403, { error: 'Cross-site requests are not allowed.' })
  if (req.headers['x-requested-with'] !== 'srm-web') return send(res, 403, { error: 'Missing request header.' })
  if (limited(clientIp(req, env))) return send(res, 429, { error: 'Too many requests.' })
  let body
  try {
    body = await readJson(req, 1000)
  } catch (e) {
    return send(res, e.status || 400, { error: e.message || 'Bad request.' })
  }
  const v = validateEvent(body)
  if (!v.ok) return send(res, 422, { error: 'Invalid event.' })
  console.log('[search]', JSON.stringify(v.value))
  return send(res, 200, { ok: true })
}
