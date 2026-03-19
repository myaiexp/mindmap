import { useState, useCallback, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import MindMapCanvas from '../components/MindMap/MindMapCanvas'
import SearchOverlay from '../components/layout/SearchOverlay'
import { useVaultData } from '../hooks/useVaultData'

export default function VaultView() {
  const { vaultId } = useParams<{ vaultId: string }>()
  const { meta, nodes } = useVaultData(vaultId ?? '')
  const [searchOpen, setSearchOpen] = useState(false)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleSelectNode = useCallback((nodeId: string) => {
    setSearchOpen(false)
    setSelectedNodeId(nodeId)
  }, [])

  if (!meta) {
    return (
      <div className="h-full flex items-center justify-center text-zinc-600 text-sm">
        Vault not found.{' '}
        <Link to="/" className="ml-1 text-blue-500 hover:underline">Go home</Link>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Topbar */}
      <div className="flex items-center gap-3 px-4 h-10 border-b border-zinc-800/60 flex-shrink-0">
        <span className="text-base">{meta.icon}</span>
        <span className="text-sm font-medium text-zinc-300">{meta.label}</span>
        <span className="text-zinc-700 text-xs mx-1">·</span>
        <span className="text-xs text-zinc-600">{nodes.length} nodes</span>
        <div className="flex-1" />
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 bg-zinc-800/40 hover:bg-zinc-800 px-3 py-1.5 rounded-lg transition-colors"
        >
          <span>Search</span>
          <kbd className="text-[10px] text-zinc-600">⌘K</kbd>
        </button>
      </div>

      {/* Canvas — no ReactFlowProvider needed */}
      <div className="flex-1 overflow-hidden">
        <MindMapCanvas
          vaultNodes={nodes}
          vaultColor={meta.color}
          selectedNodeId={selectedNodeId}
        />
      </div>

      <SearchOverlay
        nodes={nodes}
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectNode={handleSelectNode}
      />
    </div>
  )
}
