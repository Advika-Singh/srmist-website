import assert from 'node:assert/strict'
import test from 'node:test'
import { ROLES, roleOf } from '../src/lib/staffRoles.js'

const role = (d) => ROLES[roleOf(d)]

test('professors, associates and assistants are told apart', () => {
  assert.equal(role('Professor & Head, Department of Physics'), 'Professor')
  assert.equal(role('Associate Professor'), 'Associate professor')
  assert.equal(role('Assistant Professor Jr.G'), 'Assistant professor')
  assert.equal(role('Associate Professor - OG - HOD'), 'Associate professor')
})

test('deans and directors rank above professor, even when they are also professors', () => {
  assert.equal(role('Dean, Professor & Head, Department of Pharmacology, College of Pharmacy'), 'Dean, director or principal')
  assert.equal(role('Vice Principal / Professor'), 'Dean, director or principal')
})

test('research, visiting and clinical staff are grouped on their own', () => {
  assert.equal(role('Research Assistant Professor'), 'Research faculty')
  assert.equal(role('Visiting Professor'), 'Adjunct and visiting')
  assert.equal(role('Adjunct Professor'), 'Adjunct and visiting')
  assert.equal(role('Clinical Instructor'), 'Clinical and teaching staff')
  assert.equal(role('Nursing Tutor'), 'Clinical and teaching staff')
})

test('anything unrecognised is "Other staff", and nothing throws on empty text', () => {
  assert.equal(role('Lab Technician'), 'Other staff')
  assert.equal(role(''), 'Other staff')
  assert.equal(role(undefined), 'Other staff')
})
