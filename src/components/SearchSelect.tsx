import { useState } from 'react'
import type { Option } from '../content/types'
import { useG } from './useGender'

interface Props {
  options: Option[]
  picked: string[]
  onPick: (ids: string[]) => void
}

/** Single choice from a long list: type to filter, tap to pick. */
export function SearchSelect({ options, picked, onPick }: Props) {
  const g = useG()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const selected = options.find((o) => picked.includes(o.id))

  if (selected && !open) {
    return (
      <div className="chips">
        <button type="button" className="chip" aria-pressed="true" onClick={() => setOpen(true)}>
          {g(selected.label)} · שינוי
        </button>
      </div>
    )
  }

  const q = query.trim()
  const results = q ? options.filter((o) => g(o.label).includes(q)) : options

  return (
    <div className="stack">
      <input
        className="input"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={g('{הקלד|הקלידי|הקלד/י} לחיפוש או {בחר|בחרי|בחר/י} מהרשימה')}
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
            {g(o.label)}
          </button>
        ))}
        {results.length === 0 && <p className="muted" style={{ padding: '9px 12px' }}>לא נמצא. אפשר להקליד בשדה שמתחת.</p>}
      </div>
    </div>
  )
}
