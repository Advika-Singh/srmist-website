import assert from 'node:assert/strict'
import test from 'node:test'
import { PHASES } from '../src/data/srmjeee.js'
import { addDays, keyDates, toIcs, upcoming } from '../src/lib/ics.js'

test('adding days crosses month and year ends correctly', () => {
  assert.equal(addDays('2027-04-17', 2), '2027-04-19')
  assert.equal(addDays('2027-04-30', 1), '2027-05-01')
  assert.equal(addDays('2027-12-31', 1), '2028-01-01')
  assert.equal(addDays('2028-02-28', 1), '2028-02-29')
})

test('every phase gives a deadline and a two-day exam, oldest first, straight from the published data', () => {
  const items = keyDates()
  assert.equal(items.length, PHASES.length * 2)
  assert.deepEqual(items.map((e) => e.start), [...items.map((e) => e.start)].sort())
  for (const p of PHASES) {
    const d = items.find((e) => e.id === `srmjeee-p${p.n}-deadline`)
    const x = items.find((e) => e.id === `srmjeee-p${p.n}-exam`)
    assert.equal(d.start, p.deadline)
    assert.equal(d.end, addDays(p.deadline, 1))
    assert.equal(d.label, p.deadlineLabel)
    assert.equal(x.start, p.examStart)
    assert.equal(x.end, addDays(p.examStart, 2))
    assert.equal(x.label, p.exam)
  }
})

test('the exam label really covers the two days in the calendar entry', () => {
  for (const p of PHASES) {
    const [first, last] = p.exam.split(' ')[0].split('–').map(Number)
    assert.equal(last - first, 1, p.exam)
    assert.equal(Number(p.examStart.slice(8)), first, p.exam)
  }
})

test('a date drops off the upcoming list only after its last day in India', () => {
  const items = keyDates()
  const first = items[0] // Phase 1 deadline, 2 April 2027
  assert.ok(upcoming(items, new Date('2027-04-02T18:00:00+05:30')).includes(first))
  assert.ok(upcoming(items, new Date('2027-04-02T23:59:00+05:30')).includes(first))
  assert.ok(!upcoming(items, new Date('2027-04-03T00:01:00+05:30')).includes(first))
  assert.equal(upcoming(items, new Date('2026-11-15T12:00:00+05:30')).length, items.length)
  assert.equal(upcoming(items, new Date('2028-01-01T00:00:00+05:30')).length, 0)
})

test('the calendar file is valid iCalendar text', () => {
  const items = keyDates()
  const ics = toIcs(items, new Date('2026-11-15T06:30:00Z'))
  assert.ok(ics.startsWith('BEGIN:VCALENDAR\r\nVERSION:2.0\r\n'))
  assert.ok(ics.endsWith('END:VCALENDAR\r\n'))
  assert.equal(ics.match(/BEGIN:VEVENT/g).length, items.length)
  assert.equal(ics.match(/END:VEVENT/g).length, items.length)
  assert.ok(!/[^\r]\n/.test(ics), 'every line ends with CRLF')
  for (const line of ics.split('\r\n')) assert.ok(new TextEncoder().encode(line).length <= 75, `line too long: ${line}`)
  assert.ok(ics.includes('DTSTAMP:20261115T063000Z'))
  assert.ok(ics.includes('DTSTART;VALUE=DATE:20270402\r\nDTEND;VALUE=DATE:20270403'))
  assert.ok(ics.includes('DTSTART;VALUE=DATE:20270417\r\nDTEND;VALUE=DATE:20270419'))
  assert.equal(new Set(ics.match(/UID:.+/g)).size, items.length)
})

test('every entry says it is tentative and text is escaped', () => {
  const ics = toIcs(keyDates(), new Date('2026-11-15T06:30:00Z'))
  const unfolded = ics.replace(/\r\n /g, '')
  for (const s of unfolded.match(/SUMMARY:.+/g)) assert.ok(s.includes('(tentative)'), s)
  assert.ok(unfolded.includes('DESCRIPTION:Tentative: SRMIST may change this date.'))
  const odd = toIcs([{ id: 'x', title: 'A, B; C\\D', start: '2027-01-01', end: '2027-01-02' }], new Date('2026-11-15T06:30:00Z'))
  assert.ok(odd.includes('SUMMARY:A\\, B\\; C\\\\D (tentative)'))
})
