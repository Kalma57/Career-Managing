# Career Managing – notes for coding agents

A Hebrew, mobile-first questionnaire for MBA students at the Coller School of Management (TAU). Students answer a few questions, get two recommended career goals, pick faculty activities and leave with a personal plan. Live at https://career-managing.vercel.app (Vercel deploys every push to `main`).

## The site owner edits content through a skill
When the site owner (a non-technical client) wants to change texts, design, questions, goals, scoring or activities, use the **`career-editor`** skill in `.agents/skills/career-editor/`. It runs a guided Hebrew conversation and publishes each change as a numbered edit (`עריכה #N`, tag `edit-N`).

## Layout
- `src/content/content.json` – all content: texts, goals (`domains`), question screens, weights, activities. `types.ts` describes it.
- `src/engine/` – scoring, AI client, gendered wording (`{male|female|neutral}` markup). Tests here use the frozen `test-content.json`.
- `src/content/content.test.ts` – rules the live content must satisfy.
- `src/screens/`, `src/components/` – React UI. `src/index.css` – styles; each screen has `data-screen` on `<main>`.
- `api/analyze.ts` + `server/analyze.ts` – serverless function calling Gemini for free-text answers. The key is in `.env.local` (never commit it) and in Vercel's environment variables.

## Commands
- `npm run dev` – local site (serves `/api/analyze` too)
- `npm test` – all tests; must pass before any push
- `npm run build` – type-check and build
