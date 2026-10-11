import { content } from '../content'

export function IntroScreen({ onStart }: { onStart: () => void }) {
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
        <button type="button" className="btn" onClick={onStart}>
          {texts.startButton}
        </button>
      </div>
    </>
  )
}
