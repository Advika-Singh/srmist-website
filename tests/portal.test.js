import assert from 'node:assert/strict'
import test from 'node:test'
import { createPortal } from '../server/portal/handlers.js'
import { memoryRepo } from '../server/portal/repo-memory.js'
import { approverSet, csvCell, srmistEmail, validateItem } from '../server/portal/validate.js'
import { verifyGoogleIdToken } from '../server/portal/auth.js'

/* ---------- helpers ---------- */
const GOOD = { aud: 'client-id', iss: 'https://accounts.google.com', exp: String(Math.floor(Date.now() / 1000) + 3600), email_verified: 'true', hd: 'srmist.edu.in' }
const TOKENS = {
  'token-teacher-aaaaaaaaaaaa': { ...GOOD, email: 'teacher.one@srmist.edu.in', name: 'Teacher One' },
  'token-teacher2-bbbbbbbbbbb': { ...GOOD, email: 'teacher.two@srmist.edu.in', name: 'Teacher Two' },
  'token-boss-cccccccccccccccc': { ...GOOD, email: 'boss@srmist.edu.in', name: 'Boss One' },
  'token-boss2-dddddddddddddddd': { ...GOOD, email: 'boss2@srmist.edu.in', name: 'Boss Two' },
  'token-gmail-eeeeeeeeeeeeeeee': { ...GOOD, email: 'someone@gmail.com', hd: undefined },
  'token-wronghd-ffffffffffff': { ...GOOD, email: 'x@srmist.edu.in', hd: 'evil.com' },
  'token-unverified-gggggggggg': { ...GOOD, email: 'x@srmist.edu.in', email_verified: 'false' },
  'token-wrongaud-hhhhhhhhhhhh': { ...GOOD, email: 'x@srmist.edu.in', aud: 'someone-elses-client' },
  'token-lookalike-iiiiiiiiiii': { ...GOOD, email: 'user@srmist.edu.in.evil.com' },
  'token-query-jjjjjjjjjjjjjjj': { ...GOOD, email: 'user@evil.com?@srmist.edu.in' },
  'token-expired-kkkkkkkkkkkkk': { ...GOOD, email: 'x@srmist.edu.in', exp: String(Math.floor(Date.now() / 1000) - 10) },
  'token-badiss-lllllllllllllll': { ...GOOD, email: 'x@srmist.edu.in', iss: 'https://evil.example' },
}
const fakeGoogle = async (url) => {
  const t = decodeURIComponent(String(url).split('id_token=')[1])
  return TOKENS[t] ? new Response(JSON.stringify(TOKENS[t]), { status: 200 }) : new Response('{}', { status: 400 })
}

function setup(extraEnv = {}, clock) {
  const repo = memoryRepo(clock)
  const env = { GOOGLE_CLIENT_ID: 'client-id', APPROVER_EMAILS: 'boss@srmist.edu.in, boss2@srmist.edu.in', PORTAL_INSECURE_COOKIES: '1', ...extraEnv }
  const portal = createPortal({ repo, env, fetchImpl: fakeGoogle, clock })
  const call = async (method, url, { body, cookie, csrf, headers = {} } = {}) => {
    const req = { method, url, headers: { host: 'site.test', ...(cookie ? { cookie } : {}), ...(csrf ? { 'x-csrf-token': csrf } : {}), ...headers }, socket: { remoteAddress: '1.1.1.1' }, body }
    const out = { status: 0, headers: {}, text: '' }
    const res = { statusCode: 200, writableEnded: false, setHeader: (k, v) => (out.headers[k.toLowerCase()] = v), end: (t) => { out.text = t ?? ''; out.status = res.statusCode; res.writableEnded = true } }
    await portal(req, res)
    return { ...out, json: () => JSON.parse(out.text) }
  }
  // sign in with a fake Google token; returns what later requests need
  const login = async (credential) => {
    const r = await call('POST', '/api/portal/login', { body: { credential } })
    if (r.status !== 200) return { r }
    const cookie = String(r.headers['set-cookie']).split(';')[0]
    const { user, csrf } = r.json()
    const as = (method, url, body) => call(method, url, { body, cookie, csrf })
    return { r, user, csrf, cookie, as }
  }
  return { repo, call, login, env }
}
const eventBody = (o = {}) => ({ type: 'event', title: 'Guest lecture', description: 'A talk about careers.', event_date: '2099-01-10', start_time: '10:00', end_time: '11:00', venue: 'Hall 1', ...o })
const annBody = (o = {}) => ({ type: 'announcement', title: 'Timetable out', body: 'Check the portal.', ...o })

