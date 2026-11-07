// How many clicks from the home page to reach a page, counted the way a phone visitor would: header buttons, the top strip and
// the quick links are one click; a main-menu item is one click to open and each link inside its dropdown is a second click.
// Pure and tested in tests/click-depth.test.js, so a change to the menus that buries a key page fails the build.
import { ADMIT, AUX, CAMPUSES, MENUS, SRMJEEE_LINK, STRIP } from '../data/nav.js'

const pathOf = (href) => href.split(/[?#]/)[0].replace(/\/$/, '') || '/'

function build() {
  const depth = new Map()
  const put = (href, d) => {
    if (typeof href !== 'string' || !href.startsWith('/')) return // only our own pages are counted
    const p = pathOf(href)
    if (!depth.has(p) || depth.get(p) > d) depth.set(p, d)
  }
  for (const [, href] of [...STRIP, ...AUX, ADMIT, SRMJEEE_LINK]) put(href, 1)
  for (const m of MENUS) {
    put(m.to, 1)
    for (const c of m.cols) for (const [, href] of c.links) put(href, 2)
  }
  for (const [, href] of CAMPUSES) put(href, 2)
  return depth
}

const DEPTHS = build()

/** Clicks from the home page to this page, or null when no menu or button links to it. */
export const depthFromHome = (href) => DEPTHS.get(pathOf(href)) ?? null
