import { useG } from '../components/useGender'
import { content } from '../content'
import type { Activity, DomainId } from '../content/types'

interface Props {
  goals: DomainId[]
  activities: Record<DomainId, string[]>
  /** Personal goal sentences from the AI; the domain description is shown when missing. */
  phrases: Partial<Record<DomainId, string>>
  onBack: () => void
  onRestart: () => void
}

const byId = (id: string) => content.activities.find((a) => a.id === id) as Activity
const domainById = (id: DomainId) => content.domains.find((d) => d.id === id)!

export function PlanScreen({ goals, activities, phrases, onBack, onRestart }: Props) {
  // Named `t` here because `g` is the goal in the loops below.
  const t = useG()
  const { texts } = content
  const center = texts.careerCenter

  const planText = () =>
    [
      t(texts.planTitle),
      ...goals.flatMap((g, i) => [
        '',
        `מטרה ${i + 1}: ${t(domainById(g).title)}`,
        ...(phrases[g] ? [phrases[g]] : []),
        ...activities[g].map(byId).map((a) => `• ${t(a.goal)}`),
      ]),
      '',
      `${t(center.name)}: ${center.email}`,
    ].join('\n')

  const share = async () => {
    const text = planText()
    if (navigator.share) {
      try {
        await navigator.share({ title: t(texts.planTitle), text })
        return
      } catch {
        // Cancelled or unsupported – fall back to WhatsApp.
      }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener')
  }

  return (
    <>
      <h1>{t(texts.planTitle)}</h1>

      {goals.map((g, i) => {
        const domain = domainById(g)
        return (
          <section key={g} className="plan-goal">
            <div>
              <div className="card-title">
                מטרה {i + 1} · {t(domain.title)}
              </div>
              {phrases[g] ? <div className="phrase">{phrases[g]}</div> : <div className="muted">{t(domain.description)}</div>}
            </div>

            {activities[g].map(byId).map((a) => (
              <div key={a.id} className="plan-item">
                <div>
                  {a.link ? (
                    <a href={a.link} target="_blank" rel="noopener noreferrer">
                      {t(a.title)}
                    </a>
                  ) : (
                    <span>{t(a.title)}</span>
                  )}
                </div>
                <div className="plan-target">{t(a.goal)}</div>
              </div>
            ))}
          </section>
        )
      })}

      <div className="center-card stack" style={{ gap: 4 }}>
        <div className="card-title">{t(center.name)}</div>
        <div className="muted">{t(center.description)}</div>
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
