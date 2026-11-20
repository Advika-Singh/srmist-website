import CinematicHero from './immersive/CinematicHero.jsx'
import SvcHero from './SvcHero.jsx'

/**
 * The one hero every page uses (see docs/DESIGN-RULES.md). Pages choose a layout, never a new frame:
 *   layout="band"  blue band with the page photo, for service and information pages (the default)
 *   layout="photo" full-bleed photo, for the immersive pages (accent and photo crop come from data/page-kits.js)
 * The heading size and the two minimum heights come from the --hero-h1, --hero-min-m and --hero-min-l tokens in theme.css.
 * `children` is for the in-page quick links.
 */
export default function Hero({ layout = 'band', eyebrow, title, lede, img, pos, alt, accent, children }) {
  if (layout === 'photo') {
    return (
      <CinematicHero hero={{ eyebrow, h1: title, p: lede, img, alt }} accent={accent} crop={pos}>
        {children}
      </CinematicHero>
    )
  }
  return (
    <SvcHero eyebrow={eyebrow} title={title} lede={lede} img={img} pos={pos}>
      {children}
    </SvcHero>
  )
}
