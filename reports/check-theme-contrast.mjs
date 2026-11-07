// Verifies the colour pairs promised in src/theme.css. Exits 1 if any pair misses its WCAG 2.2 AA target.
//   node reports/check-theme-contrast.mjs
const hex = (h) => {
  const v = h.replace('#', '')
  return [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16) / 255)
}
const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const lum = (h) => {
  const [r, g, b] = hex(h).map(lin)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}

const C = { ink: '#171814', paper: '#f3f1e9', white: '#ffffff', blue: '#084b9b', blueDark: '#06366f', gold: '#f2c84b', muted: '#4d4e49', placeholder: '#6a6b65', onBlueMuted: '#d6e4f7', success: '#0f6b3a', danger: '#a31f1f', lineStrong: '#6a6b65' }

// [label, foreground, background, minimum]
const PAIRS = [
  ['body text on paper', C.ink, C.paper, 4.5],
  ['body text on white', C.ink, C.white, 4.5],
  ['muted text on paper', C.muted, C.paper, 4.5],
  ['muted text on white', C.muted, C.white, 4.5],
  ['placeholder on white', C.placeholder, C.white, 4.5],
  ['placeholder on paper', C.placeholder, C.paper, 4.5],
  ['links / primary button (blue on white)', C.blue, C.white, 4.5],
  ['blue on paper', C.blue, C.paper, 4.5],
  ['white on blue', C.white, C.blue, 4.5],
  ['white on dark blue', C.white, C.blueDark, 4.5],
  ['muted-on-blue text on blue', C.onBlueMuted, C.blue, 4.5],
  ['ink on gold (CTA pill)', C.ink, C.gold, 4.5],
  ['success text on white', C.success, C.white, 4.5],
  ['error text on white', C.danger, C.white, 4.5],
  ['gold focus ring on blue', C.gold, C.blue, 3],
  ['blue focus ring on paper', C.blue, C.paper, 3],
  ['input border on white', C.lineStrong, C.white, 3],
  ['gold on ink (strip, footer focus)', C.gold, C.ink, 3],
]

let bad = 0
for (const [label, fg, bg, min] of PAIRS) {
  const r = ratio(fg, bg)
  const ok = r >= min
  if (!ok) bad++
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${r.toFixed(2).padStart(5)}:1 (need ${min})  ${label}`)
}
console.log(bad ? `\n${bad} pair(s) below target` : '\nAll pairs meet WCAG 2.2 AA')
process.exit(bad ? 1 : 0)
