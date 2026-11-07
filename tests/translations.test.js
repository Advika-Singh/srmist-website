import assert from 'node:assert/strict'
import { test } from 'node:test'
import { DICT, LANGS, translate } from '../src/data/translations.js'

test('English and unknown text come back unchanged', () => {
  assert.equal(translate('en', 'Students'), 'Students')
  assert.equal(translate('ta', 'Some sentence nobody translated'), 'Some sentence nobody translated')
  assert.equal(translate('xx', 'Students'), 'Students')
})

test('Tamil and Hindi translate the header', () => {
  assert.equal(translate('ta', 'Students'), 'மாணவர்கள்')
  assert.equal(translate('hi', 'Students'), 'छात्र')
  assert.equal(translate('hi', 'Admissions 2027'), 'प्रवेश 2027')
})

test('every entry has a Tamil and a Hindi version, in the right script', () => {
  const tamil = /[஀-௿]/
  const devanagari = /[ऀ-ॿ]/
  for (const [en, v] of Object.entries(DICT)) {
    assert.ok(tamil.test(v.ta), `ta missing Tamil script: ${en}`)
    assert.ok(devanagari.test(v.hi), `hi missing Devanagari script: ${en}`)
  }
})

test('the three languages are English, Tamil and Hindi', () => {
  assert.deepEqual(LANGS.map((l) => l[0]), ['en', 'ta', 'hi'])
})

test('the strings the site shows in the header and hero are all translated', () => {
  for (const s of ['Faculty & Staff', 'Campuses', 'Academics', 'Services', 'About', 'Enter SRMIST', 'Engineering', 'Hotel Management', 'Current student', 'Learn across every discipline.']) {
    assert.ok(DICT[s], `no translation for: ${s}`)
  }
})
