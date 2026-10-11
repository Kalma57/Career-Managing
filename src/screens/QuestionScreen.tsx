import { useRef, useState } from 'react'
import { ChoiceField } from '../components/ChoiceField'
import { Progress } from '../components/Progress'
import { content } from '../content'
import type { Screen, TextQuestion } from '../content/types'
import type { Answers } from '../engine/scoring'

interface Props {
  screen: Screen
  index: number
  total: number
  answers: Answers
  onChange: (answers: Answers) => void
  onNext: () => void
  onBack: () => void
}

export function QuestionScreen({ screen, index, total, answers, onChange, onNext, onBack }: Props) {
  const [missing, setMissing] = useState<string[]>([])
  const compact = screen.questions.length > 1

  const isAnswered = (questionId: string) =>
    (answers.choices[questionId]?.length ?? 0) > 0 || (answers.other[questionId] ?? '').trim() !== ''

  const next = () => {
    const unanswered = screen.optional
      ? []
      : screen.questions.filter((q) => q.type !== 'text' && !isAnswered(q.id)).map((q) => q.id)
    setMissing(unanswered)
    if (unanswered.length === 0) onNext()
  }

  const setChoice = (id: string, ids: string[]) => {
    setMissing((m) => m.filter((x) => x !== id))
    onChange({ ...answers, choices: { ...answers.choices, [id]: ids } })
  }

  const setOther = (id: string, text: string) => {
    setMissing((m) => m.filter((x) => x !== id))
    onChange({ ...answers, other: { ...answers.other, [id]: text } })
  }

  return (
    <>
      <Progress current={index + 1} total={total} />
      {compact && <h2>קצת עליך</h2>}

      {screen.questions.map((q) => (
        <div key={q.id} className="stack">
          {q.type === 'text' ? (
            <FreeText question={q} value={answers.freeText} onChange={(freeText) => onChange({ ...answers, freeText })} />
          ) : (
            <ChoiceField
              question={q}
              compact={compact}
              picked={answers.choices[q.id] ?? []}
              other={answers.other[q.id] ?? ''}
              onPick={(ids) => setChoice(q.id, ids)}
              onOther={(text) => setOther(q.id, text)}
            />
          )}
          {missing.includes(q.id) && <p className="error">צריך לבחור תשובה או לכתוב במילים שלך</p>}
        </div>
      ))}

      <div className="actions">
        <button type="button" className="btn" onClick={next}>
          {screen.optional && !answers.freeText.trim() ? 'דילוג' : 'המשך'}
        </button>
        <button type="button" className="btn-link" onClick={onBack}>
          חזרה
        </button>
      </div>
    </>
  )
}

function FreeText({ question, value, onChange }: { question: TextQuestion; value: string; onChange: (v: string) => void }) {
  const textarea = useRef<HTMLTextAreaElement>(null)

  // Starters are only offered while the box is empty, so a student picks at most one.
  const hintsLocked = value.trim() !== ''

  // Put the starter in the box and the cursor after it, so the student can keep typing.
  const pickHint = (hint: string) => {
    if (hintsLocked) return
    onChange(hint)
    requestAnimationFrame(() => {
      const el = textarea.current
      if (!el) return
      el.focus()
      el.setSelectionRange(el.value.length, el.value.length)
    })
  }

  return (
    <>
      <div>
        <h2>{question.title}</h2>
        {question.subtitle && <p className="muted">{question.subtitle}</p>}
      </div>
      <p className="stem">{question.stem}</p>
      <div className="chips">
        {question.hints.map((hint) => (
          <button key={hint} type="button" className="chip" disabled={hintsLocked} onClick={() => pickHint(hint)}>
            {hint.trim()}…
          </button>
        ))}
      </div>
      <textarea
        ref={textarea}
        className="input other-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={question.placeholder}
        maxLength={600}
      />
      {hintsLocked && (
        <button type="button" className="btn-link" style={{ alignSelf: 'flex-start' }} onClick={() => onChange('')}>
          ניקוי והתחלה מחדש
        </button>
      )}
      <p className="muted">{content.texts.privacyNote}</p>
    </>
  )
}
