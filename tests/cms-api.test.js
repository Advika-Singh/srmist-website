import assert from 'node:assert/strict'
import test from 'node:test'
import { createPortal } from '../server/portal/handlers.js'
import { memoryRepo } from '../server/portal/repo-memory.js'

/* ---------- the same harness as the portal tests: a fake Google, an in-memory database, no network ---------- */
const GOOD = { aud: 'client-id', iss: 'https://accounts.google.com', exp: String(Math.floor(Date.now() / 1000) + 3600), email_verified: 'true', hd: 'srmist.edu.in' }
const TOKENS = {
  'token-teacher-aaaaaaaaaaaa': { ...GOOD, email: 'teacher.one@srmist.edu.in', name: 'Teacher One' },
  'token-teacher2-bbbbbbbbbbb': { ...GOOD, email: 'teacher.two@srmist.edu.in', name: 'Teacher Two' },
  'token-boss-cccccccccccccccc': { ...GOOD, email: 'boss@srmist.edu.in', name: 'Boss One' },
  'token-boss2-dddddddddddddddd': { ...GOOD, email: 'boss2@srmist.edu.in', name: 'Boss Two' },
}
const fakeGoogle = async (url) => {
  const t = decodeURIComponent(String(url).split('id_token=')[1])
  return TOKENS[t] ? new Response(JSON.stringify(TOKENS[t]), { status: 200 }) : new Response('{}', { status: 400 })
}

function setup() {
  const repo = memoryRepo()
  const env = { GOOGLE_CLIENT_ID: 'client-id', APPROVER_EMAILS: 'boss@srmist.edu.in, boss2@srmist.edu.in', PORTAL_INSECURE_COOKIES: '1' }
  const portal = createPortal({ repo, env, fetchImpl: fakeGoogle })
  const call = async (method, url, { body, cookie, csrf } = {}) => {
    const req = { method, url, headers: { host: 'site.test', ...(cookie ? { cookie } : {}), ...(csrf ? { 'x-csrf-token': csrf } : {}) }, socket: { remoteAddress: '1.1.1.1' }, body }
    const out = { status: 0, headers: {}, text: '' }
    const res = { statusCode: 200, writableEnded: false, setHeader: (k, v) => (out.headers[k.toLowerCase()] = v), end: (t) => { out.text = t ?? ''; out.status = res.statusCode; res.writableEnded = true } }
    await portal(req, res)
    return { ...out, json: () => JSON.parse(out.text) }
  }
  const login = async (who) => {
    const r = await call('POST', '/api/portal/login', { body: { credential: who } })
    const cookie = String(r.headers['set-cookie']).split(';')[0]
    const { csrf } = r.json()
    return (method, url, body) => call(method, url, { body, cookie, csrf })
  }
  return { repo, call, login }
}
const story = (o = {}) => ({ type: 'news', data: { title: 'New robotics lab opens', summary: 'The lab opens to students next week.', date: '2026-11-20', ...o } })

test('nothing in the content area works without signing in, and the public list is empty until something is published', async () => {
  const { call } = setup()
  assert.equal((await call('GET', '/api/portal/content')).status, 401)
  assert.equal((await call('POST', '/api/portal/content', { body: story() })).status, 401)
  const pub = await call('GET', '/api/public/content?type=news')
  assert.equal(pub.status, 200)
  assert.deepEqual(pub.json().items, [])
})

test('a change needs the CSRF header like every other portal change', async () => {
  const { call } = setup()
  const r = await call('POST', '/api/portal/login', { body: { credential: 'token-teacher-aaaaaaaaaaaa' } })
  const cookie = String(r.headers['set-cookie']).split(';')[0]
  assert.equal((await call('POST', '/api/portal/content', { body: story(), cookie })).status, 403)
})

