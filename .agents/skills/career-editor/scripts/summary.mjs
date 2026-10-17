// Prints the site's current content in plain Hebrew, numbered the way the skill shows it.
// Usage: node .agents/skills/career-editor/scripts/summary.mjs [all|questions|goals|activities|texts]
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('../../../../', import.meta.url))
const content = JSON.parse(readFileSync(`${ROOT}src/content/content.json`, 'utf8'))
const part = process.argv[2] ?? 'all'

// Gendered forms {male|female|neutral} are shown in their neutral form.
const n = (text = '') => text.replace(/\{([^{}|]*)\|([^{}|]*)\|([^{}|]*)\}/g, '$3')
const domainTitle = Object.fromEntries(content.domains.map((d) => [d.id, n(d.title)]))
const LOAD = { light: 'קל', medium: 'בינוני', heavy: 'דורש מחויבות' }
const TYPE = { single: 'בחירה אחת', multi: 'בחירה מרובה', search: 'רשימה עם חיפוש', text: 'טקסט חופשי' }
const points = (weights = {}) =>
  Object.entries(weights)
    .map(([d, p]) => `${domainTitle[d] ?? d} +${p}`)
    .join(', ')

function goals() {
  console.log('== מטרות (תחומים) ==')
  content.domains.forEach((d, i) => console.log(`${i + 1}. ${n(d.title)} [id: ${d.id}] – ${n(d.description)}`))
  console.log(`סדר הכרעה בשוויון: ${content.tieBreak.join(' ← ')}`)
  console.log()
}

function questions() {
  console.log('== שאלות, לפי הסדר באתר ==')
  content.screens.forEach((screen, i) => {
    console.log(`מסך ${i + 1} [screen id: ${screen.id}]${screen.optional ? ' (רשות)' : ''}`)
    for (const q of screen.questions) {
      console.log(`  • ${n(q.title)} [question id: ${q.id}, ${TYPE[q.type]}${q.max ? `, עד ${q.max}` : ''}${q.allowOther ? ', אפשר להקליד' : ''}]`)
      if (q.subtitle) console.log(`    כותרת משנה: ${n(q.subtitle)}`)
      if (q.type === 'text') {
        console.log(`    משפט פתיחה: ${n(q.stem)}`)
        console.log(`    פתיחים מוצעים: ${q.hints.map(n).join(' | ')}`)
        continue
      }
      q.options.forEach((o, j) => {
        const extra = [
          o.weights ? `ניקוד: ${points(o.weights)}` : '',
          o.group ? `קבוצה: ${o.group}` : '',
          o.maxLoad ? `מציג פעילויות עד: ${LOAD[o.maxLoad]}` : '',
        ].filter(Boolean)
        console.log(`    ${j + 1}. ${n(o.label)} [id: ${o.id}]${extra.length ? ` – ${extra.join('; ')}` : ''}`)
      })
      for (const [group, w] of Object.entries(content.groupWeights[q.id] ?? {})) {
        console.log(`    ניקוד לקבוצה "${group}": ${points(w)}`)
      }
    }
  })
  console.log()
}

function activities() {
  console.log('== פעילויות ==')
  content.activities.forEach((a, i) => {
    console.log(`${i + 1}. ${n(a.title)} [id: ${a.id}]`)
    console.log(`   תיאור: ${n(a.description)}`)
    console.log(`   מטרות: ${a.domains.map((d) => domainTitle[d] ?? d).join(', ')} | מאמץ: ${LOAD[a.load]} | קישור: ${a.link ?? 'אין'}`)
    console.log(`   יעד: ${n(a.goal)}`)
    if (a.boost) console.log(`   עולה בדירוג עבור: ${Object.entries(a.boost).map(([k, v]) => `${k} (+${v})`).join(', ')}`)
  })
  console.log()
}

function texts() {
  console.log('== טקסטים כלליים ==')
  for (const [key, value] of Object.entries(content.texts)) {
    if (typeof value === 'string') console.log(`${key}: ${n(value)}`)
    else if (Array.isArray(value)) console.log(`${key}: ${value.map((v) => (typeof v === 'string' ? n(v) : n(v.label))).join(' | ')}`)
    else console.log(`${key}: ${Object.values(value).map(n).join(' | ')}`)
  }
  console.log()
}

const parts = { goals, questions, activities, texts }
if (part === 'all') Object.values(parts).forEach((f) => f())
else if (parts[part]) parts[part]()
else {
  console.error(`Unknown part "${part}". Use: all, questions, goals, activities, texts`)
  process.exit(1)
}
