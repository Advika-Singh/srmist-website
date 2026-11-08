import { Footer, SiteHeader } from '../shared.jsx'
import SvcHero from './SvcHero.jsx'
import '../services.css'

/** Shared layout for the plain-language policy pages: a hero, then titled sections of term/definition rows. */
export default function LegalPage({ eyebrow, title, lede, img = '/srmist/library.jpg', sections, note, children }) {
  return (
    <>
      <SiteHeader />
      <main className="interior svc" id="main" tabIndex={-1}>
        <SvcHero eyebrow={eyebrow} title={title} lede={lede} img={img} pos="50% 50%" />
        <section className="svc-wrap vis-grid">
          {sections.map((s) => (
            <div className="vis-block" key={s.id} id={s.id}>
              <h2>{s.title}</h2>
              <dl className="priv-list">
                {s.items.map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
          {children}
          <div className="vis-block">
            <p className="source-note">{note}</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
