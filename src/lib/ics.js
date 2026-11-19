// Key admission dates and a calendar file (.ics, RFC 5545) built from them. Pure and tested in tests/ics.test.js.
// The dates come from data/srmjeee.js, which copies what SRMIST publishes; SRMIST marks them tentative, and so do we.
import { OFFICIAL, PHASES } from '../data/srmjeee.js'

const EXAM_DAYS = 2 // each phase is held over two days ("17–18 April 2027")

const pad = (n) => String(n).padStart(2, '0')
const compact = (iso) => iso.replaceAll('-', '')

/** The ISO date `days` after `iso` (calendar arithmetic in UTC, so it never slips a day). */
export function addDays(iso, days) {
  const [y, m, d] = iso.split('-').map(Number)
  const t = new Date(Date.UTC(y, m - 1, d + days))
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`
}

/** Every dated item we know, oldest first: { id, kind, title, start, end (exclusive), label, phase }. */
export function keyDates(phases = PHASES) {
  const out = []
  for (const p of phases) {
    out.push({ id: `srmjeee-p${p.n}-deadline`, kind: 'deadline', phase: p.n, title: `SRMJEEE Phase ${p.n}: last day to apply`, start: p.deadline, end: addDays(p.deadline, 1), label: p.deadlineLabel })
    out.push({ id: `srmjeee-p${p.n}-exam`, kind: 'exam', phase: p.n, title: `SRMJEEE Phase ${p.n} exam`, start: p.examStart, end: addDays(p.examStart, EXAM_DAYS), label: p.exam })
  }
  return out.sort((a, b) => a.start.localeCompare(b.start))
}

/** Items whose last day has not passed, judged by the date in India. */
export function upcoming(items, now = new Date()) {
  const today = new Date(now.getTime() + 5.5 * 3_600_000).toISOString().slice(0, 10)
  return items.filter((e) => e.end > today)
}

// RFC 5545 text: escape backslash, semicolon, comma and newlines.
const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')

// Lines longer than 75 octets must be folded; continuation lines start with a space.
function fold(line) {
  const bytes = new TextEncoder().encode(line)
  if (bytes.length <= 75) return line
  const parts = []
  let cur = ''
  let size = 0
  for (const ch of line) {
    const n = new TextEncoder().encode(ch).length
    const limit = parts.length ? 74 : 75
    if (size + n > limit) {
      parts.push(cur)
      cur = ''
      size = 0
    }
    cur += ch
    size += n
  }
  parts.push(cur)
  return parts.join('\r\n ')
}

/** A calendar file with one all-day event per item. `stamp` is when the file was made. */
export function toIcs(items, stamp = new Date()) {
  const dt = `${stamp.toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`
  const defaultNote = `Tentative: SRMIST may change this date. Confirm it on the official page: ${OFFICIAL.dates}`
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//SRMIST concept redesign//Key dates//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH']
  for (const e of items) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${e.id}@srmist-concept`,
      `DTSTAMP:${dt}`,
      `DTSTART;VALUE=DATE:${compact(e.start)}`,
      `DTEND;VALUE=DATE:${compact(e.end)}`,
      // an item may carry its own note and link, and say it is not tentative (events do); the SRMJEEE dates keep the defaults
      `SUMMARY:${esc(e.tentative === false ? e.title : `${e.title} (tentative)`)}`,
      `DESCRIPTION:${esc(e.note ?? defaultNote)}`,
      `URL:${e.url ?? OFFICIAL.apply}`,
      'TRANSP:TRANSPARENT',
      'END:VEVENT',
    )
  }
  lines.push('END:VCALENDAR')
  return `${lines.map(fold).join('\r\n')}\r\n`
}
