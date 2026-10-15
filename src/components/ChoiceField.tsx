import type { ChoiceQuestion } from '../content/types'
import { SearchSelect } from './SearchSelect'
import { useG } from './useGender'

interface Props {
  question: ChoiceQuestion
  picked: string[]
  other: string
  onPick: (ids: string[]) => void
  onOther: (text: string) => void
  /** Show the title as a small field label (background screen) instead of a heading. */
  compact?: boolean
}

/** One choice question: chips (multi, short labels), cards (single/multi), or a searchable list. */
export function ChoiceField({ question, picked, other, onPick, onOther, compact }: Props) {
  const g = useG()
  const toggle = (id: string) => {
    if (question.type === 'single') return onPick([id])
    if (picked.includes(id)) return onPick(picked.filter((x) => x !== id))
    if (question.max && picked.length >= question.max) return onPick([...picked.slice(1), id])
    onPick([...picked, id])
  }

  const useChips = compact && question.type === 'multi'

  return (
    <div className="stack">
      {compact ? (
        <div>
          <div className="field-label">{g(question.title)}</div>
          {question.subtitle && <div className="muted">{g(question.subtitle)}</div>}
        </div>
      ) : (
        <div>
          <h2>{g(question.title)}</h2>
          {question.subtitle && <p className="muted">{g(question.subtitle)}</p>}
        </div>
      )}

      {question.type === 'search' ? (
        <SearchSelect options={question.options} picked={picked} onPick={onPick} />
      ) : useChips ? (
        <div className="chips">
          {question.options.map((o) => (
            <button key={o.id} type="button" className="chip" aria-pressed={picked.includes(o.id)} onClick={() => toggle(o.id)}>
              {g(o.label)}
            </button>
          ))}
        </div>
      ) : (
        question.options.map((o) => (
          <button key={o.id} type="button" className="card" aria-pressed={picked.includes(o.id)} onClick={() => toggle(o.id)}>
            {g(o.label)}
          </button>
        ))
      )}

      {question.allowOther && (
        <label className="other">
          <span className="other-label">לא מצאת? אפשר להקליד כאן</span>
          <input
            className="input other-input"
            value={other}
            onChange={(e) => onOther(e.target.value)}
            placeholder={g('{כתוב|כתבי|כתוב/י} כאן…')}
            maxLength={200}
          />
        </label>
      )}
    </div>
  )
}
