import { content } from '../content'
import type { Activity, DomainId } from '../content/types'
import { formatGoal } from '../engine/scoring'

interface Props {
  goals: DomainId[]
  activities: Record<DomainId, string[]>
  numbers: Record<string, number>
  /** Personal goal sentences from the AI; the domain description is shown when missing. */
  phrases: Partial<Record<DomainId, string>>
  onNumber: (activityId: string, n: number) => void
  onBack: () => void
  onRestart: () => void
}

const byId = (id: string) => content.activities.find((a) => a.id === id) as Activity
const domainById = (id: DomainId) => content.domains.find((d) => d.id === id)!

export function PlanScreen({ goals, activities, numbers, phrases, onNumber, onBack, onRestart }: Props) {
  const { texts } = content
  const center = texts.careerCenter
  const numberFor = (a: Activity) => numbers[a.id] ?? a.goal.default

  const planText = () =>
    [
      texts.planTitle,
      ...goals.flatMap((g, i) => [
        '',
        `מטרה ${i + 1}: ${domainById(g).title}`,
        ...(phrases[g] ? [phrases[g]] : []),
        ...activities[g].map(byId).map((a) => `• ${formatGoal(a.goal, numberFor(a))}`),
      ]),
      '',
      `${center.name}: ${center.email}`,
    ].join('\n')

  const share = async () => {
    const text = planText()
    if (navigator.share) {
      try {
        await navigator.share({ title: texts.planTitle, text })
        return
      } catch {
        // Cancelled or unsupported – fall back to WhatsApp.
      }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener')
  }

  return (
    <>
      <h1>{texts.planTitle}</h1>

      {goals.map((g, i) => {
        const domain = domainById(g)
        return (
          <section key={g} className="plan-goal">
            <div>
              <div className="card-title">
                מטרה {i + 1} · {domain.title}
              </div>
              {phrases[g] ? <div className="phrase">{phrases[g]}</div> : <div className="muted">{domain.description}</div>}
            </div>

            {activities[g].map(byId).map((a) => (
              <div key={a.id} className="plan-item">
                <div>
                  {a.link ? (
                    <a href={a.link} target="_blank" rel="noopener noreferrer">
                      {a.title}
                    </a>
                  ) : (
                    <span>{a.title}</span>
                  )}
                </div>
                <div className="stepper">
                  <button
                    type="button"
                    className="no-print"
                    aria-label="פחות"
                    onClick={() => onNumber(a.id, Math.max(a.goal.min, numberFor(a) - 1))}
                  >
                    −
                  </button>
                  <span>{formatGoal(a.goal, numberFor(a))}</span>
                  <button
                    type="button"
                    className="no-print"
                    aria-label="יותר"
                    onClick={() => onNumber(a.id, Math.min(a.goal.max, numberFor(a) + 1))}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </section>
        )
      })}

      <div className="center-card stack" style={{ gap: 4 }}>
        <div className="card-title">{center.name}</div>
        <div className="muted">{center.description}</div>
        <div className="row">
          <a href={`mailto:${center.email}`}>{center.email}</a>
          <a href={center.linkedin} target="_blank" rel="noopener noreferrer">
            לינקדאין
          </a>
        </div>
      </div>

      <div className="actions no-print">
        <div className="row">
          <button type="button" className="btn" onClick={() => window.print()}>
            שמירה כ-PDF
          </button>
          <button type="button" className="btn btn-secondary" onClick={share}>
            שיתוף
          </button>
        </div>
        <div className="row">
          <button type="button" className="btn-link" onClick={onBack}>
            חזרה
          </button>
          <button type="button" className="btn-link" onClick={onRestart}>
            להתחיל מחדש
          </button>
        </div>
      </div>
    </>
  )
}
