import { useId } from 'react'
import CountUp from '../CountUp.jsx'

/** Big numbers that count up when they scroll into view. items: [[value, label], ...] */
export function CountBand({ items, tone = 'blue', label = 'At a glance' }) {
  return (
    <section className={`cb cb--${tone}`} aria-label={label}>
      <ul className="cb-grid">
        {items.map(([value, text]) => (
          <li key={text}>
            <b>
              <CountUp value={value} />
            </b>
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** A looping row of large words. Pauses on hover and focus and with the "pause animations" toggle; still under reduced motion. */
export function Marquee({ words, caption }) {
  const uid = useId()
  const row = (hidden) => (
    <ul className="mq-row" aria-hidden={hidden || undefined}>
      {words.map((w) => (
        <li key={(hidden ? 'b' : 'a') + w}>{w}</li>
      ))}
    </ul>
  )
  return (
    <section className="mq" aria-labelledby={caption ? `${uid}-c` : undefined} aria-label={caption ? undefined : words.join(', ')}>
      {caption && (
        <p id={`${uid}-c`} className="mq-caption">
          {caption}
        </p>
      )}
      <div className="mq-track">
        {row(false)}
        {row(true)}
      </div>
    </section>
  )
}
