// The content portal's API. One router for /api/portal/* and /api/public/*, used by the Vercel functions, the production server
// and the dev server. Every protected route starts with the same gate: a valid session, then (for changes) CSRF, then the role.
import { csrfOk, clearCookie, hash, newToken, readCookie, SESSION_DAYS, sessionCookie, verifyGoogleIdToken } from './auth.js'
import { approverSet, cleanReason, csvCell, srmistEmail, validateItem } from './validate.js'

const json = (res, status, body, headers = {}) => {
  res.statusCode = status
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.setHeader('cache-control', 'no-store')
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v)
  res.end(JSON.stringify(body))
}
const istToday = (now = new Date()) => new Date(now.getTime() + 5.5 * 3_600_000).toISOString().slice(0, 10)

async function readJson(req, max = 20_000) {
  if (req.body !== undefined) return typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body ?? {}
  const chunks = []
  let size = 0
  for await (const c of req) {
    size += c.length
    if (size > max) throw Object.assign(new Error('too large'), { status: 413 })
    chunks.push(c)
  }
  return chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}
}

const person = (i) => ({
  id: i.id, type: i.type, title: i.title, body: i.body, link: i.link, expires_at: i.expires_at, event_date: i.event_date, start_time: i.start_time, end_time: i.end_time,
  venue: i.venue, status: i.status, reject_reason: i.reject_reason, created_at: i.created_at, reviewed_at: i.reviewed_at, live_at: i.live_at,
  submitter: { name: i.submitter_name, email: i.submitter_email }, reviewer: i.reviewer_name ? { name: i.reviewer_name, email: i.reviewer_email } : null,
})
// what the public site may see: no names, no emails, no review details
const publicView = (i) => ({ id: i.id, type: i.type, title: i.title, body: i.body, link: i.link, expires_at: i.expires_at, event_date: i.event_date, start_time: i.start_time, end_time: i.end_time, venue: i.venue })

const logEntry = (action, item, actor, extra = {}) => ({
  action, item_id: item.id, item_type: item.type, item_title: item.title,
  submitter_id: item.submitter_id, submitter_name: item.submitter_name, submitter_email: item.submitter_email,
  actor_id: actor.id, actor_name: actor.name, actor_email: actor.email, ...extra,
})

