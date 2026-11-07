// POST /api/enquiry — receives the call-back / enquiry forms (Admissions page and the chat assistant).
//
// Defences, in order: same-origin check, a custom header that a cross-site <form> cannot send (CSRF),
// JSON-only body with a size cap, strict field validation, a honeypot field, and a per-IP rate limit.
// Delivery: set ENQUIRY_WEBHOOK_URL (CRM, Slack, Zapier …) and each enquiry is forwarded there.
// Without it the enquiry is only logged on the server, and the response says so ({ delivered: false }).

import { sameOrigin } from './security.js'

const MAX_BODY = 4_000
const FIELDS = ['Engineering & Technology', 'Medicine & Health', 'Management', 'Science & Humanities', 'Law', 'Architecture', 'Agricultural Sciences', 'Hotel Management']
const LEVELS = ['Undergraduate', 'Postgraduate', 'Doctoral']

const hits = new Map()
function limited(ip) {
  const now = Date.now()
  const recent = (hits.get(ip) || []).filter((t) => now - t < 10 * 60_000)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) hits.clear()
  return recent.length > 5 // five enquiries per ten minutes per address
}

const send = (res, status, body) => {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(body))
}

const clean = (v, max) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max)

/** Returns { ok, value } or { ok:false, errors:{field:message} }. Exported for tests. */
export function validate(body) {
  const errors = {}
  const name = clean(body.name, 80)
  const phone = clean(body.phone, 20)
  const email = clean(body.email, 120)
  const field = clean(body.field, 60)
  const level = clean(body.level, 20)
  if (name.length < 2) errors.name = 'Please enter your name.'
  const digits = phone.replace(/[\s()+-]/g, '')
  if (phone && !/^\d{10,13}$/.test(digits)) errors.phone = 'Enter a valid phone number.'
  if (email && !/^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = 'Enter a valid email address.'
  if (!phone && !email) errors.contact = 'Give a phone number or an email so we can reply.'
  if (field && !FIELDS.includes(field)) errors.field = 'Choose a field from the list.'
  if (level && !LEVELS.includes(level)) errors.level = 'Choose a level from the list.'
  if (body.consent !== true) errors.consent = 'Please agree to be contacted.'
  if (Object.keys(errors).length) return { ok: false, errors }
  return { ok: true, value: { name, phone: digits, email, field, level, source: clean(body.source, 40) || 'web' } }
}

export async function handleEnquiry(req, res, env = process.env) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' })
  if (!sameOrigin(req)) return send(res, 403, { error: 'Cross-site requests are not allowed.' })
  if (req.headers['x-requested-with'] !== 'srm-web') return send(res, 403, { error: 'Missing request header.' })
  if (!/^application\/json\b/i.test(req.headers['content-type'] || '')) return send(res, 415, { error: 'Send JSON.' })

  const ip = (env.TRUST_PROXY && String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()) || req.socket?.remoteAddress || 'local'
  if (limited(ip)) return send(res, 429, { error: 'Too many requests. Please try again in a few minutes.' })

  let raw = ''
  try {
    if (req.body && typeof req.body === 'object') raw = JSON.stringify(req.body) // Vercel pre-parses the body
    else {
      for await (const chunk of req) {
        raw += chunk
        if (raw.length > MAX_BODY) return send(res, 413, { error: 'Request too large.' })
      }
    }
  } catch {
    return send(res, 400, { error: 'Bad request.' })
  }
  let body
  try {
    body = JSON.parse(raw || '{}')
  } catch {
    return send(res, 400, { error: 'Invalid JSON.' })
  }

  if (body.website) return send(res, 200, { ok: true, delivered: false }) // honeypot: bots fill the hidden field
  const v = validate(body)
  if (!v.ok) return send(res, 422, { error: 'Please check the form.', errors: v.errors })

  let delivered = false
  if (env.ENQUIRY_WEBHOOK_URL) {
    try {
      const r = await fetch(env.ENQUIRY_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...v.value, receivedAt: new Date().toISOString() }),
        signal: AbortSignal.timeout(8000),
      })
      delivered = r.ok
    } catch {
      delivered = false
    }
    if (!delivered) return send(res, 502, { error: 'We could not pass your request on. Please call +91 70 2645 2645.' })
  } else {
    console.log('[enquiry] (no ENQUIRY_WEBHOOK_URL set, not forwarded)', JSON.stringify({ ...v.value, phone: v.value.phone.replace(/\d(?=\d{3})/g, '•') }))
  }
  return send(res, 200, { ok: true, delivered })
}
