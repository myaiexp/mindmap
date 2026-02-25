import { memo } from 'react'
import type { NodeComponentProps } from './types'

export const BranchNode = memo(({ label, vaultColor, isSelected, onClick, onContextMenu }: NodeComponentProps) => (
  <div
    onClick={onClick}
    onContextMenu={onContextMenu}
    style={{
      borderColor: isSelected ? vaultColor : vaultColor + '66',
      backgroundColor: vaultColor + '14',
    }}
    className="flex items-center justify-center w-full h-full rounded-lg border cursor-pointer select-none"
  >
    <span className="text-xs font-semibold text-zinc-200 text-center px-3 leading-tight">
      {label}
    </span>
  </div>
))

BranchNode.displayName = 'BranchNode'
