// Input rules for the content portal. Pure functions, tested in tests/portal-validate.test.js.
// Server-side is the real check; the browser form repeats the same limits so people see problems early.

export const DOMAIN = 'srmist.edu.in'

// One address, exactly one "@", and the domain must be exactly srmist.edu.in (no subdomain, no suffix, no query or path tricks).
const EMAIL = /^[a-z0-9._%+-]{1,64}@srmist\.edu\.in$/

/** The cleaned address, or null if it is not an srmist.edu.in address. */
export function srmistEmail(value) {
  if (typeof value !== 'string') return null
  const e = value.trim().toLowerCase()
  if (e.length > 90 || !EMAIL.test(e)) return null
  return e
}

/** The address list in APPROVER_EMAILS, as a Set of cleaned addresses (anything that is not srmist.edu.in is dropped). */
export const approverSet = (list = '') => new Set(String(list).split(/[\s,;]+/).map(srmistEmail).filter(Boolean))

const clean = (s, max) => (typeof s === 'string' ? s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').replace(/\r\n/g, '\n').trim().slice(0, max + 1) : '')
const DATE = /^\d{4}-\d{2}-\d{2}$/
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/
const validDate = (s) => DATE.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`)) && new Date(`${s}T00:00:00Z`).toISOString().startsWith(s)

/** Only http(s) links; no credentials in them. Returns the cleaned link, '' for none, or null if invalid. */
export function cleanLink(value) {
  const s = clean(value ?? '', 500)
  if (!s) return ''
  try {
    const u = new URL(s)
    if (!['http:', 'https:'].includes(u.protocol) || u.username || u.password || s.length > 500) return null
    return u.toString()
  } catch {
    return null
  }
}

/**
 * Validate a submission. Returns { ok: true, value } with exactly the fields the database stores,
 * or { ok: false, errors: { field: message } }.
 */
export function validateItem(input, today = new Date().toISOString().slice(0, 10)) {
  const errors = {}
  const type = input?.type
  if (type !== 'announcement' && type !== 'event') return { ok: false, errors: { type: 'Choose Announcement or Event.' } }
  const title = clean(input.title, 140)
  if (title.length < 3 || title.length > 140) errors.title = 'The title needs 3 to 140 characters.'
  const body = clean(type === 'event' ? input.description ?? input.body : input.body, 4000)
  if (body.length < 3 || body.length > 4000) errors[type === 'event' ? 'description' : 'body'] = 'This needs 3 to 4000 characters.'
  const link = cleanLink(type === 'event' ? input.registration_link ?? input.link : input.link)
  if (link === null) errors[type === 'event' ? 'registration_link' : 'link'] = 'Use a full link starting with http:// or https://.'

  const value = { type, title, body, link: link || null, expires_at: null, event_date: null, start_time: null, end_time: null, venue: null }
  if (type === 'announcement') {
    const exp = clean(input.expires_at ?? '', 10)
    if (exp) {
      if (!validDate(exp)) errors.expires_at = 'Use a date like 2026-12-31.'
      else if (exp < today) errors.expires_at = 'The expiry date cannot be in the past.'
      else value.expires_at = exp
    }
  } else {
    const date = clean(input.event_date, 10)
    if (!validDate(date)) errors.event_date = 'Use a date like 2026-12-31.'
    else if (date < today) errors.event_date = 'The event date cannot be in the past.'
    else value.event_date = date
    const start = clean(input.start_time, 5)
    const end = clean(input.end_time, 5)
    if (!TIME.test(start)) errors.start_time = 'Use a time like 09:30.'
    if (!TIME.test(end)) errors.end_time = 'Use a time like 16:30.'
    if (TIME.test(start) && TIME.test(end) && end <= start) errors.end_time = 'The end time must be after the start time.'
    value.start_time = TIME.test(start) ? start : null
    value.end_time = TIME.test(end) ? end : null
    const venue = clean(input.venue, 140)
    if (venue.length < 2 || venue.length > 140) errors.venue = 'Give the venue (2 to 140 characters).'
    else value.venue = venue
  }
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value }
}

/** A short rejection reason, or null if it is missing or too long. */
export function cleanReason(value) {
  const r = clean(value ?? '', 300)
  return r.length >= 3 && r.length <= 300 ? r : null
}

/** Make a CSV cell safe: quotes doubled, and a leading = + - @ or tab neutralised so spreadsheets never run it as a formula. */
export function csvCell(v) {
  let s = v === null || v === undefined ? '' : String(v)
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  return `"${s.replace(/"/g, '""')}"`
}
