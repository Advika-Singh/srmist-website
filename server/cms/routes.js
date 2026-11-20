// The headless CMS's HTTP routes. Mounted inside the portal router (server/portal/handlers.js), so it shares the sign-in, the CSRF check,
// the roles and the database. Two halves:
//   publicRoute  GET /api/public/content...      what the website reads: only live, published content, no names, no emails
//   portalRoute  /api/portal/content...          what staff use: create, edit, submit, then an approver (never the author) publishes
import { cleanReason } from '../portal/validate.js'
import { TYPES, typeList, slugFor, validateContent } from './schemas.js'

const PUBLIC_CACHE = { 'cache-control': 'public, max-age=60, stale-while-revalidate=300' }

const publicItem = (it) => ({ type: it.type, slug: it.slug, data: it.live_data, published_at: it.published_at })
const staffItem = (it) => ({
  id: it.id, type: it.type, slug: it.slug, status: it.status, data: it.data, live: Boolean(it.live_data), version: it.version,
  author: { name: it.author_name, email: it.author_email }, reviewer: it.reviewer_name ? { name: it.reviewer_name, email: it.reviewer_email } : null,
  reject_reason: it.reject_reason, created_at: it.created_at, updated_at: it.updated_at, published_at: it.published_at,
})
// where an item goes when someone saves a change to it: a live item goes back for review (the live copy stays up meanwhile)
const AFTER_EDIT = { draft: 'draft', rejected: 'draft', pending: 'pending', published: 'pending' }

