import { useState } from 'react'
import { useG } from '../components/useGender'
import { content } from '../content'
import type { Activity, Domain, Load } from '../content/types'

const LOAD_LABEL: Record<Load, string> = {
  light: 'מאמץ קל',
  medium: 'מאמץ בינוני',
  heavy: 'דורש מחויבות',
}

interface Props {
  goal: Domain
  step: number
  activities: Activity[]
  chosen: string[]
  onChange: (ids: string[]) => void
  onNext: () => void
  onBack: () => void
}

export function ActivitiesScreen({ goal, step, activities, chosen, onChange, onNext, onBack }: Props) {
  const g = useG()
  const [error, setError] = useState(false)

  const toggle = (id: string) => {
    setError(false)
    if (chosen.includes(id)) onChange(chosen.filter((x) => x !== id))
    else onChange(chosen.length >= 2 ? [chosen[1], id] : [...chosen, id])
  }

  return (
    <>
      <p className="eyebrow">מטרה {step} מתוך 2</p>
      <div>
        <h1>{g(goal.title)}: מה מתאים לך?</h1>
        <p className="muted">{g(content.texts.activitiesSubtitle)}</p>
      </div>

      <div className="stack">
        {activities.map((a) => (
          <button key={a.id} type="button" className="card" aria-pressed={chosen.includes(a.id)} onClick={() => toggle(a.id)}>
            <div className="card-title">
              {g(a.title)}
              <span className="load">· {LOAD_LABEL[a.load]}</span>
            </div>
            <div className="muted">{g(a.description)}</div>
          </button>
        ))}
      </div>

      {error && <p className="error">{g('{בחר|בחרי|בחר/י} לפחות פעילות אחת')}</p>}

      <div className="actions">
        <button type="button" className="btn" onClick={() => (chosen.length > 0 ? onNext() : setError(true))}>
          {step === 1 ? 'למטרה הבאה' : 'לתוכנית שלי'}
        </button>
        <button type="button" className="btn-link" onClick={onBack}>
          חזרה
        </button>
      </div>
    </>
  )
}
