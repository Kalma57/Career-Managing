import { useState } from 'react'
import type { Option } from '../content/types'

interface Props {
  options: Option[]
  picked: string[]
  onPick: (ids: string[]) => void
}

/** Single choice from a long list: type to filter, tap to pick. */
export function SearchSelect({ options, picked, onPick }: Props) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const selected = options.find((o) => picked.includes(o.id))

  if (selected && !open) {
    return (
      <div className="chips">
        <button type="button" className="chip" aria-pressed="true" onClick={() => setOpen(true)}>
          {selected.label} · שינוי
        </button>
      </div>
    )
  }

  const q = query.trim()
  const results = q ? options.filter((o) => o.label.includes(q)) : options

  return (
    <div className="stack">
      <input
        className="input"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="הקלד/י לחיפוש או בחר/י מהרשימה"
      />
      <div className="search-results" role="listbox">
        {results.map((o) => (
          <button
            key={o.id}
            type="button"
            role="option"
            aria-selected={picked.includes(o.id)}
            onClick={() => {
              onPick([o.id])
              setQuery('')
              setOpen(false)
            }}
          >
            {o.label}
          </button>
        ))}
        {results.length === 0 && <p className="muted" style={{ padding: '9px 12px' }}>לא נמצא. אפשר לכתוב בשדה "אחר".</p>}
      </div>
    </div>
  )
}
