interface Props {
  current: number
  total: number
}

export function Progress({ current, total }: Props) {
  return (
    <div className="stack" style={{ gap: 4 }}>
      <span className="progress-label">
        שאלה {current} מתוך {total}
      </span>
      <div className="progress" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={current}>
        <span style={{ width: `${(current / total) * 100}%` }} />
      </div>
    </div>
  )
}
