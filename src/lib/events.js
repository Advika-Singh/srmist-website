// Calendar logic for the events page. Pure and tested in tests/events.test.js.
import { addDays } from './ics.js'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const SHORT = MONTHS.map((m) => m.slice(0, 3))

/** Today's date in India, as YYYY-MM-DD. */
export const istToday = (now = new Date()) => new Date(now.getTime() + 5.5 * 3_600_000).toISOString().slice(0, 10)

/** Events whose last day has not passed, soonest first. */
export function upcoming(events, now = new Date()) {
  const today = istToday(now)
  return events.filter((e) => e.end >= today).sort((a, b) => a.start.localeCompare(b.start) || a.end.localeCompare(b.end))
}

const parts = (iso) => iso.split('-').map(Number) // [y, m, d]

/** "9 Dec 2026", "23–28 Nov 2026", "28 Nov – 2 Dec 2026" or "28 Dec 2026 – 3 Jan 2027". */
export function formatRange(start, end) {
  const [y1, m1, d1] = parts(start)
  const [y2, m2, d2] = parts(end)
  if (start === end) return `${d1} ${SHORT[m1 - 1]} ${y1}`
  if (y1 === y2 && m1 === m2) return `${d1}–${d2} ${SHORT[m1 - 1]} ${y1}`
  if (y1 === y2) return `${d1} ${SHORT[m1 - 1]} – ${d2} ${SHORT[m2 - 1]} ${y1}`
  return `${d1} ${SHORT[m1 - 1]} ${y1} – ${d2} ${SHORT[m2 - 1]} ${y2}`
}

/** "2026-12" for the month an event starts in. */
export const monthKey = (e) => e.start.slice(0, 7)

/** "December 2026" for a month key. */
export function monthLabel(key) {
  const [y, m] = key.split('-').map(Number)
  return `${MONTHS[m - 1]} ${y}`
}

/** The months that have events, in order. */
export const monthsOf = (events) => [...new Set(events.map(monthKey))].sort()

/** Events grouped by the month they start in: [[key, events[]], ...] in date order. */
export function groupByMonth(events) {
  const map = new Map()
  for (const e of events) map.set(monthKey(e), [...(map.get(monthKey(e)) ?? []), e])
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))
}

/** Days from `today` to the start of an event: negative once it has begun. */
export function daysUntil(start, today) {
  const t = (iso) => Date.UTC(...parts(iso).map((n, i) => (i === 1 ? n - 1 : n)))
  return Math.round((t(start) - t(today)) / 86_400_000)
}

/** The shape lib/ics.js wants: an all-day entry ending the day after the last day. */
export function toCalendarItem(e) {
  return {
    id: `event-${e.id}`,
    title: e.title,
    start: e.start,
    end: addDays(e.end, 1),
    tentative: false,
    url: e.href,
    note: e.staff ? `Time: ${e.time}. Venue: ${e.venue}. Posted by university staff through the SRMIST staff portal.${e.href ? ` Details: ${e.href}` : ''}` : `${e.time ? `Time on the official page: ${e.time}. ` : ''}Listed on the official SRMIST events page. Check the event page for changes before you travel: ${e.href}`,
  }
}

// Representative campus photos for the events rail. The university publishes no photo for these events, so each one gets a
// photo of the SRMIST campus that fits its subject (the page says so); nothing here claims to show the event itself.
const P = {
  tech: ['/srmist/tech-park.webp', '40% 50%'],
  lab: ['/srmist/labs.webp', '50% 40%'],
  research: ['/srmist/research.webp', '50% 40%'],
  people: ['/srmist/admission-india.webp', '50% 35%'],
  students: ['/srmist/students.webp', '50% 35%'],
  main: ['/srmist/campus-main-building.webp', '50% 50%'],
  pano: ['/srmist/campus-panorama.webp', '50% 50%'],
  lake: ['/srmist/campus-lakeview.webp', '50% 60%'],
  library: ['/srmist/library.webp', '50% 50%'],
}
// each subject has a few photos; `index` (the card's place in the row) rotates through them so neighbours differ
const SETS = {
  people: ['people', 'students'],
  lab: ['lab', 'research', 'library'],
  tech: ['tech', 'students', 'pano', 'main'],
  main: ['main', 'pano', 'lake'],
  other: ['lake', 'library', 'students', 'main'],
}

/** { img, pos } for an event, chosen from its title and rotated by its place in the row. */
export function photoFor(e, index = 0) {
  const t = e.title.toLowerCase()
  const set = /alumni/.test(t)
    ? SETS.people
    : /drosophila|karyotyp|water|energy|environment|chemical|summer school|molecule/.test(t)
      ? SETS.lab
      : /robot|ros 2|hackathon|cyber|programming|network|data science|computational|electrical|technoblizz|ai-|artificial/.test(t)
        ? SETS.tech
        : /conference|sustainable|higher education|winter school/.test(t)
          ? SETS.main
          : SETS.other
  const [img, pos] = P[set[index % set.length]]
  return { img, pos }
}