/* ---------- domain validation ---------- */
test('only exactly @srmist.edu.in addresses pass, including every lookalike we can think of', () => {
  assert.equal(srmistEmail('Priya.Raman@SRMIST.edu.in '), 'priya.raman@srmist.edu.in')
  for (const bad of ['user@srmist.edu.in.evil.com', 'user@evil.com?@srmist.edu.in', 'user@evil.com#@srmist.edu.in', 'user@evil.com/@srmist.edu.in', 'user@sub.srmist.edu.in', 'user@xsrmist.edu.in', 'user@srmist.edu.in\n@evil.com', 'a@b@srmist.edu.in', 'user@srmist.edu.in@evil.com', '@srmist.edu.in', 'user@srmist.edu.in ,x@evil.com', 'user@srmist.edu', 'user@srmist-edu.in', 'user＠srmist.edu.in', '', null, undefined, 42, ['a@srmist.edu.in']]) {
    assert.equal(srmistEmail(bad), null, String(bad))
  }
  assert.deepEqual([...approverSet('a@srmist.edu.in; b@evil.com ,C@srmist.edu.in')], ['a@srmist.edu.in', 'c@srmist.edu.in'])
})

test('Google sign-in is accepted only for a verified srmist.edu.in account, with our client id, from Google, unexpired', async () => {
  const env = { GOOGLE_CLIENT_ID: 'client-id' }
  const ok = await verifyGoogleIdToken('token-teacher-aaaaaaaaaaaa', env, fakeGoogle)
  assert.deepEqual(ok, { email: 'teacher.one@srmist.edu.in', name: 'Teacher One' })
  for (const t of ['token-gmail-eeeeeeeeeeeeeeee', 'token-wronghd-ffffffffffff', 'token-lookalike-iiiiiiiiiii', 'token-query-jjjjjjjjjjjjjjj']) assert.equal((await verifyGoogleIdToken(t, env, fakeGoogle)).error, 'wrong_domain', t)
  assert.equal((await verifyGoogleIdToken('token-unverified-gggggggggg', env, fakeGoogle)).error, 'unverified')
  for (const t of ['token-wrongaud-hhhhhhhhhhhh', 'token-expired-kkkkkkkkkkkkk', 'token-badiss-lllllllllllllll', 'not-a-real-token-at-all-xx']) assert.equal((await verifyGoogleIdToken(t, env, fakeGoogle)).error, 'bad_token', t)
  assert.equal((await verifyGoogleIdToken('token-teacher-aaaaaaaaaaaa', {}, fakeGoogle)).error, 'not_configured')
})

test('login over HTTP is refused for every bad account and sets no cookie', async () => {
  const { call } = setup()
  for (const t of ['token-gmail-eeeeeeeeeeeeeeee', 'token-wronghd-ffffffffffff', 'token-lookalike-iiiiiiiiiii', 'token-query-jjjjjjjjjjjjjjj', 'token-unverified-gggggggggg', 'garbage']) {
    const r = await call('POST', '/api/portal/login', { body: { credential: t } })
    assert.equal(r.status, 403, t)
    assert.equal(r.headers['set-cookie'], undefined)
  }
})

/* ---------- sessions, roles, csrf ---------- */
test('the role comes from the server list; a client claiming to be an approver is ignored', async () => {
  const { call, login } = setup()
  const t = await call('POST', '/api/portal/login', { body: { credential: 'token-teacher-aaaaaaaaaaaa', role: 'approver', user: { role: 'approver' } } })
  assert.equal(t.json().user.role, 'teacher')
  assert.equal((await login('token-boss-cccccccccccccccc')).user.role, 'approver')
})

test('without a session every protected route says 401', async () => {
  const { call } = setup()
  for (const [m, u] of [['GET', '/api/portal/me'], ['GET', '/api/portal/my-items'], ['POST', '/api/portal/items'], ['GET', '/api/portal/queue'], ['GET', '/api/portal/logs']]) assert.equal((await call(m, u)).status, 401, u)
})

