// Groups the designations the university publishes into a few roles the staff finder can filter by.
// Pure logic; used by scripts/build-staff.mjs and tested in tests/staff-roles.test.js.

export const ROLES = ['Dean, director or principal', 'Professor', 'Associate professor', 'Assistant professor', 'Research faculty', 'Adjunct and visiting', 'Clinical and teaching staff', 'Other staff']

/** Index into ROLES, from the designation text the university publishes (most senior reading wins). */
export function roleOf(desig) {
  const d = String(desig).toLowerCase()
  if (/\b(adjunct|visiting)\b/.test(d)) return 5
  if (/\b(dean|director|principal|registrar|librarian)\b/.test(d) && !/\bassistant (dean|director)\b/.test(d)) return 0
  if (/research (assistant |associate )?professor|research professor|scientist|research associate/.test(d)) return 4
  if (/clinical|tutor|teaching|demonstrator|therapist|chef|instructor|program associate/.test(d)) return 6
  if (/assistant professor/.test(d)) return 3
  if (/associate professor/.test(d)) return 2
  if (/professor/.test(d)) return 1
  return 7
}
