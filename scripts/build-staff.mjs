// Turns the crawled staff list (scripts/fetch-staff.mjs → staff-all.json + facets.json) into the compact file the
// Staff finder page loads: public/data/staff.json.
//   node scripts/build-staff.mjs [folder holding staff-all.json and facets.json]   (default: scripts/.staff-cache)
import fs from 'node:fs'
import path from 'node:path'
import { ROLES, roleOf } from '../src/lib/staffRoles.js'

const dir = path.resolve(process.argv[2] ?? 'scripts/.staff-cache')
const people = JSON.parse(fs.readFileSync(path.join(dir, 'staff-all.json'), 'utf8'))
const facets = JSON.parse(fs.readFileSync(path.join(dir, 'facets.json'), 'utf8'))

const tidy = (s) => s.replace(/^\((.*)\)$/, '$1').replace(/ - /g, ' – ').replace(/^formerly /i, 'Formerly ')
// only keep facet values somebody belongs to, sorted by name, and give every value a small index
const table = (key, list) => {
  const used = new Set(people.flatMap((p) => p[key]))
  const rows = list.filter(([id]) => used.has(id)).map(([id, name]) => [id, tidy(name)]).sort((a, b) => a[1].localeCompare(b[1]))
  return { rows, index: new Map(rows.map(([id], i) => [id, i])) }
}
const campuses = table('campus', facets.campus)
const colleges = table('college', facets.college)
const departments = table('department', facets.department)
const types = table('type', facets.facultyType)

const clean = (s) => String(s || '').replace(/\s+/g, ' ').trim()
const out = {
  updated: new Date().toISOString().slice(0, 10),
  source: 'https://www.srmist.edu.in/staff-finder/',
  campuses: campuses.rows.map(([, n], i) => [i, n]),
  colleges: colleges.rows.map(([, n], i) => [i, n]),
  departments: departments.rows.map(([, n], i) => [i, n]),
  types: types.rows.map(([, n], i) => [i, n]),
  roles: ROLES,
  // [name, profile slug, designation, research areas, photo path, role, campus[], college[], department[], type[]]
  people: people
    .filter((p) => p.name && p.href)
    .map((p) => [
      clean(p.name),
      p.href.replace(/^https?:\/\/[^/]+\/faculty\//, '').replace(/\/$/, ''),
      clean(p.desig),
      clean(p.spec),
      p.photo ? p.photo.replace(/^https?:\/\/[^/]+/, '') : null,
      roleOf(p.desig),
      p.campus.map((id) => campuses.index.get(id)).filter((i) => i != null),
      p.college.map((id) => colleges.index.get(id)).filter((i) => i != null),
      p.department.map((id) => departments.index.get(id)).filter((i) => i != null),
      p.type.map((id) => types.index.get(id)).filter((i) => i != null),
    ]),
}

fs.mkdirSync('public/data', { recursive: true })
fs.writeFileSync('public/data/staff.json', JSON.stringify(out))
const kb = Math.round(fs.statSync('public/data/staff.json').size / 1024)
const withDept = out.people.filter((p) => p[8].length).length
console.log(`${out.people.length} people, ${withDept} with a department, ${kb} kB → public/data/staff.json`)
