// Short answers for the questions people type most: what a programme costs, how long it takes, and the last date to apply.
// Pure functions, tested in tests/answers.test.js. Fee figures come from data/fees.js and stay labelled illustrative
// until the official schedule replaces them; deadlines come from the SRMJEEE data.
import { FEES_ARE_ILLUSTRATIVE, FEE_PROGRAMMES } from '../data/fees.js'
import { PROGRAMMES } from '../data/programmes.js'
import { nextDeadline } from './srmjeee.js'

const norm = (q) =>
  String(q ?? '')
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/[^a-z0-9ऀ-෿]+/g, ' ')
    .trim()

// Words people use for each field, matched against the normalised query ("B.Tech CSE" becomes "btech cse").
const ALIASES = [
  ['engineering', /\b(btech|b tech|cse|ece|eee|mech|mechanical|civil|engineering|mtech)\b/],
  ['medicine', /\b(mbbs|medicine|medical)\b/],
  ['management', /\b(bba|mba|management)\b/],
  ['science', /\b(bsc|science|sciences)\b/],
  ['law', /\b(llb|llm|law)\b/],
  ['architecture', /\b(barch|march|architecture)\b/],
  ['agriculture', /\b(agri|agriculture)\b/],
  ['hotel', /\b(hotel|hospitality)\b/],
]

const CAMPUS = /\b(delhi|ncr|ghaziabad|ramapuram|vadapalani|trichy|tiruchirappalli|baburayanpettai|sonepat|sikkim|kattankulathur)\b/

const FEE = /\b(fee|fees|cost|costs|tuition|price|how much)\b/
const LENGTH = /\b(how long|duration|years|length|semesters)\b/
const DEADLINE = /\b(last date|deadline|apply by|closing date|due date)\b/

const rupees = (n) => `₹${n.toLocaleString('en-IN')}`

/**
 * answerFor('B.Tech CSE fees') -> { kind: 'fees' | 'duration' | 'deadline', title, body, href, illustrative } or null.
 * null means "no direct answer": the caller shows ordinary search results.
 */
export function answerFor(query, now = new Date()) {
  const q = norm(query)
  if (!q) return null

  if (DEADLINE.test(q)) {
    const d = nextDeadline(now)
    if (!d) return null
    const when = d.daysLeft === 0 ? 'today' : `${d.daysLeft} ${d.daysLeft === 1 ? 'day' : 'days'} left`
    return {
      kind: 'deadline',
      title: `SRMJEEE Phase ${d.n} application deadline`,
      body: `${d.deadlineLabel} (${when}). Dates are tentative; confirm on the official page.`,
      href: '/srmjeee',
      illustrative: false,
    }
  }

  const field = ALIASES.find(([, re]) => re.test(q))?.[0]
  if (!field) return null

  if (LENGTH.test(q)) {
    const p = PROGRAMMES.find((x) => x.id === field)
    if (!p) return null
    return { kind: 'duration', title: `${p.field}: programme length`, body: p.duration, href: `/apply/programme?field=${encodeURIComponent(p.field)}`, illustrative: false }
  }

  if (FEE.test(q)) {
    const f = FEE_PROGRAMMES.find((x) => x.id === field)
    if (!f) return null
    const campus = q.match(CAMPUS)?.[1]
    let body = `About ${rupees(f.tuition)} per year for ${f.label}, over ${f.years} years, before hostel and mess.`
    if (campus) body += ` This figure is not campus-specific: confirm the fee for the ${campus[0].toUpperCase()}${campus.slice(1)} campus with admissions.`
    if (FEES_ARE_ILLUSTRATIVE) body += ' Illustrative figure until the official fee schedule is added.'
    return { kind: 'fees', title: `${f.label}: tuition`, body, href: '/admissions', illustrative: FEES_ARE_ILLUSTRATIVE }
  }

  return null
}
