import { useEffect, useRef } from 'react'
import { useLang } from '../i18n.jsx'

/**
 * The hero every service and information page shares with the landing page's look: a full-bleed photo under a blue tint,
 * a title that rises word by word, and the page content sliding up over it like a curtain (see .sh in services.css).
 * `children` is for the in-page quick links.
 */
export default function SvcHero({ eyebrow, title, lede, img, pos = '50% 50%', children }) {
  const root = useRef(null)
  const { lang } = useLang()

  // the photo drifts and the copy fades as the hero scrolls away (one CSS variable, no React re-render)
  useEffect(() => {
    const el = root.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const update = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      el.style.setProperty('--sh-p', Math.min(1, Math.max(0, -r.top / Math.max(1, r.height))).toFixed(3))
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

  return (
    <section ref={root} className="sh" style={{ '--sh-p': 0 }}>
      {img && (
        <div className="sh-photo" aria-hidden="true">
          <img src={img} alt="" decoding="async" fetchpriority="high" style={{ objectPosition: pos }} />
        </div>
      )}
      <div className="sh-tint" aria-hidden="true" />
      <div className="sh-copy">
        <span className="eyebrow">{eyebrow}</span>
        <h1 aria-label={title}>
          {(lang === 'en' ? title.split(' ') : [title]).map((w, i) => ( // one piece when translated, so the whole sentence is translated together
            <span key={i} className="sh-word" aria-hidden="true" style={{ animationDelay: `${0.1 + i * 0.07}s` }}>
              {w}
            </span>
          ))}
        </h1>
        {lede && <p className="sh-lede">{lede}</p>}
        {children}
      </div>
    </section>
  )
}
