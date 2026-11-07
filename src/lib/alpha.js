// Groups named items under their first letter, A to Z, with anything else under "#". Pure, so Node can test it.

const first = (name) => {
  const c = String(name).trim().charAt(0).toUpperCase()
  return /[A-Z]/.test(c) ? c : '#'
}

/** [{ name, ... }] -> [{ letter, items: [...] }], letters in order with "#" last, items sorted by name. */
export function groupByLetter(items) {
  const map = new Map()
  for (const it of items) {
    const l = first(it.name)
    if (!map.has(l)) map.set(l, [])
    map.get(l).push(it)
  }
  const letters = [...map.keys()].sort((a, b) => (a === '#' ? 1 : b === '#' ? -1 : a.localeCompare(b)))
  return letters.map((letter) => ({
    letter,
    items: map.get(letter).sort((a, b) => a.name.trim().localeCompare(b.name.trim(), 'en', { sensitivity: 'base' })),
  }))
}
