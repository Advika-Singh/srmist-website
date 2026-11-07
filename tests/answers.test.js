import assert from 'node:assert/strict'
import test from 'node:test'
import { answerFor } from '../src/lib/answers.js'
import { nextDeadline } from '../src/lib/srmjeee.js'

test('a fee question naming a programme gets an illustrative fee card', () => {
  const a = answerFor('B.Tech CSE fees')
  assert.equal(a.kind, 'fees')
  assert.match(a.body, /2,50,000/)
  assert.match(a.body, /per year/)
  assert.match(a.body, /4 years/)
  assert.equal(a.illustrative, true)
  assert.ok(a.href.startsWith('/admissions'))
})

test('MBBS fees use the medicine figure', () => {
  assert.match(answerFor('mbbs fees').body, /12,00,000/)
})

test('"fees" alone names no programme, so normal search handles it', () => {
  assert.equal(answerFor('fees'), null)
})

test('a duration question answers from the programme length', () => {
  const a = answerFor('how long is b.tech')
  assert.equal(a.kind, 'duration')
  assert.match(a.body, /4 yrs/)
})

test('"last date to apply" answers with the next SRMJEEE deadline, and nothing once all have passed', () => {
  const now = new Date('2027-03-01T10:00:00+05:30')
  const a = answerFor('last date to apply', now)
  assert.equal(a.kind, 'deadline')
  assert.ok(a.body.includes(nextDeadline(now).deadlineLabel))
  assert.equal(a.href, '/srmjeee')
  assert.equal(answerFor('last date to apply', new Date('2028-01-01T10:00:00+05:30')), null)
})

test('a fee question naming a campus says the figure is not campus-specific', () => {
  const a = answerFor('cse fees delhi campus')
  assert.equal(a.kind, 'fees')
  assert.match(a.body, /campus/i)
  assert.match(a.body, /not campus-specific/i)
})
