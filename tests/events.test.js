import assert from 'node:assert/strict'
import test from 'node:test'
import { EVENTS } from '../src/data/events.js'
import { daysUntil, formatRange, groupByMonth, istToday, monthLabel, monthsOf, toCalendarItem, upcoming } from '../src/lib/events.js'
import { addDays, toIcs } from '../src/lib/ics.js'

test('every event has a valid date range, an official link and a unique id', () => {
  const ids = new Set()
  for (const e of EVENTS) {
    assert.ok(!ids.has(e.id), `duplicate id ${e.id}`)
    ids.add(e.id)
    assert.match(e.start, /^\d{4}-\d{2}-\d{2}$/)
    assert.match(e.end, /^\d{4}-\d{2}-\d{2}$/)
    assert.ok(e.end >= e.start, `${e.id} ends before it starts`)
    assert.ok(Number.isFinite(Date.parse(`${e.start}T00:00:00Z`)), e.id)
    assert.match(e.href, /^https:\/\/www\.srmist\.edu\.in\/events\/[a-z0-9-]+\/$/, e.id)
    assert.ok(e.title.length > 4, e.id)
  }
  assert.ok(EVENTS.length >= 20)
})

test('past events drop out the day after their last day, India time, and the rest are in date order', () => {
  const tb = EVENTS.find((e) => e.id === 'technoblizz-2026')
  assert.ok(upcoming(EVENTS, new Date('2026-11-13T23:00:00+05:30')).includes(tb))
  assert.ok(!upcoming(EVENTS, new Date('2026-11-14T00:30:00+05:30')).includes(tb))
  const list = upcoming(EVENTS, new Date('2026-11-19T12:00:00+05:30'))
  assert.deepEqual(list.map((e) => e.start), [...list.map((e) => e.start)].sort())
  assert.equal(list[0].id, 'robotics-automation-healthcare') // same first day as the PDP, ends a day earlier
  assert.equal(upcoming(EVENTS, new Date('2028-01-01T00:00:00+05:30')).length, 0)
  assert.equal(istToday(new Date('2026-11-19T20:00:00Z')), '2026-11-20') // already the next day in India
})

test('date ranges read the way people write them', () => {
  assert.equal(formatRange('2026-12-09', '2026-12-09'), '9 Dec 2026')
  assert.equal(formatRange('2026-11-23', '2026-11-28'), '23–28 Nov 2026')
  assert.equal(formatRange('2026-11-28', '2026-12-02'), '28 Nov – 2 Dec 2026')
  assert.equal(formatRange('2026-12-30', '2027-01-02'), '30 Dec 2026 – 2 Jan 2027')
})

test('events group by the month they start in', () => {
  const list = upcoming(EVENTS, new Date('2026-11-19T12:00:00+05:30'))
  const groups = groupByMonth(list)
  assert.deepEqual(groups.map(([k]) => k), monthsOf(list))
  assert.equal(groups[0][0], '2026-11')
  assert.equal(monthLabel('2026-12'), 'December 2026')
  assert.equal(groups.flatMap(([, l]) => l).length, list.length)
})

test('days until counts calendar days across month ends', () => {
  assert.equal(daysUntil('2026-12-01', '2026-11-30'), 1)
  assert.equal(daysUntil('2026-11-19', '2026-11-19'), 0)
  assert.equal(daysUntil('2027-01-01', '2026-12-25'), 7)
  assert.ok(daysUntil('2026-11-12', '2026-11-19') < 0)
})

test('a calendar entry ends the day after the last day and carries its own link and note', () => {
  const e = EVENTS.find((x) => x.id === 'pdp-network-information-theory')
  const item = toCalendarItem(e)
  assert.equal(item.end, addDays(e.end, 1))
  assert.equal(item.tentative, false)
  assert.equal(item.url, e.href)
  assert.match(item.note, /9:30 AM – 3:30 PM/)
  const ics = toIcs([item], new Date('2026-11-19T06:30:00Z')).replace(/\r\n /g, '')
  assert.ok(ics.includes('DTSTART;VALUE=DATE:20261123\r\nDTEND;VALUE=DATE:20261129'))
  assert.ok(ics.includes(`URL:${e.href}`))
  assert.ok(!ics.includes('(tentative)'))
  assert.ok(!ics.includes('applications.srmist.edu.in'))
  for (const line of toIcs([item]).split('\r\n')) assert.ok(new TextEncoder().encode(line).length <= 75)
})
