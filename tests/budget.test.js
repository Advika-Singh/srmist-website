import assert from 'node:assert/strict'
import test from 'node:test'
import { createBudget } from '../server/budget.js'

const at = (iso) => () => Date.parse(iso)

test('one visitor is stopped at their daily limit, others are not', () => {
  const b = createBudget({ CHAT_DAILY_PER_IP: '3' }, at('2026-11-20T10:00:00+05:30'))
  for (let i = 0; i < 3; i++) {
    assert.equal(b.check('a').ok, true)
    b.record('a', 100)
  }
  assert.deepEqual(b.check('a'), { ok: false, status: 429, reason: 'visitor' })
  assert.equal(b.check('b').ok, true)
})

test('the whole site stops at its daily question limit', () => {
  const b = createBudget({ CHAT_DAILY_GLOBAL: '2', CHAT_DAILY_PER_IP: '99' }, at('2026-11-20T10:00:00+05:30'))
  b.record('a')
  b.record('b')
  assert.deepEqual(b.check('c'), { ok: false, status: 503, reason: 'site' })
})

test('the whole site stops at its daily token limit, counted from what Gemini reports', () => {
  const b = createBudget({ CHAT_DAILY_TOKENS: '1000' }, at('2026-11-20T10:00:00+05:30'))
  b.record('a', 600)
  assert.equal(b.check('b').ok, true)
  b.record('b', 500)
  assert.equal(b.check('c').reason, 'site')
  assert.equal(b.usage().tokens, 1100)
})

test('the counters start again at midnight India time', () => {
  let now = Date.parse('2026-11-20T23:30:00+05:30')
  const b = createBudget({ CHAT_DAILY_PER_IP: '1' }, () => now)
  b.record('a', 10)
  assert.equal(b.check('a').ok, false)
  now = Date.parse('2026-11-21T00:05:00+05:30')
  assert.equal(b.check('a').ok, true)
  assert.deepEqual(b.usage(), { questions: 0, tokens: 0, visitors: 0 })
})

test('bad settings fall back to the defaults, and a bad token count is ignored', () => {
  const b = createBudget({ CHAT_DAILY_PER_IP: 'abc', CHAT_DAILY_GLOBAL: '-5' }, at('2026-11-20T10:00:00+05:30'))
  assert.equal(b.limits.perIp, 60)
  assert.equal(b.limits.global, 3000)
  b.record('a', Number.NaN)
  assert.equal(b.usage().tokens, 0)
})
