import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { READ_ON, SECTION_BY_PATH } from '../data/sections.js'
import { Footer, SiteHeader } from '../shared.jsx'
import { FX } from '../ui/fx.jsx'
import LinkCards from '../ui/LinkCards.jsx'
import SvcHero from '../ui/SvcHero.jsx'
import { labelFor } from '../lib/seo.js'
import '../services.css'
import '../styles/sections.css'

// Each section's own hero shape, pattern and photo treatment (see styles/identity.css).
const IDV = {
  '/colleges': 'idv-arcade',
  '/research/centres': 'idv-grid idv-duo',
  '/research/initiatives': 'idv-stairs',
  '/research/partners': 'idv-venn',
  '/campus-life/student-life': 'idv-diamond idv-warm',
  '/campus-life/living': 'idv-sun idv-dome',
  '/campus-life/wellbeing': 'idv-blob',
  '/international/global': 'idv-circle',
  '/international/pathways': 'idv-arrow',
  '/about/history': 'idv-film',
  '/about/leadership': 'idv-ghost',
  '/about/recognition': 'idv-rays idv-octagon',
  '/about/offices': 'idv-ledger idv-chamfer',
  '/contact': 'idv-chevron',
}

/** One page of the redesigned official sections. The page's content and the effect for each group come from data/sections.js. */
export default function Section({ path }) {
  const page = SECTION_BY_PATH[path]
  const { hash } = useLocation()

  // Menu links point at a card (#pharmacy): scroll to it once the page is up, after the router's own scroll to the top.
  useEffect(() => {
    if (!hash) return undefined
    const t = setTimeout(() => document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ block: 'center', behavior: 'auto' }), 450)
    return () => clearTimeout(t)
  }, [hash, path])

  if (!page) return null
  return (
    <>
      <SiteHeader />
      <main className={`interior svc sx-page sx-${page.path.replace(/\W+/g, '-').replace(/^-|-$/g, '')} ${IDV[page.path] ?? ''}`} id="main" tabIndex={-1}>
        <SvcHero eyebrow={page.eyebrow} title={page.h1} lede={page.lede} img={page.img} pos={page.pos}>
          <nav className="vis-quick" aria-label="On this page">
            {page.groups.map((g) => (
              <a key={g.id} href={`#${g.id}`}>
                {g.title}
              </a>
            ))}
          </nav>
        </SvcHero>

        <section className="svc-wrap vis-grid">
          {page.groups.map((g) => {
            const Effect = FX[g.fx]
            return (
              <div className="vis-block" id={g.id} key={g.id}>
                <h2>{g.title}</h2>
                {g.intro && <p>{g.intro}</p>}
                <Effect items={g.items} group={g} />
              </div>
            )
          })}

          <div className="vis-block">
            <h2>Keep exploring</h2>
            <LinkCards items={page.related.map((p) => [labelFor(p) ?? p, p, null])} />
            <p className="source-note">
              Descriptions were written from the university’s own pages, read on {READ_ON}. Each card links to its official page, which is the source of truth and may have changed since. This is an independent concept redesign, not the official site.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
