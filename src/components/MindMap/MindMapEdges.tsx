import { memo } from 'react'
import type { EdgePath } from '../../hooks/useRadialLayout'

interface Props {
  hierarchyEdges: EdgePath[]
  relatedEdges: EdgePath[]
  vaultColor: string
}

const MindMapEdges = memo(({ hierarchyEdges, relatedEdges, vaultColor }: Props) => (
  <>
    {hierarchyEdges.map(edge => (
      <path
        key={edge.id}
        d={edge.d}
        fill="none"
        stroke="#444"
        strokeWidth={1.5}
      />
    ))}
    {relatedEdges.map(edge => (
      <path
        key={edge.id}
        d={edge.d}
        fill="none"
        stroke={edge.color ?? vaultColor + '88'}
        strokeWidth={1}
        strokeDasharray="4 4"
      />
    ))}
  </>
))

MindMapEdges.displayName = 'MindMapEdges'

export default MindMapEdges
