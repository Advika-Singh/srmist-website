// Line icons for the fields of study (24×24, drawn with strokes so they take the text colour).
const PATHS = {
  engineering: [
    'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
    'M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z',
  ],
  medicine: ['M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8Z', 'M6.5 12h3l1.5-2.5 2.5 5L15 12h2.5'],
  management: ['M4 7h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z', 'M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2', 'M2 13h20'],
  science: ['M9 3h6', 'M10 3v6.5L4.5 19a1.5 1.5 0 0 0 1.3 2.2h12.4a1.5 1.5 0 0 0 1.3-2.2L14 9.5V3', 'M7.5 14h9'],
  law: ['M12 3v18', 'M7 21h10', 'M5 7h14', 'M5 7l-3 7a3.5 3.5 0 0 0 6 0L5 7Z', 'M19 7l-3 7a3.5 3.5 0 0 0 6 0l-3-7Z'],
  architecture: ['M3 21h18', 'M5 21V9l7-5 7 5v12', 'M9 21v-6h6v6', 'M9 11h.01M15 11h.01'],
  agriculture: ['M12 21v-9', 'M12 12c0-4 3-7 8-7 0 5-3 8-8 8Z', 'M12 15c0-3-2.5-5.5-7-5.5 0 4.5 2.5 6.5 7 6.5Z'],
  hotel: ['M3 18h18', 'M5 18a7 7 0 0 1 14 0', 'M12 8V6', 'M10 6h4'],
}

export const fieldKey = (name) => {
  const n = name.toLowerCase()
  if (n.includes('hotel')) return 'hotel'
  if (n.includes('engineer')) return 'engineering'
  if (n.includes('medic')) return 'medicine'
  if (n.includes('manage')) return 'management'
  if (n.includes('law')) return 'law'
  if (n.includes('architect')) return 'architecture'
  if (n.includes('agri')) return 'agriculture'
  return 'science'
}

export default function FieldIcon({ name }) {
  return (
    <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[fieldKey(name)].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  )
}
