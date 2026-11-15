// Programme compare and saved shortlist. Pure functions, tested in tests/compare.test.js.
// Every value shown comes from data/programmes.js, data/srmjeee.js or an official link: nothing is made up here.
import { PROGRAMMES, programmeById } from '../data/programmes.js'
import { OFFICIAL, OTHER_EXAMS } from '../data/srmjeee.js'

export const MAX_COMPARE = 3
export const SHORTLIST_KEY = 'srm-shortlist'

const B = 'https://www.srmist.edu.in'
const exam = (code) => {
  const found = OTHER_EXAMS.find(([c]) => c === code)
  return found ? `${found[0]}, for ${found[1]}` : code
}

// The entrance exam SRMIST publishes for each field, and the field's page on the official site.
// Fields with no published exam in our data say so and point at the official admissions page instead.
const ROUTES = {
  engineering: { entrance: 'SRMJEEE, for B.Tech and M.Tech (Integrated)', guide: '/srmjeee', official: `${B}/college/college-of-engineering-technology/` },
  medicine: { entrance: exam('SRMJEEH'), official: `${B}/college/medicine-and-health-sciences/` },
  management: { entrance: exam('SRMJEEM'), official: `${B}/faculty-of-management/` },
  science: { official: `${B}/college/college-of-science-and-humanities/` },
  law: { entrance: exam('SRMJEEL'), official: 'https://law.srmist.edu.in/' },
  agriculture: { official: `${B}/department/college-of-agriculture-sciences/` },
}

export const NO_EXAM_TEXT = 'See the official admissions page'

/** Keep only known ids, drop repeats, and stop at the limit. */
export function cleanIds(ids, max = MAX_COMPARE) {
  const out = []
  for (const id of Array.isArray(ids) ? ids : []) {
    if (typeof id === 'string' && programmeById(id) && !out.includes(id)) out.push(id)
    if (out.length === max) break
  }
  return out
}

/** Add or remove one field. Adding past the limit changes nothing. */
export function toggleId(ids, id, max = MAX_COMPARE) {
  const cur = cleanIds(ids, max)
  if (cur.includes(id)) return cur.filter((x) => x !== id)
  if (!programmeById(id) || cur.length >= max) return cur
  return [...cur, id]
}

/** One column per chosen field, ready to render. */
export function columns(ids) {
  return cleanIds(ids).map((id) => {
    const p = programmeById(id)
    const r = ROUTES[id] ?? {}
    return {
      id,
      field: p.field,
      levels: p.levels,
      duration: p.duration.split(' · '),
      examples: p.examples.split(', '),
      entrance: r.entrance ?? NO_EXAM_TEXT,
      guide: r.guide ?? null,
      official: r.official ?? OFFICIAL.admissions,
      officialIsField: Boolean(r.official),
      apply: `/apply/programme?field=${encodeURIComponent(p.field)}`,
    }
  })
}

/** Read the ids from a ?fields=a,b query string. */
export const idsFromQuery = (search) => cleanIds((new URLSearchParams(search).get('fields') ?? '').split(','))

/** The shareable address for a selection. */
export const queryFor = (ids) => (cleanIds(ids).length ? `?fields=${cleanIds(ids).join(',')}` : '')

// Shortlist: a list of field ids kept in the visitor's own browser. `store` is localStorage or anything shaped like it.
export function readShortlist(store) {
  try {
    return cleanIds(JSON.parse(store.getItem(SHORTLIST_KEY) ?? '[]'), PROGRAMMES.length)
  } catch {
    return []
  }
}

export function toggleShortlist(store, id) {
  const next = toggleId(readShortlist(store), id, PROGRAMMES.length)
  try {
    store.setItem(SHORTLIST_KEY, JSON.stringify(next))
  } catch {
    /* storage can be blocked or full; the page still works for this visit */
  }
  return next
}

export function clearShortlist(store) {
  try {
    store.removeItem(SHORTLIST_KEY)
  } catch {
    /* nothing to clear */
  }
  return []
}
