import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'

// The guard for docs/DESIGN-RULES.md. The numbers are ceilings measured on 2026-11-20: they may only go DOWN.
// When you remove variants, lower the ceiling here in the same commit.
const MAX_IDENTITY_CLASSES = 45 // the curated menu of hero looks; it may shrink, it must not grow
const MAX_PAGE_ACCENTS = 1
const MAX_RADIUS_VALUES = 11

const read = (f) => fs.readFileSync(f, 'utf8')
const walk = (dir, ext) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name)
    return e.isDirectory() ? walk(p, ext) : p.endsWith(ext) ? [p] : []
  })

const cssFiles = [...walk('src', '.css')]

test('the menu of hero looks does not grow', () => {
  const names = new Set([...read('src/styles/identity.css').matchAll(/\.idv-[a-z0-9-]+/g)].map((m) => m[0]))
  assert.ok(names.size <= MAX_IDENTITY_CLASSES, `identity.css has ${names.size} .idv-* classes; the ceiling is ${MAX_IDENTITY_CLASSES}. Pick a look that exists; docs/DESIGN-RULES.md says how to add one.`)
})

test('page accent colours do not multiply', () => {
  const accents = new Set([...read('src/data/page-kits.js').matchAll(/accent:\s*'(#[0-9a-fA-F]+)'/g)].map((m) => m[1].toLowerCase()))
  assert.ok(accents.size <= MAX_PAGE_ACCENTS, `page-kits.js uses ${accents.size} accent colours; the ceiling is ${MAX_PAGE_ACCENTS}. The site accent is gold on brand blue.`)
})

test('corner radii do not multiply', () => {
  const values = new Set()
  for (const f of cssFiles) for (const m of read(f).matchAll(/border-radius:\s*([0-9.]+)px/g)) values.add(m[1])
  assert.ok(values.size <= MAX_RADIUS_VALUES, `the CSS uses ${values.size} different border-radius pixel values; the ceiling is ${MAX_RADIUS_VALUES}.`)
})

test('every page gets its hero from the one Hero component', () => {
  const offenders = walk('src', '.jsx').filter((f) => {
    const norm = f.replaceAll('\\', '/')
    if (norm.endsWith('src/ui/Hero.jsx')) return false // the one place allowed to use the implementations
    return /from\s+'[^']*(SvcHero|CinematicHero)\.jsx'/.test(read(f))
  })
  assert.deepEqual(offenders, [], `import { Hero } from the ui/Hero component instead of SvcHero or CinematicHero in: ${offenders.join(', ')}`)
})

test('the hero heading size is one token, not a per-page number', () => {
  assert.match(read('src/theme.css'), /--hero-h1\s*:/, 'theme.css must define --hero-h1')
  for (const [file, selector] of [
    ['src/styles/shell.css', '.sh h1'],
    ['src/styles/immersive.css', '.ch h1'],
  ]) {
    const rule = read(file)
      .split('\n')
      .find((l) => l.startsWith(`${selector}{`))
    assert.ok(rule, `${file} should have a "${selector}" rule`)
    assert.match(rule, /font-size:\s*var\(--hero-h1\)/, `${selector} must use var(--hero-h1)`)
  }
  const identity = read('src/styles/identity.css')
  assert.doesNotMatch(identity, /\.(sh|ch) h1\{[^}]*font-size/, 'identity.css must not set its own hero heading size')
})

test('the two hero heights are tokens', () => {
  const theme = read('src/theme.css')
  assert.match(theme, /--hero-min-m\s*:/)
  assert.match(theme, /--hero-min-l\s*:/)
  assert.match(read('src/styles/shell.css'), /\.sh\{[^}]*min-height:var\(--hero-min-m\)/)
  assert.match(read('src/styles/immersive.css'), /\.ch\{[^}]*min-height:var\(--hero-min-l\)/)
})

test('the primary button is the gold square', () => {
  assert.match(read('src/services.css'), /\.svc-btn--primary\s*\{[^}]*background:\s*var\(--gold\)[^}]*border-radius:\s*0/)
})
