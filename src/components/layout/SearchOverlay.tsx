import { useState, useEffect, useRef } from 'react'
import { useSearch } from '../../hooks/useSearch'
import type { VaultNode } from '../../data/schema'

interface Props {
  nodes: VaultNode[]
  open: boolean
  onClose: () => void
  onSelectNode: (nodeId: string) => void
}

export default function SearchOverlay({ nodes, open, onClose, onSelectNode }: Props) {
  const [query, setQuery] = useState('')
  const results = useSearch(nodes, query)
  const inputRef = useRef<HTMLInputElement>(null)
  const [cursor, setCursor] = useState(0)

  useEffect(() => {
    if (open) {
      setQuery('')
      setCursor(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowDown') setCursor(c => Math.min(c + 1, results.length - 1))
      if (e.key === 'ArrowUp') setCursor(c => Math.max(c - 1, 0))
      if (e.key === 'Enter' && results[cursor]) {
        onSelectNode(results[cursor].id)
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, results, cursor, onClose, onSelectNode])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
          <span className="text-zinc-500 text-sm">⌕</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setCursor(0) }}
            placeholder="Search nodes…"
            className="flex-1 bg-transparent text-sm text-white placeholder-zinc-600 outline-none"
          />
          <kbd className="text-[10px] text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded">ESC</kbd>
        </div>

        {results.length > 0 ? (
          <ul className="max-h-72 overflow-y-auto py-1.5">
            {results.map((node, i) => (
              <li key={node.id}>
                <button
                  className={`w-full text-left px-4 py-2.5 flex flex-col gap-0.5 transition-colors ${
                    i === cursor ? 'bg-zinc-800' : 'hover:bg-zinc-800/50'
                  }`}
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => { onSelectNode(node.id); onClose() }}
                >
                  <span className="text-sm text-zinc-100 font-medium">{node.label}</span>
                  {node.summary && (
                    <span className="text-xs text-zinc-500 truncate">{node.summary}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        ) : query ? (
          <p className="text-sm text-zinc-600 px-4 py-6 text-center">No results for "{query}"</p>
        ) : null}
      </div>
    </div>
  )
}
