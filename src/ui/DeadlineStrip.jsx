import { deadlineLine } from '../lib/srmjeee.js'

/** Slim strip on the home page: the next SRMJEEE application deadline, linking to the dates and the apply button. Hidden once all have passed. */
export default function DeadlineStrip() {
  const line = deadlineLine()
  if (!line) return null
  return (
    <a className="deadline-strip" href="/srmjeee" data-notranslate>
      <span className="deadline-dot" aria-hidden="true" />
      <span>{line}</span>
      <b>See dates and apply</b>
    </a>
  )
}
