// /api/complaints — submit an issue and follow it with a reference number.
//
//   POST  { category, subject, description, place?, name?, contact?, consent? }  ->  { ref, status, ... }
//   GET   ?ref=SRM-XXXX-XXXX                                                   ->  status + timeline (never personal details)
//   PATCH { ref, status, note }  with  Authorization: Bearer <COMPLAINTS_ADMIN_TOKEN>  ->  staff move an issue along
//
// This is a working prototype. It is NOT connected to any SRMIST system: issues are stored on this server
// (server/data/complaints.json) and only move forward when someone with the admin token updates them.
// Set COMPLAINTS_WEBHOOK_URL to also forward each new issue to Slack, a Zapier flow, a CRM, etc.
//
// Defences: same-origin + custom header (CSRF), JSON only, size cap, strict validation, honeypot, per-IP rate
// limits on both submitting and looking up, unguessable references, and personal details are never sent back.

import { randomInt, timingSafeEqual } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { sameOrigin } from './security.js'
import { clean, clientIp, makeLimiter, readJson, send } from './util.js'

export const CATEGORIES = [
  'Portal or website problem',
  'Fees or payments',
  'Examinations & results',
  'Hostel & food',
  'Transport',
  'Academics & faculty',
  'Accessibility barrier',
  'Harassment or safety',
  'Other',
]
export const STATUSES = ['Received', 'In review', 'Assigned', 'Resolved', 'Closed']

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789' // no I, L, O, 0, 1
const MAX_ITEMS = 5000
const submitLimited = makeLimiter(5, 10 * 60_000)
const lookupLimited = makeLimiter(30, 10 * 60_000)

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
let store = null // { items: { [ref]: record } }
let file = null
let persistent = false

function load(env) {
  if (store) return
  const dir = env.COMPLAINTS_DIR || join(ROOT, 'server', 'data')
  for (const d of [dir, join(tmpdir(), 'srmist-home')]) {
    try {
      mkdirSync(d, { recursive: true })
      file = join(d, 'complaints.json')
      store = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : { items: {} }
      persistent = d === dir
      return
    } catch {
      /* try the next folder */
    }
  }
  store = { items: {} }
  file = null
}

function save() {
  if (!file) return
  try {
    writeFileSync(file + '.tmp', JSON.stringify(store))
    renameSync(file + '.tmp', file) // swap in one step so a crash never leaves half a file
  } catch {
    persistent = false
  }
}

function newRef() {
  const pick = () => Array.from({ length: 4 }, () => ALPHABET[randomInt(ALPHABET.length)]).join('')
  for (let i = 0; i < 20; i++) {
    const ref = `SRM-${pick()}-${pick()}`
    if (!store.items[ref]) return ref
  }
  throw new Error('no free reference')
}

const normRef = (v) => clean(v, 16).toUpperCase().replace(/\s+/g, '')
const REF_RE = /^SRM-[A-Z2-9]{4}-[A-Z2-9]{4}$/

/** Returns { ok, value } or { ok:false, errors }. Exported so it can be tested. */
export function validate(body) {
  const errors = {}
  const category = clean(body.category, 40)
  const subject = clean(body.subject, 100)
  const description = clean(body.description, 1500)
  const place = clean(body.place, 100)
  const name = clean(body.name, 80)
  const contact = clean(body.contact, 120)
  if (!CATEGORIES.includes(category)) errors.category = 'Choose a category from the list.'
  if (subject.length < 4) errors.subject = 'Give the issue a short title (at least 4 characters).'
  if (description.length < 20) errors.description = 'Tell us a little more (at least 20 characters) so the right team can act.'
  if (contact) {
    const digits = contact.replace(/[\s()+-]/g, '')
    const isEmail = /^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/.test(contact)
    const isPhone = /^\d{10,13}$/.test(digits)
    if (!isEmail && !isPhone) errors.contact = 'Enter a valid email address or mobile number, or leave it empty.'
    else if (body.consent !== true) errors.consent = 'Tick the box if you want to be contacted about this issue.'
  }
  if (Object.keys(errors).length) return { ok: false, errors }
  return { ok: true, value: { category, subject, description, place, name, contact } }
}

