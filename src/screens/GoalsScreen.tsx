import { useState } from 'react'
import { content } from '../content'
import type { DomainId } from '../content/types'

interface Props {
  recommended: DomainId[]
  chosen: DomainId[]
  onChange: (goals: DomainId[]) => void
  onNext: () => void
  onBack: () => void
}

export function GoalsScreen({ recommended, chosen, onChange, onNext, onBack }: Props) {
  const [error, setError] = useState(false)
  const { texts } = content

  const toggle = (id: DomainId) => {
    setError(false)
    if (chosen.includes(id)) onChange(chosen.filter((g) => g !== id))
    else onChange(chosen.length >= 2 ? [chosen[1], id] : [...chosen, id])
  }

  // Recommended domains first, then the rest in their usual order.
  const ordered = [...content.domains].sort(
    (a, b) => Number(recommended.includes(b.id)) - Number(recommended.includes(a.id)),
  )

  return (
    <>
      <div>
        <h1>{texts.goalsTitle}</h1>
        <p className="muted">{texts.goalsSubtitle}</p>
      </div>

      <div className="stack">
        {ordered.map((d) => (
          <button
            key={d.id}
            type="button"
            className={`card${recommended.includes(d.id) ? ' recommended' : ''}`}
            aria-pressed={chosen.includes(d.id)}
            onClick={() => toggle(d.id)}
          >
            <div className="card-title">
              {d.title}
              {recommended.includes(d.id) && <span className="badge">{texts.recommendedBadge}</span>}
            </div>
            <div className="muted">{d.description}</div>
          </button>
        ))}
      </div>

      {error && <p className="error">בחר/י 2 מטרות כדי להמשיך</p>}

      <div className="actions">
        <button type="button" className="btn" onClick={() => (chosen.length === 2 ? onNext() : setError(true))}>
          המשך
        </button>
        <button type="button" className="btn-link" onClick={onBack}>
          חזרה
        </button>
      </div>
    </>
  )
}
