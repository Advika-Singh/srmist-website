import { useEffect, useRef, useState } from 'react'
import { Arrow, IMG, LINK, Photo } from './shared.jsx'

/**
 * "Learn · Leap · Lead": three stacked rows that stay pinned while you scroll.
 * Only the active row is open (description + a slider of four photos that drifts from side to side); the others collapse to a dimmed title.
 * On phones, with reduced motion, or on short screens the rows are simply all open in normal flow.
 *
 * Each tile is a photo; give a tile a `video` (a muted, looping clip in /public/video) and it plays
 * while its row is open and on screen.
 */
const ROWS = [
  {
    word: 'Learn',
    title: 'Learn across every discipline.',
    text: 'Engineering, medicine, law, management, science, agriculture, architecture and hotel management: eight fields of study on six campuses.',
    href: LINK.academics,
    cta: 'Explore academics',
    tiles: [
      { img: IMG.classroom, pos: '50% 40%' },
      { img: IMG.lab, pos: '50% 30%' },
      { img: IMG.collab, pos: '40% 40%' },
      { img: IMG.urban, pos: '50% 50%' },
    ],
  },
  {
    word: 'Leap',
    title: 'Leap beyond the classroom.',
    text: 'More than 200 students are sponsored abroad every year to 35+ partner universities, with a semester abroad programme and a global immersion programme.',
    href: LINK.international,
    cta: 'Go global',
    tiles: [
      { img: IMG.walking, pos: '50% 40%' },
      { img: IMG.campus, pos: '30% 50%' },
      { img: IMG.campusAlt, pos: '50% 50%' },
      { img: IMG.collab, pos: '70% 40%' },
    ],
  },
  {
    word: 'Lead',
    title: 'Lead what comes next.',
    text: '980+ companies visited in 2023–24 with a highest package of 52 LPA, and research that has produced 920+ patents and 47,000+ publications.',
    href: LINK.placements,
    cta: 'See the outcomes',
    tiles: [
      { img: IMG.lab, pos: '60% 40%' },
      { img: IMG.urban, pos: '30% 60%' },
      { img: IMG.walking, pos: '70% 50%' },
      { img: IMG.campusAlt, pos: '30% 40%' },
    ],
  },
]

const PIN_QUERY = '(min-width: 901px) and (min-height: 600px) and (prefers-reduced-motion: no-preference)'

function Tile({ tile, playing }) {
  const video = useRef(null)
  useEffect(() => {
    const v = video.current
    if (!v) return
    if (playing) v.play().catch(() => {})
    else v.pause()
  }, [playing])
  return (
    <li className="triplet-tile">
      {tile.video ? (
        <video ref={video} src={tile.video} poster={tile.poster} muted loop playsInline preload="none" aria-hidden="true" />
      ) : (
        <Photo src={tile.img} alt="" aria-hidden="true" sizes="(max-width: 900px) 70vw, 34vw" widths={[500, 800, 1100]} size={[1000, 1000]} style={{ objectPosition: tile.pos }} />
      )}
    </li>
  )
}

export default function ScrollTriplet({ style }) {
  const root = useRef(null)
  const [pinned, setPinned] = useState(false)
  const [active, setActive] = useState(0)

  // pin only where it works well: wide, tall screens that haven't asked for less motion
  useEffect(() => {
    const mq = window.matchMedia(PIN_QUERY)
    const update = () => setPinned(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  // which row is open follows scroll progress through the pinned block
  useEffect(() => {
    if (!pinned) return
    let frame = 0
    const measure = () => {
      frame = 0
      const el = root.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const total = r.height - window.innerHeight
      const p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0
      const i = Math.min(ROWS.length - 1, Math.floor(p * ROWS.length))
      setActive((prev) => (prev === i ? prev : i))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [pinned])

  const jumpTo = (i) => {
    const el = root.current
    const total = el.offsetHeight - window.innerHeight
    const top = el.getBoundingClientRect().top + window.scrollY
    window.scrollTo({ top: top + total * ((i + 0.5) / ROWS.length), behavior: 'smooth' })
  }

  return (
    <section ref={root} className={`triplet ${pinned ? 'is-pinned' : 'is-static'}`} aria-labelledby="triplet-heading" style={style}>
      <div className="triplet-stage">
        <div className="triplet-top">
          <h2 id="triplet-heading" className="eyebrow">
            Learn · Leap · Lead
          </h2>
          <span className="triplet-count" aria-hidden="true">
            {pinned ? `0${active + 1} / 0${ROWS.length}` : ''}
          </span>
        </div>

        <div className="triplet-rows">
          {ROWS.map((row, i) => {
            const open = !pinned || i === active
            return (
              <article key={row.word} className={`triplet-row ${open ? 'is-open' : 'is-closed'}`}>
                <div className="triplet-head">
                  <span className="triplet-n" aria-hidden="true">
                    [0{i + 1}]
                  </span>
                  <h3>
                    {pinned ? (
                      <button type="button" aria-expanded={open} aria-controls={`triplet-body-${i}`} onClick={() => jumpTo(i)}>
                        {row.title}
                      </button>
                    ) : (
                      row.title
                    )}
                  </h3>
                  <a className="triplet-plus" href={row.href} aria-label={`${row.cta}: ${row.word}`} tabIndex={open ? 0 : -1}>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </a>
                </div>
                <div className="triplet-body" id={`triplet-body-${i}`}>
                  <div className="triplet-body-inner">
                    <p>{row.text}</p>
                    <div className="triplet-slider">
                      <ul className="triplet-tiles">
                        {row.tiles.map((t, k) => (
                          <Tile key={k} tile={t} playing={open} />
                        ))}
                      </ul>
                    </div>
                    <a className="triplet-link" href={row.href} tabIndex={open ? 0 : -1}>
                      {row.cta} <Arrow />
                    </a>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
