import type { Content, DomainId, Weights } from '../content/types'
import { gendered } from './gender'
import type { Answers } from './scoring'

export interface AiResult {
  weights: Weights
  phrases: Partial<Record<DomainId, string>>
}

/** How long the student waits for the AI before we continue without it. */
export const AI_TIMEOUT_MS = 6000


/**
 * Everything the student wrote in their own words: "other" fields and the open question.
 * The open answer continues a sentence, so `stem` (e.g. "בסוף התואר הייתי רוצה ש") is put back in front of it.
 */
export function studentText(answers: Answers, stem = ''): string {
  const open = answers.freeText.trim()
  return [...Object.values(answers.other).map((t) => t.trim()), open ? stem + open : '']
    .filter(Boolean)
    .join('\n')
}

/** The open question's sentence stem without the trailing ellipsis. */
function stemOf(content: Content): string {
  const question = content.screens.flatMap((s) => s.questions).find((q) => q.type === 'text')
  return question?.type === 'text' ? gendered(question.stem, 'n').replace(/[….]+$/, '') : ''
}

/** The AI is only worth calling when the student wrote something. */
export function needsAi(answers: Answers): boolean {
  return studentText(answers) !== ''
}

/** The structured answers as readable question/answer pairs, for context. */
export function buildProfile(content: Content, answers: Answers) {
  return content.screens.flatMap((screen) =>
    screen.questions.flatMap((q) => {
      if (q.type === 'text') return []
      const picked = answers.choices[q.id] ?? []
      const labels = q.options.filter((o) => picked.includes(o.id)).map((o) => gendered(o.label, 'n'))
      return labels.length ? [{ question: gendered(q.title, 'n'), answer: labels.join(', ') }] : []
    }),
  )
}

function parse(raw: unknown, ids: DomainId[]): AiResult | null {
  if (!raw || typeof raw !== 'object') return null
  const { weights, phrases } = raw as { weights?: Record<string, unknown>; phrases?: Record<string, unknown> }
  if (!weights || !phrases) return null
  const result: AiResult = { weights: {}, phrases: {} }
  for (const d of ids) {
    if (typeof weights[d] === 'number') result.weights[d] = weights[d]
    if (typeof phrases[d] === 'string' && phrases[d]) result.phrases[d] = phrases[d]
  }
  return result
}

/** Asks /api/analyze for extra points and personal phrases; null on any failure or timeout. */
export async function fetchAi(content: Content, answers: Answers, fetchImpl: typeof fetch = fetch): Promise<AiResult | null> {
  try {
    const response = await fetchImpl('/api/analyze', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        domains: content.domains.map((d) => ({
          id: d.id,
          title: gendered(d.title, 'n'),
          description: gendered(d.description, 'n'),
        })),
        profile: buildProfile(content, answers),
        freeText: studentText(answers, stemOf(content)),
      }),
      signal: AbortSignal.timeout(AI_TIMEOUT_MS),
    })
    if (!response.ok) return null
    return parse(await response.json(), content.domains.map((d) => d.id))
  } catch {
    return null
  }
}
