import assert from 'node:assert/strict'
import { test } from 'node:test'
import { HOURS, hourAt, pointAt, polylineLength, skyFor, timeline } from '../src/lib/day.js'

test('timeline starts dwelling at the first stop and ends dwelling at the last', () => {
  const a = timeline(0, 6)
  assert.equal(a.phase, 'dwell')
  assert.equal(a.stop, 0)
  const z = timeline(1, 6)
  assert.equal(z.phase, 'dwell')
  assert.equal(z.stop, 5)
})

test('timeline only moves forward: stop and leg never go backwards as progress grows', () => {
  let lastStop = -1
  let lastPos = -1
  for (let i = 0; i <= 200; i++) {
    const tl = timeline(i / 200, 6)
    assert.ok(tl.stop >= lastStop)
    const pos = tl.phase === 'travel' ? tl.leg + 0.5 + tl.t * 0.01 : tl.stop
    assert.ok(pos >= lastPos - 1e-9, `at ${i}`)
    lastStop = tl.stop
    lastPos = pos
  }
})

test('while travelling, t runs 0 to 1 along the leg and leg is a valid index', () => {
  const seen = new Set()
  for (let i = 0; i <= 400; i++) {
    const tl = timeline(i / 400, 6)
    if (tl.phase === 'travel') {
      assert.ok(tl.t >= 0 && tl.t <= 1)
      assert.ok(tl.leg >= 0 && tl.leg < 5)
      seen.add(tl.leg)
    }
  }
  assert.equal(seen.size, 5)
})

test('polylineLength and pointAt walk a polyline by distance', () => {
  const pts = [[0, 0], [10, 0], [10, 10]]
  assert.equal(polylineLength(pts), 20)
  assert.deepEqual(pointAt(pts, 0), [0, 0])
  assert.deepEqual(pointAt(pts, 1), [10, 10])
  assert.deepEqual(pointAt(pts, 0.25), [5, 0])
  assert.deepEqual(pointAt(pts, 0.75), [10, 5])
})

test('hourAt is the stop time while dwelling and rises through the legs', () => {
  assert.equal(hourAt(timeline(0, 6)), HOURS[0])
  assert.equal(hourAt(timeline(1, 6)), HOURS[5])
  let last = -1
  for (let i = 0; i <= 100; i++) {
    const h = hourAt(timeline(i / 100, 6))
    assert.ok(h >= last)
    last = h
  }
})

test('skyFor is bright at noon, dark at night, and always returns the five colours', () => {
  const lum = (hex) => {
    const n = parseInt(hex.slice(1), 16)
    return 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)
  }
  const noon = skyFor(12)
  const night = skyFor(22)
  assert.ok(lum(noon.sky) > lum(night.sky) + 80)
  assert.ok(noon.light > night.light)
  for (const k of ['sky', 'ground', 'building', 'road', 'glow']) assert.match(noon[k], /^#[0-9a-f]{6}$/i, k)
})

import { mix, shade } from '../src/lib/day.js'

test('shade darkens a colour and mix blends two', () => {
  assert.equal(shade('#808080', 0.5), '#404040')
  assert.equal(shade('#ffffff', 1), '#ffffff')
  assert.equal(mix('#000000', '#ffffff', 0.5), '#808080')
})
