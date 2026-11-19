// Converts the SRMIST photographs in public/srmist from JPEG to WebP, next to the originals.
// Run once after adding or replacing a photo:  node scripts/optimize-images.mjs
// The app uses the .webp files; the .jpg files stay because link previews (Open Graph) still want JPEG.
import { readdirSync, statSync } from 'node:fs'
import { extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const dir = fileURLToPath(new URL('../public/srmist/', import.meta.url))
let before = 0
let after = 0
for (const name of readdirSync(dir).filter((n) => extname(n).toLowerCase() === '.jpg')) {
  const src = join(dir, name)
  const out = join(dir, name.replace(/\.jpg$/i, '.webp'))
  await sharp(src).webp({ quality: 74, effort: 6 }).toFile(out)
  const a = statSync(src).size
  const b = statSync(out).size
  before += a
  after += b
  console.log(`${name.padEnd(30)} ${(a / 1024).toFixed(0).padStart(5)} KB -> ${(b / 1024).toFixed(0).padStart(5)} KB`)
}
console.log(`total ${(before / 1024).toFixed(0)} KB -> ${(after / 1024).toFixed(0)} KB`)
