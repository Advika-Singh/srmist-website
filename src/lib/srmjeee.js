// Logic for the SRMJEEE page: the next application deadline, and a self-check against the published eligibility.
// Pure functions, tested in tests/srmjeee.test.js. The check only restates SRMIST's published rule; it decides nothing.
import { MIN_AGGREGATE, PHASES, THIRD_SUBJECT } from '../data/srmjeee.js'

const DAY = 86_400_000
const endOf = (iso) => new Date(`${iso}T23:59:59+05:30`) // a deadline lasts to the end of that day in India

/** The next phase whose application deadline has not passed, with whole days left (0 on the day itself). */
export function nextDeadline(now = new Date()) {
  for (const p of PHASES) {
    const end = endOf(p.deadline)
    if (now <= end) return { ...p, daysLeft: Math.max(0, Math.ceil((end - now) / DAY) - 1) }
  }
  return null
}

/**
 * input: { status: 'passed' | 'appearing' | '', aggregate: number (percent), subjects: string[] }
 * Returns one line per published criterion ({ ok: true | false | null, text }) and an overall result:
 *   'meets' every criterion is met, 'short' at least one is not met, 'unknown' something has not been answered yet.
 */
export function checkEligibility({ status, aggregate, subjects }) {
  const has = (s) => subjects.includes(s)
  const third = subjects.some((s) => THIRD_SUBJECT.includes(s))
  const answeredMarks = Number.isFinite(aggregate)
  const lines = [
    { ok: status ? true : null, text: 'Passed Class 12, or appearing in it this academic year' },
    { ok: !subjects.length ? null : has('Physics') && has('Mathematics'), text: 'Physics and Mathematics are both studied (compulsory)' },
    { ok: !subjects.length ? null : third, text: `At least one more of: ${THIRD_SUBJECT.join(', ')}` },
    { ok: !answeredMarks ? null : aggregate >= MIN_AGGREGATE, text: `At least ${MIN_AGGREGATE}% aggregate across the three subjects` },
  ]
  const result = lines.some((l) => l.ok === false) ? 'short' : lines.every((l) => l.ok === true) ? 'meets' : 'unknown'
  return { lines, result }
}