test('a teacher calling any approver route directly gets 403', async () => {
  const { login } = setup()
  const boss = await login('token-boss-cccccccccccccccc')
  const teacher = await login('token-teacher-aaaaaaaaaaaa')
  const made = (await teacher.as('POST', '/api/portal/items', annBody())).json().item
  for (const [m, u, b] of [['GET', '/api/portal/queue'], ['POST', `/api/portal/items/${made.id}/approve`], ['POST', `/api/portal/items/${made.id}/reject`, { reason: 'no way' }], ['PATCH', `/api/portal/items/${made.id}`, annBody({ title: 'Changed' })], ['GET', '/api/portal/logs'], ['GET', '/api/portal/logs.csv']]) {
    assert.equal((await teacher.as(m, u, b)).status, 403, `${m} ${u}`)
  }
  assert.equal((await boss.as('GET', '/api/portal/queue')).status, 200)
})

test('changes need the CSRF token and our own origin', async () => {
  const { call, login } = setup()
  const t = await login('token-teacher-aaaaaaaaaaaa')
  assert.equal((await call('POST', '/api/portal/items', { body: annBody(), cookie: t.cookie })).status, 403) // no token
  assert.equal((await call('POST', '/api/portal/items', { body: annBody(), cookie: t.cookie, csrf: 'wrong' })).status, 403)
  assert.equal((await call('POST', '/api/portal/items', { body: annBody(), cookie: t.cookie, csrf: t.csrf, headers: { origin: 'https://evil.example' } })).status, 403)
  assert.equal((await call('POST', '/api/portal/items', { body: annBody(), cookie: t.cookie, csrf: t.csrf, headers: { origin: 'https://site.test' } })).status, 201)
})

test('logout ends the session', async () => {
  const { call, login } = setup()
  const t = await login('token-teacher-aaaaaaaaaaaa')
  assert.equal((await t.as('POST', '/api/portal/logout')).status, 200)
  assert.equal((await call('GET', '/api/portal/me', { cookie: t.cookie })).status, 401)
})

test('the session cookie is httpOnly, Secure and SameSite when not in local development', async () => {
  const { call } = setup({ PORTAL_INSECURE_COOKIES: '0' })
  const r = await call('POST', '/api/portal/login', { body: { credential: 'token-teacher-aaaaaaaaaaaa' } })
  const c = String(r.headers['set-cookie'])
  assert.match(c, /^__Host-srm_portal=/)
  for (const part of ['HttpOnly', 'Secure', 'SameSite=Lax', 'Path=/', 'Max-Age=']) assert.ok(c.includes(part), part)
  assert.ok(!/Domain=/i.test(c))
})

test('the demo sign-in works only when DEMO_MODE=1', async () => {
  assert.equal((await setup().call('POST', '/api/portal/login', { body: { demo: 'approver' } })).status, 403)
  const demo = await setup({ DEMO_MODE: '1' }).call('POST', '/api/portal/login', { body: { demo: 'approver' } })
  assert.equal(demo.status, 200)
})

test('login is rate limited', async () => {
  const { call } = setup()
  let last
  for (let i = 0; i < 12; i++) last = await call('POST', '/api/portal/login', { body: { credential: 'garbage' } })
  assert.equal(last.status, 429)
})

/* ---------- the approval flow ---------- */
const publicItems = async (call, type) => (await call('GET', `/api/public/items?type=${type}`)).json().items

