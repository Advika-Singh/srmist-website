import { ArrowUR } from '../shared.jsx'

const isExternal = (href) => /^https?:/.test(href)

/** A grid of linked cards: [title, href, hint]. Own pages open in place; official pages open in a new tab and say so. */
export default function LinkCards({ items }) {
  return (
    <ul className="cm-grid">
      {items.map(([title, href, hint]) => {
        const ext = isExternal(href)
        return (
          <li key={title}>
            <a className="svc-card cm-card" href={href} {...(ext ? { target: '_blank', rel: 'noreferrer' } : {})}>
              <b>{title}</b>
              {hint && <span>{hint}</span>}
              {ext && <small className="sr-only"> (opens in a new tab)</small>}
              <ArrowUR />
            </a>
          </li>
        )
      })}
    </ul>
  )
}
