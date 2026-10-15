import { content } from '../content'
import type { Gender } from '../engine/gender'

/** The intro is always worded neutrally; picking a wording also starts the questionnaire. */
export function IntroScreen({ onStart }: { onStart: (gender: Gender) => void }) {
  const { texts } = content
  return (
    <>
      <p className="eyebrow">הפקולטה לניהול ע"ש קולר · אוניברסיטת תל אביב</p>
      <h1>{texts.introTitle}</h1>
      {texts.introBody.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      <p className="muted">{texts.introMeta}</p>
      <div className="actions">
        <p className="field-label">{texts.genderQuestion}</p>
        {texts.genderOptions.map((option) => (
          <button key={option.id} type="button" className="btn btn-choice" onClick={() => onStart(option.id)}>
            {option.label}
          </button>
        ))}
        <p className="muted">{texts.genderNote}</p>
      </div>
    </>
  )
}