test('a pending item never appears publicly; approving it makes it appear; rejected and withdrawn never do', async () => {
  const { call, login } = setup()
  const teacher = await login('token-teacher-aaaaaaaaaaaa')
  const boss = await login('token-boss-cccccccccccccccc')
  const ev = (await teacher.as('POST', '/api/portal/items', eventBody())).json().item
  const an = (await teacher.as('POST', '/api/portal/items', annBody())).json().item
  const bad = (await teacher.as('POST', '/api/portal/items', annBody({ title: 'To be rejected' }))).json().item
  const gone = (await teacher.as('POST', '/api/portal/items', annBody({ title: 'Withdrawn one' }))).json().item
  assert.equal(ev.status, 'pending')
  assert.deepEqual(await publicItems(call, 'event'), [])
  assert.deepEqual(await publicItems(call, 'announcement'), [])
  assert.equal((await teacher.as('POST', `/api/portal/items/${gone.id}/withdraw`)).status, 200)
  assert.equal((await boss.as('POST', `/api/portal/items/${bad.id}/reject`, {})).status, 422) // a reason is required
  assert.equal((await boss.as('POST', `/api/portal/items/${bad.id}/reject`, { reason: 'Not suitable.' })).status, 200)
  assert.equal((await boss.as('POST', `/api/portal/items/${ev.id}/approve`)).status, 200)
  assert.equal((await boss.as('POST', `/api/portal/items/${an.id}/approve`)).status, 200)
  assert.deepEqual((await publicItems(call, 'event')).map((i) => i.title), ['Guest lecture'])
  assert.deepEqual((await publicItems(call, 'announcement')).map((i) => i.title), ['Timetable out'])
  const mine = (await teacher.as('GET', '/api/portal/my-items')).json().items
  assert.equal(mine.find((i) => i.id === bad.id).reject_reason, 'Not suitable.')
  assert.equal((await boss.as('POST', `/api/portal/items/${ev.id}/approve`)).status, 409) // already reviewed
})

test('the public feed carries no names, emails or review details', async () => {
  const { call, login } = setup()
  const teacher = await login('token-teacher-aaaaaaaaaaaa')
  const boss = await login('token-boss-cccccccccccccccc')
  const item = (await teacher.as('POST', '/api/portal/items', annBody())).json().item
  await boss.as('POST', `/api/portal/items/${item.id}/approve`)
  const [pub] = await publicItems(call, 'announcement')
  assert.deepEqual(Object.keys(pub).sort(), ['body', 'event_date', 'end_time', 'expires_at', 'id', 'link', 'start_time', 'title', 'type', 'venue'].sort())
  assert.ok(!JSON.stringify(pub).includes('srmist.edu.in'))
})

test('an approver cannot approve or reject their own submission, but another approver can', async () => {
  const { login } = setup()
  const boss = await login('token-boss-cccccccccccccccc')
  const boss2 = await login('token-boss2-dddddddddddddddd')
  const own = (await boss.as('POST', '/api/portal/items', annBody({ title: 'My own notice' }))).json().item
  assert.equal((await boss.as('POST', `/api/portal/items/${own.id}/approve`)).status, 403)
  assert.equal((await boss.as('POST', `/api/portal/items/${own.id}/reject`, { reason: 'self' })).status, 403)
  assert.equal((await boss2.as('POST', `/api/portal/items/${own.id}/approve`)).status, 200)
})

test('expired announcements and past events drop off the public pages by themselves', async () => {
  let now = new Date('2026-12-01T10:00:00Z')
  const { call, login } = setup({}, () => now)
  const teacher = await login('token-teacher-aaaaaaaaaaaa')
  const boss = await login('token-boss-cccccccccccccccc')
  const a = (await teacher.as('POST', '/api/portal/items', annBody({ expires_at: '2026-12-05' }))).json().item
  const e = (await teacher.as('POST', '/api/portal/items', eventBody({ event_date: '2026-12-05' }))).json().item
  await boss.as('POST', `/api/portal/items/${a.id}/approve`)
  await boss.as('POST', `/api/portal/items/${e.id}/approve`)
  assert.equal((await publicItems(call, 'announcement')).length, 1)
  assert.equal((await publicItems(call, 'event')).length, 1)
  now = new Date('2026-12-05T10:00:00Z') // the last day still shows
  assert.equal((await publicItems(call, 'event')).length, 1)
  now = new Date('2026-12-06T10:00:00Z')
  assert.equal((await publicItems(call, 'announcement')).length, 0)
  assert.equal((await publicItems(call, 'event')).length, 0)
})

