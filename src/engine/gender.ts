// Gendered wording. Texts mark each form as {male|female|neutral}, e.g. "{בחר|בחרי|בחר/י} 2 מטרות".
// Hebrew imperatives aren't regular ("השלם/י" → "השלימי"), so every form is written out in full.

export type Gender = 'm' | 'f' | 'n'

const FORM = /\{([^{}|]*)\|([^{}|]*)\|([^{}|]*)\}/g

/** Picks the form for the given gender. Plain `{n}` placeholders (no pipes) are left alone. */
export function gendered(text: string, gender: Gender): string {
  return text.replace(FORM, (_, male: string, female: string, neutral: string) =>
    gender === 'm' ? male : gender === 'f' ? female : neutral,
  )
}
