// The shape of content.json. Assigning the JSON to `Content` makes the build
// fail on typos (e.g. an unknown domain id) instead of shipping them.

export type DomainId = 'self' | 'skills' | 'industry' | 'network'

export type Weights = Partial<Record<DomainId, number>>

export type Load = 'light' | 'medium' | 'heavy'

export interface Domain {
  id: DomainId
  title: string
  description: string
}

export interface Option {
  id: string
  label: string
  /** Background lists: the scoring group this option belongs to. */
  group?: string
  /** Points this answer adds to each domain. */
  weights?: Weights
  /** Workload question: the heaviest activity load to show. */
  maxLoad?: Load
}

interface BaseQuestion {
  id: string
  title: string
  subtitle?: string
}

export interface ChoiceQuestion extends BaseQuestion {
  type: 'single' | 'multi' | 'search'
  options: Option[]
  /** Multi: how many options may be picked. */
  max?: number
  /** Show an "other – in your own words" text field. */
  allowOther?: boolean
}

export interface TextQuestion extends BaseQuestion {
  type: 'text'
  /** The sentence the student continues, shown large above the text box. */
  stem: string
  placeholder: string
  /** Sentence starters the student can tap. */
  hints: string[]
}

export type Question = ChoiceQuestion | TextQuestion

/** One screen in the questionnaire; the background screen holds several questions. */
export interface Screen {
  id: string
  questions: Question[]
  optional?: boolean
}

export interface GoalTemplate {
  /** Measurable goal text; `{n}` is replaced by the chosen number. */
  text: string
  default: number
  min: number
  max: number
}

export interface Activity {
  id: string
  title: string
  description: string
  domains: DomainId[]
  load: Load
  link: string | null
  goal: GoalTemplate
  /** Extra ranking points when a given answer was picked, keyed "questionId:optionId". */
  boost?: Record<string, number>
}

export interface Texts {
  introTitle: string
  introBody: string[]
  introMeta: string
  startButton: string
  privacyNote: string
  goalsTitle: string
  goalsSubtitle: string
  recommendedBadge: string
  activitiesSubtitle: string
  planTitle: string
  /** Shown at the bottom of every page. */
  footer: string
  careerCenter: {
    name: string
    description: string
    email: string
    linkedin: string
  }
}

export interface Content {
  texts: Texts
  domains: Domain[]
  screens: Screen[]
  /** Question ids whose points decide ties between domains, most decisive first. */
  tieBreak: string[]
  /** Points per background group, keyed by question id then group id. */
  groupWeights: Record<string, Record<string, Weights>>
  activities: Activity[]
}
