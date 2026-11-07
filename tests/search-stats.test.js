import assert from 'node:assert/strict'
import test from 'node:test'
import { redact, summarise } from '../src/lib/searchStats.js'
import { validateEvent } from '../server/searchlog.js'

test('redact hides emails and phone numbers and caps the length', () => {
  assert.equal(redact('mail me a@b.com'), 'mail me [email]')
  assert.equal(redact('call 9876543210'), 'call [number]')
  assert.equal(redact('call 98765 43210 now'), 'call [number] now')
  assert.equal(redact('fees 2027'), 'fees 2027')
  assert.ok(redact('x'.repeat(300)).length <= 80)
})

test('summarise of nothing is all zeros and no helpful rate', () => {
  assert.deepEqual(summarise([]), { total: 0, noResultRate: 0, clickRate: 0, helpfulRate: null })
})

test('summarise computes no-result, click and helpful rates', () => {
  const events = [
    { q: 'a', lang: 'en', results: 0, clicked: false },
    { q: 'b', lang: 'en', results: 3, clicked: true, helpful: true },
    { q: 'c', lang: 'ta', results: 2, clicked: true, helpful: false },
    { q: 'd', lang: 'hi', results: 5, clicked: false },
  ]
  assert.deepEqual(summarise(events), { total: 4, noResultRate: 0.25, clickRate: 0.5, helpfulRate: 0.5 })
})

test('the server refuses a body that is not an object and redacts again before logging', () => {
  assert.equal(validateEvent(null).ok, false)
  assert.equal(validateEvent('text').ok, false)
  const v = validateEvent({ q: 'write to a@b.com', lang: 'xx', results: 2, clicked: true })
  assert.equal(v.ok, true)
  assert.equal(v.value.q, 'write to [email]')
  assert.equal(v.value.lang, 'en')
  assert.equal(v.value.results, 2)
  assert.equal(v.value.clicked, true)
  assert.equal('helpful' in v.value, false)
})
