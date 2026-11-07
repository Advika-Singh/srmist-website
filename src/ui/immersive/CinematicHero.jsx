import { useEffect, useRef } from 'react'
import { useLang } from '../../i18n.jsx'
import { Photo } from '../../shared.jsx'

/**
 * Full-bleed inner-page hero: the page's photo cropped its own way, tinted with the page accent, a slow push-in as you
 * scroll past, and a title that rises word by word like the home page wordmark.
 */
export default function CinematicHero({ hero, accent, crop }) {
  const root = useRef(null)
  const { lang } = useLang()

  // push-in and fade while the hero scrolls away (cheap: one CSS variable, no React re-render)
  useEffect(() => {
    const el = root.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const update = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height)))
      el.style.setProperty('--ch-p', p.toFixed(3))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  const words = lang === 'en' ? hero.h1.split(' ') : [hero.h1] // one piece when translated, so the whole sentence is translated together
  return (
    <section ref={root} className="ch" style={{ '--ch-accent': accent, '--ch-crop': crop, '--ch-p': 0 }}>
      <div className="ch-photo" aria-hidden={!hero.alt}>
        <Photo src={hero.img} alt={hero.alt ?? ''} sizes="100vw" widths={[800, 1200, 1600]} size={[1600, 1000]} priority />
      </div>
      <div className="ch-tint" aria-hidden="true" />
      <div className="ch-copy">
        <span className="eyebrow ch-eyebrow">{hero.eyebrow}</span>
        <h1 aria-label={hero.h1}>
          {words.map((w, i) => (
            <span key={i} className="ch-word" aria-hidden="true" style={{ animationDelay: `${0.15 + i * 0.09}s` }}>
              {w}
            </span>
          ))}
        </h1>
        <p className="ch-lede">{hero.p}</p>
      </div>
      <span className="ch-cue" aria-hidden="true">
        Scroll
        <i />
      </span>
    </section>
  )
}
