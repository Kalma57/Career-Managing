# Content guide – how the site is built and how to edit it

Almost everything she can change lives in **`src/content/content.json`**. Design lives in **`src/index.css`**. A few button labels live in screen files. Nothing else is edited by this skill.

## Gendered wording (applies to every text that talks to the student)

Students choose on the first page how to be addressed: female, male or "אחר" (neutral). Any word that addresses the student and changes by gender is written as **`{male|female|neutral}`**:

```
"{בחר|בחרי|בחר/י} 2 מטרות"
"באיזה תחום {אתה|את|את/ה} {עובד|עובדת|עובד/ת} היום?"
```

- She writes text in one form (usually female). **You** produce all three forms. The neutral form is the slash form (בחר/י, עובד/ת, יודע/ת, בטוח/ה, את/ה).
- Write out irregular forms in full: `{השלם|השלימי|השלם/י}`, `{כתוב|כתבי|כתוב/י}`, `{המשך|המשיכי|המשך/י}`.
- Words about **someone else** (מנטור/ית, יועץ/ת, חבר/ת סגל) are **not** marked. They stay as slash forms.
- First-person student text ("מה מעניין אותי") and infinitives ("להשתתף ב...") don't change by gender, so no markup is needed.
- Never put `{`, `|` or `}` in a text for any other reason.
- The opening page (`introTitle`, `introBody`, `introMeta`, `genderQuestion`, `genderOptions`, `genderNote`) is always shown neutral. Write it in neutral wording without markup.

When confirming with her, show the **female** version only.

## content.json structure

