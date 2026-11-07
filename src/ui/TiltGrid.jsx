import Tilt from 'react-parallax-tilt'

// SRMIST's own photographs, saved in /public/srmist.
const CARDS = [
  { title: 'Campus', imageUrl: '/srmist/campus-lakeview.jpg', alt: 'The SRMIST campus seen across the lake at dusk' },
  { title: 'Tech Park', imageUrl: '/srmist/tech-park.jpg', alt: 'The SRM Tech Park building' },
  { title: 'Labs', imageUrl: '/srmist/labs.jpg', alt: 'Researchers with laboratory equipment at SRMIST' },
  { title: 'Library', imageUrl: '/srmist/library.jpg', alt: 'Entrance gates of the SRMIST library' },
  { title: 'Student life', imageUrl: '/srmist/admission-india.jpg', alt: 'SRMIST students outside the main building' },
  { title: 'Sports', imageUrl: '/srmist/sports.jpg', alt: 'An SRMIST sports team on the ground' },
]

export default function TiltGrid({ items = CARDS }) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12" aria-label="Life at SRMIST">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map(({ title, imageUrl, alt }) => (
          <Tilt key={title} glareEnable={true} glareMaxOpacity={0.4} glarePosition="all" scale={1.05} className="rounded-2xl">
            <figure className="relative m-0 h-72 w-full overflow-hidden rounded-2xl shadow-lg">
              <img
                src={imageUrl}
                alt={alt || title}
                loading="lazy"
                decoding="async"
                width="900"
                height="600"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-5 pb-5 pt-16">
                <span className="text-xl font-semibold tracking-tight text-white">{title}</span>
              </figcaption>
            </figure>
          </Tilt>
        ))}
      </div>
    </section>
  )
}
