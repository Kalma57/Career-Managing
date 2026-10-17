import { describe, expect, it } from 'vitest'
import { content } from './index'
import { rankDomains, scoreDomains, type Answers, emptyAnswers } from '../engine/scoring'

const DOMAINS = content.domains.map((d) => d.id)
const LOADS = ['light', 'medium', 'heavy']
const questions = content.screens.flatMap((s) => s.questions)
const choiceQuestions = questions.flatMap((q) => (q.type === 'text' ? [] : [q]))

function expectUnique(ids: string[]) {
  expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([])
}

describe('content.json', () => {
  it('defines at least two goal domains with simple English ids', () => {
    expect(DOMAINS.length).toBeGreaterThanOrEqual(2)
    for (const id of DOMAINS) expect(id).toMatch(/^[a-z][a-z0-9-]{0,30}$/)
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

  describe('gendered wording', () => {
    const json = JSON.stringify(content)
    // Slash forms that describe someone other than the student, so they stay neutral.
    const OTHERS = ['יועץ/ת', 'מנטור/ית', 'המנטור/ית', 'שחושף/ת', 'חבר/ת', 'עוזר/ת']

    it('writes every gendered form as {male|female|neutral}', () => {
      for (const match of json.match(/\{[^{}]*\|[^{}]*\}/g) ?? []) {
        expect(match.split('|'), match).toHaveLength(3)
      }
    })

    it('marks every slash form that addresses the student', () => {
      // Remove marked forms, then look for leftover Hebrew slash forms.
      const unmarked = json.replace(/\{[^{}|]*\|[^{}|]*\|[^{}|]*\}/g, '').match(/[֐-׿]+\/[֐-׿]+/g) ?? []
      expect(unmarked.filter((form) => !OTHERS.includes(form))).toEqual([])
    })
  })

  // The promise to students: a goal they say is missing always makes the two recommendations.
  // Checked over every combination of "direction", one or two "missing" answers and the background group.
  it('always recommends what the student said is missing', () => {
    const byId = (id: string) => choiceQuestions.find((q) => q.id === id)
    const directions = byId('direction')?.options ?? []
    const missing = byId('missing')?.options ?? []
    const workFields = (byId('workField')?.options ?? []).filter(
      (o, i, all) => all.findIndex((x) => x.group === o.group) === i, // one per group
    )
    const combos = [...missing.map((m) => [m]), ...missing.flatMap((m, i) => missing.slice(i + 1).map((n) => [m, n]))]
    // The domain each "missing" answer points to most strongly.
    const target = (o: (typeof missing)[number]) =>
      Object.entries(o.weights ?? {}).sort((a, b) => b[1] - a[1])[0]?.[0]

    for (const d of directions.length ? directions : [undefined]) {
      for (const combo of combos) {
        for (const w of workFields.length ? workFields : [undefined]) {
          const choices: Answers['choices'] = { missing: combo.map((o) => o.id) }
          if (d) choices.direction = [d.id]
          if (w) choices.workField = [w.id]
          const answers = { ...emptyAnswers(), choices }
          const top = rankDomains(content, scoreDomains(content, answers), answers).slice(0, 2)
          const expected = combo.map(target).filter(Boolean)
          expect(top, `${d?.label} | ${combo.map((o) => o.label)} | ${w?.label}`).toEqual(expect.arrayContaining(expected))
        }
      }
    }
  })

  it('breaks ties only by real choice questions', () => {
    for (const id of content.tieBreak) expect(choiceQuestions.map((q) => q.id)).toContain(id)
  })

  it('points group weights at real questions and groups', () => {
    for (const [questionId, groups] of Object.entries(content.groupWeights)) {
      const q = choiceQuestions.find((x) => x.id === questionId)
      expect(q, questionId).toBeDefined()
      const known = new Set(q!.options.map((o) => o.group))
      for (const group of Object.keys(groups)) expect(known, `${questionId}.${group}`).toContain(group)
    }
  })

  it('gives every activity valid domains, load and a fixed goal sentence', () => {
    for (const a of content.activities) {
      expect(a.domains.length, a.id).toBeGreaterThan(0)
      for (const d of a.domains) expect(DOMAINS, a.id).toContain(d)
      expect(LOADS, a.id).toContain(a.load)
      expect(typeof a.goal, a.id).toBe('string')
      expect(a.goal.trim().length, a.id).toBeGreaterThan(0)
      // The target is fixed in the sentence itself, so no template placeholder may be left over.
      expect(a.goal, a.id).not.toContain('{n}')
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
