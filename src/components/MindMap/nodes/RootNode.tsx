import { memo } from 'react'
import type { NodeComponentProps } from './types'

export const RootNode = memo(({ label, vaultColor, isSelected, onClick, onContextMenu }: NodeComponentProps) => (
  <div
    onClick={onClick}
    onContextMenu={onContextMenu}
    style={{
      borderColor: vaultColor,
      boxShadow: isSelected
        ? `0 0 0 2px ${vaultColor}, 0 0 20px ${vaultColor}55`
        : `0 0 12px ${vaultColor}44`,
    }}
    className="flex items-center justify-center w-full h-full rounded-xl border-2 bg-black/60 backdrop-blur-sm cursor-pointer select-none"
  >
    <span
      style={{ color: vaultColor }}
      className="text-sm font-bold tracking-wide text-center px-3"
    >
      {label}
    </span>
  </div>
))

RootNode.displayName = 'RootNode'
