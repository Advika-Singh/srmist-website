/** A small line icon for the staff finder: a person with a magnifying glass. Drawn for this site (the official site has no icon file for it). */
export default function StaffIcon({ className = 'staff-icon' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <circle cx="9" cy="7.5" r="3.4" />
      <path d="M2.8 19.5c.3-3.6 3-5.8 6.2-5.8 1.2 0 2.3.3 3.2.8" />
      <circle cx="16.4" cy="16.2" r="3.3" />
      <path d="m18.9 18.7 2.6 2.6" />
    </svg>
  )
}
