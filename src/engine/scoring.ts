import type {
  Activity,
  ChoiceQuestion,
  Content,
  DomainId,
  Load,
  Weights,
} from '../content/types'

export interface Answers {
  /** Picked option ids per question id. */
  choices: Record<string, string[]>
  /** "Other – in your own words" text per question id. */
  other: Record<string, string>
  /** The open question at the end. */
  freeText: string
}

export type Scores = Record<DomainId, number>

const LOAD_ORDER: Load[] = ['light', 'medium', 'heavy']

/** The most points the AI may add in total, so free text can't outweigh the buttons. */
export const AI_WEIGHT_CAP = 3

/** Activities shown per goal. */
export const ACTIVITIES_PER_GOAL = 4

export function emptyAnswers(): Answers {
  return { choices: {}, other: {}, freeText: '' }
}

function choiceQuestions(content: Content): ChoiceQuestion[] {
  return content.screens
    .flatMap((s) => s.questions)
    .filter((q): q is ChoiceQuestion => q.type !== 'text')
}

function addWeights(scores: Scores, weights: Weights | undefined) {
  if (!weights) return
  for (const [domain, points] of Object.entries(weights)) {
    // Ignore weights for domains that don't exist (content.test.ts reports them).
    if (domain in scores) scores[domain] += points ?? 0
  }
}

/** Clamps AI weights to non-negative whole numbers totalling at most AI_WEIGHT_CAP. */
export function capAiWeights(weights: Weights): Weights {
  const clean: Weights = {}
  for (const [domain, points] of Object.entries(weights)) {
    const p = Math.max(0, Math.round(Number(points) || 0))
    if (p > 0) clean[domain as DomainId] = p
  }
  let total = Object.values(clean).reduce((a, b) => a + (b ?? 0), 0)
  // Trim the largest entries first until within the cap.
  while (total > AI_WEIGHT_CAP) {
    const [largest] = Object.entries(clean).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))[0]
    clean[largest as DomainId]! -= 1
    if (clean[largest as DomainId] === 0) delete clean[largest as DomainId]
    total -= 1
  }
  return clean
}

function zeroScores(content: Content): Scores {
  return Object.fromEntries(content.domains.map((d) => [d.id, 0])) as Scores
}

/** Points from the student's answers to the given questions only (all questions when omitted). */
function answerPoints(content: Content, answers: Answers, questionIds?: string[]): Scores {
  const scores = zeroScores(content)

  for (const question of choiceQuestions(content)) {
    if (questionIds && !questionIds.includes(question.id)) continue
    const picked = answers.choices[question.id] ?? []
    for (const option of question.options.filter((o) => picked.includes(o.id))) {
      addWeights(scores, option.weights)
      if (option.group) addWeights(scores, content.groupWeights[question.id]?.[option.group])
    }
  }

  return scores
}

export function scoreDomains(content: Content, answers: Answers, aiWeights: Weights = {}): Scores {
  const scores = answerPoints(content, answers)
  addWeights(scores, capAiWeights(aiWeights))
  return scores
}

/**
 * Domains from highest to lowest score. Ties go to the domain with more points
 * from the questions in content.tieBreak (what the student said explicitly),
 * and only then to the order of content.domains.
 */
export function rankDomains(content: Content, scores: Scores, answers: Answers): DomainId[] {
  const tieBreakers = content.tieBreak.map((id) => answerPoints(content, answers, [id]))
  return content.domains
    .map((d) => d.id)
    .sort((a, b) => {
      if (scores[b] !== scores[a]) return scores[b] - scores[a]
      for (const points of tieBreakers) {
        if (points[b] !== points[a]) return points[b] - points[a]
      }
      return 0
    })
}

/** The heaviest activity load this student has time for. */
export function maxLoad(content: Content, answers: Answers): Load {
  for (const question of choiceQuestions(content)) {
    const picked = answers.choices[question.id] ?? []
    const option = question.options.find((o) => o.maxLoad && picked.includes(o.id))
    if (option?.maxLoad) return option.maxLoad
  }
  return 'heavy'
}

function boostPoints(activity: Activity, answers: Answers): number {
  let points = 0
  for (const [key, value] of Object.entries(activity.boost ?? {})) {
    const [questionId, optionId] = key.split(':')
    if (answers.choices[questionId]?.includes(optionId)) points += value
  }
  return points
}

/**
 * Activities for one goal: only those serving the goal's domain and fitting the
 * student's time, ranked by how many of the chosen goals they serve plus boosts.
 */
export function rankActivities(
  content: Content,
  answers: Answers,
  goal: DomainId,
  chosenGoals: DomainId[],
  /** Activity ids already picked under the other goal. */
  exclude: string[] = [],
): Activity[] {
  const limit = LOAD_ORDER.indexOf(maxLoad(content, answers))
  const score = (a: Activity) =>
    chosenGoals.filter((g) => a.domains.includes(g)).length + boostPoints(a, answers)

  return content.activities
    .filter((a) => a.domains.includes(goal) && LOAD_ORDER.indexOf(a.load) <= limit && !exclude.includes(a.id))
    .map((a, index) => ({ a, index, s: score(a) }))
    .sort((x, y) => y.s - x.s || x.index - y.index)
    .slice(0, ACTIVITIES_PER_GOAL)
    .map(({ a }) => a)
}
