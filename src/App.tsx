import { useEffect, useState } from 'react'
import { GenderContext } from './components/useGender'
import { content } from './content'
import type { DomainId } from './content/types'
import { type AiResult, fetchAi, needsAi } from './engine/ai'
import type { Gender } from './engine/gender'
import { emptyAnswers, rankActivities, rankDomains, scoreDomains, type Answers } from './engine/scoring'
import { ActivitiesScreen } from './screens/ActivitiesScreen'
import { GoalsScreen } from './screens/GoalsScreen'
import { IntroScreen } from './screens/IntroScreen'
import { PlanScreen } from './screens/PlanScreen'
import { QuestionScreen } from './screens/QuestionScreen'

type Step =
  | { kind: 'intro' }
  | { kind: 'question'; index: number }
  | { kind: 'loading' }
  | { kind: 'goals' }
  | { kind: 'activities'; goalIndex: number }
  | { kind: 'plan' }

const screens = content.screens
const emptyActivities = () => ({}) as Record<DomainId, string[]>

function App() {
  const [step, setStep] = useState<Step>({ kind: 'intro' })
  const [gender, setGender] = useState<Gender>('n')
  const [answers, setAnswers] = useState<Answers>(emptyAnswers)
  const [goals, setGoals] = useState<DomainId[]>([])
  const [activities, setActivities] = useState(emptyActivities)

  const [ai, setAi] = useState<AiResult | null>(null)

  const recommend = (aiResult: AiResult | null) =>
    rankDomains(content, scoreDomains(content, answers, aiResult?.weights), answers).slice(0, 2)
  const recommended = recommend(ai)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [step])

  // After the last question: ask the AI if the student wrote anything, then show the goals.
  const finishQuestions = async () => {
    let aiResult: AiResult | null = null
    if (needsAi(answers)) {
      setStep({ kind: 'loading' })
      aiResult = await fetchAi(content, answers)
    }
    setAi(aiResult)
    if (goals.length === 0) setGoals(recommend(aiResult))
    setStep({ kind: 'goals' })
  }

  const changeGoals = (next: DomainId[]) => {
    setGoals(next)
    // Drop activity picks for goals that were deselected.
    setActivities((prev) => Object.fromEntries(next.map((g) => [g, prev[g] ?? []])) as Record<DomainId, string[]>)
  }

  const restart = () => {
    setAnswers(emptyAnswers())
    setGoals([])
    setActivities(emptyActivities())
    setAi(null)
    setGender('n')
    setStep({ kind: 'intro' })
  }

  return (
    <GenderContext.Provider value={gender}>
      {/* data-screen lets CSS style one screen only, e.g. .app[data-screen="goals"] h1 { … } */}
      <main className="app" data-screen={screenName()}>
        {renderStep()}
        <footer className="site-footer">{content.texts.footer}</footer>
      </main>
    </GenderContext.Provider>
  )

  /** intro, question-<screen id> (e.g. question-direction), loading, goals, activities, plan */
  function screenName() {
    return step.kind === 'question' ? `question-${screens[step.index].id}` : step.kind
  }

  function renderStep() {
    switch (step.kind) {
      case 'intro':
        return (
          <IntroScreen
            onStart={(chosen) => {
              setGender(chosen)
              setStep({ kind: 'question', index: 0 })
            }}
          />
        )

      case 'question': {
        const { index } = step
        return (
          <QuestionScreen
            key={screens[index].id}
            screen={screens[index]}
            index={index}
            total={screens.length}
            answers={answers}
            onChange={setAnswers}
            onNext={() => (index + 1 < screens.length ? setStep({ kind: 'question', index: index + 1 }) : finishQuestions())}
            onBack={() => setStep(index === 0 ? { kind: 'intro' } : { kind: 'question', index: index - 1 })}
          />
        )
      }

      case 'loading':
        return (
          <div className="loading" role="status">
            <div className="spinner" aria-hidden="true" />
            <p>מכינים לך המלצות…</p>
          </div>
        )

      case 'goals':
        return (
          <GoalsScreen
            recommended={recommended}
            chosen={goals}
            onChange={changeGoals}
            onNext={() => setStep({ kind: 'activities', goalIndex: 0 })}
            onBack={() => setStep({ kind: 'question', index: screens.length - 1 })}
          />
        )

      case 'activities': {
        const { goalIndex } = step
        const goal = goals[goalIndex]
        // An activity serving both goals is offered under the second one only if not already picked.
        const pickedElsewhere = goals.filter((g) => g !== goal).flatMap((g) => activities[g] ?? [])
        return (
          <ActivitiesScreen
            key={goal}
            goal={content.domains.find((d) => d.id === goal)!}
            step={goalIndex + 1}
            activities={rankActivities(content, answers, goal, goals, pickedElsewhere)}
            chosen={activities[goal] ?? []}
            onChange={(ids) => setActivities((prev) => ({ ...prev, [goal]: ids }))}
            onNext={() => setStep(goalIndex === 0 ? { kind: 'activities', goalIndex: 1 } : { kind: 'plan' })}
            onBack={() => setStep(goalIndex === 0 ? { kind: 'goals' } : { kind: 'activities', goalIndex: 0 })}
          />
        )
      }

      case 'plan':
        return (
          <PlanScreen
            goals={goals}
            activities={activities}
            phrases={ai?.phrases ?? {}}
            onBack={() => setStep({ kind: 'activities', goalIndex: 1 })}
            onRestart={restart}
          />
        )
    }
  }
}

export default App
