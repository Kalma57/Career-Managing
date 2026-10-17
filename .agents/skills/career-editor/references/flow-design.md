# Flow 1 – design or text change

One question per message. Every menu ends with `9 – חזרה לתפריט הראשי` and `0 – להתחיל מחדש`.

## Step 1 – which screen?
Run `scripts/summary.mjs questions` to get the current question screens, then ask:

```
איזה חלק באתר תרצי לשנות?
1 – דף הפתיחה
2 – שאלה 1: <first question title>
3 – שאלה 2: <...>
...                                    (one line per question screen, numbered in order)
N+2 – בחירת המטרות
N+3 – בחירת הפעילויות
N+4 – התוכנית האישית (העמוד האחרון)
N+5 – השורה התחתונה ("המרכז לניהול קריירה")
N+6 – כל האתר (צבעים וגופן כלליים)
```

## Step 2 – what to change?
```
מה תרצי לשנות ב<screen name>?
1 – נוסח של טקסט
2 – צבע
3 – גודל כתב
4 – הדגשה (כתב מודגש או רגיל)
5 – משהו אחר
```

### 1 – text
1. List the texts on that screen, numbered, in their female form (titles, subtitles, buttons, answers). Use `summary.mjs` and the "Texts that live in screen files" table in the content guide.
2. "איזה טקסט?" → she picks a number.
3. "מה הנוסח החדש? (הנוסח הנוכחי: "<current>")" → she types.
4. Add gendered markup where needed (content guide). If the text addresses the student, confirm: "כך זה ייראה לסטודנטית: "<female>". ולסטודנט: "<male>". מתאים?  1 – כן / 2 – לתקן".

Changing answer *wording* here is fine. Adding, removing or re-scoring answers belongs to flow 2.

### 2 – colour
1. "מה לצבוע?" with the elements on that screen, e.g. `1 – הכותרת` / `2 – הכפתורים` / `3 – הרקע` / `4 – המסגרות` / `5 – הטקסט הקטן`. For "כל האתר": `1 – הצבע הראשי (כפתורים, מסגרות, קישורים)` / `2 – צבע הטקסט` / `3 – צבע הרקע`.
2. "איזה צבע?"
   ```
   1 – כחול כהה (הנוכחי)      #1f3a68
   2 – כחול בהיר               #2f6db5
   3 – בורדו                   #7a1f3d
   4 – ירוק כהה                #1f5f4a
   5 – אפור כהה                #333a45
   6 – צבע אחר (אפשר לכתוב שם של צבע או קוד צבע)
   ```
   For "צבע אחר", turn her description into a readable dark shade and confirm it in words.
3. Site-wide main colour: change `--accent` and `--accent-text` together, and set `--accent-soft` to a very light tint of the same colour. One screen only: add a rule scoped with `data-screen` (content guide).
4. Keep text readable: dark text on light backgrounds. If her choice would make text hard to read (e.g. light text on white), say so and suggest a darker shade.

### 3 – text size
1. "איזה טקסט?" (as for colour).
2. `1 – קצת יותר גדול` / `2 – הרבה יותר גדול` / `3 – קצת יותר קטן` / `4 – הרבה יותר קטן`.
3. Apply ±0.1rem or ±0.3rem from the current size, scoped to the screen. Never below 0.8rem.

### 4 – bold
"איזה טקסט?" then `1 – מודגש` / `2 – רגיל`. Use `font-weight: 600` or `400`.

### 5 – something else
"תארי במשפט אחד מה תרצי שישתנה, ואיפה. (לדוגמה: שהכפתורים יהיו מעוגלים יותר)".
- If it's a small visual change in `index.css`, propose it in words and continue.
- If it means a new element, moving parts around, or a new screen: it needs עידן (see SKILL.md).

## Step 3 – confirm and publish
Back to SKILL.md step 5. Describe the change visually ("הכותרת במסך המטרות תהיה בבורדו ובגודל גדול יותר").