/** What anyone holding the reference may see. No name, no contact details, no free-text description. */
const publicView = (r) => ({
  ref: r.ref,
  category: r.category,
  subject: r.subject,
  status: r.status,
  createdAt: r.createdAt,
  updatedAt: r.updatedAt,
  timeline: r.timeline,
  stored: persistent ? 'disk' : 'memory',
})

function safeEqual(a, b) {
  const x = Buffer.from(String(a))
  const y = Buffer.from(String(b))
  return x.length === y.length && timingSafeEqual(x, y)
}

export async function handleComplaints(req, res, env = process.env) {
  load(env)
  const ip = clientIp(req, env)
  const url = new URL(req.url, 'http://x')

  if (req.method === 'GET') {
    if (lookupLimited(ip)) return send(res, 429, { error: 'Too many look-ups. Please wait a few minutes.' })
    const ref = normRef(url.searchParams.get('ref'))
    if (!REF_RE.test(ref)) return send(res, 400, { error: 'That does not look like a reference number. It looks like SRM-7K4Q-X9MD.' })
    const r = store.items[ref]
    if (!r) return send(res, 404, { error: 'No issue found with that reference. Check it and try again.' })
    return send(res, 200, publicView(r))
  }

  if (req.method === 'PATCH') {
    const token = env.COMPLAINTS_ADMIN_TOKEN
    const given = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '')
    if (!token || !safeEqual(given, token)) return send(res, 401, { error: 'Not authorised.' })
    let body
    try {
      body = await readJson(req)
    } catch (e) {
      return send(res, e.status || 400, { error: e.message || 'Bad request.' })
    }
    const ref = normRef(body.ref)
    const r = store.items[ref]
    if (!r) return send(res, 404, { error: 'No issue found with that reference.' })
    if (!STATUSES.includes(body.status)) return send(res, 422, { error: `status must be one of: ${STATUSES.join(', ')}` })
    const now = new Date().toISOString()
    r.status = body.status
    r.updatedAt = now
    r.timeline.push({ status: body.status, at: now, note: clean(body.note, 300) })
    save()
    return send(res, 200, publicView(r))
  }

  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' })
  if (!sameOrigin(req)) return send(res, 403, { error: 'Cross-site requests are not allowed.' })
  if (req.headers['x-requested-with'] !== 'srm-web') return send(res, 403, { error: 'Missing request header.' })
  if (submitLimited(ip)) return send(res, 429, { error: 'Too many reports from this connection. Please try again in a few minutes.' })

  let body
  try {
    body = await readJson(req)
  } catch (e) {
    return send(res, e.status || 400, { error: e.message || 'Bad request.' })
  }
  if (body.website) return send(res, 200, { ref: 'SRM-XXXX-XXXX', status: 'Received', timeline: [] }) // honeypot: bots fill the hidden field
  const v = validate(body)
  if (!v.ok) return send(res, 422, { error: 'Please check the form.', errors: v.errors })
  if (Object.keys(store.items).length >= MAX_ITEMS) return send(res, 503, { error: 'The tracker is full right now. Please use the official channels listed on this page.' })

  const now = new Date().toISOString()
  const record = {
    ref: newRef(),
    ...v.value,
    status: 'Received',
    createdAt: now,
    updatedAt: now,
    timeline: [{ status: 'Received', at: now, note: 'Your issue has been logged.' }],
  }
  store.items[record.ref] = record
  save()

  if (env.COMPLAINTS_WEBHOOK_URL) {
    // Best effort: the issue is already saved, so a failing webhook does not fail the request.
    fetch(env.COMPLAINTS_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...record, receivedAt: now }),
      signal: AbortSignal.timeout(8000),
    }).catch(() => {})
  }
  console.log('[complaint]', record.ref, record.category)
  return send(res, 201, publicView(record))
}
