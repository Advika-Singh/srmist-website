// The CMS's database layer, in memory: the same methods as repo-sql.js, used by the tests and by `DEMO_MEMORY=1` local runs.
// It is mixed into the portal's memory repo (server/portal/repo-memory.js) so it shares the same users. Nothing here persists.

export function cmsMemory({ users, clock = () => new Date() }) {
  const items = []
  const events = []
  const ids = { item: 0, event: 0 }
  const iso = () => clock().toISOString()
  const person = (id) => users.find((u) => u.id === id)
  const view = (it) => {
    const a = person(it.author_id)
    const r = person(it.reviewer_id)
    return { ...it, data: { ...it.data }, live_data: it.live_data ? { ...it.live_data } : null, author_name: a?.name, author_email: a?.email, reviewer_name: r?.name ?? null, reviewer_email: r?.email ?? null }
  }
  const find = (id) => items.find((x) => x.id === id)

  return {
    async cmsCreate({ type, slug, data, authorId }) {
      if (items.some((i) => i.type === type && i.slug === slug)) throw Object.assign(new Error('slug_taken'), { code: 'slug_taken' })
      const it = { id: ++ids.item, type, slug, status: 'draft', data, live_data: null, version: 1, author_id: authorId, reviewer_id: null, reject_reason: null, created_at: iso(), updated_at: iso(), published_at: null }
      items.push(it)
      return view(it)
    },
    async cmsGet(id) {
      const it = find(id)
      return it ? view(it) : null
    },
    async cmsSlugTaken(type, slug) {
      return items.some((i) => i.type === type && i.slug === slug)
    },
    async cmsList({ type, status, authorId, limit = 200 } = {}) {
      return items
        .filter((i) => (!type || i.type === type) && (!status || i.status === status) && (!authorId || i.author_id === authorId))
        .sort((a, b) => b.updated_at.localeCompare(a.updated_at) || b.id - a.id)
        .slice(0, limit)
        .map(view)
    },
    /** A saved change: new content, the status the caller chose, a new version, and any earlier review is cleared. */
    async cmsUpdate(id, { data, status }) {
      const it = find(id)
      Object.assign(it, { data, status, version: it.version + 1, updated_at: iso(), reviewer_id: null, reject_reason: null })
      return view(it)
    },
    /** liveData: undefined leaves the live copy alone, null takes it down, an object publishes it. */
    async cmsSetStatus(id, { status, reviewerId = null, reason = null, liveData, publishedAt }) {
      const it = find(id)
      if (reviewerId !== null && reviewerId === it.author_id) throw new Error('reviewer_is_author') // the rule the database enforces too
      Object.assign(it, { status, reviewer_id: reviewerId, reject_reason: reason, updated_at: iso() })
      if (liveData !== undefined) it.live_data = liveData
      if (publishedAt !== undefined) it.published_at = publishedAt
      return view(it)
    },
    async cmsPublicList(type, limit = 50) {
      return items
        .filter((i) => i.type === type && i.live_data && i.status !== 'archived')
        .sort((a, b) => String(b.published_at).localeCompare(String(a.published_at)) || b.id - a.id)
        .slice(0, limit)
        .map(view)
    },
    async cmsPublicGet(type, slug) {
      const it = items.find((i) => i.type === type && i.slug === slug && i.live_data && i.status !== 'archived')
      return it ? view(it) : null
    },

    async cmsAddEvent(e) {
      events.push({ id: ++ids.event, at: iso(), note: null, ...e })
    },
    async cmsEvents(itemId) {
      return events.filter((e) => e.item_id === itemId).sort((a, b) => b.id - a.id).map((e) => ({ ...e }))
    },
    /** Events are append-only: the real database refuses these, and so does this copy. */
    async cmsUpdateEvent() {
      throw new Error('content_events is append-only')
    },
    async cmsDeleteEvent() {
      throw new Error('content_events is append-only')
    },
  }
}
