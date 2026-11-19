// Creates the portal's tables in the Neon database. Reads DATABASE_URL from the environment or from .env.local / .env.
// Run:  node scripts/migrate-portal.mjs      (safe to run again: every statement is IF NOT EXISTS / OR REPLACE)
import { existsSync, readFileSync } from 'node:fs'
import { neon } from '@neondatabase/serverless'

function loadEnv() {
  for (const f of ['.env.local', '.env']) {
    if (!existsSync(f)) continue
    for (const line of readFileSync(f, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\r\n]*)"?\s*$/)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
    }
  }
}
loadEnv()
const url = process.env.DATABASE_URL || process.env.POSTGRES_URL
if (!url) {
  console.error('DATABASE_URL is not set. In Vercel: Storage > your Neon database > connect it to the project, then run `vercel env pull .env.local`.')
  process.exit(1)
}

/** Split SQL into statements, keeping $$ ... $$ function bodies whole. */
export function statements(sqlText) {
  const out = []
  let cur = ''
  let inDollar = false
  for (const line of sqlText.split('\n')) {
    if (!inDollar && /^\s*--/.test(line)) continue
    cur += `${line}\n`
    if ((line.match(/\$\$/g) || []).length % 2 === 1) inDollar = !inDollar
    if (!inDollar && /;\s*$/.test(line)) {
      out.push(cur.trim())
      cur = ''
    }
  }
  if (cur.trim()) out.push(cur.trim())
  return out
}

const sql = neon(url)
const file = new URL('../db/migrations/001_portal.sql', import.meta.url)
const list = statements(readFileSync(file, 'utf8'))
let n = 0
for (const stmt of list) {
  await sql.query(stmt)
  n++
}
console.log(`migration applied: ${n} statements`)
