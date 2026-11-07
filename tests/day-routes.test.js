import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { test } from 'node:test'

const file = new URL('../src/data/campus-day.json', import.meta.url)
const day = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : null
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1])

test('the day data exists (run: node scripts/build-day-data.mjs)', () => {
  assert.ok(day, 'src/data/campus-day.json is missing')
})

test('there are six stops and five legs that chain from one stop to the next', () => {
  assert.equal(day.stops.length, 6)
  assert.equal(day.legs.length, 5)
  day.legs.forEach((leg, i) => {
    assert.equal(leg.from, day.stops[i].id)
    assert.equal(leg.to, day.stops[i + 1].id)
  })
})

test('every leg starts at its first stop and ends at its second, along a real route', () => {
  day.legs.forEach((leg, i) => {
    assert.ok(leg.pts.length >= 2, leg.from)
    assert.ok(dist(leg.pts[0], day.stops[i].at) < 1, `${leg.from} start`)
    assert.ok(dist(leg.pts.at(-1), day.stops[i + 1].at) < 1, `${leg.to} end`)
    assert.ok(leg.metres >= dist(day.stops[i].at, day.stops[i + 1].at) - 1, 'a route is never shorter than the straight line')
  })
})

test('every leg follows the path network (none fell back to a straight line)', () => {
  for (const leg of day.legs) assert.ok(leg.connected, `${leg.from} to ${leg.to} is not connected`)
})

test('the whole day is a plausible walk: between 300 m and 4 km', () => {
  const total = day.legs.reduce((s, l) => s + l.metres, 0)
  assert.ok(total > 300 && total < 4000, `total ${total} m`)
})

test('the sports grounds are drawn and the stops sit inside the campus map', () => {
  assert.ok(day.grounds.length >= 3)
  for (const s of day.stops) assert.ok(s.at[0] > 0 && s.at[0] < day.size[0] && s.at[1] > 0 && s.at[1] < day.size[1], s.id)
})
