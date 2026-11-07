import assert from 'node:assert/strict'
import { test } from 'node:test'
import { clamp01, smooth, stageIndex, windowProgress } from '../src/lib/motion.js'

test('clamp01 limits to 0..1', () => {
  assert.equal(clamp01(-3), 0)
  assert.equal(clamp01(0.4), 0.4)
  assert.equal(clamp01(9), 1)
})

test('smooth is 0 before a, 1 after b and 0.5 at the midpoint', () => {
  assert.equal(smooth(0.2, 0.8, 0), 0)
  assert.equal(smooth(0.2, 0.8, 1), 1)
  assert.ok(Math.abs(smooth(0.2, 0.8, 0.5) - 0.5) < 1e-9)
})

test('windowProgress maps a window of progress to 0..1 and clamps outside it', () => {
  assert.equal(windowProgress(0.5, 0.25, 0.75), 0.5)
  assert.equal(windowProgress(0.1, 0.25, 0.75), 0)
  assert.equal(windowProgress(0.9, 0.25, 0.75), 1)
})

test('stageIndex picks the stage for a progress and never overflows', () => {
  assert.equal(stageIndex(0, 3), 0)
  assert.equal(stageIndex(0.34, 3), 1)
  assert.equal(stageIndex(1, 3), 2)
  assert.equal(stageIndex(0.999, 1), 0)
  assert.equal(stageIndex(0.5, 0), 0)
})