### `texts`: general texts
| Key | Where it appears |
|---|---|
| `introTitle`, `introBody` (list of paragraphs), `introMeta` | Opening page |
| `genderQuestion`, `genderOptions[].label`, `genderNote` | Opening page, wording choice (don't change the ids f/m/n) |
| `privacyNote` | Under the open question |
| `goalsTitle`, `goalsSubtitle`, `recommendedBadge` | Choosing goals |
| `activitiesSubtitle` | Choosing activities |
| `planTitle` | The plan |
| `footer` | Bottom of every page |
| `careerCenter.name/description/email/linkedin` | Career-center box on the plan |

### `domains`: the goals
```json
{ "id": "network", "title": "הרחבת הרשת", "description": "להכיר אנשים: עמיתים, מרצים, בוגרים ואנשי תעשייה" }
```
- `id`: short lowercase English, letters, digits and dashes (e.g. `wellbeing`). It never changes once created, because answers and activities point to it. Pick it yourself from the meaning; don't ask her.
- Order in the list = order on the goals screen (after the two recommended ones, which come first).

### `screens`: the questionnaire, in order
Each screen has `id`, `questions` (usually one), and optional `"optional": true`. The first screen (`background`) shows three short questions together.

Question types:
```json
{ "id": "direction", "type": "single", "title": "...", "subtitle": "...", "allowOther": true, "options": [ ... ] }
{ "id": "missing", "type": "multi", "max": 2, ... }          // pick up to max
{ "id": "workField", "type": "search", ... }                // long list with a search box
{ "id": "freeText", "type": "text", "title": "...", "subtitle": "...", "stem": "...", "placeholder": "...", "hints": ["..."] }
```
- `allowOther: true` adds the "לא מצאת? אפשר להקליד כאן" box.
- New ids: short lowercase English made up by you (e.g. `experience`), unique.

Options:
```json
{ "id": "switch", "label": "לעבור לתחום או תעשייה אחרים", "weights": { "industry": 2, "network": 2 } }
```
- `weights`: points per goal id: 1 = קצת, 2 = בינוני, 3 = הרבה. No `weights` = the answer doesn't affect recommendations.
- `group` (background lists only) + `groupWeights` (top level) give points to a whole group: `"groupWeights": { "workField": { "none": { "industry": 1 } } }`.
- `maxLoad` (only in `workload`): the heaviest effort level shown to someone who picked it.

### Questions with a special role: never remove them
| id | Role |
|---|---|
| `direction` | Main scoring question; activities can rise in ranking for its answers (`boost`) |
| `missing` | The strongest signal. Each answer gives 3 points to **one** goal. The site promises: a goal the student says is missing is always among the two recommended |
| `workload` | Filters activities by effort; each answer needs `maxLoad` |
| `workField` | Background; its groups can give points |
| `freeText` | The only free-text question; its text goes to the AI. There can be only one free-text question |

Their wording and answers may change. Removing one, or adding a second free-text question, needs עידן.

`tieBreak` (top level, e.g. `["missing", "direction"]`): when two goals have equal points, the one with more points from these questions wins, in this order.

### `activities`
```json
{
  "id": "clubs",
  "title": "מועדוני סטודנטים",
  "description": "מפגשים עם אנשי תעשייה ועם סטודנטים שמתעניינים באותו תחום",
  "domains": ["industry", "network"],
  "load": "medium",
  "link": "https://coller.tau.ac.il/students/clubs",
  "goal": "להשתתף ב-3 מפגשי מועדון בסמסטר",
  "boost": { "direction:switch": 1 }
}
```
- `domains`: which goals it serves (at least one). An activity serving both of a student's goals is shown first.
- `load`: `light` (קל) / `medium` (בינוני) / `heavy` (דורש מחויבות). Full-time workers don't see `heavy`.
- `link`: full https link, `mailto:` address, or `null`.
- `goal`: the measurable target sentence, with the number written in, in the infinitive.
- `boost` (optional): extra ranking points when the student picked a specific answer, keyed `"questionId:optionId"`. When an answer is removed, remove boosts that point to it.

## Rules the checks enforce (`npm test`)
Explain any failure to her in one plain sentence:
1. At least two goals; goal ids are short lowercase English.
2. All ids are unique.
3. Points only go to goals that exist.
4. Gendered wording is written correctly, and no student-addressed slash form is left unmarked.
5. **A goal the student marks as missing is always recommended.** If a scoring change breaks this, it's usually because another answer now gives too many points. Suggest lowering it.
6. Every activity has valid goals, effort level and a target sentence; boosts point to real answers.
7. **Every goal has at least two activities with effort "קל"**, so full-time workers always have options.

## Design: `src/index.css`
Site-wide colours are variables at the top (`:root`):
| Variable | Meaning |
|---|---|
| `--accent` | Main colour: buttons, progress bar, frames |
| `--accent-soft` | Light background of selected items |
| `--accent-text` | Coloured text: links, highlighted labels, footer |
| `--text` / `--text-secondary` | Main / secondary text |
| `--border` | Frames and lines |
| `--surface` / `--surface-muted` | Page / outer background |

Changing one variable changes it everywhere. To change **one screen only**, add a rule scoped to that screen. The page element carries `data-screen`:

| Screen | `data-screen` |
|---|---|
| Opening page | `intro` |
| Question screens | `question-<screen id>`, e.g. `question-direction`, `question-background` |
| Choosing goals | `goals` |
| Choosing activities | `activities` |
| The plan | `plan` |
| Loading ("מכינים לך המלצות") | `loading` |

```css
.app[data-screen="goals"] h1 { font-size: 1.8rem; color: #7a1f3d; }
```
Useful selectors: `h1` (big title), `h2` (question title), `.muted` (small grey text), `.card` (answer/activity box), `.chip` (small round option), `.btn` (main button), `.stem` (the sentence in the open question), `.other-label` (the "לא מצאת?" label), `.site-footer`, `.badge` ("מומלץ עבורך").

Sizes: use `rem` (1rem = normal text). Small step = ±0.1rem, big step = ±0.3rem. Keep text readable: never below 0.8rem.

## Texts that live in screen files
Change only the Hebrew text; keep every `g('…')` / `t('…')` wrapper and the gendered markup inside it.
| Text | File |
|---|---|
| "הפקולטה לניהול ע"ש קולר · אוניברסיטת תל אביב" | `src/screens/IntroScreen.tsx` |
| "קצת עליך", "המשך", "דילוג", "חזרה", "ניקוי והתחלה מחדש", error messages | `src/screens/QuestionScreen.tsx` |
| "לא מצאת? אפשר להקליד כאן", "כתבי כאן…" | `src/components/ChoiceField.tsx` |
| "שאלה X מתוך Y" | `src/components/Progress.tsx` |
| "מטרה X מתוך 2", ": מה מתאים לך?", "מאמץ קל/בינוני/דורש מחויבות" | `src/screens/ActivitiesScreen.tsx` |
| "שמירה כ-PDF", "שיתוף", "להתחיל מחדש", "מטרה X" | `src/screens/PlanScreen.tsx` |
| "מכינים לך המלצות…" | `src/App.tsx` |
