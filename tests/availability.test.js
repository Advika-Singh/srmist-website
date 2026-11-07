import assert from 'node:assert/strict'
import test from 'node:test'
import { DAYS, WORK, describe, fmt, istNow, makeWeek, slotsOn, statusAt, toMin } from '../src/lib/availability.js'

const week = {
  Mon: [
    { start: '09:00', end: '10:00', kind: 'class', label: 'Lecture' },
    { start: '14:00', end: '15:30', kind: 'office' },
  ],
  Tue: [{ start: '10:00', end: '12:00', kind: 'lab', label: 'Lab' }],
  Wed: [{ start: '11:00', end: '12:00', kind: 'office' }],
}
const at = (day, t) => ({ day, minutes: toMin(t) })

test('inside a class the person is busy until it ends', () => {
  const s = statusAt(week, at(0, '09:30'))
  assert.equal(s.state, 'busy')
  assert.equal(describe(s), 'Lecture · Teaching until 10:00 am')
})

test('inside office hours the person is in the office; slot ends are exclusive', () => {
  assert.equal(describe(statusAt(week, at(0, '14:00'))), 'In office until 3:30 pm')
  assert.equal(statusAt(week, at(0, '10:00')).state, 'idle')
})

test('outside the working day and on Sundays the person is off, with the next office hours', () => {
  const late = statusAt(week, at(0, '18:00'))
  assert.equal(late.state, 'off')
  assert.deepEqual([late.next.day, late.next.start], [2, toMin('11:00')])
  assert.equal(statusAt(week, at(6, '12:00')).state, 'off')
  assert.equal(statusAt({ Mon: [] }, at(1, '12:00')).next, null)
})

test('times format as a 12-hour clock and istNow reads India time', () => {
  assert.equal(fmt(toMin('00:05')), '12:05 am')
  assert.equal(fmt(toMin('13:45')), '1:45 pm')
  assert.deepEqual(istNow(new Date('2026-11-06T04:30:00Z')), { day: 4, minutes: toMin('10:00') }) // a Friday, 10:00 in India
})

test('makeWeek is repeatable: the same id always gives the same week, different ids differ', () => {
  assert.deepEqual(makeWeek('dr-a-b'), makeWeek('dr-a-b'))
  assert.notDeepEqual(makeWeek('dr-a-b'), makeWeek('dr-c-d'))
})

test('every generated week stays inside working hours, never overlaps and has office hours', () => {
  for (let i = 0; i < 300; i++) {
    const w = makeWeek(`person-${i}`)
    let office = 0
    DAYS.forEach((_, d) => {
      const slots = slotsOn(w, d)
      slots.forEach((s, k) => {
        assert.ok(s.a >= WORK[0] && s.b <= WORK[1] && s.b > s.a, `person-${i} ${DAYS[d]} ${s.start}-${s.end}`)
        if (k) assert.ok(slots[k - 1].b <= s.a, `overlap person-${i} ${DAYS[d]}`)
        if (s.kind === 'office') office++
      })
    })
    assert.ok(office >= 2, `person-${i} has ${office} office slots`)
  }
})
