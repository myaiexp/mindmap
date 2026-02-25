import ELK from 'elkjs/lib/elk.bundled.js'
import type { VaultNode } from '../data/schema'

const elk = new ELK()

const NODE_DIMS: Record<string, { width: number; height: number }> = {
  root:     { width: 160, height: 60 },
  branch:   { width: 140, height: 48 },
  leaf:     { width: 120, height: 40 },
  resource: { width: 130, height: 40 },
  note:     { width: 120, height: 40 },
}

export interface LayoutNode {
  id: string
  x: number
  y: number
  width: number
  height: number
}

export async function computeLayout(
  nodes: VaultNode[],
  collapsedIds: Set<string>
): Promise<LayoutNode[]> {
  // Build set of visible nodes (exclude descendants of collapsed nodes)
  const hiddenIds = new Set<string>()
  const idSet = new Set(nodes.map(n => n.id))

  function markHidden(parentId: string) {
    for (const node of nodes) {
      if (node.parents.includes(parentId) && !hiddenIds.has(node.id)) {
        hiddenIds.add(node.id)
        markHidden(node.id)
      }
    }
  }

  for (const id of collapsedIds) {
    markHidden(id)
  }

  const visibleNodes = nodes.filter(n => !hiddenIds.has(n.id))

  const graph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'radial',
      'elk.radial.centerOnRoot': 'true',
      'elk.radial.radius': '150',
      'elk.spacing.nodeNode': '20',
      'elk.radial.wedgeCriteria': 'NODE_SIZE',
    },
    children: visibleNodes.map(n => ({
      id: n.id,
      ...NODE_DIMS[n.type] ?? NODE_DIMS.leaf,
    })),
    edges: visibleNodes
      .flatMap(n =>
        n.parents
          .filter(p => idSet.has(p) && !hiddenIds.has(p))
          .map(p => ({ id: `${p}->${n.id}`, sources: [p], targets: [n.id] }))
      ),
  }

  const result = await elk.layout(graph)

  return (result.children ?? []).map(c => ({
    id: c.id,
    x: c.x ?? 0,
    y: c.y ?? 0,
    width: c.width ?? NODE_DIMS.leaf.width,
    height: c.height ?? NODE_DIMS.leaf.height,
  }))
}

export { NODE_DIMS }
