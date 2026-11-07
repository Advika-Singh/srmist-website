import { Footer, SiteHeader } from '../shared.jsx'
import DayAtSRM from '../ui/DayAtSRM.jsx'

/** "A day at SRM" on its own page: the scene fills the screen under the header, then the footer follows. */
export default function Day() {
  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="day-page">
        <DayAtSRM standalone startBg="var(--ink)" endBg="var(--ink)" />
      </main>
      <Footer />
    </>
  )
}