export function createCms({ repo, json, readJson, limit, clock = () => new Date() }) {
  const log = (action, it, actor, note) =>
    repo.cmsAddEvent({ item_id: it.id, item_type: it.type, slug: it.slug, action, version: it.version, actor_id: actor.id, actor_name: actor.name, actor_email: actor.email, note: note ?? null, snapshot: it.data })

  async function publicRoute(req, res, path, url) {
    if (req.method !== 'GET') return json(res, 405, { error: 'Use GET.' })
    const m = path.match(/^\/api\/public\/content(?:\/([a-z][a-z0-9-]*)\/([a-z0-9][a-z0-9.-]*))?$/)
    if (!m) return json(res, 404, { error: 'Not found.' })
    if (m[1]) {
      if (!TYPES[m[1]]) return json(res, 404, { error: 'Not found.' })
      const it = await repo.cmsPublicGet(m[1], m[2])
      return it ? json(res, 200, { item: publicItem(it) }, PUBLIC_CACHE) : json(res, 404, { error: 'Not found.' })
    }
    const type = url.searchParams.get('type')
    if (!TYPES[type]) return json(res, 400, { error: `type must be one of: ${Object.keys(TYPES).join(', ')}.` })
    const rows = await repo.cmsPublicList(type, Number(url.searchParams.get('limit')) || 50)
    return json(res, 200, { items: rows.map(publicItem) }, PUBLIC_CACHE)
  }

  /** Called after the portal's sign-in and CSRF gate. Returns false when the route is not a content route. */
  async function portalRoute({ req, res, route, method, user, isApprover }) {
    if (!route.startsWith('/content')) return false
    const forbid = (msg) => json(res, 403, { error: msg })
    const body = async () => {
      try {
        return await readJson(req, 30_000)
      } catch {
        json(res, 400, { error: 'Invalid request.' })
        return null
      }
    }

    if (route === '/content/types' && method === 'GET') return json(res, 200, { types: typeList() })

    if (route === '/content' && method === 'GET') {
      const q = new URL(req.url, 'http://x').searchParams
      const type = TYPES[q.get('type')] ? q.get('type') : undefined
      const status = ['draft', 'pending', 'rejected', 'published', 'archived'].includes(q.get('status')) ? q.get('status') : undefined
      const mine = !isApprover || q.get('mine') === '1' // teachers only ever see their own
      const rows = await repo.cmsList({ type, status, authorId: mine ? user.id : undefined })
      return json(res, 200, { items: rows.map(staffItem) })
    }

    if (route === '/content' && method === 'POST') {
      if (!(await limit(res, `cms:${user.id}`, 3600, 120))) return true
      const b = await body()
      if (!b) return true
      const checked = validateContent(b.type, b.data)
      if (!checked.ok) return json(res, 422, { error: 'Please fix the highlighted fields.', fields: checked.errors })
      const base = slugFor(b.type, checked.value)
      let slug = base
      // a headline can repeat: the second "Open day" becomes open-day-2. A site-text key cannot repeat, so that is an error.
      for (let n = 2; await repo.cmsSlugTaken(b.type, slug); n++) {
        if (b.type === 'snippet' || n > 30) return json(res, 409, { error: 'An item with this name already exists.', fields: { [TYPES[b.type].slugFrom]: 'Already used. Choose another.' } })
        slug = `${base.slice(0, 56)}-${n}`
      }
      let it
      try {
        it = await repo.cmsCreate({ type: b.type, slug, data: checked.value, authorId: user.id })
      } catch (e) {
        if (e?.code === 'slug_taken') return json(res, 409, { error: 'An item with this name already exists.' })
        throw e
      }
      await log('created', it, user)
      return json(res, 201, { item: staffItem(it) })
    }

    const m = route.match(/^\/content\/(\d+)(?:\/(submit|publish|reject|unpublish|archive|history))?$/)
    if (!m) return json(res, 404, { error: 'Not found.' })
    const it = await repo.cmsGet(Number(m[1]))
    // an item that is not yours (and you are not an approver) looks exactly like one that does not exist
    if (!it || (!isApprover && it.author_id !== user.id)) return json(res, 404, { error: 'Not found.' })
    const own = it.author_id === user.id
    const action = m[2]

    if (!action && method === 'GET') return json(res, 200, { item: staffItem(it) })
    if (action === 'history' && method === 'GET') {
      const events = await repo.cmsEvents(it.id)
      return json(res, 200, { events: events.map((e) => ({ id: e.id, at: e.at, action: e.action, version: e.version, actor: { name: e.actor_name, email: e.actor_email }, note: e.note, snapshot: e.snapshot })) })
    }

    if (!action && method === 'PATCH') {
      if (it.status === 'archived') return json(res, 409, { error: 'Archived items cannot be edited.' })
      if (!(await limit(res, `cms:${user.id}`, 3600, 120))) return true
      const b = await body()
      if (!b) return true
      const checked = validateContent(it.type, b.data)
      if (!checked.ok) return json(res, 422, { error: 'Please fix the highlighted fields.', fields: checked.errors })
      if (it.type === 'snippet' && checked.value.key !== it.data.key) return json(res, 422, { error: 'The key cannot be changed.', fields: { key: 'Cannot be changed. Create a new item instead.' } })
      if (JSON.stringify(checked.value) === JSON.stringify(it.data)) return json(res, 200, { item: staffItem(it) })
      const out = await repo.cmsUpdate(it.id, { data: checked.value, status: AFTER_EDIT[it.status] ?? 'draft' })
      await log('edited', out, user)
      return json(res, 200, { item: staffItem(out) })
    }

    if (method !== 'POST') return json(res, 405, { error: 'Use POST.' })

    if (action === 'submit') {
      if (!['draft', 'rejected'].includes(it.status)) return json(res, 409, { error: 'Only a draft or a rejected item can be sent for review.' })
      const out = await repo.cmsSetStatus(it.id, { status: 'pending' })
      await log('submitted', out, user)
      return json(res, 200, { item: staffItem(out) })
    }

    if (action === 'publish' || action === 'reject') {
      if (!isApprover) return forbid('Approvers only.')
      if (own) return forbid('You cannot review your own item. Ask another approver.')
      if (it.status !== 'pending') return json(res, 409, { error: 'Only an item waiting for review can be published or rejected.' })
      if (action === 'publish') {
        const now = clock().toISOString()
        const out = await repo.cmsSetStatus(it.id, { status: 'published', reviewerId: user.id, liveData: it.data, publishedAt: it.published_at ?? now })
        await log('published', out, user)
        return json(res, 200, { item: staffItem(out) })
      }
      const b = await body()
      if (!b) return true
      const reason = cleanReason(b.reason)
      if (!reason) return json(res, 422, { error: 'Give a short reason (3 to 300 characters).', fields: { reason: 'Required.' } })
      const out = await repo.cmsSetStatus(it.id, { status: 'rejected', reviewerId: user.id, reason })
      await log('rejected', out, user, reason)
      return json(res, 200, { item: staffItem(out) })
    }

    if (action === 'unpublish') {
      if (!isApprover) return forbid('Approvers only.')
      if (!it.live_data) return json(res, 409, { error: 'This item is not live.' })
      const out = await repo.cmsSetStatus(it.id, { status: 'draft', liveData: null }) // off the public site at once, back to a draft
      await log('unpublished', out, user)
      return json(res, 200, { item: staffItem(out) })
    }

    if (action === 'archive') {
      if (it.status === 'archived') return json(res, 409, { error: 'Already archived.' })
      if (!isApprover && !(own && ['draft', 'rejected'].includes(it.status))) return forbid('Only an approver can archive an item that was sent for review or is live.')
      const out = await repo.cmsSetStatus(it.id, { status: 'archived', liveData: null })
      await log('archived', out, user)
      return json(res, 200, { item: staffItem(out) })
    }

    return json(res, 404, { error: 'Not found.' })
  }

  return { publicRoute, portalRoute }
}
