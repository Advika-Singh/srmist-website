// Wires the portal to a database. With DATABASE_URL (Neon, added through the Vercel Marketplace) it uses Postgres.
// With DEMO_MEMORY=1 and no DATABASE_URL it uses a seeded in-memory copy, handy for local demos; nothing persists.
import { createPortal } from './handlers.js'
import { memoryRepo } from './repo-memory.js'
import { seed } from './seed.js'
import { sqlRepo } from './repo-sql.js'

let cached = null

export function portalFromEnv(env = process.env) {
  if (cached) return cached
  let repo
  const dbUrl = env.DATABASE_URL || env.POSTGRES_URL
  if (dbUrl) repo = sqlRepo(dbUrl)
  else if (env.DEMO_MEMORY === '1') {
    repo = memoryRepo()
    seed(repo).catch((e) => console.error('[portal] seed failed', e?.message))
  } else {
    // no database: every portal route answers 503 instead of crashing
    cached = async (req, res) => {
      res.statusCode = 503
      res.setHeader('content-type', 'application/json; charset=utf-8')
      res.end(JSON.stringify({ error: 'The portal database is not connected yet.' }))
    }
    return cached
  }
  cached = createPortal({ repo, env })
  return cached
}
