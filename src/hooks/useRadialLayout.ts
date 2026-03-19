import { useMemo } from 'react'
import * as d3 from 'd3'
import type { VaultNode, NodeType } from '../data/schema'

export const NODE_DIMS: Record<NodeType, { width: number; height: number }> = {
  root:     { width: 160, height: 60 },
  branch:   { width: 140, height: 48 },
  leaf:     { width: 120, height: 40 },
  resource: { width: 130, height: 40 },
  note:     { width: 120, height: 40 },
}

const RING_SPACING = 180

export interface PositionedNode {
  id: string
  x: number
  y: number
  width: number
  height: number
  data: VaultNode
}

export interface EdgePath {
  id: string
  d: string
  type: 'hierarchy' | 'related'
  color?: string
}

export interface RadialLayout {
  positioned: PositionedNode[]
  hierarchyEdges: EdgePath[]
  relatedEdges: EdgePath[]
}

export function computeRadialLayout(vaultNodes: VaultNode[], vaultColor: string): RadialLayout {
  if (vaultNodes.length === 0) {
    return { positioned: [], hierarchyEdges: [], relatedEdges: [] }
  }

  const rootNode = vaultNodes.find(n => n.type === 'root') ?? vaultNodes[0]
  const nodeMap = new Map(vaultNodes.map(n => [n.id, n]))

  // Build children map from parents fields
  // Only the FIRST parent is used for tree layout — additional parents would
  // cause d3.hierarchy to clone the node under multiple parents, producing
  // duplicate positioned nodes and edges.
  const childrenMap = new Map<string, string[]>()
  for (const node of vaultNodes) {
    const primaryParent = node.parents[0]
    if (!primaryParent) continue
    if (!childrenMap.has(primaryParent)) childrenMap.set(primaryParent, [])
    childrenMap.get(primaryParent)!.push(node.id)
  }

  const hierarchy = d3.hierarchy(rootNode, (node) =>
    (childrenMap.get(node.id) ?? [])
      .map(id => nodeMap.get(id))
      .filter((n): n is VaultNode => n !== undefined)
  )

  // Compute layout with angular range [0, 2π], radius normalized to 1
  const tree = d3.tree<VaultNode>()
    .size([2 * Math.PI, 1])
    .separation((a, b) => (a.parent === b.parent ? 1 : 2) / Math.max(1, a.depth))

  const root = tree(hierarchy)

  // Override radius to fixed ring spacing per depth level
  root.each(d => { d.y = d.depth * RING_SPACING })

  // Convert polar (angle=d.x, radius=d.y) to cartesian
  // Using d3's convention: x = r*cos(angle), y = r*sin(angle)
  const positioned: PositionedNode[] = root.descendants().map(d => {
    const dims = NODE_DIMS[d.data.type]
    return {
      id: d.data.id,
      x: d.y * Math.cos(d.x),
      y: d.y * Math.sin(d.x),
      width: dims.width,
      height: dims.height,
      data: d.data,
    }
  })

  // Hierarchy edges: bezier curves between cartesian node positions
  const posMap = new Map(positioned.map(n => [n.id, n]))

  const hierarchyEdges: EdgePath[] = root.links().map(link => {
    const src = posMap.get(link.source.data.id)!
    const tgt = posMap.get(link.target.data.id)!
    // Control point pulled toward origin for a gentle radial curve
    const cpx = (src.x + tgt.x) / 2 * 0.5
    const cpy = (src.y + tgt.y) / 2 * 0.5
    return {
      id: `h-${link.source.data.id}-${link.target.data.id}`,
      d: `M ${src.x} ${src.y} Q ${cpx} ${cpy} ${tgt.x} ${tgt.y}`,
      type: 'hierarchy' as const,
    }
  })

  // Related edges: straight dashed lines between cartesian node positions
  const seen = new Set<string>()
  const relatedEdges: EdgePath[] = []

  for (const node of vaultNodes) {
    const src = posMap.get(node.id)
    if (!src) continue

    for (const relId of node.related) {
      const [a, b] = [node.id, relId].sort()
      const key = `${a}-${b}`
      if (seen.has(key)) continue
      seen.add(key)

      const tgt = posMap.get(relId)
      if (!tgt) continue

      relatedEdges.push({
        id: `r-${a}-${b}`,
        d: `M ${src.x} ${src.y} L ${tgt.x} ${tgt.y}`,
        type: 'related' as const,
        color: vaultColor + '88',
      })
    }
  }

  return { positioned, hierarchyEdges, relatedEdges }
}

export function useRadialLayout(vaultNodes: VaultNode[], vaultColor: string): RadialLayout {
  return useMemo(
    () => computeRadialLayout(vaultNodes, vaultColor),
    [vaultNodes, vaultColor]
  )
}
