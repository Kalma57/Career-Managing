import { describe, expect, it } from 'vitest'
import { gendered } from './gender'

describe('gendered', () => {
  const text = '{בחר|בחרי|בחר/י} 2 מטרות. באיזה תחום {אתה|את|את/ה} {עובד|עובדת|עובד/ת}?'

  it('picks the male form', () => {
    expect(gendered(text, 'm')).toBe('בחר 2 מטרות. באיזה תחום אתה עובד?')
  })

  it('picks the female form', () => {
    expect(gendered(text, 'f')).toBe('בחרי 2 מטרות. באיזה תחום את עובדת?')
  })

  it('picks the neutral form', () => {
    expect(gendered(text, 'n')).toBe('בחר/י 2 מטרות. באיזה תחום את/ה עובד/ת?')
  })

  it('leaves goal placeholders and plain text alone', () => {
    expect(gendered('להשתתף ב-{n} מפגשים', 'f')).toBe('להשתתף ב-{n} מפגשים')
  })
})
