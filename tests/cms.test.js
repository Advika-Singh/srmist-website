import assert from 'node:assert/strict'
import test from 'node:test'
import { TYPES, cleanImage, cleanString, cleanText, cleanUrl, slugFor, slugify, typeList, validateContent } from '../server/cms/schemas.js'

const news = (o = {}) => ({ title: 'A new lab opens', summary: 'The new laboratory opens its doors this week.', date: '2026-11-20', ...o })

test('a good news story passes and keeps only its own fields, cleaned', () => {
  const r = validateContent('news', news({ body: 'Line one.\r\n\r\n\r\n\r\nLine two.' }))
  assert.equal(r.ok, true)
  assert.equal(r.value.body, 'Line one.\n\nLine two.')
  assert.deepEqual(Object.keys(r.value).sort(), ['body', 'date', 'summary', 'title'])
})

test('HTML never survives: tags are stripped from every text field', () => {
  assert.equal(cleanString('Hello <script>alert(1)</script> world', 100), 'Hello alert(1) world')
  assert.equal(cleanString('<img src=x onerror=alert(1)>Hi', 100), 'Hi')
  assert.equal(cleanText('<b>Bold</b>\n\n<iframe src="x"></iframe>Next', 100), 'Bold\n\nNext')
  assert.equal(cleanString('a < b > c', 100).includes('<'), false)
  const r = validateContent('news', news({ title: '<h1>Big news</h1>' }))
  assert.equal(r.value.title, 'Big news')
})

test('missing, too short, too long and unknown fields are reported by name', () => {
  const r = validateContent('news', { title: 'ab', summary: 'short', extra: 'x' })
  assert.equal(r.ok, false)
  assert.match(r.errors.title, /At least 3/)
  assert.match(r.errors.summary, /At least 10/)
  assert.equal(r.errors.date, 'Required.')
  assert.match(r.errors.extra, /does not exist/)
  assert.match(validateContent('news', news({ title: 'x'.repeat(141) })).errors.title, /At most 140/)
})

test('links must be web addresses without credentials; javascript: and data: are refused', () => {
  assert.equal(cleanUrl('https://www.srmist.edu.in/news/', 500), 'https://www.srmist.edu.in/news/')
  for (const bad of ['javascript:alert(1)', 'data:text/html,<b>x', 'ftp://x.org/f', 'https://user:pass@evil.com/', 'not a url', 'vbscript:x']) assert.equal(cleanUrl(bad, 500), null, bad)
  assert.equal(cleanUrl('', 500), '')
})

test('images must be allowed by the site policy: own photos, srmist.edu.in or Unsplash over https', () => {
  assert.equal(cleanImage('/srmist/campus-lakeview.webp', 300), '/srmist/campus-lakeview.webp')
  assert.equal(cleanImage('https://www.srmist.edu.in/wp-content/uploads/2022/04/Music.png', 300), 'https://www.srmist.edu.in/wp-content/uploads/2022/04/Music.png')
  for (const bad of ['/srmist/../../etc/passwd', '/srmist/a.exe', 'http://www.srmist.edu.in/a.png', 'https://evil.com/a.png', 'https://www.srmist.edu.in.evil.com/a.png', '//evil.com/a.png', 'javascript:alert(1)']) assert.equal(cleanImage(bad, 300), null, bad)
})

test('an image needs a description for screen readers', () => {
  const r = validateContent('news', news({ image: '/srmist/hero.webp' }))
  assert.equal(r.ok, false)
  assert.match(r.errors.image_alt, /screen readers/)
  assert.equal(validateContent('news', news({ image: '/srmist/hero.webp', image_alt: 'The campus from above' })).ok, true)
})

test('dates must be real days; enums must be one of the options', () => {
  assert.equal(validateContent('news', news({ date: '2026-02-31' })).ok, false)
  assert.equal(validateContent('news', news({ date: 'tomorrow' })).ok, false)
  assert.equal(validateContent('faq', { question: 'When do classes start?', answer: 'See the academic calendar for the dates.', topic: 'campus' }).ok, true)
  assert.equal(validateContent('faq', { question: 'When do classes start?', answer: 'See the academic calendar for the dates.', topic: 'bribes' }).ok, false)
})

test('a site-text key is a strict slug and becomes the item address as it is', () => {
  for (const bad of ['Has Space', 'UPPER', '../x', 'a..b', '-a', 'a_b']) assert.equal(validateContent('snippet', { key: bad, text: 'x' }).ok, false, bad)
  const r = validateContent('snippet', { key: 'announcements.intro', text: 'Notices from across the university.' })
  assert.equal(r.ok, true)
  assert.equal(slugFor('snippet', r.value), 'announcements.intro')
})

test('slugs come from the headline, safely', () => {
  assert.equal(slugify('SRMIST hosts Falling Walls Lab, Chennai 2026!'), 'srmist-hosts-falling-walls-lab-chennai-2026')
  assert.equal(slugify('Café & Crème'), 'cafe-creme')
  assert.equal(slugify('...'), '')
  assert.equal(slugFor('news', { title: '!!!' }), 'news')
  assert.ok(slugify('x'.repeat(200)).length <= 60)
})

test('the editor gets every type with its fields, and an unknown type is refused', () => {
  assert.deepEqual(typeList().map((t) => t.id), Object.keys(TYPES))
  assert.ok(typeList().every((t) => t.fields.length && t.fields.every((f) => f.key && f.label && f.kind)))
  assert.equal(validateContent('nope', {}).ok, false)
  assert.equal(validateContent('news', [1]).ok, false)
})
