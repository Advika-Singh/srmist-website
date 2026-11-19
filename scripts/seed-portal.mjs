// Fills the portal with demo people and sample items (see server/portal/seed.js). Run AFTER the migration:
//   node scripts/seed-portal.mjs            adds the sample data (skips if people already exist)
//   node scripts/seed-portal.mjs --force    adds it again
// The people are made-up addresses ending in @srmist.edu.in. Do not seed a production database that holds real submissions.
import { existsSync, readFileSync } from 'node:fs'
import { sqlRepo } from '../server/portal/repo-sql.js'
import { seed } from '../server/portal/seed.js'

for (const f of ['.env.local', '.env']) {
  if (!existsSync(f)) continue
  for (const line of readFileSync(f, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\r\n]*)"?\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
  }
}
const url = process.env.DATABASE_URL || process.env.POSTGRES_URL
if (!url) {
  console.error('DATABASE_URL is not set (see scripts/migrate-portal.mjs).')
  process.exit(1)
}
const repo = sqlRepo(url)
const existing = await repo.queue()
if (existing.length && !process.argv.includes('--force')) {
  console.log(`The database already has ${existing.length} pending item(s); not seeding. Use --force to add the samples anyway.`)
  process.exit(0)
}
await seed(repo)
console.log('seeded: 7 people (2 approvers + demo accounts), 12 items in every status, with their log rows')
