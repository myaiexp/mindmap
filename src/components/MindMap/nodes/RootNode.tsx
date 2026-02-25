import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'

export const RootNode = memo(({ data, selected }: NodeProps) => {
  const d = data as {
    label: string
    vaultColor: string
    isCollapsed: boolean
    hasChildren: boolean
  }

  return (
    <div
      style={{
        borderColor: d.vaultColor,
        boxShadow: selected
          ? `0 0 0 2px ${d.vaultColor}, 0 0 20px ${d.vaultColor}55`
          : `0 0 12px ${d.vaultColor}44`,
      }}
      className="relative flex items-center justify-center w-full h-full rounded-xl border-2 bg-black/60 backdrop-blur-sm cursor-pointer select-none"
    >
      <span
        style={{ color: d.vaultColor }}
        className="text-sm font-bold tracking-wide text-center px-3"
      >
        {d.label}
      </span>
      {d.hasChildren && (
        <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-zinc-800 border border-zinc-600 flex items-center justify-center text-[9px] text-zinc-400">
          {d.isCollapsed ? '+' : '−'}
        </span>
      )}
      <Handle type="source" position={Position.Top} id="c"
        style={{ opacity: 0, left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }} />
      <Handle type="target" position={Position.Top} id="c"
        style={{ opacity: 0, left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }} />
    </div>
  )
})

RootNode.displayName = 'RootNode'
