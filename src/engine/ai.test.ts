import { describe, expect, it, vi } from 'vitest'
import { content } from '../content'
import { buildProfile, fetchAi, needsAi, studentText } from './ai'
import { emptyAnswers, type Answers } from './scoring'

const answers: Answers = {
  choices: { workField: ['finance'], direction: ['switch'] },
  other: { degrees: ' תואר בתיירות ' },
  freeText: 'אכיר אנשים בעולם ההשקעות',
}

describe('needsAi', () => {
  it('is false when the student wrote nothing', () => {
    expect(needsAi({ ...emptyAnswers(), choices: { direction: ['grow'] } })).toBe(false)
  })

  it('is true for the open question or any "other" field', () => {
    expect(needsAi(answers)).toBe(true)
    expect(needsAi({ ...emptyAnswers(), other: { direction: 'משהו אחר' } })).toBe(true)
  })
})

describe('studentText', () => {
  it('joins the trimmed "other" fields and the open answer', () => {
    expect(studentText(answers)).toBe('תואר בתיירות\nאכיר אנשים בעולם ההשקעות')
  })

  it('puts the sentence stem back in front of the open answer', () => {
    expect(studentText({ ...emptyAnswers(), freeText: 'אכיר אנשים' }, 'בסוף התואר הייתי רוצה ש')).toBe(
      'בסוף התואר הייתי רוצה שאכיר אנשים',
    )
  })

  it('sends the full sentence to the server', async () => {
    const fetchImpl = vi.fn(async () => Response.json({ weights: {}, phrases: {} })) as unknown as typeof fetch
    await fetchAi(content, { ...emptyAnswers(), freeText: 'אכיר אנשים' }, fetchImpl)
    const init = (fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls[0][1] as RequestInit
    expect(JSON.parse(String(init.body)).freeText).toBe('בסוף התואר הייתי רוצה שאכיר אנשים')
  })
})

describe('buildProfile', () => {
  it('turns picked options into readable question/answer pairs', () => {
    expect(buildProfile(content, answers)).toEqual([
      { question: 'באיזה תחום את/ה עובד/ת היום?', answer: 'פיננסים / בנקאות / השקעות' },
      { question: 'לאן היית רוצה שה‑MBA ייקח אותך?', answer: 'לעבור לתחום או תעשייה אחרים' },
    ])
  })
})

describe('fetchAi', () => {
  it('returns the parsed result', async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json({ weights: { network: 2 }, phrases: { network: 'להכיר אנשים' } }),
    ) as unknown as typeof fetch
    expect(await fetchAi(content, answers, fetchImpl)).toEqual({
      weights: { network: 2 },
      phrases: { network: 'להכיר אנשים' },
    })
  })

  it('returns null on an error status or a network failure', async () => {
    const error = vi.fn(async () => Response.json({ error: 'x' }, { status: 502 })) as unknown as typeof fetch
    const failing = vi.fn(async () => {
      throw new Error('offline')
    }) as unknown as typeof fetch
    expect(await fetchAi(content, answers, error)).toBeNull()
    expect(await fetchAi(content, answers, failing)).toBeNull()
  })
})