test('the full path: teacher drafts, submits, someone else publishes, the public site shows it, with no names or emails', async () => {
  const { login, call } = setup()
  const teacher = await login('token-teacher-aaaaaaaaaaaa')
  const boss = await login('token-boss-cccccccccccccccc')

  const made = await teacher('POST', '/api/portal/content', story())
  assert.equal(made.status, 201)
  const item = made.json().item
  assert.equal(item.status, 'draft')
  assert.equal(item.slug, 'new-robotics-lab-opens')
  assert.equal((await call('GET', '/api/public/content?type=news')).json().items.length, 0, 'a draft is not public')

  assert.equal((await teacher('POST', `/api/portal/content/${item.id}/submit`)).json().item.status, 'pending')
  assert.equal((await call('GET', '/api/public/content?type=news')).json().items.length, 0, 'pending is not public')

  const out = await boss('POST', `/api/portal/content/${item.id}/publish`)
  assert.equal(out.status, 200)
  assert.equal(out.json().item.status, 'published')

  const list = await call('GET', '/api/public/content?type=news')
  assert.equal(list.status, 200)
  assert.match(list.headers['cache-control'], /public/)
  assert.equal(list.json().items.length, 1)
  assert.equal(list.json().items[0].data.title, 'New robotics lab opens')
  assert.equal(/teacher\.one|boss@|srmist\.edu\.in"/.test(list.text), false, 'no email addresses reach the public')
  assert.equal((await call('GET', '/api/public/content/news/new-robotics-lab-opens')).status, 200)
  assert.equal((await call('GET', '/api/public/content/news/nope')).status, 404)
})

test('nobody reviews their own work, not even an approver; a second approver can', async () => {
  const { login } = setup()
  const boss = await login('token-boss-cccccccccccccccc')
  const boss2 = await login('token-boss2-dddddddddddddddd')
  const id = (await boss('POST', '/api/portal/content', story())).json().item.id
  await boss('POST', `/api/portal/content/${id}/submit`)
  assert.equal((await boss('POST', `/api/portal/content/${id}/publish`)).status, 403)
  assert.equal((await boss('POST', `/api/portal/content/${id}/reject`, { reason: 'Nope, still mine' })).status, 403)
  assert.equal((await boss2('POST', `/api/portal/content/${id}/publish`)).status, 200)
})

test('teachers cannot publish, reject, unpublish, or see other teachers\' items', async () => {
  const { login } = setup()
  const t1 = await login('token-teacher-aaaaaaaaaaaa')
  const t2 = await login('token-teacher2-bbbbbbbbbbb')
  const id = (await t1('POST', '/api/portal/content', story())).json().item.id
  await t1('POST', `/api/portal/content/${id}/submit`)
  for (const action of ['publish', 'unpublish']) assert.equal((await t2('POST', `/api/portal/content/${id}/${action}`)).status, 404, 'looks like it does not exist')
  assert.equal((await t1('POST', `/api/portal/content/${id}/publish`)).status, 403)
  assert.equal((await t2('GET', `/api/portal/content/${id}`)).status, 404)
  assert.equal((await t2('PATCH', `/api/portal/content/${id}`, story({ title: 'Hijacked headline' }))).status, 404)
  assert.equal((await t2('GET', '/api/portal/content')).json().items.length, 0)
  assert.equal((await t1('GET', '/api/portal/content')).json().items.length, 1)
})

test('a rejection needs a reason, goes back to the author, and editing returns it to draft', async () => {
  const { login } = setup()
  const t = await login('token-teacher-aaaaaaaaaaaa')
  const boss = await login('token-boss-cccccccccccccccc')
  const id = (await t('POST', '/api/portal/content', story())).json().item.id
  await t('POST', `/api/portal/content/${id}/submit`)
  assert.equal((await boss('POST', `/api/portal/content/${id}/reject`, {})).status, 422)
  const rej = (await boss('POST', `/api/portal/content/${id}/reject`, { reason: 'Please add the date of the opening.' })).json().item
  assert.equal(rej.status, 'rejected')
  assert.equal(rej.reject_reason, 'Please add the date of the opening.')
  const edited = (await t('PATCH', `/api/portal/content/${id}`, story({ summary: 'The lab opens to students on 27 November.' }))).json().item
  assert.equal(edited.status, 'draft')
  assert.equal(edited.reject_reason, null)
  assert.equal(edited.version, 2)
})

test('a live story that is edited goes back for review while the published copy stays up, until the edit is approved', async () => {
  const { login, call } = setup()
  const t = await login('token-teacher-aaaaaaaaaaaa')
  const boss = await login('token-boss-cccccccccccccccc')
  const id = (await t('POST', '/api/portal/content', story())).json().item.id
  await t('POST', `/api/portal/content/${id}/submit`)
  await boss('POST', `/api/portal/content/${id}/publish`)

  const edit = (await t('PATCH', `/api/portal/content/${id}`, story({ title: 'Robotics lab now open' }))).json().item
  assert.equal(edit.status, 'pending')
  let live = (await call('GET', '/api/public/content/news/new-robotics-lab-opens')).json().item
  assert.equal(live.data.title, 'New robotics lab opens', 'the old text is still what the public sees')

  await boss('POST', `/api/portal/content/${id}/publish`)
  live = (await call('GET', '/api/public/content/news/new-robotics-lab-opens')).json().item
  assert.equal(live.data.title, 'Robotics lab now open')
})

test('unpublish takes it off the public site at once; archive keeps it out; archived items cannot be edited', async () => {
  const { login, call } = setup()
  const t = await login('token-teacher-aaaaaaaaaaaa')
  const boss = await login('token-boss-cccccccccccccccc')
  const id = (await t('POST', '/api/portal/content', story())).json().item.id
  await t('POST', `/api/portal/content/${id}/submit`)
  await boss('POST', `/api/portal/content/${id}/publish`)
  assert.equal((await t('POST', `/api/portal/content/${id}/unpublish`)).status, 403)
  assert.equal((await boss('POST', `/api/portal/content/${id}/unpublish`)).json().item.status, 'draft')
  assert.equal((await call('GET', '/api/public/content?type=news')).json().items.length, 0)
  assert.equal((await boss('POST', `/api/portal/content/${id}/archive`)).json().item.status, 'archived')
  assert.equal((await boss('PATCH', `/api/portal/content/${id}`, story({ title: 'Edit after archive' }))).status, 409)
})

test('bad content is refused with field messages; HTML is stripped; unknown types and fields are refused', async () => {
  const { login } = setup()
  const t = await login('token-teacher-aaaaaaaaaaaa')
  const bad = await t('POST', '/api/portal/content', { type: 'news', data: { title: 'ab', summary: 'short' } })
  assert.equal(bad.status, 422)
  assert.ok(bad.json().fields.title && bad.json().fields.summary && bad.json().fields.date)
  assert.equal((await t('POST', '/api/portal/content', { type: 'page', data: {} })).status, 422)
  assert.equal((await t('POST', '/api/portal/content', story({ is_admin: true }))).status, 422)
  const ok = (await t('POST', '/api/portal/content', story({ title: '<img src=x onerror=alert(1)>Safe headline' }))).json().item
  assert.equal(ok.data.title, 'Safe headline')
  assert.equal((await t('POST', '/api/portal/content', story({ link: 'javascript:alert(1)' }))).status, 422)
})

test('two stories with the same headline get different addresses; a site-text key cannot be reused or renamed', async () => {
  const { login } = setup()
  const t = await login('token-teacher-aaaaaaaaaaaa')
  const a = (await t('POST', '/api/portal/content', story())).json().item
  const b = (await t('POST', '/api/portal/content', story())).json().item
  assert.equal(a.slug, 'new-robotics-lab-opens')
  assert.equal(b.slug, 'new-robotics-lab-opens-2')

  const snip = { type: 'snippet', data: { key: 'announcements.intro', text: 'Notices from across the university.' } }
  const s = (await t('POST', '/api/portal/content', snip)).json().item
  assert.equal(s.slug, 'announcements.intro')
  assert.equal((await t('POST', '/api/portal/content', snip)).status, 409)
  assert.equal((await t('PATCH', `/api/portal/content/${s.id}`, { data: { key: 'other.key', text: 'x y z' } })).status, 422)
})

test('every action leaves an event with who did it and a snapshot, and events cannot be changed or removed', async () => {
  const { login, repo } = setup()
  const t = await login('token-teacher-aaaaaaaaaaaa')
  const boss = await login('token-boss-cccccccccccccccc')
  const id = (await t('POST', '/api/portal/content', story())).json().item.id
  await t('PATCH', `/api/portal/content/${id}`, story({ summary: 'The lab opens to students on the 27th.' }))
  await t('POST', `/api/portal/content/${id}/submit`)
  await boss('POST', `/api/portal/content/${id}/publish`)
  const events = (await boss('GET', `/api/portal/content/${id}/history`)).json().events
  assert.deepEqual(events.map((e) => e.action), ['published', 'submitted', 'edited', 'created'])
  assert.equal(events[0].actor.email, 'boss@srmist.edu.in')
  assert.equal(events[2].snapshot.summary, 'The lab opens to students on the 27th.')
  await assert.rejects(() => repo.cmsUpdateEvent(), /append-only/)
  await assert.rejects(() => repo.cmsDeleteEvent(), /append-only/)
})

test('the database layer itself refuses a reviewer who is the author', async () => {
  const { login, repo } = setup()
  const t = await login('token-teacher-aaaaaaaaaaaa')
  const item = (await t('POST', '/api/portal/content', story())).json().item
  const author = repo._raw.users.find((u) => u.email === 'teacher.one@srmist.edu.in')
  await assert.rejects(() => repo.cmsSetStatus(item.id, { status: 'published', reviewerId: author.id }), /reviewer_is_author/)
})

test('the editor can read the content types; the public list needs a known type', async () => {
  const { login, call } = setup()
  const t = await login('token-teacher-aaaaaaaaaaaa')
  const types = (await t('GET', '/api/portal/content/types')).json().types
  assert.deepEqual(types.map((x) => x.id), ['news', 'faq', 'snippet'])
  assert.equal((await call('GET', '/api/public/content')).status, 400)
  assert.equal((await call('GET', '/api/public/content?type=users')).status, 400)
  assert.equal((await call('POST', '/api/public/content?type=news')).status, 405)
})

test('only approvers can ask for everyone\'s items; a teacher asking for them still gets only their own', async () => {
  const { login } = setup()
  const t = await login('token-teacher-aaaaaaaaaaaa')
  const t2 = await login('token-teacher2-bbbbbbbbbbb')
  const boss = await login('token-boss-cccccccccccccccc')
  await t('POST', '/api/portal/content', story())
  await t2('POST', '/api/portal/content', story({ title: 'Another headline here' }))
  assert.equal((await t('GET', '/api/portal/content')).json().items.length, 1)
  assert.equal((await boss('GET', '/api/portal/content')).json().items.length, 2)
  assert.equal((await boss('GET', '/api/portal/content?mine=1')).json().items.length, 0)
})
