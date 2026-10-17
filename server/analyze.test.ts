import { describe, expect, it, vi } from 'vitest'
import { analyze, parseRequest, parseResult } from './analyze.ts'

const env = { GEMINI_API_KEY: 'test-key' }
const domains = [
  { id: 'self', title: 'היכרות עם עצמי', description: 'א' },
  { id: 'skills', title: 'פיתוח מיומנויות', description: 'ב' },
  { id: 'industry', title: 'הכרת התעשייה', description: 'ג' },
  { id: 'network', title: 'הרחבת הרשת', description: 'ד' },
]
const ids = domains.map((d) => d.id)
const body = {
  domains,
  profile: [{ question: 'התחום שבו אני עובד/ת', answer: 'פיתוח תוכנה' }],
  freeText: 'אכיר לעומק את תחום הפיננסים',
}

/** A fake fetch that answers like Gemini with the given model output text. */
function geminiReturning(text: string, status = 200) {
  return vi.fn(async () =>
    Response.json({ candidates: [{ content: { parts: [{ text }] } }] }, { status }),
  ) as unknown as typeof fetch
}

const goodOutput = JSON.stringify({
  weights: { self: 0, skills: 0, industry: 2, network: 1 },
  phrases: { self: 'א', skills: 'ב', industry: 'להכיר את עולם הפיננסים', network: 'ד' },
})

describe('parseRequest', () => {
  it('accepts a valid body', () => {
    expect(parseRequest(body)).toEqual(body)
  })

  it('rejects a body without usable domains', () => {
    expect(parseRequest({ ...body, domains: [domains[0]] })).toBeNull()
    expect(parseRequest({ ...body, domains: [domains[0], domains[0]] })).toBeNull()
    expect(parseRequest({ ...body, domains: [{ id: 'Bad Id!', title: 'x' }, domains[1]] })).toBeNull()
  })

  it('accepts a new goal added to the content', () => {
    const extra = [...domains, { id: 'wellbeing', title: 'רווחה אישית', description: 'ה' }]
    expect(parseRequest({ ...body, domains: extra })?.domains).toHaveLength(5)
  })

  it('rejects a body without free text', () => {
    expect(parseRequest({ ...body, freeText: '   ' })).toBeNull()
    expect(parseRequest({ profile: 'x', freeText: 'y' })).toBeNull()
    expect(parseRequest(null)).toBeNull()
  })

  it('trims long text and drops malformed profile items', () => {
    const parsed = parseRequest({ domains, profile: [{ question: 1 }, ...body.profile], freeText: 'א'.repeat(2000) })
    expect(parsed?.freeText.length).toBe(600)
    expect(parsed?.profile).toEqual(body.profile)
  })
})

describe('parseResult', () => {
  it('clamps weights to 0–3 whole numbers', () => {
    const result = parseResult({ weights: { self: 9, skills: -1, industry: 1.6, network: 'x' }, phrases: {} }, ids)
    expect(result?.weights).toEqual({ self: 3, skills: 0, industry: 2, network: 0 })
  })

  it('rejects output without weights or phrases', () => {
    expect(parseResult({ weights: {} }, ids)).toBeNull()
    expect(parseResult('text', ids)).toBeNull()
  })
})

describe('analyze', () => {
  it('returns weights and phrases from Gemini', async () => {
    const fetchImpl = geminiReturning(goodOutput)
    const result = await analyze(body, env, fetchImpl)
    expect(result.status).toBe(200)
    expect(result.body).toMatchObject({ weights: { industry: 2, network: 1 }, phrases: { industry: 'להכיר את עולם הפיננסים' } })
  })

  it('sends the key in a header, never in the URL', async () => {
    const fetchImpl = geminiReturning(goodOutput)
    await analyze(body, env, fetchImpl)
    const [url, init] = (fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(String(url)).not.toContain('test-key')
    expect((init as RequestInit).headers).toMatchObject({ 'x-goog-api-key': 'test-key' })
  })

  it('reports 503 when the key is missing', async () => {
    expect((await analyze(body, {}, geminiReturning(goodOutput))).status).toBe(503)
  })

  it('reports 400 for a bad request without calling Gemini', async () => {
    const fetchImpl = geminiReturning(goodOutput)
    expect((await analyze({}, env, fetchImpl)).status).toBe(400)
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('reports 502 when Gemini is over quota', async () => {
    expect((await analyze(body, env, geminiReturning('', 429))).status).toBe(502)
  })

  it('reports 502 when Gemini returns malformed JSON', async () => {
    expect((await analyze(body, env, geminiReturning('not json'))).status).toBe(502)
  })

  it('reports 502 when the request fails or times out', async () => {
    const failing = vi.fn(async () => {
      throw new DOMException('timed out', 'TimeoutError')
    }) as unknown as typeof fetch
    expect((await analyze(body, env, failing)).status).toBe(502)
  })
})
