import assert from 'node:assert/strict'
import test from 'node:test'
import { checkEligibility, nextDeadline } from '../src/lib/srmjeee.js'

test('the next deadline is the first phase not yet closed, counted in whole days', () => {
  const a = nextDeadline(new Date('2026-11-06T10:00:00+05:30'))
  assert.equal(a.n, 1)
  assert.equal(a.deadlineLabel, '2 April 2027')
  assert.equal(a.daysLeft, 147)
  const b = nextDeadline(new Date('2027-04-03T09:00:00+05:30'))
  assert.equal(b.n, 2)
})

test('a deadline lasts to the end of its day, and after the last one there is none', () => {
  const last = nextDeadline(new Date('2027-04-02T23:00:00+05:30'))
  assert.equal(last.n, 1)
  assert.equal(last.daysLeft, 0)
  assert.equal(nextDeadline(new Date('2027-06-05T00:30:00+05:30')), null)
})

test('physics, maths, one more subject and 60% meets the published rule', () => {
  const r = checkEligibility({ status: 'appearing', aggregate: 60, subjects: ['Physics', 'Mathematics', 'Chemistry'] })
  assert.equal(r.result, 'meets')
  assert.ok(r.lines.every((l) => l.ok === true))
})

test('59.9% or a missing compulsory subject falls short', () => {
  assert.equal(checkEligibility({ status: 'passed', aggregate: 59.9, subjects: ['Physics', 'Mathematics', 'Biology'] }).result, 'short')
  assert.equal(checkEligibility({ status: 'passed', aggregate: 80, subjects: ['Physics', 'Chemistry', 'Biology'] }).result, 'short')
  assert.equal(checkEligibility({ status: 'passed', aggregate: 80, subjects: ['Physics', 'Mathematics'] }).result, 'short') // needs a third
})

test('unanswered questions give "unknown", never a verdict', () => {
  assert.equal(checkEligibility({ status: '', aggregate: NaN, subjects: [] }).result, 'unknown')
  assert.equal(checkEligibility({ status: 'passed', aggregate: NaN, subjects: ['Physics', 'Mathematics', 'Chemistry'] }).result, 'unknown')
})
