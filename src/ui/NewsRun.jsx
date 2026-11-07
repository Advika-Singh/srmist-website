import { Arrow, ArrowUR } from '../shared.jsx'

/**
 * "What's happening" as a live-feeling news run: two rows of cards drifting in opposite directions, like a ticker.
 * Hovering or focusing a row pauses it, and so does the footer's pause-animations toggle. With reduced motion the
 * rows stop and can be scrolled by hand instead. items: { kind: 'photo' | 'story' | 'event', href, ext?, tag?, title, img?, alt?, date? }.
 */
function Card({ it, hidden }) {
  const link = { href: it.href, tabIndex: hidden ? -1 : undefined, ...(it.ext ?? {}) }
  if (it.kind === 'photo') {
    return (
      <article className="nr-card nr-card--photo">
        <a {...link}>
          <img src={it.img} alt={hidden ? '' : it.alt} loading="lazy" decoding="async" />
          <span>{it.tag}</span>
          <h3>{it.title}</h3>
        </a>
      </article>
    )
  }
  if (it.kind === 'event') {
    return (
      <article className="nr-card nr-card--event">
        <a {...link}>
          <span>Coming up · {it.date}</span>
          <b>{it.title}</b>
          <ArrowUR />
        </a>
      </article>
    )
  }
  return (
    <article className="nr-card">
      <span>{it.tag}</span>
      <h3>{it.title}</h3>
      <a {...link}>
        Read story <Arrow />
      </a>
    </article>
  )
}

function Row({ items, reverse, seconds, label }) {
  return (
    <div className={`nr ${reverse ? 'nr--rev' : ''}`} style={{ '--nr-s': `${seconds}s` }} role="group" aria-label={label}>
      <div className="nr-track">
        {items.map((it, i) => (
          <Card key={`a${i}`} it={it} />
        ))}
        {items.map((it, i) => (
          <div key={`b${i}`} className="nr-dup" aria-hidden="true">
            <Card it={it} hidden />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function NewsRun({ top, bottom }) {
  return (
    <div className="nr-wrap">
      <Row items={top} seconds={64} label="Stories from the community" />
      <Row items={bottom} reverse seconds={52} label="Upcoming events and more stories" />
    </div>
  )
}
