import { useState, useEffect } from 'react'
import type { Node, Edge } from '@xyflow/react'
import { computeLayout } from '../lib/elk'
import type { VaultNode } from '../data/schema'
import { NODE_DIMS } from '../lib/elk'

export function useELKLayout(
  vaultNodes: VaultNode[],
  collapsedIds: Set<string>,
  vaultColor: string
) {
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (vaultNodes.length === 0) return

    setLoading(true)

    const hidden = new Set<string>()
    function markHidden(parentId: string) {
      for (const node of vaultNodes) {
        if (node.parents.includes(parentId) && !hidden.has(node.id)) {
          hidden.add(node.id)
          markHidden(node.id)
        }
      }
    }
    for (const id of collapsedIds) markHidden(id)

    computeLayout(vaultNodes, collapsedIds).then(layout => {
      const posMap = new Map(layout.map(l => [l.id, l]))

      const flowNodes: Node[] = layout.map(l => {
        const vn = vaultNodes.find(n => n.id === l.id)!
        const isCollapsed = collapsedIds.has(l.id)
        const hasChildren = vaultNodes.some(n => n.parents.includes(l.id))
        return {
          id: l.id,
          type: vn.type,
          position: { x: l.x, y: l.y },
          data: {
            label: vn.label,
            type: vn.type,
            summary: vn.summary,
            tags: vn.tags,
            links: vn.links,
            content: vn.content,
            vaultColor,
            isCollapsed,
            hasChildren,
          },
          style: { width: l.width, height: l.height },
        }
      })

      const allIds = new Set(vaultNodes.map(n => n.id))
      const visibleIds = new Set(layout.map(l => l.id))

      const flowEdges: Edge[] = []

      // Hierarchy edges
      for (const vn of vaultNodes) {
        if (!visibleIds.has(vn.id)) continue
        for (const p of vn.parents) {
          if (!visibleIds.has(p)) continue
          flowEdges.push({
            id: `h-${p}-${vn.id}`,
            source: p,
            target: vn.id,
            type: 'floating',
            style: { stroke: '#444', strokeWidth: 1.5 },
          })
        }
      }

      // Related edges (dashed)
      for (const vn of vaultNodes) {
        if (!visibleIds.has(vn.id)) continue
        for (const rel of vn.related) {
          if (!visibleIds.has(rel) || !allIds.has(rel)) continue
          // Deduplicate by using sorted id pair
          const [a, b] = [vn.id, rel].sort()
          const edgeId = `r-${a}-${b}`
          if (!flowEdges.find(e => e.id === edgeId)) {
            flowEdges.push({
              id: edgeId,
              source: vn.id,
              target: rel,
              type: 'straight',
              style: {
                stroke: vaultColor + '88',
                strokeWidth: 1,
                strokeDasharray: '4 4',
              },
            })
          }
        }
      }

      setNodes(flowNodes)
      setEdges(flowEdges)
      setLoading(false)
    })
  }, [vaultNodes, collapsedIds, vaultColor])

  return { nodes, edges, loading }
}
