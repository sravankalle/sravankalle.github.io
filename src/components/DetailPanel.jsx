import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { categoryLabels } from '../data/portfolio'
import { usePrefersReducedMotion } from '../hooks/useTheme'

/*
 * The panel "builds" itself: grid lines fade in, then squares fill in as a wave
 * from the top-left corner, then the content rises in line by line. Closing
 * runs the same thing in reverse. Timings here must match styles.css.
 */
const CELL = 46 // target square size, px
const CELL_DELAY = { start: 60, spread: 300 } // ms: first square, wave length
const BUILD_MS = 1000 // until the panel is fully built and content is in
const CLOSE_MS = 620 // until squares and grid lines are gone

// Deterministic jitter per square, so the wave looks organic but never flickers.
const jitter = (i) => {
  const x = Math.sin(i * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

export default function DetailPanel({ item, onClose, onTagClick, tagCount, activeTag }) {
  // Keep showing the last item while the panel animates closed.
  const [shown, setShown] = useState(item)
  const [phase, setPhase] = useState('closed') // closed | opening | open | closing
  const [grid, setGrid] = useState({ cols: 10, rows: 20 })
  const panelRef = useRef(null)
  const closeRef = useRef(null)
  const reduced = usePrefersReducedMotion()
  const open = Boolean(item)

  // Drive the phases. Measuring happens before paint so the grid fits exactly.
  useLayoutEffect(() => {
    let timer
    if (item) {
      setShown(item)
      const r = panelRef.current.getBoundingClientRect()
      setGrid({ cols: Math.max(4, Math.round(r.width / CELL)), rows: Math.max(6, Math.round(r.height / CELL)) })
      setPhase('opening')
      timer = setTimeout(() => setPhase('open'), reduced ? 0 : BUILD_MS)
    } else {
      setPhase((p) => (p === 'closed' ? 'closed' : 'closing'))
      timer = setTimeout(() => setPhase('closed'), reduced ? 0 : CLOSE_MS)
    }
    return () => clearTimeout(timer)
  }, [item, reduced])

  useEffect(() => {
    if (open) closeRef.current?.focus()
  }, [open])

  // One square per grid cell, each with its own open/close delay.
  const cells = useMemo(() => {
    const { cols, rows } = grid
    const out = []
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c
        const t = Math.min(1, (c / cols) * 0.5 + (r / rows) * 0.5 + jitter(i) * 0.18)
        out.push({
          i,
          open: CELL_DELAY.start + t * CELL_DELAY.spread,
          close: 100 + (1 - t) * 240,
        })
      }
    }
    return out
  }, [grid])

  const { category, title, meta, period, summary, highlights, tags, links } = shown ?? {}

  return (
    <>
      <div className={`scrim${open ? ' is-open' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside
        ref={panelRef}
        className={`panel is-${phase}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="panel-title"
        inert={!open}
        style={{ '--cols': grid.cols, '--rows': grid.rows }}
      >
        <div className="panel-grid" aria-hidden="true">
          {phase !== 'closed' &&
            cells.map((cell) => (
              <span
                key={cell.i}
                className="panel-cell"
                style={{ '--open-delay': `${cell.open}ms`, '--close-delay': `${cell.close}ms` }}
              />
            ))}
        </div>

        {shown && (
          <div className="panel-body">
            <div className="panel-top">
              <span className="eyebrow">
                {categoryLabels[category]}
                {period ? ` · ${period}` : ''}
              </span>
              <button ref={closeRef} className="icon-btn" onClick={onClose} aria-label="Close details">
                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                  <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>
            </div>

            <h2 id="panel-title">{title}</h2>
            {meta && <p className="panel-meta">{meta}</p>}
            {summary && <p className="panel-summary">{summary}</p>}

            {highlights?.length > 0 && (
              <ul className="panel-list">
                {highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            )}

            {tags?.length > 0 && (
              <ul className="chips" aria-label="Technologies">
                {tags.map((t) => {
                  const n = tagCount(t)
                  const isActive = activeTag?.toLowerCase() === t.toLowerCase()
                  // Only tags shared with other cards lead anywhere.
                  if (n < 2) return <li key={t}>{t}</li>
                  return (
                    <li key={t}>
                      <button
                        className={`chip-btn${isActive ? ' is-active' : ''}`}
                        onClick={() => onTagClick(t, shown)}
                        aria-label={`See the ${n} cards tagged ${t}`}
                      >
                        {t}
                        <sup>{n}</sup>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
            {tags?.some((t) => tagCount(t) > 1) && (
              <p className="chips-hint">Tap a tag with a number to see everything else that uses it.</p>
            )}

            {links?.length > 0 && (
              <div className="panel-links">
                {links.map((l) => (
                  <a key={l.url} href={l.url} target="_blank" rel="noreferrer">
                    {l.label} <span aria-hidden="true">↗</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  )
}
