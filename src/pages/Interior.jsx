import pages from '../data/pages.json'
import { kitFor } from '../data/page-kits.js'
import '../styles/immersive.css'
import CinematicHero from '../ui/immersive/CinematicHero.jsx'
import Moments from '../ui/immersive/Moments.jsx'
import { PROGRAMMES, applyHref } from '../data/programmes.js'
import { Arrow, Footer, Photo, Reveal, SiteHeader, ex } from '../shared.jsx'
import { AboutDeemed, ResponsiveTable } from '../ui/blocks.jsx'
import TiltGrid from '../ui/TiltGrid.jsx'

const PROGRAMME_COLUMNS = [
  { key: 'field', label: 'Field of study' },
  { key: 'levels', label: 'Levels' },
  { key: 'duration', label: 'Typical length' },
  { key: 'examples', label: 'Includes' },
  { key: 'apply', label: 'Next step' },
]

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

/**
 * Every inner page shares this template: compact hero, stat strip, a sticky "on this page" bar,
 * card grid of topics, and a split feature. Programme pages add the programme table, which turns
 * into stacked cards on phones (no sideways scrolling). Admissions has its own screen (pages/Admissions.jsx).
 */
export default function Interior({ slug }) {
  const page = pages[slug]
  const { hero, stats, intro, blocks, split } = page
  const kit = kitFor(slug)
  const showProgrammes = slug === 'programmes' || slug === 'academics'

  const rows = PROGRAMMES.map((p) => ({
    field: p.field,
    levels: p.levels,
    duration: p.duration,
    examples: p.examples,
    apply: (
      <a className="text-link" href={applyHref(p.id)}>
        Apply <Arrow />
      </a>
    ),
  }))

  return (
    <>
      <SiteHeader />
      <main className="interior" id="main" tabIndex={-1}>
        {kit ? (
          <CinematicHero hero={hero} accent={kit.accent} crop={kit.crop} />
        ) : (
        <section className="page-hero">
          <Reveal className="page-title">
            <span className="eyebrow">{hero.eyebrow}</span>
            <h1>{hero.h1}</h1>
            <p>{hero.p}</p>
          </Reveal>
          <figure>
            <Photo src={hero.img} alt={hero.alt} sizes="(max-width: 900px) 100vw, 48vw" widths={[600, 900, 1200]} size={[1200, 1400]} priority />
            <figcaption>{hero.caption}</figcaption>
          </figure>
        </section>
        )}

        {kit ? (
          <Moments slug={slug} page={page} kit={kit} />
        ) : (
        <section className="page-stats" aria-label="At a glance">
          {stats.map(([n, label]) => (
            <div key={label}>
              <b>{n}</b>
              <span>{label}</span>
            </div>
          ))}
        </section>
        )}

        {slug === 'about' && <AboutDeemed headingLevel="h2" />}

        <nav className="page-jump" aria-label="On this page">
          {showProgrammes && <a href="#programme-table">Programmes at a glance</a>}
          {blocks.map((b) => (
            <a key={b.n} href={`#${slugify(b.h3)}`}>
              {b.h3}
            </a>
          ))}
        </nav>

        <Reveal as="section" className="page-intro">
          <span className="eyebrow">{intro.eyebrow}</span>
          <h2>{intro.h2}</h2>
        </Reveal>

        {showProgrammes && (
          <section className="programme-table" id="programme-table" aria-labelledby="pt-h">
            <h2 id="pt-h">Programmes at a glance</h2>
            <ResponsiveTable caption="Fields of study, levels and typical programme length" columns={PROGRAMME_COLUMNS} rows={rows} />
            <small className="source-note">Typical lengths for each degree; confirm exact programmes and eligibility on the official programme page.</small>
          </section>
        )}

        <section className="content-blocks">
          {blocks.map((b, i) => (
            <Reveal as="article" key={b.n} id={slugify(b.h3)} delay={(i % 4) * 0.07}>
              <span>{b.n}</span>
              <div>
                <h3>{b.h3}</h3>
                <p>{b.p}</p>
              </div>
              <ul>
                {b.items.map((it) => (
                  <li key={it}>
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </section>

        {(slug === 'campus-life' || slug === 'about') && <TiltGrid />}

        <section className="split-feature">
          <Photo src={split.img} alt={split.alt} sizes="(max-width: 900px) 100vw, 50vw" widths={[600, 900, 1200]} size={[1200, 1000]} />
          <Reveal>
            <span className="eyebrow">{split.eyebrow}</span>
            <h2>{split.h2}</h2>
            <p>{split.p}</p>
            {split.link && (
              <a className="text-link" href={split.link.href} {...ex(split.link.href)}>
                {split.link.text} <Arrow />
              </a>
            )}
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  )
}