test('an approver can edit a pending item before approving, and the edit is logged with before and after', async () => {
  const { login } = setup()
  const teacher = await login('token-teacher-aaaaaaaaaaaa')
  const boss = await login('token-boss-cccccccccccccccc')
  const item = (await teacher.as('POST', '/api/portal/items', annBody({ title: 'Typo titel' }))).json().item
  assert.equal((await boss.as('PATCH', `/api/portal/items/${item.id}`, annBody({ title: 'Typo title' }))).status, 200)
  const logs = (await boss.as('GET', '/api/portal/logs?action=edited')).json().logs
  assert.equal(logs.length, 1)
  assert.deepEqual(logs[0].details, { before: { title: 'Typo titel' }, after: { title: 'Typo title' } })
  assert.equal((await boss.as('PATCH', `/api/portal/items/${item.id}`, annBody({ title: 'Typo title' }))).status, 200) // no change: nothing new logged
  assert.equal((await boss.as('GET', '/api/portal/logs?action=edited')).json().logs.length, 1)
  await boss.as('POST', `/api/portal/items/${item.id}/approve`)
  assert.equal((await boss.as('PATCH', `/api/portal/items/${item.id}`, annBody({ title: 'Late change' }))).status, 409) // approved items are frozen
})

test('only the submitter can withdraw, and only while pending', async () => {
  const { login } = setup()
  const t1 = await login('token-teacher-aaaaaaaaaaaa')
  const t2 = await login('token-teacher2-bbbbbbbbbbb')
  const item = (await t1.as('POST', '/api/portal/items', annBody())).json().item
  assert.equal((await t2.as('POST', `/api/portal/items/${item.id}/withdraw`)).status, 404)
  assert.equal((await t1.as('POST', `/api/portal/items/${item.id}/withdraw`)).status, 200)
  assert.equal((await t1.as('POST', `/api/portal/items/${item.id}/withdraw`)).status, 409)
})

/* ---------- logs ---------- */
test('every action writes a log row, with IST-ready UTC times, and the approver sees who did what', async () => {
  const { login, repo } = setup()
  const teacher = await login('token-teacher-aaaaaaaaaaaa')
  const boss = await login('token-boss-cccccccccccccccc')
  const a = (await teacher.as('POST', '/api/portal/items', annBody())).json().item
  const b = (await teacher.as('POST', '/api/portal/items', annBody({ title: 'Second' }))).json().item
  await boss.as('POST', `/api/portal/items/${a.id}/approve`)
  await boss.as('POST', `/api/portal/items/${b.id}/reject`, { reason: 'Because.' })
  const logs = (await boss.as('GET', '/api/portal/logs')).json().logs
  assert.deepEqual(logs.map((l) => l.action).sort(), ['approved', 'rejected', 'submitted', 'submitted'])
  const approved = logs.find((l) => l.action === 'approved')
  assert.equal(approved.submitter_email, 'teacher.one@srmist.edu.in')
  assert.equal(approved.actor_email, 'boss@srmist.edu.in')
  assert.match(approved.approved_at, /Z$/)
  assert.ok(approved.live_at)
  assert.equal(repo._raw.logs.length, 4)
  // filters
  assert.equal((await boss.as('GET', '/api/portal/logs?action=rejected')).json().logs.length, 1)
  assert.equal((await boss.as('GET', '/api/portal/logs?approver=boss')).json().logs.length, 2)
  assert.equal((await boss.as('GET', '/api/portal/logs?submitter=teacher.one&type=announcement')).json().logs.length, 4)
  assert.equal((await boss.as('GET', '/api/portal/logs?type=event')).json().logs.length, 0)
  assert.equal((await boss.as('GET', '/api/portal/logs?from=2099-01-01')).json().logs.length, 0)
})

test('logs are append-only: no route changes them and the store refuses', async () => {
  const { login, repo } = setup()
  const boss = await login('token-boss-cccccccccccccccc')
  const teacher = await login('token-teacher-aaaaaaaaaaaa')
  await teacher.as('POST', '/api/portal/items', annBody())
  for (const [m, u] of [['POST', '/api/portal/logs'], ['PATCH', '/api/portal/logs/1'], ['PUT', '/api/portal/logs/1'], ['DELETE', '/api/portal/logs/1'], ['DELETE', '/api/portal/logs']]) {
    const r = await boss.as(m, u, {})
    assert.ok([404, 405].includes(r.status), `${m} ${u} -> ${r.status}`)
  }
  await assert.rejects(repo.updateLog(), /append-only/)
  await assert.rejects(repo.deleteLog(), /append-only/)
  assert.equal(repo._raw.logs.length, 1)
})

