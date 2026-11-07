// Pure logic for the staff timetable prototype: a repeatable random weekly timetable per person, and who is where
// at a given moment. No browser APIs beyond Intl, so Node can test it.
//
// THE TIMETABLES ARE GENERATED, NOT REAL. SRMIST publishes no staff timetables or office hours; makeWeek() invents a
// plausible week from the person's profile id so the idea can be shown. Replace makeWeek() with a real data source to ship it.

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] // timetables run Monday to Saturday; Sunday is always off
export const WORK = [8 * 60 + 30, 17 * 60] // the working day, in minutes (08:30 to 17:00)
const UNIT = 30 // timetable slots start on half hours

export const toMin = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}
export const fmt = (min) => {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`
}
const hhmm = (min) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`

/** The day (0 = Monday … 6 = Sunday) and minutes since midnight in India, for any Date. */
export function istNow(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(date)
  const get = (t) => parts.find((p) => p.type === t).value
  const day = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(get('weekday'))
  return { day, minutes: (Number(get('hour')) % 24) * 60 + Number(get('minute')) }
}

/* ---------- the invented timetable ---------- */
function rng(seedText) {
  let h = 1779033703 ^ seedText.length
  for (let i = 0; i < seedText.length; i++) {
    h = Math.imul(h ^ seedText.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  let a = h >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * A weekly timetable for `seed` (use the profile id): the same seed always gives the same week.
 * Each working day gets 0-3 teaching sessions (classes of 1-1.5 h, the odd 2-2.5 h lab), sometimes a meeting, and usually
 * an office-hours slot. Nothing overlaps and everything sits inside 08:30-17:00. Every week has at least two office slots.
 */
export function makeWeek(seed) {
  const rand = rng(String(seed))
  const units = (WORK[1] - WORK[0]) / UNIT
  const week = {}
  let office = 0
  const build = (d) => {
    const used = new Array(units).fill(false)
    const slots = []
    const place = (len, kind, label) => {
      for (let tries = 0; tries < 14; tries++) {
        const at = Math.floor(rand() * (units - len + 1))
        if (used.slice(at, at + len).some(Boolean)) continue
        for (let k = at; k < at + len; k++) used[k] = true
        slots.push({ start: hhmm(WORK[0] + at * UNIT), end: hhmm(WORK[0] + (at + len) * UNIT), kind, ...(label ? { label } : {}) })
        return true
      }
      return false
    }
    const sat = d === 5
    const teaching = sat ? Math.floor(rand() * 2) : 1 + Math.floor(rand() * 3)
    for (let k = 0; k < teaching; k++) {
      if (rand() < 0.25) place(4 + Math.floor(rand() * 2), 'lab', 'Lab')
      else place(2 + Math.floor(rand() * 2), 'class', 'Lecture')
    }
    if (rand() < 0.28) place(2, 'meeting', 'Meeting')
    if (rand() < (sat ? 0.4 : 0.78) && place(2 + Math.floor(rand() * 2), 'office')) office++
    return slots.sort((x, y) => toMin(x.start) - toMin(y.start))
  }
  for (let d = 0; d < DAYS.length; d++) week[DAYS[d]] = build(d)
  // make sure the week always has a couple of office-hours slots
  for (let d = 0; office < 2 && d < 5; d++) {
    const taken = week[DAYS[d]]
    for (let s = WORK[0]; s + 60 <= WORK[1] && office < 2; s += UNIT) {
      if (taken.every((x) => s + 60 <= toMin(x.start) || s >= toMin(x.end))) {
        taken.push({ start: hhmm(s), end: hhmm(s + 60), kind: 'office' })
        taken.sort((x, y) => toMin(x.start) - toMin(y.start))
        office++
        break
      }
    }
  }
  return week
}

/* ---------- who is where ---------- */
const BUSY = new Set(['class', 'lab', 'meeting'])

/** week: { Mon: [{ start: '09:00', end: '10:00', kind: 'class' | 'lab' | 'meeting' | 'office', label }], … } */
export function slotsOn(week, day) {
  return (week[DAYS[day]] ?? []).map((s) => ({ ...s, a: toMin(s.start), b: toMin(s.end) })).sort((x, y) => x.a - y.a)
}

/**
 * What is this person doing now, and what is next?
 *   state 'busy'   in class, lab or a meeting (until `until`)
 *   state 'office' in office hours, open to visitors (until `until`)
 *   state 'idle'   in the working day with nothing scheduled
 *   state 'off'    outside the working day, or on a Sunday
 * `next` is the start of the next office-hours slot ({ day, start, end }), looking up to a week ahead.
 */
export function statusAt(week, { day, minutes }) {
  const today = day <= 5 ? slotsOn(week, day) : []
  const now = today.find((s) => minutes >= s.a && minutes < s.b)
  let state = 'off'
  let until = null
  let label = null
  if (day <= 5 && now) {
    state = BUSY.has(now.kind) ? 'busy' : 'office'
    until = now.b
    label = now.label ?? null
  } else if (day <= 5 && minutes >= WORK[0] && minutes < WORK[1]) {
    state = 'idle'
    until = today.find((s) => s.a > minutes)?.a ?? WORK[1]
  }

  let next = null
  for (let step = 0; step < 7 && !next; step++) {
    const d = (day + step) % 7
    if (d > 5) continue
    const from = step === 0 ? minutes : -1
    const slot = slotsOn(week, d).find((s) => s.kind === 'office' && s.a > from && !(step === 0 && state === 'office' && s === now))
    if (slot) next = { day: d, start: slot.a, end: slot.b }
  }
  return { state, until, label, next }
}

/** A short sentence for a status, e.g. "In office until 3:00 pm". */
export function describe(st) {
  if (st.state === 'office') return `In office until ${fmt(st.until)}`
  if (st.state === 'busy') return `${st.label ? st.label + ' · ' : ''}Teaching until ${fmt(st.until)}`
  if (st.state === 'idle') return `No session scheduled until ${fmt(st.until)}`
  return st.next ? `Off now · next office hours ${DAYS[st.next.day]} ${fmt(st.next.start)}` : 'Off now'
}
