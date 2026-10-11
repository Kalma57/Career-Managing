import { describe, expect, it } from 'vitest'
import { content } from './index'

const DOMAINS = ['self', 'skills', 'industry', 'network']
const LOADS = ['light', 'medium', 'heavy']
const questions = content.screens.flatMap((s) => s.questions)
const choiceQuestions = questions.flatMap((q) => (q.type === 'text' ? [] : [q]))

function expectUnique(ids: string[]) {
  expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([])
}

describe('content.json', () => {
  it('defines exactly the four domains', () => {
    expect(content.domains.map((d) => d.id)).toEqual(DOMAINS)
  })

  it('has unique ids for screens, questions, options and activities', () => {
    expectUnique(content.screens.map((s) => s.id))
    expectUnique(questions.map((q) => q.id))
    for (const q of choiceQuestions) expectUnique(q.options.map((o) => `${q.id}:${o.id}`))
    expectUnique(content.activities.map((a) => a.id))
  })

  it('uses only known domains in every weight', () => {
    const weights = [
      ...choiceQuestions.flatMap((q) => q.options.map((o) => o.weights ?? {})),
      ...Object.values(content.groupWeights).flatMap((g) => Object.values(g)),
    ]
    for (const w of weights) {
      for (const domain of Object.keys(w)) expect(DOMAINS).toContain(domain)
    }
  })

  it('points group weights at real questions and groups', () => {
    for (const [questionId, groups] of Object.entries(content.groupWeights)) {
      const q = choiceQuestions.find((x) => x.id === questionId)
      expect(q, questionId).toBeDefined()
      const known = new Set(q!.options.map((o) => o.group))
      for (const group of Object.keys(groups)) expect(known, `${questionId}.${group}`).toContain(group)
    }
  })

  it('gives every activity valid domains, load and goal template', () => {
    for (const a of content.activities) {
      expect(a.domains.length, a.id).toBeGreaterThan(0)
      for (const d of a.domains) expect(DOMAINS, a.id).toContain(d)
      expect(LOADS, a.id).toContain(a.load)
      expect(a.goal.text, a.id).toContain('{n}')
      expect(a.goal.min, a.id).toBeLessThanOrEqual(a.goal.default)
      expect(a.goal.default, a.id).toBeLessThanOrEqual(a.goal.max)
    }
  })

  it('points activity boosts at real answers', () => {
    for (const a of content.activities) {
      for (const key of Object.keys(a.boost ?? {})) {
        const [questionId, optionId] = key.split(':')
        const q = choiceQuestions.find((x) => x.id === questionId)
        expect(q?.options.some((o) => o.id === optionId), `${a.id} → ${key}`).toBe(true)
      }
    }
  })

  it('offers at least two light activities for every domain', () => {
    for (const d of DOMAINS) {
      const light = content.activities.filter((a) => a.domains.includes(d as never) && a.load === 'light')
      expect(light.length, d).toBeGreaterThanOrEqual(2)
    }
  })
})