export function createPortal({ repo, env = process.env, fetchImpl = fetch, clock = () => new Date() }) {
  const approvers = approverSet(env.APPROVER_EMAILS)
  const secure = env.PORTAL_INSECURE_COOKIES !== '1' // only local http development turns this off
  const roleFor = (email) => (approvers.has(email) ? 'approver' : 'teacher')

  async function startSession(res, user) {
    const token = newToken()
    const csrf = newToken()
    await repo.createSession({ tokenHash: hash(token), userId: user.id, csrf, expiresAt: new Date(clock().getTime() + SESSION_DAYS * 86_400_000).toISOString() })
    res.setHeader('set-cookie', sessionCookie(token, { secure }))
    return { user: { id: user.id, name: user.name, email: user.email, role: user.role }, csrf }
  }

  /** The session behind the request, or null. */
  async function sessionOf(req) {
    const token = readCookie(req)
    return token ? repo.getSession(hash(token)) : null
  }

  const ipOf = (req) => (env.TRUST_PROXY === '1' ? String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() : '') || req.socket?.remoteAddress || 'local'

  async function limit(res, key, windowSec, max) {
    const hit = await repo.rateHit(key, windowSec, max)
    if (!hit.ok) {
      json(res, 429, { error: 'Too many attempts. Please wait a few minutes.' }, { 'retry-after': String(windowSec) })
      return false
    }
    return true
  }

  async function handle(req, res) {
    const url = new URL(req.url, 'http://x')
    const path = url.pathname.replace(/\/+$/, '')
    const method = req.method
    const host = req.headers.host
    const today = istToday(clock())

    // ---------- public: approved, unexpired items only ----------
    if (path === '/api/public/items') {
      if (method !== 'GET') return json(res, 405, { error: 'Use GET.' })
      const type = url.searchParams.get('type')
      if (type !== 'event' && type !== 'announcement') return json(res, 400, { error: 'type must be event or announcement.' })
      const rows = await repo.publicItems(type, today)
      res.setHeader('cache-control', 'public, max-age=60, stale-while-revalidate=300')
      res.statusCode = 200
      res.setHeader('content-type', 'application/json; charset=utf-8')
      return res.end(JSON.stringify({ items: rows.map(publicView) }))
    }

    if (!path.startsWith('/api/portal')) return json(res, 404, { error: 'Not found.' })
    const route = path.slice('/api/portal'.length) || '/'

    if (route === '/config' && method === 'GET') return json(res, 200, { googleClientId: env.GOOGLE_CLIENT_ID || '', demo: env.DEMO_MODE === '1', domain: 'srmist.edu.in' })

    // ---------- login ----------
    if (route === '/login') {
      if (method !== 'POST') return json(res, 405, { error: 'Use POST.' })
      if (!(await limit(res, `login:${ipOf(req)}`, 600, 10))) return
      let body
      try {
        body = await readJson(req)
      } catch {
        return json(res, 400, { error: 'Invalid request.' })
      }
      // The demo sign-in exists only when DEMO_MODE=1, for presentations. It still goes through the same domain rule.
      if (body.demo !== undefined) {
        if (env.DEMO_MODE !== '1') return json(res, 403, { error: 'Demo sign-in is switched off.' })
        const email = body.demo === 'approver' ? 'demo.approver@srmist.edu.in' : 'demo.teacher@srmist.edu.in'
        const user = await repo.upsertUser({ email, name: body.demo === 'approver' ? 'Demo Approver' : 'Demo Teacher', role: body.demo === 'approver' ? 'approver' : 'teacher' })
        return json(res, 200, await startSession(res, user))
      }
      const proof = await verifyGoogleIdToken(body.credential, env, fetchImpl)
      if (proof.error === 'not_configured') return json(res, 503, { error: 'Sign-in is not configured yet.' })
      if (proof.error === 'unavailable') return json(res, 502, { error: 'Google could not be reached. Try again.' })
      if (proof.error) return json(res, 403, { error: 'Only verified @srmist.edu.in accounts can sign in.' })
      const user = await repo.upsertUser({ email: proof.email, name: proof.name, role: roleFor(proof.email) }) // the role is decided here, never by the client
      return json(res, 200, await startSession(res, user))
    }

    // ---------- everything below needs a session ----------
    const session = await sessionOf(req)
    if (!session) return json(res, 401, { error: 'Please sign in.' })
    const user = session.user
    const isApprover = user.role === 'approver' && srmistEmail(user.email) !== null
    const needApprover = () => {
      if (!isApprover) {
        json(res, 403, { error: 'Approvers only.' })
        return false
      }
      return true
    }
    const changes = method !== 'GET'
    if (changes && !csrfOk(req, session, host)) return json(res, 403, { error: 'Security check failed. Reload the page and try again.' })

    if (route === '/me' && method === 'GET') return json(res, 200, { user: { id: user.id, name: user.name, email: user.email, role: user.role }, csrf: session.csrf })

    if (route === '/logout' && method === 'POST') {
      await repo.deleteSession(hash(readCookie(req)))
      res.setHeader('set-cookie', clearCookie({ secure }))
      return json(res, 200, { ok: true })
    }

    // ---------- submissions (teachers and approvers) ----------
    if (route === '/items' && method === 'POST') {
      if (!(await limit(res, `submit:${user.id}`, 3600, 20))) return
      let body
      try {
        body = await readJson(req)
      } catch {
        return json(res, 400, { error: 'Invalid request.' })
      }
      const checked = validateItem(body, today)
      if (!checked.ok) return json(res, 422, { error: 'Please fix the highlighted fields.', fields: checked.errors })
      const item = await repo.createItem(checked.value, user.id)
      await repo.addLog(logEntry('submitted', item, user))
      return json(res, 201, { item: person(item) })
    }

    if (route === '/my-items' && method === 'GET') return json(res, 200, { items: (await repo.myItems(user.id)).map(person) })

    let m = route.match(/^\/items\/(\d+)\/withdraw$/)
    if (m && method === 'POST') {
      const item = await repo.getItem(Number(m[1]))
      if (!item || item.submitter_id !== user.id) return json(res, 404, { error: 'Not found.' })
      if (item.status !== 'pending') return json(res, 409, { error: 'Only pending items can be withdrawn.' })
      const out = await repo.setStatus(item.id, { status: 'withdrawn' })
      await repo.addLog(logEntry('withdrawn', out, user))
      return json(res, 200, { item: person(out) })
    }

    // ---------- approvals (approvers only) ----------
    if (route === '/queue' && method === 'GET') {
      if (!needApprover()) return
      return json(res, 200, { items: (await repo.queue()).map(person) })
    }

    m = route.match(/^\/items\/(\d+)\/(approve|reject)$/)
    if (m && method === 'POST') {
      if (!needApprover()) return
      const item = await repo.getItem(Number(m[1]))
      if (!item) return json(res, 404, { error: 'Not found.' })
      if (item.submitter_id === user.id) return json(res, 403, { error: 'You cannot review your own submission. Ask another approver.' })
      if (item.status !== 'pending') return json(res, 409, { error: 'This item has already been reviewed.' })
      const now = clock().toISOString()
      if (m[2] === 'approve') {
        const out = await repo.setStatus(item.id, { status: 'approved', reviewerId: user.id, reviewedAt: now, liveAt: now })
        await repo.addLog(logEntry('approved', out, user, { approved_at: now, live_at: now }))
        return json(res, 200, { item: person(out) })
      }
      let body
      try {
        body = await readJson(req)
      } catch {
        return json(res, 400, { error: 'Invalid request.' })
      }
      const reason = cleanReason(body.reason)
      if (!reason) return json(res, 422, { error: 'Give a short reason (3 to 300 characters).', fields: { reason: 'Required.' } })
      const out = await repo.setStatus(item.id, { status: 'rejected', reviewerId: user.id, reason, reviewedAt: now })
      await repo.addLog(logEntry('rejected', out, user, { details: { reason } }))
      return json(res, 200, { item: person(out) })
    }

    m = route.match(/^\/items\/(\d+)$/)
    if (m && method === 'PATCH') {
      if (!needApprover()) return
      const item = await repo.getItem(Number(m[1]))
      if (!item) return json(res, 404, { error: 'Not found.' })
      if (item.status !== 'pending') return json(res, 409, { error: 'Only pending items can be edited.' })
      let body
      try {
        body = await readJson(req)
      } catch {
        return json(res, 400, { error: 'Invalid request.' })
      }
      const checked = validateItem({ ...body, type: item.type }, '0000-01-01') // dates already accepted at submission may be edited
      if (!checked.ok) return json(res, 422, { error: 'Please fix the highlighted fields.', fields: checked.errors })
      const before = {}
      const after = {}
      for (const k of ['title', 'body', 'link', 'expires_at', 'event_date', 'start_time', 'end_time', 'venue']) {
        if ((item[k] ?? null) !== (checked.value[k] ?? null)) {
          before[k] = item[k] ?? null
          after[k] = checked.value[k] ?? null
        }
      }
      if (!Object.keys(after).length) return json(res, 200, { item: person(item) })
      const out = await repo.updateItem(item.id, checked.value)
      await repo.addLog(logEntry('edited', out, user, { details: { before, after } }))
      return json(res, 200, { item: person(out) })
    }

    // ---------- logs (approvers only; read-only, there is no write route) ----------
    if ((route === '/logs' || route === '/logs.csv') && method === 'GET') {
      if (!needApprover()) return
      const q = Object.fromEntries(url.searchParams)
      const toIso = (d, end) => (/^\d{4}-\d{2}-\d{2}$/.test(d || '') ? new Date(`${d}T${end ? '23:59:59.999' : '00:00:00'}+05:30`).toISOString() : undefined) // dates are IST days
      const rows = await repo.queryLogs({
        from: toIso(q.from, false), to: toIso(q.to, true),
        type: ['announcement', 'event'].includes(q.type) ? q.type : undefined,
        action: ['submitted', 'approved', 'rejected', 'edited', 'withdrawn'].includes(q.action) ? q.action : undefined,
        submitter: q.submitter ? String(q.submitter).slice(0, 80) : undefined,
        approver: q.approver ? String(q.approver).slice(0, 80) : undefined,
        limit: route === '/logs.csv' ? 2000 : 300,
      })
      if (route === '/logs') return json(res, 200, { logs: rows })
      const ist = (iso) => (iso ? new Date(new Date(iso).getTime() + 5.5 * 3_600_000).toISOString().replace('T', ' ').slice(0, 19) : '')
      const head = ['Timestamp (IST)', 'Item type', 'Item title', 'Posted by', 'Posted by email', 'Action', 'Acted by', 'Acted by email', 'Approved at (IST)', 'Went live at (IST)', 'Details']
      const lines = rows.map((l) => [ist(l.at), l.item_type, l.item_title, l.submitter_name, l.submitter_email, l.action, l.actor_name, l.actor_email, ist(l.approved_at), ist(l.live_at), JSON.stringify(l.details ?? {})].map(csvCell).join(','))
      res.statusCode = 200
      res.setHeader('content-type', 'text/csv; charset=utf-8')
      res.setHeader('content-disposition', 'attachment; filename="portal-logs.csv"')
      res.setHeader('cache-control', 'no-store')
      return res.end(`﻿${[head.map(csvCell).join(','), ...lines].join('\r\n')}\r\n`)
    }

    return json(res, 404, { error: 'Not found.' })
  }

  return async function portalHandler(req, res) {
    try {
      await handle(req, res)
    } catch (e) {
      console.error('[portal]', e?.message)
      if (!res.writableEnded) json(res, 500, { error: 'Something went wrong. Please try again.' })
    }
  }
}
