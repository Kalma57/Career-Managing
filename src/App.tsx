import { useEffect, useMemo, useState } from 'react'
import { content } from './content'
import type { DomainId } from './content/types'
import { emptyAnswers, rankActivities, rankDomains, scoreDomains, type Answers } from './engine/scoring'
import { ActivitiesScreen } from './screens/ActivitiesScreen'
import { GoalsScreen } from './screens/GoalsScreen'
import { IntroScreen } from './screens/IntroScreen'
import { PlanScreen } from './screens/PlanScreen'
import { QuestionScreen } from './screens/QuestionScreen'

type Step =
  | { kind: 'intro' }
  | { kind: 'question'; index: number }
  | { kind: 'goals' }
  | { kind: 'activities'; goalIndex: number }
  | { kind: 'plan' }

const screens = content.screens
const emptyActivities = () => ({}) as Record<DomainId, string[]>

function App() {
  const [step, setStep] = useState<Step>({ kind: 'intro' })
  const [answers, setAnswers] = useState<Answers>(emptyAnswers)
  const [goals, setGoals] = useState<DomainId[]>([])
  const [activities, setActivities] = useState(emptyActivities)
  const [numbers, setNumbers] = useState<Record<string, number>>({})

  const recommended = useMemo(
    () => rankDomains(content, scoreDomains(content, answers), answers).slice(0, 2),
    [answers],
  )

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [step])

  const toGoals = () => {
    if (goals.length === 0) setGoals(recommended)
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
    setNumbers({})
    setStep({ kind: 'intro' })
  }

  return <main className="app">{renderStep()}</main>

  function renderStep() {
    switch (step.kind) {
      case 'intro':
        return <IntroScreen onStart={() => setStep({ kind: 'question', index: 0 })} />

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
            onNext={() => (index + 1 < screens.length ? setStep({ kind: 'question', index: index + 1 }) : toGoals())}
            onBack={() => setStep(index === 0 ? { kind: 'intro' } : { kind: 'question', index: index - 1 })}
          />
        )
      }

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
            numbers={numbers}
            onNumber={(id, n) => setNumbers((prev) => ({ ...prev, [id]: n }))}
            onBack={() => setStep({ kind: 'activities', goalIndex: 1 })}
            onRestart={restart}
          />
        )
    }
  }
}

export default App
