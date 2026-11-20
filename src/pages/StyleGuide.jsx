import Hero from '../ui/Hero.jsx'
import { Footer, SiteHeader } from '../shared.jsx'
import '../services.css'
import '../styles/styleguide.css'

/**
 * The design system on one page, for reviewers (not linked from the menus, not in the sitemap).
 * The rules and the guard behind them are in docs/DESIGN-RULES.md and tests/design-consistency.test.js.
 */

const COLOURS = [
  ['--ink', 'Ink', 'Text, dark bands'],
  ['--paper', 'Paper', 'Page ground'],
  ['--sand', 'Sand', 'Alternate bands'],
  ['--blue', 'Blue', 'Brand, links'],
  ['--blue-dark', 'Blue dark', 'Hero ground'],
  ['--gold', 'Gold', 'The one accent: buttons, eyebrows, rules'],
]

const LOOKS = [
  {
    id: 'ghost',
    name: 'Ghost',
    what: 'Gold rule on the left, an outlined SRMIST watermark, a quiet greyscale photo.',
    when: 'Used on Leadership and Accessible map',
    pages: 'Leadership and governance, Accessible map',
  },
  {
    id: 'circle',
    name: 'Circle',
    what: 'Blue hero with the page photo in a ringed circle on the right over a ring pattern.',
    when: 'Used on Global SRM',
    pages: 'Global SRM. The same family also holds the arch, hexagon, pill, blob, diamond, venn, octagon, slats and tiles frames used by other pages.',
  },
  {
    id: 'spine',
    name: 'Spine',
    what: 'Ink hero with the photo in a ringed circle at the corner over a fine line pattern.',
    when: 'Used on Library only',
    pages: 'The Library, and only the Library. Quarter and diagonal heroes serve the other immersive pages.',
  },
]

export default function StyleGuide() {
  return (
    <>
      <SiteHeader />
      <main className="interior svc idv-ghost sg" id="main" tabIndex={-1}>
        <Hero layout="band" eyebrow="Design system" title="One site, many pages." lede="What is the same on every page, and the short list of ways a page is allowed to differ." img="/srmist/campus-main-building.webp" pos="50% 40%" />

        <section className="svc-wrap">
          <div className="vis-block">
            <h2>Locked on every page</h2>
            <p>This is what makes it one site: colour tokens with one accent, three typefaces, one hero heading size, two hero heights, three corner radii, one primary button and one motion curve.</p>
            <ul className="sg-swatches">
              {COLOURS.map(([v, name, use]) => (
                <li key={v}>
                  <span style={{ background: `var(${v})` }} aria-hidden="true" />
                  <b>{name}</b>
                  <small>{use}</small>
                </li>
              ))}
            </ul>
            <div className="sg-type">
              <p className="sg-display">Playfair Display, for headings</p>
              <p className="sg-sans">DM Sans, for text and everything you read for longer than a line.</p>
              <p className="sg-mono">ROBOTO MONO, FOR SMALL LABELS</p>
            </div>
            <div className="sg-parts">
              <a className="svc-btn svc-btn--primary" href="#looks">Primary: gold square</a>
              <a className="svc-btn" href="#looks">Secondary: outline</a>
              <span className="sg-r sg-r-sm">Small radius</span>
              <span className="sg-r sg-r-md">Medium radius</span>
              <span className="sg-r sg-r-lg">Large radius</span>
            </div>
          </div>

          <div className="vis-block" id="looks">
            <h2>A menu of hero looks</h2>
            <p>Every page picks one look from a curated menu of about twenty (framed photos, cut edges, pattern washes, ghost and the immersive looks), so neighbouring pages differ. Three examples are shown. A new page picks from the menu; it does not invent a new one.</p>
            <ul className="sg-looks">
              {LOOKS.map((l) => (
                <li key={l.id}>
                  <div className={`sg-thumb sg-thumb--${l.id}`} aria-hidden="true">
                    <i />
                    <em>SRMIST</em>
                  </div>
                  <h3>{l.name}</h3>
                  <p>{l.what}</p>
                  <p className="sg-when">{l.when}</p>
                  <details>
                    <summary>Pages that use it</summary>
                    <p>{l.pages}</p>
                  </details>
                </li>
              ))}
            </ul>
          </div>

          <div className="vis-block">
            <h2>Where a page may be different</h2>
            <p>Content, photography, and one signature moment: a pinned story, a sideways rail, sticky chapters, expanding panels, a filter grid or a count band. In the menus, links to pages this redesign has rebuilt are bold.</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