test('the CSV export has the headers, IST times and neutralised formulas', async () => {
  const { login } = setup()
  const teacher = await login('token-teacher-aaaaaaaaaaaa')
  const boss = await login('token-boss-cccccccccccccccc')
  const item = (await teacher.as('POST', '/api/portal/items', annBody({ title: '=HYPERLINK("http://evil")' }))).json().item
  await boss.as('POST', `/api/portal/items/${item.id}/approve`)
  const r = await boss.as('GET', '/api/portal/logs.csv')
  assert.equal(r.status, 200)
  assert.match(r.headers['content-type'], /text\/csv/)
  assert.match(r.text, /Timestamp \(IST\).*Posted by.*Action.*Approved at \(IST\).*Went live at \(IST\)/)
  assert.ok(!r.text.includes(',"=HYPERLINK'), 'a cell must not start with =')
  assert.ok(r.text.includes(`"'=HYPERLINK(""http://evil"")"`))
  assert.equal(csvCell('+1+1'), `"'+1+1"`)
})

/* ---------- input safety ---------- */
test('submission validation: types, lengths, dates, times and links, with the same rules the form shows', () => {
  const today = '2026-11-20'
  assert.equal(validateItem(annBody(), today).ok, true)
  assert.equal(validateItem({ ...annBody(), type: 'poll' }, today).ok, false)
  assert.ok(validateItem(annBody({ title: 'ab' }), today).errors.title)
  assert.ok(validateItem(annBody({ body: 'x'.repeat(4001) }), today).errors.body)
  assert.ok(validateItem(annBody({ link: 'javascript:alert(1)' }), today).errors.link)
  assert.ok(validateItem(annBody({ link: 'https://user:pw@evil.example/' }), today).errors.link)
  assert.ok(validateItem(annBody({ link: 'data:text/html,<script>1</script>' }), today).errors.link)
  assert.ok(validateItem(annBody({ expires_at: '2026-11-01' }), today).errors.expires_at)
  assert.ok(validateItem(annBody({ expires_at: '2026-02-30' }), today).errors.expires_at)
  assert.ok(validateItem(eventBody({ event_date: '2026-11-01' }), today).errors.event_date)
  assert.ok(validateItem(eventBody({ start_time: '25:00' }), today).errors.start_time)
  assert.ok(validateItem(eventBody({ start_time: '11:00', end_time: '10:00' }), today).errors.end_time)
  assert.ok(validateItem(eventBody({ venue: '' }), today).errors.venue)
  assert.equal(validateItem(eventBody({ registration_link: 'https://example.org/r' }), today).value.link, 'https://example.org/r')
})

test('markup in a submission is stored as plain text and control characters are removed (the pages escape it when they draw it)', async () => {
  const { login } = setup()
  const teacher = await login('token-teacher-aaaaaaaaaaaa')
  const r = await teacher.as('POST', '/api/portal/items', annBody({ title: '<img src=x onerror=alert(1)>Hello\u0000', body: '<script>alert(1)</script>\u0007ok' }))
  assert.equal(r.status, 201)
  const item = r.json().item
  assert.equal(item.title, '<img src=x onerror=alert(1)>Hello')
  assert.equal(item.body, '<script>alert(1)</script>ok')
  assert.match(r.headers['content-type'], /^application\/json/) // never served as HTML
})

test('the database layer never builds SQL from values: the only text pasted into a query is fixed SQL, never user input', async () => {
  const { readFileSync } = await import('node:fs')
  const src = readFileSync(new URL('../server/portal/repo-sql.js', import.meta.url), 'utf8')
  // every ${...} inside a template literal must be one of these known pieces of fixed SQL or a placeholder number
  const allowed = new Set(['ITEM_SELECT', 'where.length ? `WHERE ${where.join(\' AND \')}` : \'\'', "where.join(' AND ')", 'p.length', 'p.length + 1'])
  const used = [...src.matchAll(/\$\{([^}]*)\}/g)].map((m) => m[1].trim())
  for (const u of used) assert.ok(allowed.has(u) || /^where\.length/.test(u), `unexpected value pasted into SQL: ${u}`)
  assert.ok(!/\+\s*(email|name|title|body|reason|link|venue|req|user|id)\b/.test(src), 'string concatenation with a value')
  assert.ok((src.match(/\$\d/g) || []).length > 40, 'queries use numbered parameters')
})
