import { useId, useMemo, useState } from 'react'
import { AVERAGE_CTC, FEES_ARE_ILLUSTRATIVE, FEE_PROGRAMMES, HOSTELS, SCHOLARSHIPS, estimate, inr } from '../data/fees.js'
import { track } from '../lib/experiments.js'

const PARTS = [
  ['tuition', 'Tuition'],
  ['room', 'Hostel room'],
  ['mess', 'Mess'],
  ['once', 'One-time first-year fees'],
]

/**
 * Dynamic cost and ROI calculator: pick a programme and a hostel, get the year-by-year cost,
 * a stacked breakdown and "how many years of an average first salary covers the whole degree".
 * Problem it solves: families can't compare options because fees, hostel and mess are on different pages.
 */
export default function FeeCalculator({ initialProgramme = 'engineering', compact = false }) {
  const [programme, setProgramme] = useState(initialProgramme)
  const [hostel, setHostel] = useState('triple')
  const [waiver, setWaiver] = useState(0)
  const [rise, setRise] = useState(5)
  const id = useId()

  const est = useMemo(() => estimate({ programme, hostel, waiver, rise }), [programme, hostel, waiver, rise])
  const first = est.years[0]
  const sums = PARTS.map(([k, label]) => [k, label, est.years.reduce((s, y) => s + y[k], 0)]).filter(([, , v]) => v > 0)
  const touch = (fn) => (e) => {
    fn(e.target.value)
    track('fee_calculator_used')
  }

  return (
    <div className={`fc ${compact ? 'fc-compact' : ''}`}>
      <div className="fc-inputs">
        <label htmlFor={`${id}-p`}>
          Programme
          <select id={`${id}-p`} value={programme} onChange={touch(setProgramme)}>
            {FEE_PROGRAMMES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor={`${id}-h`}>
          Accommodation
          <select id={`${id}-h`} value={hostel} onChange={touch(setHostel)}>
            {HOSTELS.map((h) => (
              <option key={h.id} value={h.id}>
                {h.label}
              </option>
            ))}
          </select>
        </label>
        {!compact && (
          <>
            <label htmlFor={`${id}-w`}>
              Scholarship
              <select id={`${id}-w`} value={waiver} onChange={(e) => (setWaiver(Number(e.target.value)), track('fee_calculator_used'))}>
                {SCHOLARSHIPS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <label htmlFor={`${id}-r`}>
              Yearly fee rise: <b>{rise}%</b>
              <input id={`${id}-r`} type="range" min="0" max="10" step="1" value={rise} onChange={(e) => setRise(Number(e.target.value))} />
            </label>
          </>
        )}
      </div>

      <div className="fc-result" role="status" aria-live="polite">
        <div className="fc-total">
          <span>Estimated total · {est.programme.years} years</span>
          <b>{inr(est.total)}</b>
          <small>
            First year {inr(first.total)} · about {inr(est.total / est.programme.years / 12)} a month on average
          </small>
        </div>

        <div className="fc-bar" aria-hidden="true">
          {sums.map(([k, , v]) => (
            <i key={k} className={`p-${k}`} style={{ flexGrow: v }} />
          ))}
        </div>
        <ul className="fc-legend">
          {sums.map(([k, label, v]) => (
            <li key={k}>
              <i className={`p-${k}`} aria-hidden="true" />
              <span>{label}</span>
              <b>{inr(v)}</b>
            </li>
          ))}
        </ul>

        {!compact && (
          <>
            <table className="fc-years" role="table">
              <caption className="sr-only">Cost per year</caption>
              <thead>
                <tr role="row">
                  <th role="columnheader" scope="col">Year</th>
                  <th role="columnheader" scope="col">Tuition</th>
                  <th role="columnheader" scope="col">Hostel + mess</th>
                  <th role="columnheader" scope="col">Total</th>
                </tr>
              </thead>
              <tbody>
                {est.years.map((y) => (
                  <tr role="row" key={y.year}>
                    <th role="rowheader" scope="row" data-label="Year">{y.year}</th>
                    <td role="cell" data-label="Tuition">{inr(y.tuition + y.once)}</td>
                    <td role="cell" data-label="Hostel + mess">{inr(y.room + y.mess)}</td>
                    <td role="cell" data-label="Total"><b>{inr(y.total)}</b></td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="fc-roi">
              <span>Return on investment</span>
              <p>
                At the 2023–24 average package of <b>{inr(AVERAGE_CTC)}</b> a year, the whole degree equals{' '}
                <b>{est.payback.toFixed(1)} years</b> of average starting salary.
              </p>
            </div>
          </>
        )}
        {FEES_ARE_ILLUSTRATIVE && (
          <p className="fc-note">
            Illustrative estimate, not an offer. Confirm every figure with the Admissions Office on +91 70 2645 2645 before paying.
          </p>
        )}
      </div>
    </div>
  )
}
