import assert from 'node:assert/strict'
import test from 'node:test'
import { createBudget, memoryStore, upstashStore } from '../server/budget.js'

const make = (env, iso = '2026-11-20T10:00:00+05:30') => {
  let now = Date.parse(iso)
  const clock = () => now
  return { b: createBudget({ env, clock, store: memoryStore(clock) }), set: (v) => (now = Date.parse(v)) }
}

test('one visitor is stopped at their daily limit, others are not', async () => {
  const { b } = make({ CHAT_DAILY_PER_IP: '3' })
  for (let i = 0; i < 3; i++) {
    assert.equal((await b.check('a')).ok, true)
    await b.record('a', 100)
  }
  assert.deepEqual(await b.check('a'), { ok: false, status: 429, reason: 'visitor' })
  assert.equal((await b.check('b')).ok, true)
})

test('the whole site stops at its daily question limit', async () => {
  const { b } = make({ CHAT_DAILY_GLOBAL: '2', CHAT_DAILY_PER_IP: '99' })
  await b.record('a')
  await b.record('b')
  assert.deepEqual(await b.check('c'), { ok: false, status: 503, reason: 'site' })
})

test('the whole site stops at its daily token limit, counted from what Gemini reports', async () => {
  const { b } = make({ CHAT_DAILY_TOKENS: '1000' })
  await b.record('a', 600)
  assert.equal((await b.check('b')).ok, true)
  await b.record('b', 500)
  assert.equal((await b.check('c')).reason, 'site')
  assert.equal((await b.usage()).tokens, 1100)
})

test('the counters start again at midnight India time', async () => {
  const { b, set } = make({ CHAT_DAILY_PER_IP: '1' }, '2026-11-20T23:30:00+05:30')
  await b.record('a', 10)
  assert.equal((await b.check('a')).ok, false)
  set('2026-11-21T00:05:00+05:30')
  assert.equal((await b.check('a')).ok, true)
  assert.deepEqual(await b.usage(), { questions: 0, tokens: 0 })
})

test('bad settings fall back to the defaults, and a bad token count is ignored', async () => {
  const { b } = make({ CHAT_DAILY_PER_IP: 'abc', CHAT_DAILY_GLOBAL: '-5' })
  assert.equal(b.limits.perIp, 60)
  assert.equal(b.limits.global, 3000)
  await b.record('a', Number.NaN)
  assert.equal((await b.usage()).tokens, 0)
})

test('the assistant and the translator count separately, with their own settings', async () => {
  const store = memoryStore()
  const chat = createBudget({ env: { CHAT_DAILY_PER_IP: '1' }, name: 'chat', store })
  const tr = createBudget({ env: { TRANSLATE_DAILY_PER_IP: '2' }, name: 'translate', defaults: { perIp: 300 }, store })
  await chat.record('a')
  assert.equal((await chat.check('a')).ok, false)
  assert.equal((await tr.check('a')).ok, true)
  await tr.record('a')
  await tr.record('a')
  assert.equal((await tr.check('a')).ok, false)
})

test('shared counters (Upstash) are read and written through its REST pipeline', async () => {
  const calls = []
  const values = { total: 5, tokens: 100 }
  const fake = async (url, init) => {
    const cmds = JSON.parse(init.body)
    calls.push({ url, auth: init.headers.authorization, cmds })
    return new Response(JSON.stringify(cmds.map(([op, key]) => ({ result: op === 'GET' ? String(key.endsWith('total') ? values.total : key.endsWith('tokens') ? values.tokens : 2) : 1 }))), { status: 200 })
  }
  const store = upstashStore('https://example.upstash.io/', 'secret', fake)
  const b = createBudget({ env: { CHAT_DAILY_PER_IP: '2' }, store })
  const gate = await b.check('1.2.3.4')
  assert.deepEqual(gate, { ok: false, status: 429, reason: 'visitor' }) // the fake says this visitor has asked twice
  await b.record('1.2.3.4', 40)
  const write = calls.at(-1)
  assert.equal(write.url, 'https://example.upstash.io/pipeline')
  assert.equal(write.auth, 'Bearer secret')
  assert.ok(write.cmds.some(([op, , by]) => op === 'INCRBY' && by === '40'))
  assert.ok(write.cmds.some(([op]) => op === 'EXPIRE'))
})

test('if the shared store is down the request is let through instead of breaking the assistant', async () => {
  const down = upstashStore('https://example.upstash.io', 'x', async () => new Response('no', { status: 500 }))
  const b = createBudget({ env: {}, store: down })
  assert.deepEqual(await b.check('a'), { ok: true })
  await b.record('a', 10) // must not throw
})
