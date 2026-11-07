import assert from 'node:assert/strict'
import test from 'node:test'
import { DEPARTMENTS } from '../src/data/departments.js'
import { KINDS, STORIES, storiesForDepartment } from '../src/data/innovation.js'

const slugOf = (href) => href.replace(/\/$/, '').split('/').pop()
const known = new Set(DEPARTMENTS.map((d) => slugOf(d.href)))

test('there are stories, and each one is sourced, short and dated', () => {
  assert.ok(STORIES.length >= 3)
  const ids = new Set()
  for (const s of STORIES) {
    assert.ok(!ids.has(s.id), `duplicate id ${s.id}`)
    ids.add(s.id)
    assert.match(s.source, /^https:\/\//, `${s.id} needs an https source`)
    assert.ok(s.hook.length > 0 && s.hook.length <= 120, `${s.id} hook length ${s.hook.length}`)
    assert.match(s.asOf, /^\d{4}-\d{2}-\d{2}$/)
    assert.ok(KINDS.includes(s.kind), `${s.id} has an unknown kind`)
    assert.ok(Array.isArray(s.departments))
  }
})

test('every department a story names exists in the department directory', () => {
  for (const s of STORIES) for (const d of s.departments) assert.ok(known.has(d), `${s.id}: unknown department ${d}`)
})

test('storiesForDepartment returns only stories that name the department, and nothing for an unknown one', () => {
  const aero = storiesForDepartment('department-of-aerospace-engineering')
  assert.ok(aero.length >= 1)
  assert.ok(aero.every((s) => s.departments.includes('department-of-aerospace-engineering')))
  assert.deepEqual(storiesForDepartment('department-of-nothing'), [])
})
