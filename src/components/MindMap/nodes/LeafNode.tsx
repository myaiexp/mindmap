import { memo } from 'react'
import type { NodeComponentProps } from './types'

export const LeafNode = memo(({ label, type, vaultColor, isSelected, onClick, onContextMenu }: NodeComponentProps) => {
  const isResource = type === 'resource'
  const isNote = type === 'note'

  return (
    <div
      onClick={onClick}
      onContextMenu={onContextMenu}
      style={{
        borderColor: isSelected ? vaultColor + 'cc' : '#2a2a2a',
        backgroundColor: isSelected ? vaultColor + '10' : 'transparent',
      }}
      className="flex items-center justify-center w-full h-full rounded-md border cursor-pointer select-none"
    >
      <span
        className={`text-[11px] text-center px-2 leading-tight ${
          isNote ? 'italic text-zinc-400' : isResource ? 'text-blue-400' : 'text-zinc-300'
        }`}
      >
        {isResource && <span className="mr-1">↗</span>}
        {label}
      </span>
    </div>
  )
})

LeafNode.displayName = 'LeafNode'
