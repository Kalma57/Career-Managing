# Flow 2 – question update

One question per message. Every menu ends with `9 – חזרה לתפריט הראשי` and `0 – להתחיל מחדש`.
Run `scripts/summary.mjs questions` (and `goals` when scoring comes up) before showing any list.

```
מה תרצי לעשות?
1 – להוסיף שאלה חדשה
2 – להסיר שאלה
3 – לשנות שאלה קיימת
```

## 1 – add a question

1. **Type:**
   ```
   איך הסטודנטים יענו על השאלה?
   1 – בחירה של תשובה אחת
   2 – בחירה של כמה תשובות
   3 – רשימה ארוכה עם חיפוש (למשל רשימת תחומים)
   ```
   (No new free-text question: there can be only one. If she asks for one, explain it and offer to edit the existing one.)
   For 2: "עד כמה תשובות אפשר לבחור? (מספר)".
2. **Wording:** "מה נוסח השאלה? (לדוגמה: כמה שנות ניסיון יש לך?)". Add gendered markup and confirm the female form.
3. **Answers:** "כתבי את התשובות האפשריות, כל תשובה בשורה נפרדת". Add markup per answer where needed, then show them back numbered for confirmation.
4. **"Other" box:** `האם לאפשר גם להקליד תשובה אחרת?  1 – כן / 2 – לא`.
5. **Required:** `האם חובה לענות על השאלה?  1 – כן, חובה / 2 – לא, אפשר לדלג`. (2 → `"optional": true` on the screen.)
6. **Position:** show the current order numbered, then: "אחרי איזו שאלה לשים אותה? (0 – בהתחלה)". It gets its own new screen in that position.
7. **Effect on recommendations:**
   ```
   האם התשובות לשאלה הזו צריכות להשפיע על המטרות שהאתר ממליץ עליהן?
   1 – כן
   2 – לא, זו שאלה להיכרות בלבד
   ```
   On 1, for each answer in turn:
   ```
   התשובה "<answer>" – לאיזו מטרה היא מכוונת?
   1 – היכרות עם עצמי
   2 – פיתוח מיומנויות
   ...                       (all goals from summary.mjs goals)
   N+1 – לאף מטרה
   ```
   then
   ```
   כמה חזק?
   1 – קצת      2 – בינוני      3 – הרבה
   ```
   then `האם התשובה מכוונת גם למטרה נוספת?  1 – כן / 2 – לא`.
   Points: קצת = 1, בינוני = 2, הרבה = 3.
8. Write the question (new screen object at the chosen index, unique short English ids), then confirm and publish (SKILL.md step 5).

## 2 – remove a question
1. Show the questions numbered; "איזו שאלה להסיר?".
2. If it's one of `direction`, `missing`, `workload`, `workField`, `freeText`, say: "השאלה הזו היא חלק מהלב של ההמלצות, ולכן אי אפשר להסיר אותה כאן. אפשר לשנות את הנוסח או את התשובות שלה. רוצה?  1 – כן, לשנות אותה / 9 – חזרה לתפריט הראשי". For an outright removal, see "outside these menus" in SKILL.md.
3. Otherwise explain the effect in one sentence ("השאלה לא תופיע יותר. היא כרגע (לא) משפיעה על ההמלצות.") and confirm. Remove it; if its screen is left empty, remove the screen; remove any `boost`, `groupWeights` or `tieBreak` entry pointing to it.

## 3 – change a question
1. Show the questions numbered; "איזו שאלה לשנות?".
2. ```
   מה לשנות בשאלה?
   1 – הנוסח של השאלה
   2 – הנוסח של תשובה
   3 – להוסיף תשובה
   4 – להסיר תשובה
   5 – כמה תשובה משפיעה על ההמלצות
   6 – המיקום של השאלה
   ```
   - **1 / 2**: as in add, steps 2–3, for the one text.
   - **3**: wording → markup → scoring (step 7 for this answer). In `workload` also ask which effort levels to show: `1 – רק קל / 2 – עד בינוני / 3 – הכול` (`maxLoad` light/medium/heavy). In `missing`, a new answer should point to one goal with 3 points.
   - **4**: confirm; remove it and any `boost` keyed `"<question>:<answer>"` (tell her which activities lose the boost). A question must keep at least two answers.
   - **5**: show the answer's current effect in words ("כרגע: הכרת התעשייה – בינוני, הרחבת הרשת – בינוני"), then step 7 for that answer from scratch.
   - **6**: show the order; "אחרי איזו שאלה? (0 – בהתחלה)". Move the whole screen. The background screen stays first.
3. Confirm and publish.

## After a scoring change
`npm test` (inside publish) checks that a goal the student marks as missing is still always recommended. If it fails, tell her: "השינוי הזה גורם לכך שלפעמים מטרה שהסטודנט אמר שחסרה לו לא תומלץ. כדי לשמור על ההבטחה הזו, אפשר להוריד את החוזק של "<answer>" ל<level>. לעשות את זה?" and offer the alternative of choosing a different strength.
