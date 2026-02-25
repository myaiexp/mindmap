import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'

export const LeafNode = memo(({ data, selected }: NodeProps) => {
  const d = data as {
    label: string
    type: string
    vaultColor: string
  }

  const isResource = d.type === 'resource'
  const isNote = d.type === 'note'

  return (
    <div
      style={{
        borderColor: selected ? d.vaultColor + 'cc' : '#2a2a2a',
        backgroundColor: selected ? d.vaultColor + '10' : 'transparent',
      }}
      className="relative flex items-center justify-center w-full h-full rounded-md border cursor-pointer select-none"
    >
      <span
        className={`text-[11px] text-center px-2 leading-tight ${
          isNote
            ? 'italic text-zinc-400'
            : isResource
            ? 'text-blue-400'
            : 'text-zinc-300'
        }`}
      >
        {isResource && <span className="mr-1">↗</span>}
        {d.label}
      </span>
      <Handle type="source" position={Position.Top} id="c"
        style={{ opacity: 0, left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }} />
      <Handle type="target" position={Position.Top} id="c"
        style={{ opacity: 0, left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }} />
    </div>
  )
})

LeafNode.displayName = 'LeafNode'
