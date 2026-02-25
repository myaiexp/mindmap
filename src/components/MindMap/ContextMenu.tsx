import { useEffect, useRef } from 'react'

interface Props {
  x: number
  y: number
  nodeId: string
  onClose: () => void
}

export default function ContextMenu({ x, y, nodeId: _nodeId, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  const style: React.CSSProperties = {
    position: 'fixed',
    top: y,
    left: x,
    zIndex: 50,
  }

  return (
    <div ref={ref} style={style}>
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl py-1 min-w-[140px]">
        <div className="px-3 py-1.5 text-xs text-zinc-600 select-none">
          More actions coming soon
        </div>
      </div>
    </div>
  )
}
