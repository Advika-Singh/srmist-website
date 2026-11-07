import { useState } from 'react'

/** "Was this helpful?" under an answer. onVote(true | false) is called once; afterwards it thanks the reader. */
export default function Helpful({ onVote, className = '' }) {
  const [voted, setVoted] = useState(null)
  if (voted !== null) {
    return (
      <p className={`helpful ${className}`.trim()} role="status">
        Thanks, that helps us improve.
      </p>
    )
  }
  const vote = (v) => {
    setVoted(v)
    onVote(v)
  }
  return (
    <div className={`helpful ${className}`.trim()}>
      <span id="helpful-q">Was this helpful?</span>
      <button type="button" aria-describedby="helpful-q" onClick={() => vote(true)}>
        Yes
      </button>
      <button type="button" aria-describedby="helpful-q" onClick={() => vote(false)}>
        No
      </button>
    </div>
  )
}
