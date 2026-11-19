import assert from 'node:assert/strict'
import test from 'node:test'
import { turnstileEnabled, verifyTurnstile } from '../server/turnstile.js'

const reply = (success) => async () => new Response(JSON.stringify({ success }), { status: 200 })
const env = { TURNSTILE_SECRET: 'test-secret' }

test('it is off until a secret is set, and then lets everything through', async () => {
  assert.equal(turnstileEnabled({}), false)
  assert.deepEqual(await verifyTurnstile('', 'x', {}), { ok: true, skipped: true })
})

test('a token Cloudflare accepts passes, and the secret and visitor address are sent along', async () => {
  let sent
  const ok = await verifyTurnstile('a-long-enough-token', '1.2.3.4', env, async (url, init) => {
    sent = { url, body: String(init.body) }
    return new Response('{"success":true}')
  })
  assert.deepEqual(ok, { ok: true })
  assert.match(sent.url, /challenges\.cloudflare\.com\/turnstile\/v0\/siteverify$/)
  assert.match(sent.body, /secret=test-secret/)
  assert.match(sent.body, /remoteip=1\.2\.3\.4/)
})

test('a rejected, missing or oversized token fails', async () => {
  assert.deepEqual(await verifyTurnstile('a-long-enough-token', 'x', env, reply(false)), { ok: false, reason: 'rejected' })
  assert.deepEqual(await verifyTurnstile('', 'x', env, reply(true)), { ok: false, reason: 'missing' })
  assert.deepEqual(await verifyTurnstile('short', 'x', env, reply(true)), { ok: false, reason: 'missing' })
  assert.deepEqual(await verifyTurnstile('x'.repeat(3000), 'x', env, reply(true)), { ok: false, reason: 'missing' })
})

test('if Cloudflare cannot be reached the check fails closed', async () => {
  const down = async () => {
    throw new Error('network')
  }
  assert.deepEqual(await verifyTurnstile('a-long-enough-token', 'x', env, down), { ok: false, reason: 'unavailable' })
})
