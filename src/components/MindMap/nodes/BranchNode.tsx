import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'

export const BranchNode = memo(({ data, selected }: NodeProps) => {
  const d = data as {
    label: string
    vaultColor: string
    isCollapsed: boolean
    hasChildren: boolean
  }

  return (
    <div
      style={{
        borderColor: selected ? d.vaultColor : d.vaultColor + '66',
        backgroundColor: d.vaultColor + '14',
      }}
      className="relative flex items-center justify-center w-full h-full rounded-lg border cursor-pointer select-none"
    >
      <span className="text-xs font-semibold text-zinc-200 text-center px-3 leading-tight">
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

BranchNode.displayName = 'BranchNode'
