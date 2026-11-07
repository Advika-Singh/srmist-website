import assert from 'node:assert/strict'
import test from 'node:test'
import { depthFromHome } from '../src/lib/clickDepth.js'

test('the pages a prospective student looks for first are one click away', () => {
  assert.equal(depthFromHome('/admissions'), 1)
  assert.equal(depthFromHome('/srmjeee'), 1)
  assert.equal(depthFromHome('/placements'), 1)
})

test('programme, hostel, staff and story pages are at most two clicks away (open the menu, then the link)', () => {
  for (const p of ['/course-finder', '/hostels', '/staff-finder', '/innovation', '/ask-a-student', '/clubs']) {
    const d = depthFromHome(p)
    assert.ok(d !== null && d <= 2, `${p} is ${d} clicks away`)
  }
})

test('anchors and query strings count as the page they open', () => {
  assert.equal(depthFromHome('/hostels#women'), depthFromHome('/hostels'))
  assert.equal(depthFromHome('/innovation?dept=x'), depthFromHome('/innovation'))
})

test('a page that nothing links to is unreachable', () => {
  assert.equal(depthFromHome('/does-not-exist'), null)
})
