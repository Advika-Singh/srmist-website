// The CMS's database layer on Neon Postgres (the same database as the portal). Every value goes in as a numbered parameter.
// `run` and `one` are the portal repo's own query helpers, so the sleeping-database retry is shared.

const SELECT = `
  SELECT c.*, a.name AS author_name, a.email AS author_email, r.name AS reviewer_name, r.email AS reviewer_email
  FROM content_items c JOIN portal_users a ON a.id = c.author_id LEFT JOIN portal_users r ON r.id = c.reviewer_id`

export function cmsSql({ run, one }) {
  const get = (id) => one(`${SELECT} WHERE c.id = $1`, [id])
  return {
    async cmsCreate({ type, slug, data, authorId }) {
      try {
        const row = await one('INSERT INTO content_items (type, slug, data, author_id) VALUES ($1,$2,$3,$4) RETURNING id', [type, slug, JSON.stringify(data), authorId])
        return get(row.id)
      } catch (e) {
        if (e?.code === '23505') throw Object.assign(new Error('slug_taken'), { code: 'slug_taken' }) // the (type, slug) unique rule
        throw e
      }
    },
    cmsGet: get,
    async cmsSlugTaken(type, slug) {
      return Boolean(await one('SELECT 1 AS x FROM content_items WHERE type = $1 AND slug = $2', [type, slug]))
    },
    async cmsList({ type, status, authorId, limit = 200 } = {}) {
      const where = []
      const p = []
      const add = (cond, v) => {
        p.push(v)
        where.push(cond.replace('?', `$${p.length}`))
      }
      if (type) add('c.type = ?', type)
      if (status) add('c.status = ?', status)
      if (authorId) add('c.author_id = ?', authorId)
      p.push(Math.min(Number(limit) || 200, 500))
      return run(`${SELECT} ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY c.updated_at DESC, c.id DESC LIMIT $${p.length}`, p)
    },
    async cmsUpdate(id, { data, status }) {
      await run('UPDATE content_items SET data=$2, status=$3, version=version+1, updated_at=now(), reviewer_id=NULL, reject_reason=NULL WHERE id=$1', [id, JSON.stringify(data), status])
      return get(id)
    },
    async cmsSetStatus(id, { status, reviewerId = null, reason = null, liveData, publishedAt }) {
      const sets = ['status=$2', 'reviewer_id=$3', 'reject_reason=$4', 'updated_at=now()']
      const p = [id, status, reviewerId, reason]
      if (liveData !== undefined) {
        p.push(liveData === null ? null : JSON.stringify(liveData))
        sets.push(`live_data=$${p.length}`)
      }
      if (publishedAt !== undefined) {
        p.push(publishedAt)
        sets.push(`published_at=$${p.length}`)
      }
      await run(`UPDATE content_items SET ${sets.join(', ')} WHERE id=$1`, p) // the database refuses a reviewer who is the author
      return get(id)
    },
    async cmsPublicList(type, limit = 50) {
      return run(`${SELECT} WHERE c.type = $1 AND c.live_data IS NOT NULL AND c.status <> 'archived' ORDER BY c.published_at DESC NULLS LAST, c.id DESC LIMIT $2`, [type, Math.min(Number(limit) || 50, 200)])
    },
    async cmsPublicGet(type, slug) {
      return one(`${SELECT} WHERE c.type = $1 AND c.slug = $2 AND c.live_data IS NOT NULL AND c.status <> 'archived'`, [type, slug])
    },

    async cmsAddEvent(e) {
      await run(
        `INSERT INTO content_events (item_id,item_type,slug,action,version,actor_id,actor_name,actor_email,note,snapshot) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [e.item_id, e.item_type, e.slug, e.action, e.version, e.actor_id, e.actor_name, e.actor_email, e.note ?? null, JSON.stringify(e.snapshot ?? null)],
      )
    },
    async cmsEvents(itemId) {
      return run('SELECT * FROM content_events WHERE item_id = $1 ORDER BY id DESC LIMIT 200', [itemId])
    },
  }
}
