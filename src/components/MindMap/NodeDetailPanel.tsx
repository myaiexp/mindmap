import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import type { VaultNode } from '../../data/schema'

interface Props {
  node: VaultNode | null
  vaultColor: string
  onClose: () => void
}

export default function NodeDetailPanel({ node, vaultColor, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!node) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [node, onClose])

  return (
    <div
      className={`fixed right-0 top-0 h-full w-96 z-40 transition-transform duration-300 ${
        node ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div
        ref={panelRef}
        className="h-full bg-zinc-950/95 backdrop-blur border-l border-zinc-800 flex flex-col overflow-hidden"
      >
        {node && (
          <>
            {/* Header */}
            <div
              className="flex items-start justify-between p-4 border-b border-zinc-800"
              style={{ borderTopColor: vaultColor, borderTopWidth: 2 }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-[10px] font-medium uppercase tracking-widest px-1.5 py-0.5 rounded"
                    style={{ color: vaultColor, background: vaultColor + '22' }}
                  >
                    {node.type}
                  </span>
                </div>
                <h2 className="text-base font-bold text-white leading-tight">{node.label}</h2>
                {node.summary && (
                  <p className="mt-1 text-xs text-zinc-400 leading-relaxed">{node.summary}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="ml-3 text-zinc-500 hover:text-zinc-200 text-lg leading-none flex-shrink-0 mt-0.5"
              >
                ×
              </button>
            </div>

            {/* Tags */}
            {node.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 px-4 py-2.5 border-b border-zinc-800/50">
                {node.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-[10px] text-zinc-500 bg-zinc-800/60 px-2 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {node.content ? (
                <div className="prose prose-sm prose-invert prose-zinc max-w-none
                  prose-headings:font-semibold prose-headings:text-zinc-100
                  prose-p:text-zinc-300 prose-p:leading-relaxed
                  prose-li:text-zinc-300
                  prose-code:text-emerald-400 prose-code:bg-zinc-800/60 prose-code:px-1 prose-code:rounded
                  prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-700/50
                  prose-a:text-blue-400 prose-strong:text-zinc-100
                ">
                  <ReactMarkdown>{node.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-zinc-600 text-sm italic">No content.</p>
              )}
            </div>

            {/* Links */}
            {node.links.length > 0 && (
              <div className="border-t border-zinc-800 p-4 space-y-1.5">
                <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-2">Links</p>
                {node.links.map(link => (
                  <a
                    key={link}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-xs text-blue-400 hover:text-blue-300 truncate"
                  >
                    ↗ {link}
                  </a>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
