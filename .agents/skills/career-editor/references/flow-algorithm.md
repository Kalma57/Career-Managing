# Flow 3 – goals, scoring and activities

One question per message. Every menu ends with `9 – חזרה לתפריט הראשי` and `0 – להתחיל מחדש`.
Run `scripts/summary.mjs goals` / `activities` / `questions` before showing lists.

```
מה תרצי לשנות?
1 – להוסיף מטרה
2 – להסיר מטרה
3 – לשנות שם או תיאור של מטרה
4 – לשנות כמה תשובה משפיעה על ההמלצות
5 – פעילויות (הוספה, הסרה או שינוי)
6 – מה מוצג למי שעובד/ת במשרה מלאה
```

## 1 – add a goal
1. "מה שם המטרה? (לדוגמה: איזון ורווחה)".
2. "תארי במשפט אחד מה הסטודנט ירוויח ממנה. (לדוגמה: לשמור על איזון בין לימודים, עבודה ומשפחה)". Write it in first person or infinitive, like the existing goals.
3. **Into "מה חסר לך":** `להוסיף לשאלה "מה הכי מרגיש לך חסר עכשיו?" תשובה שמכוונת למטרה הזו? (מומלץ, כך הסטודנטים יוכלו לבחור בה ישירות)  1 – כן / 2 – לא`. On 1: suggest a wording in the style of the existing answers ("אני רוצה ...") as `1 – מתאים / 2 – לנסח אחרת`. It gets 3 points to the new goal.
4. **Other answers:** `האם יש עוד תשובות בשאלון שצריכות לקרב למטרה הזו?  1 – כן / 2 – לא`. On 1, go answer by answer as in flow 2 step 7.
5. **Activities:** show all activities numbered with their effort level: "אילו פעילויות מתאימות למטרה הזו? כתבי את המספרים, מופרדים בפסיקים (לדוגמה: 2, 5, 11)". Add the goal to their `domains`.
   - The rule: at least two activities with effort "קל". If fewer were chosen: "כדי שגם מי שעובד/ת במשרה מלאה יקבל/תקבל אפשרויות, צריך לפחות שתי פעילויות קלות למטרה. אלה הפעילויות הקלות: … אילו להוסיף? או 0 – להוסיף פעילות חדשה" (→ section 5, add).
6. Create the goal with a new short English `id`, at the end of `domains`. Confirm and publish.

## 2 – remove a goal
1. Show the goals; "איזו מטרה להסיר?". At least two goals must remain.
2. Explain: "המטרה לא תופיע יותר. תשובות שקירבו אליה יפסיקו להשפיע, והיא תוסר מהפעילויות."
3. Activities whose **only** goal is this one: list them and ask for each: `1 – לשייך למטרה אחרת (איזו?) / 2 – להסיר את הפעילות`.
4. If a `missing` answer pointed to it: `להסיר גם את התשובה "<answer>" מהשאלה "מה הכי מרגיש לך חסר"?  1 – כן (מומלץ) / 2 – לא`. On 2, ask which other goal it should point to.
5. Remove the goal from `domains`, from every `weights` and `groupWeights`, and from activities' `domains`. Confirm and publish.

## 3 – rename or redescribe a goal
Pick the goal, then `1 – השם / 2 – התיאור`, then the new text. The `id` never changes.

## 4 – how much an answer counts
1. Pick a question, then an answer (numbered from `summary.mjs questions`).
2. Show its current effect in words, then re-ask it as in flow 2 step 7.
3. If the check about "missing" fails, handle it as described at the end of flow 2.

## 5 – activities
```
1 – להוסיף פעילות
2 – להסיר פעילות
3 – לשנות פעילות
```
**Add:** ask one at a time:
1. "מה שם הפעילות?"
2. "תיאור קצר במשפט אחד?"
3. "לאילו מטרות היא מתאימה?" (numbers, comma-separated)
4. ```
   כמה מאמץ היא דורשת?
   1 – קל
   2 – בינוני
   3 – דורש מחויבות (לא תוצג למי שעובד/ת במשרה מלאה)
   ```
5. "מה היעד שהסטודנט יקבל? כתבי משפט עם מספר, שמתחיל בפועל. (לדוגמה: להשתתף ב-2 אירועים בסמסטר)"
6. "יש קישור לפעילות? אם כן, הדביקי אותו. אם לא, כתבי 0"
7. ```
   האם הפעילות צריכה לעלות בדירוג למי שבחר תשובה מסוימת?
   1 – לא
   2 – כן
   ```
   On 2: pick the question (usually "לאן היית רוצה שה-MBA ייקח אותך?"), then the answer, then `1 – קצת / 2 – הרבה` (boost 1 or 2).

**Remove:** pick it and confirm. If a goal is left with fewer than two "קל" activities, explain and offer to mark another activity as "קל" for it or to add one.

**Change:** pick it, then:
```
מה לשנות?
1 – השם
2 – התיאור
3 – המטרות שהיא מתאימה להן
4 – רמת המאמץ
5 – היעד
6 – הקישור
7 – העלייה בדירוג לתשובה מסוימת
```
Show the current value first ("כרגע: …"), then ask for the new one as in "Add".

## 6 – what full-time workers see
Explain: "מי שמסמן/ת שעובד/ת במשרה מלאה רואה כרגע פעילויות עד רמת מאמץ <current>." Then:
```
1 – רק פעילויות קלות
2 – פעילויות קלות ובינוניות (כמו היום)
3 – את כל הפעילויות
```
Set `maxLoad` on the `workload` answer `full` (light/medium/heavy). The same can be asked for part-time (`part`) if she wants.
