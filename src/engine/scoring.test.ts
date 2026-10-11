import { describe, expect, it } from 'vitest'
import { content } from '../content'
import {
  AI_WEIGHT_CAP,
  type Answers,
  capAiWeights,
  emptyAnswers,
  formatGoal,
  maxLoad,
  rankActivities,
  rankDomains,
  scoreDomains,
} from './scoring'

function answers(choices: Answers['choices']): Answers {
  return { ...emptyAnswers(), choices }
}

const top2 = (a: Answers) => rankDomains(content, scoreDomains(content, a)).slice(0, 2)

describe('scoreDomains', () => {
  it('recommends industry and network to a career switcher', () => {
    const a = answers({ direction: ['switch'], missing: ['network'] })
    expect(top2(a).sort()).toEqual(['industry', 'network'])
  })

  it('puts self-knowledge first for a student who is still unsure', () => {
    expect(top2(answers({ direction: ['unsure'] }))[0]).toBe('self')
  })

  it('adds group weights from the background lists', () => {
    const scores = scoreDomains(content, answers({ workField: ['none'] }))
    expect(scores.industry).toBe(1)
  })

  it('lets the "missing" answers outweigh the direction', () => {
    const a = answers({ direction: ['grow'], missing: ['self', 'industry'] })
    expect(top2(a).sort()).toEqual(['industry', 'self'])
  })

  it('adds AI weights, capped', () => {
    const scores = scoreDomains(content, emptyAnswers(), { network: 10 })
    expect(scores.network).toBe(AI_WEIGHT_CAP)
  })
})

describe('capAiWeights', () => {
  it('keeps small weights as they are', () => {
    expect(capAiWeights({ self: 1, skills: 2 })).toEqual({ self: 1, skills: 2 })
  })

  it('trims the total to the cap and drops junk values', () => {
    const capped = capAiWeights({ self: 5, skills: -2, industry: 1.4 })
    const total = Object.values(capped).reduce((x, y) => x + (y ?? 0), 0)
    expect(total).toBe(AI_WEIGHT_CAP)
    expect(capped.skills).toBeUndefined()
  })
})

describe('maxLoad', () => {
  it('limits full-time workers to medium activities', () => {
    expect(maxLoad(content, answers({ workload: ['full'] }))).toBe('medium')
  })

  it('allows everything when the question was not answered', () => {
    expect(maxLoad(content, emptyAnswers())).toBe('heavy')
  })
})

describe('rankActivities', () => {
  it('only returns activities serving the goal', () => {
    const list = rankActivities(content, emptyAnswers(), 'network', ['network', 'self'])
    expect(list.length).toBeGreaterThan(0)
    for (const a of list) expect(a.domains).toContain('network')
  })

  it('hides heavy activities from full-time workers', () => {
    const list = rankActivities(content, answers({ workload: ['full'] }), 'skills', ['skills', 'industry'])
    expect(list.some((a) => a.load === 'heavy')).toBe(false)
  })

  it('ranks StartUp Coller first for an aspiring founder with time', () => {
    const a = answers({ workload: ['part'], direction: ['startup'] })
    expect(rankActivities(content, a, 'skills', ['skills', 'industry'])[0].id).toBe('startup-coller')
  })

  it('prefers activities that serve both chosen goals', () => {
    const [first] = rankActivities(content, emptyAnswers(), 'industry', ['industry', 'network'])
    expect(first.domains).toEqual(expect.arrayContaining(['industry', 'network']))
  })
})

describe('formatGoal', () => {
  const template = { text: 'להשתתף ב-{n} מפגשים', default: 3, min: 1, max: 5 }

  it('fills in the number', () => {
    expect(formatGoal(template, 2)).toBe('להשתתף ב-2 מפגשים')
  })

  it('clamps to the allowed range', () => {
    expect(formatGoal(template, 9)).toBe('להשתתף ב-5 מפגשים')
  })
})
