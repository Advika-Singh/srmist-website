import { useMemo, useState } from 'react'
import nearby from '../data/nearby.json'
import { Arrow, Footer, SiteHeader } from '../shared.jsx'
import SvcHero from '../ui/SvcHero.jsx'
import CampusMap, { NAMED_BUILDINGS } from '../ui/CampusMap.jsx'
import '../services.css'

const HOTEL = {
  name: 'SRM Hotel, Maraimalai Nagar',
  address: 'GST Road, Intra College Road, near SRM Institute of Science and Technology, Maraimalai Nagar, SRM Nagar, Chennai 603203',
  phone: '+91 44 4743 2000',
  tel: '+914447432000',
  book: 'https://www.srmhotels.com/srm-hotel-maraimalainagar-chennai/',
  site: 'https://www.srmhotels.com/',
  perks: ['Swimming pool', 'Gym', 'Pick-up & drop service', 'Multi-cuisine restaurants', 'Event halls', 'Free parking', 'Complimentary breakfast', 'Pure vegetarian cuisine'],
  rooms: 'Premium King (340 sq ft) and Premium Twin rooms, among others',
}

const MAPS = (q) => `https://www.google.com/maps/search/${encodeURIComponent(q)}`
const km = (m) => (m < 950 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1)} km`)
const KIND = { restaurant: 'Restaurant', cafe: 'Café', fast_food: 'Fast food', food_court: 'Food court', hotel: 'Hotel', guest_house: 'Guest house', motel: 'Motel', apartment: 'Apartments' }

export default function Visitors() {
  const [show, setShow] = useState('all') // all | food | stay | buildings
  const [sel, setSel] = useState(null)

  const eat = useMemo(() => nearby.places.filter((p) => p.group === 'eat'), [])
  // student hostels are not for visitors, and SRM Hotel has its own card
  const stay = useMemo(() => nearby.places.filter((p) => p.group === 'stay' && p.kind !== 'hostel' && !/^SRM Hotel/i.test(p.name)), [])
  const markers = useMemo(() => nearby.places.filter((p) => p.x != null && p.kind !== 'hostel').filter((p) => (show === 'food' ? p.group === 'eat' : show === 'stay' ? p.group === 'stay' : show === 'buildings' ? false : true)).map((p) => ({ id: p.id, name: p.name, group: p.group, x: p.x, y: p.y })), [show])

  return (
    <>
      <SiteHeader />
      <main className="interior svc" id="main" tabIndex={-1}>
        <SvcHero eyebrow="Visitors &amp; parents" title="Coming to campus? Start here." lede="Where things are, where to stay and where to eat, so a first visit to the Kattankulathur campus is easy." img="/srmist/campus-lakeview.jpg" pos="50% 55%">
  <nav className="vis-quick" aria-label="On this page">
              <a href="#layout">Campus layout</a>
              <a href="#hotel">SRM Hotel</a>
              <a href="#stay">Nearby hotels</a>
              <a href="#eat">Places to eat</a>
              <a href="#reach">Getting here</a>
            </nav>
        </SvcHero>

        <section className="svc-wrap vis-grid">
          <div className="vis-block" id="layout">
            <h2>Campus layout</h2>
            <p>Drag the map, use the + and − buttons, and pick a building from the list. Food and stay markers show what is on or beside the campus.</p>
            <div className="svc-row" role="group" aria-label="What to show on the map" style={{ marginTop: 0, marginBottom: 12 }}>
              {[
                ['all', 'Everything'],
                ['buildings', 'Buildings only'],
                ['food', 'Food (F)'],
                ['stay', 'Stay (H)'],
              ].map(([k, label]) => (
                <button key={k} className={`svc-btn ${show === k ? 'svc-btn--primary' : ''}`} aria-pressed={show === k} onClick={() => setShow(k)}>
                  {label}
                </button>
              ))}
            </div>
            <div className="map-layout">
              <CampusMap mode="visitor" markers={markers} selected={sel?.id} onSelect={setSel} label="Map of the SRMIST Kattankulathur campus" />
              <aside className="map-side" aria-label="Buildings">
                {sel && (
                  <div className="map-card" role="status">
                    <h3>{sel.name}</h3>
                    <a className="svc-btn" href={MAPS(`${sel.name} SRM Institute of Science and Technology Kattankulathur`)} target="_blank" rel="noopener noreferrer">
                      Directions in Google Maps<span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </div>
                )}
                <ul className="map-list" aria-label={`${NAMED_BUILDINGS.length} named buildings`} style={{ maxHeight: 360 }}>
                  {NAMED_BUILDINGS.map((b) => (
                    <li key={b.id}>
                      <button className={sel?.id === b.id ? 'is-on' : ''} aria-pressed={sel?.id === b.id} onClick={() => setSel(b)}>
                        {b.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </aside>
            </div>
            <p className="svc-fine">The map is drawn from OpenStreetMap, so a few names are informal or out of date. For official building names and department locations, ask at the main gate or the university enquiry desk, +91 44 2741 7000.</p>
          </div>

          <div className="vis-block" id="hotel">
            <h2>Stay at SRM Hotel</h2>
            <p>The university-linked hotel beside the campus on GST Road, popular with parents, examiners and guests.</p>
            <div className="vis-hotel">
              <div>
                <h3>{HOTEL.name}</h3>
                <p>{HOTEL.rooms}.</p>
                <ul aria-label="Amenities">
                  {HOTEL.perks.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                <a className="button" href={HOTEL.book} target="_blank" rel="noopener noreferrer">
                  Check rooms and book <Arrow />
                  <span className="sr-only"> (opens the hotel’s own website)</span>
                </a>
              </div>
              <dl>
                <div><dt>Address</dt><dd>{HOTEL.address}</dd></div>
                <div><dt>Reservations</dt><dd><a href={`tel:${HOTEL.tel}`}>{HOTEL.phone}</a></dd></div>
                <div><dt>Hotel website</dt><dd><a href={HOTEL.site} target="_blank" rel="noopener noreferrer">srmhotels.com</a></dd></div>
              </dl>
            </div>
            <p className="svc-fine">Booking happens on the hotel’s own website, not here. Rates and availability change, so confirm them with the hotel.</p>
          </div>

          <div className="vis-block" id="stay">
            <h2>Nearby hotels</h2>
            <p>OpenStreetMap knows very few hotels around Kattankulathur, and most of what it lists nearby are student hostels, which are not open to visitors. For a fuller list with prices and reviews, search in your maps app.</p>
            <div className="svc-row" style={{ marginTop: 0 }}>
              <a className="svc-btn svc-btn--primary" href={MAPS('hotels near SRM Institute of Science and Technology Kattankulathur')} target="_blank" rel="noopener noreferrer">
                Search hotels near SRM in Google Maps<span className="sr-only"> (opens in a new tab)</span>
              </a>
              <a className="svc-btn" href={MAPS('guest house near SRM University Potheri')} target="_blank" rel="noopener noreferrer">
                Guest houses near Potheri<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>
            {stay.length > 0 && (
              <ul className="vis-places" style={{ marginTop: 18 }}>
                {stay.map((p) => (
                  <li key={p.id}>
                    <b>{p.name}</b>
                    <span>{KIND[p.kind] || 'Stay'} · {km(p.dist)} from the main campus</span>
                    {p.phone && <a href={`tel:${p.phone.replace(/[^+\d]/g, '')}`}>{p.phone}</a>}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="vis-block" id="eat">
            <h2>Places to eat</h2>
            <p>Inside the campus and along GST Road, nearest first. Distances are in a straight line from the main campus, not by road.</p>
            <ul className="vis-places">
              {eat.map((p) => (
                <li key={p.id}>
                  <b>{p.name}</b>
                  <span>
                    {KIND[p.kind] || 'Food'}
                    {p.cuisine ? ` · ${p.cuisine}` : ''} · {p.dist < 500 ? 'on or beside campus' : km(p.dist)}
                  </span>
                  {p.hours && <span>Hours: {p.hours}</span>}
                  {p.phone && <a href={`tel:${p.phone.replace(/[^+\d]/g, '')}`}>{p.phone}</a>}
                </li>
              ))}
            </ul>
            <p className="svc-fine">
              Hostel mess and campus eateries are described on the official{' '}
              <a href="https://www.srmist.edu.in/srm-hostels/dining-eateries/" target="_blank" rel="noopener noreferrer">
                Dining &amp; Eateries page<span className="sr-only"> (opens in a new tab)</span>
              </a>
              . Opening hours change, so check before you go.
            </p>
          </div>

          <div className="vis-block" id="reach">
            <h2>Getting here</h2>
            <p>The Kattankulathur campus is on GST Road (Chennai–Chengalpattu), SRM Nagar, Kattankulathur 603203. Potheri is the nearest suburban railway station. Chennai International Airport is roughly an hour away by road, depending on traffic.</p>
            <div className="svc-row" style={{ marginTop: 0 }}>
              <a className="svc-btn svc-btn--primary" href={MAPS('SRM Institute of Science and Technology Kattankulathur')} target="_blank" rel="noopener noreferrer">
                Open campus in Google Maps<span className="sr-only"> (opens in a new tab)</span>
              </a>
              <a className="svc-btn" href="https://www.srmist.edu.in/visitors/" target="_blank" rel="noopener noreferrer">
                Official visitors page<span className="sr-only"> (opens in a new tab)</span>
              </a>
              <a className="svc-btn" href="/access-map">Accessible routes</a>
              <a className="svc-btn" href="/day">A day at SRM</a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
