import { useCallback, useEffect, useMemo, useState } from 'react'
import { categories, categoryLabels, items, profile } from './data/portfolio'
import Carousel from './components/Carousel'
import DetailPanel from './components/DetailPanel'
import { useTheme } from './hooks/useTheme'

const mod = (n, m) => ((n % m) + m) % m
const pad = (n) => String(n).padStart(2, '0')

const norm = (t) => t.trim().toLowerCase()
const hasTag = (item, tag) => (item.tags ?? []).some((t) => norm(t) === norm(tag))

// How many items carry each tag (case-insensitive).
const tagCounts = items.reduce((acc, item) => {
  for (const t of new Set((item.tags ?? []).map(norm))) acc.set(t, (acc.get(t) ?? 0) + 1)
  return acc
}, new Map())
const tagCount = (tag) => tagCounts.get(norm(tag)) ?? 0

export default function App() {
  const { theme, toggle } = useTheme()
  const [filter, setFilter] = useState('all')
  const [tag, setTag] = useState(null) // when set, overrides the category filter
  const [index, setIndex] = useState(0) // unbounded; wrapped with mod()
  const [openItem, setOpenItem] = useState(null)

  const visible = useMemo(() => {
    if (tag) return items.filter((i) => hasTag(i, tag))
    return filter === 'all' ? items : items.filter((i) => i.category === filter)
  }, [filter, tag])
  const count = visible.length
  const active = count ? mod(index, count) : 0
  const current = visible[active]

  const go = useCallback((delta) => setIndex((i) => i + delta), [])

  const selectFilter = (id) => {
    setFilter(id)
    setTag(null)
    setIndex(0)
  }

  // Show everything that shares `t`, starting on the card the user came from.
  const selectTag = useCallback((t, source) => {
    const related = items.filter((i) => hasTag(i, t))
    setOpenItem(null)
    setFilter('all')
    setTag(t)
    setIndex(Math.max(0, related.findIndex((i) => i.id === source?.id)))
  }, [])

  const clearTag = useCallback(() => {
    // Return to "All", keeping the current card in front.
    const id = current?.id
    setTag(null)
    setIndex(Math.max(0, items.findIndex((i) => i.id === id)))
  }, [current])

  // `delta` = how many steps the clicked card is from the front (0 = front card).
  const handleCardClick = useCallback(
    (delta) => (delta === 0 ? setOpenItem(current) : go(delta)),
    [current, go],
  )

  useEffect(() => {
    const onKey = (e) => {
      if (openItem) {
        if (e.key === 'Escape') setOpenItem(null)
        return
      }
      if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
      else if (e.key === 'Escape' && tag) clearTag()
      else if (e.key === 'Enter' && e.target === document.body && current) setOpenItem(current)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openItem, current, go, tag, clearTag])

  return (
    <div className="app">
      <header className="header">
        <a className="brand" href="/" aria-label={`${profile.name} — home`}>
          {profile.name
            .split(' ')
            .map((w) => w[0])
            .join('')}
          <span className="brand-dot" aria-hidden="true" />
        </a>
        <nav className="nav" aria-label="Elsewhere">
          {profile.links.map((l) => (
            <a key={l.label} href={l.url} target={l.url.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
              {l.label}
            </a>
          ))}
          <button className="icon-btn theme-btn" onClick={toggle} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 1.75a6.25 6.25 0 0 1 0 12.5z" fill="currentColor" />
            </svg>
          </button>
        </nav>
      </header>

      <section className="hero">
        <h1 className="name">{profile.name}</h1>
        <div className="intro">
          <p className="eyebrow">
            {profile.available && <span className="pulse" aria-hidden="true" />}
            {profile.role} — {profile.location}
          </p>
          <p className="tagline">{profile.tagline}</p>
        </div>
      </section>

      <main className="showcase">
        <Carousel
          items={visible}
          index={index}
          setIndex={setIndex}
          onCardClick={handleCardClick}
          theme={theme}
          ringKey={tag ? `tag:${norm(tag)}` : filter}
        />

        <div className="controls">
          <div className="caption" aria-live="polite">
            {current && (
              <>
                <span className="eyebrow">{categoryLabels[current.category]}</span>
                <span className="caption-title">{current.title}</span>
                <button className="link-btn" onClick={() => setOpenItem(current)}>
                  Details <span aria-hidden="true">→</span>
                </button>
              </>
            )}
          </div>

          {tag ? (
            <div className="tabs tag-bar" aria-live="polite">
              <span className="eyebrow">Tagged</span>
              <span className="tag-pill">
                {tag}
                <sup>{count}</sup>
              </span>
              <button className="link-btn" onClick={clearTag}>
                Show all <span aria-hidden="true">×</span>
              </button>
            </div>
          ) : (
          <div className="tabs" role="tablist" aria-label="Filter">
            {categories.map((c) => {
              const n = c.id === 'all' ? items.length : items.filter((i) => i.category === c.id).length
              return (
                <button
                  key={c.id}
                  role="tab"
                  aria-selected={filter === c.id}
                  className={`tab${filter === c.id ? ' is-active' : ''}`}
                  onClick={() => selectFilter(c.id)}
                >
                  {c.label}
                  <sup>{n}</sup>
                </button>
              )
            })}
          </div>
          )}

          <div className="pager">
            <button className="icon-btn" onClick={() => go(-1)} aria-label="Previous">
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M10 3L5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
            <span className="counter">
              {pad(active + 1)} <span className="counter-sep">/</span> {pad(count)}
            </span>
            <button className="icon-btn" onClick={() => go(1)} aria-label="Next">
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          </div>
        </div>
      </main>

      <DetailPanel
        item={openItem}
        onClose={() => setOpenItem(null)}
        onTagClick={selectTag}
        tagCount={tagCount}
        activeTag={tag}
      />
    </div>
  )
}
