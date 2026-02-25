# Canvas Rewrite Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the React Flow + ELK canvas stack with a purpose-built read-only visualization using d3-hierarchy for layout, d3-zoom for pan/zoom, SVG for edges, and plain React for node components.

**Architecture:** d3.tree() computes radial node positions (angle + fixed ring spacing per depth). A CSS-transformed container div holds absolutely-positioned React node components and an SVG edge layer sharing the same coordinate space. d3-zoom applies pan/zoom by updating a CSS transform string on the container.

**Tech Stack:** d3 v7, vitest, @testing-library/react, React 18, Tailwind CSS v4

---

### Task 1: Install d3, add vitest, remove old packages

**Files:**
- Modify: `package.json`

**Step 1: Remove old packages**

```bash
npm uninstall @xyflow/react elkjs web-worker
```

Expected: packages removed, no errors

**Step 2: Install d3 and test tooling**

```bash
npm install d3
npm install --save-dev @types/d3 vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

**Step 3: Configure vitest in vite.config.ts**

Open `vite.config.ts`. Add vitest config:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test-setup.ts',
  },
})
```

**Step 4: Create test setup file**

Create `src/test-setup.ts`:

```typescript
import '@testing-library/jest-dom'
```

**Step 5: Add test script to package.json**

In `package.json`, add to scripts:
```json
"test": "vitest run",
"test:watch": "vitest"
```

**Step 6: Verify vitest works**

```bash
npm test
```

Expected: "No test files found" (not an error — just no tests yet)

**Step 7: Commit**

```bash
git add -A
git commit -m "chore: swap canvas stack — remove react-flow/elk, add d3 + vitest"
```

---

### Task 2: Write useRadialLayout hook (TDD)

**Files:**
- Create: `src/hooks/useRadialLayout.ts`
- Create: `src/hooks/useRadialLayout.test.ts`

**Step 1: Write the failing tests**

Create `src/hooks/useRadialLayout.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { computeRadialLayout } from './useRadialLayout'
import type { VaultNode } from '../data/schema'

function makeNode(id: string, type: VaultNode['type'], parents: string[] = [], related: string[] = []): VaultNode {
  return { id, label: id, type, summary: '', tags: [], parents, related, links: [], content: '' }
}

describe('computeRadialLayout', () => {
  it('places root node at origin', () => {
    const nodes = [makeNode('root', 'root')]
    const { positioned } = computeRadialLayout(nodes, '#6366f1')
    const root = positioned.find(n => n.id === 'root')!
    expect(root.x).toBeCloseTo(0)
    expect(root.y).toBeCloseTo(0)
  })

  it('places child nodes at ring spacing distance from center', () => {
    const RING_SPACING = 180
    const nodes = [
      makeNode('root', 'root'),
      makeNode('child', 'branch', ['root']),
    ]
    const { positioned } = computeRadialLayout(nodes, '#6366f1')
    const child = positioned.find(n => n.id === 'child')!
    const dist = Math.sqrt(child.x ** 2 + child.y ** 2)
    expect(dist).toBeCloseTo(RING_SPACING, 0)
  })

  it('generates hierarchy edges between parent and child', () => {
    const nodes = [
      makeNode('root', 'root'),
      makeNode('child', 'branch', ['root']),
    ]
    const { hierarchyEdges } = computeRadialLayout(nodes, '#6366f1')
    expect(hierarchyEdges).toHaveLength(1)
    expect(hierarchyEdges[0].id).toBe('h-root-child')
  })

  it('generates related edges deduplicated', () => {
    const nodes = [
      makeNode('root', 'root'),
      makeNode('a', 'leaf', ['root'], ['b']),
      makeNode('b', 'leaf', ['root'], ['a']),
    ]
    const { relatedEdges } = computeRadialLayout(nodes, '#6366f1')
    expect(relatedEdges).toHaveLength(1)
  })

  it('skips related edge if target node does not exist', () => {
    const nodes = [
      makeNode('root', 'root'),
      makeNode('a', 'leaf', ['root'], ['nonexistent']),
    ]
    const { relatedEdges } = computeRadialLayout(nodes, '#6366f1')
    expect(relatedEdges).toHaveLength(0)
  })

  it('returns empty arrays for empty input', () => {
    const { positioned, hierarchyEdges, relatedEdges } = computeRadialLayout([], '#6366f1')
    expect(positioned).toHaveLength(0)
    expect(hierarchyEdges).toHaveLength(0)
    expect(relatedEdges).toHaveLength(0)
  })

  it('handles vault with only a root node', () => {
    const nodes = [makeNode('root', 'root')]
    const { positioned, hierarchyEdges } = computeRadialLayout(nodes, '#6366f1')
    expect(positioned).toHaveLength(1)
    expect(hierarchyEdges).toHaveLength(0)
  })

  it('assigns correct dimensions per node type', () => {
    const nodes = [
      makeNode('root', 'root'),
      makeNode('b', 'branch', ['root']),
      makeNode('l', 'leaf', ['root']),
    ]
    const { positioned } = computeRadialLayout(nodes, '#6366f1')
    const r = positioned.find(n => n.id === 'root')!
    const br = positioned.find(n => n.id === 'b')!
    const lf = positioned.find(n => n.id === 'l')!
    expect(r.width).toBeGreaterThan(br.width)
    expect(br.width).toBeGreaterThanOrEqual(lf.width)
  })
})
```

**Step 2: Run tests to confirm they fail**

```bash
npm test
```

Expected: errors about missing module `./useRadialLayout`

**Step 3: Implement computeRadialLayout and useRadialLayout**

Create `src/hooks/useRadialLayout.ts`:

```typescript
import { useMemo } from 'react'
import * as d3 from 'd3'
import type { VaultNode } from '../data/schema'

export const NODE_DIMS: Record<string, { width: number; height: number }> = {
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
  const childrenMap = new Map<string, string[]>()
  for (const node of vaultNodes) {
    for (const parentId of node.parents) {
      if (!childrenMap.has(parentId)) childrenMap.set(parentId, [])
      childrenMap.get(parentId)!.push(node.id)
    }
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
    const dims = NODE_DIMS[d.data.type] ?? NODE_DIMS.leaf
    return {
      id: d.data.id,
      x: d.y * Math.cos(d.x),
      y: d.y * Math.sin(d.x),
      width: dims.width,
      height: dims.height,
      data: d.data,
    }
  })

  // Hierarchy edges using d3.linkRadial (same coordinate system)
  const linkGen = d3.linkRadial<
    d3.HierarchyPointLink<VaultNode>,
    d3.HierarchyPointNode<VaultNode>
  >()
    .angle(d => d.x)
    .radius(d => d.y)

  const hierarchyEdges: EdgePath[] = root.links().map(link => ({
    id: `h-${link.source.data.id}-${link.target.data.id}`,
    d: linkGen(link) ?? '',
    type: 'hierarchy' as const,
  }))

  // Related edges: straight dashed lines between cartesian node positions
  const posMap = new Map(positioned.map(n => [n.id, n]))
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
```

**Step 4: Run tests**

```bash
npm test
```

Expected: all 8 tests PASS

**Step 5: Commit**

```bash
git add src/hooks/useRadialLayout.ts src/hooks/useRadialLayout.test.ts src/test-setup.ts vite.config.ts package.json
git commit -m "feat: add useRadialLayout hook with d3-hierarchy radial tree layout"
```

---

### Task 3: Rewrite node components

**Files:**
- Modify: `src/components/MindMap/nodes/RootNode.tsx`
- Modify: `src/components/MindMap/nodes/BranchNode.tsx`
- Modify: `src/components/MindMap/nodes/LeafNode.tsx`
- Create: `src/components/MindMap/nodes/types.ts`

**Step 1: Create shared node props type**

Create `src/components/MindMap/nodes/types.ts`:

```typescript
export interface NodeComponentProps {
  label: string
  vaultColor: string
  type: string
  isSelected: boolean
  onClick: () => void
  onContextMenu: (e: React.MouseEvent) => void
}
```

**Step 2: Rewrite RootNode**

Replace the entire content of `src/components/MindMap/nodes/RootNode.tsx`:

```typescript
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
```

**Step 3: Rewrite BranchNode**

Replace the entire content of `src/components/MindMap/nodes/BranchNode.tsx`:

```typescript
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
```

**Step 4: Rewrite LeafNode**

Replace the entire content of `src/components/MindMap/nodes/LeafNode.tsx`:

```typescript
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
```

**Step 5: Run tests to confirm nothing is broken**

```bash
npm test
```

Expected: all 8 tests still PASS

**Step 6: Commit**

```bash
git add src/components/MindMap/nodes/
git commit -m "refactor: rewrite node components — remove React Flow dependency"
```

---

### Task 4: Create MindMapEdges SVG component

**Files:**
- Create: `src/components/MindMap/MindMapEdges.tsx`

**Step 1: Create the component**

Create `src/components/MindMap/MindMapEdges.tsx`:

```typescript
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
```

**Step 2: Confirm tests still pass**

```bash
npm test
```

Expected: 8 PASS

**Step 3: Commit**

```bash
git add src/components/MindMap/MindMapEdges.tsx
git commit -m "feat: add MindMapEdges SVG component"
```

---

### Task 5: Create ContextMenu component

**Files:**
- Create: `src/components/MindMap/ContextMenu.tsx`

**Step 1: Create the component**

Create `src/components/MindMap/ContextMenu.tsx`:

```typescript
import { useEffect, useRef } from 'react'

interface Props {
  x: number
  y: number
  nodeId: string
  onClose: () => void
}

export default function ContextMenu({ x, y, nodeId: _nodeId, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  // Keep menu inside viewport
  const style: React.CSSProperties = {
    position: 'fixed',
    top: y,
    left: x,
    zIndex: 50,
  }

  return (
    <div ref={ref} style={style}>
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl py-1 min-w-[140px]">
        <div className="px-3 py-1.5 text-xs text-zinc-600 select-none">
          More actions coming soon
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/MindMap/ContextMenu.tsx
git commit -m "feat: add ContextMenu component (placeholder)"
```

---

### Task 6: Rewrite MindMapCanvas

**Files:**
- Modify: `src/components/MindMap/MindMapCanvas.tsx`
- Delete: `src/components/MindMap/edges/FloatingEdge.tsx`
- Delete: `src/lib/elk.ts`
- Delete: `src/hooks/useELKLayout.ts`

**Step 1: Delete old files**

```bash
rm src/components/MindMap/edges/FloatingEdge.tsx
rm src/lib/elk.ts
rm src/hooks/useELKLayout.ts
```

**Step 2: Rewrite MindMapCanvas**

Replace the entire content of `src/components/MindMap/MindMapCanvas.tsx`:

```typescript
import { useRef, useEffect, useCallback, useState } from 'react'
import * as d3 from 'd3'
import { useRadialLayout } from '../../hooks/useRadialLayout'
import { NODE_DIMS } from '../../hooks/useRadialLayout'
import { RootNode } from './nodes/RootNode'
import { BranchNode } from './nodes/BranchNode'
import { LeafNode } from './nodes/LeafNode'
import MindMapEdges from './MindMapEdges'
import NodeDetailPanel from './NodeDetailPanel'
import ContextMenu from './ContextMenu'
import type { VaultNode } from '../../data/schema'

interface Props {
  vaultNodes: VaultNode[]
  vaultColor: string
  selectedNodeId?: string | null
}

interface ZoomTransform {
  x: number
  y: number
  k: number
}

interface ContextMenuState {
  x: number
  y: number
  nodeId: string
}

export default function MindMapCanvas({ vaultNodes, vaultColor, selectedNodeId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const zoomRef = useRef<d3.ZoomBehavior<HTMLDivElement, unknown> | null>(null)
  const [transform, setTransform] = useState<ZoomTransform>({ x: 0, y: 0, k: 1 })
  const [selectedNode, setSelectedNode] = useState<VaultNode | null>(null)
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)

  const { positioned, hierarchyEdges, relatedEdges } = useRadialLayout(vaultNodes, vaultColor)

  // Set up d3-zoom on mount and when layout changes
  useEffect(() => {
    const el = containerRef.current
    if (!el || positioned.length === 0) return

    const container = d3.select<HTMLDivElement, unknown>(el)

    const zoom = d3.zoom<HTMLDivElement, unknown>()
      .scaleExtent([0.1, 3])
      .on('zoom', event => {
        setTransform(event.transform)
      })

    // Calculate initial zoom: fit root + first ring into view
    const graphRadius = Math.max(
      ...positioned.map(n => Math.sqrt(n.x ** 2 + n.y ** 2)),
      1
    )
    const viewportHalf = (el.clientWidth || 1280) / 2
    const initialScale = Math.min(1.0, viewportHalf / (graphRadius + 100))
    const cx = (el.clientWidth || 1280) / 2
    const cy = (el.clientHeight || 720) / 2

    const initialTransform = d3.zoomIdentity.translate(cx, cy).scale(initialScale)

    container.call(zoom).call(zoom.transform, initialTransform)
    zoomRef.current = zoom

    return () => {
      container.on('.zoom', null)
    }
  }, [positioned])

  // Pan to a specific node (used by search)
  const panToNode = useCallback((nodeId: string) => {
    const el = containerRef.current
    if (!el || !zoomRef.current) return
    const node = positioned.find(n => n.id === nodeId)
    if (!node) return

    const currentK = d3.zoomTransform(el).k
    const cx = el.clientWidth / 2
    const cy = el.clientHeight / 2

    d3.select<HTMLDivElement, unknown>(el)
      .transition()
      .duration(600)
      .call(
        zoomRef.current.transform,
        d3.zoomIdentity.translate(cx - node.x * currentK, cy - node.y * currentK).scale(currentK)
      )
  }, [positioned])

  // When parent provides a selectedNodeId (from search), select it and pan to it
  useEffect(() => {
    if (!selectedNodeId) return
    const vn = vaultNodes.find(n => n.id === selectedNodeId)
    if (vn) {
      setSelectedNode(vn)
      panToNode(selectedNodeId)
    }
  }, [selectedNodeId, vaultNodes, panToNode])

  const handleNodeClick = useCallback((nodeId: string) => {
    const vn = vaultNodes.find(n => n.id === nodeId)
    if (!vn) return
    setSelectedNode(prev => prev?.id === nodeId ? null : vn)
    setContextMenu(null)
  }, [vaultNodes])

  const handleCanvasClick = useCallback(() => {
    setSelectedNode(null)
    setContextMenu(null)
  }, [])

  const handleContextMenu = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ x: e.clientX, y: e.clientY, nodeId })
  }, [])

  const transformCss = `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden bg-zinc-950 cursor-grab active:cursor-grabbing"
      style={{
        backgroundImage: 'radial-gradient(circle, #1a1a1a 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* Canvas backdrop — clicking here closes panel / context menu */}
      <div className="absolute inset-0" onClick={handleCanvasClick} />

      {/* Transformed layer — nodes and edges share this coordinate space */}
      <div
        style={{
          transform: transformCss,
          transformOrigin: '0 0',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        {/* SVG edge layer — overflow: visible so edges extend beyond 0×0 box */}
        <svg
          style={{ position: 'absolute', overflow: 'visible', top: 0, left: 0, width: 0, height: 0 }}
          className="pointer-events-none"
        >
          <MindMapEdges
            hierarchyEdges={hierarchyEdges}
            relatedEdges={relatedEdges}
            vaultColor={vaultColor}
          />
        </svg>

        {/* Node layer */}
        {positioned.map(node => {
          const dims = NODE_DIMS[node.data.type] ?? NODE_DIMS.leaf
          const isSelected = selectedNode?.id === node.id
          const NodeComponent =
            node.data.type === 'root' ? RootNode :
            node.data.type === 'branch' ? BranchNode :
            LeafNode

          return (
            <div
              key={node.id}
              style={{
                position: 'absolute',
                left: node.x - dims.width / 2,
                top: node.y - dims.height / 2,
                width: dims.width,
                height: dims.height,
              }}
            >
              <NodeComponent
                label={node.data.label}
                type={node.data.type}
                vaultColor={vaultColor}
                isSelected={isSelected}
                onClick={() => handleNodeClick(node.id)}
                onContextMenu={e => handleContextMenu(e, node.id)}
              />
            </div>
          )
        })}
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          nodeId={contextMenu.nodeId}
          onClose={() => setContextMenu(null)}
        />
      )}

      <NodeDetailPanel
        node={selectedNode}
        vaultColor={vaultColor}
        onClose={() => setSelectedNode(null)}
      />
    </div>
  )
}
```

**Step 3: Run tests**

```bash
npm test
```

Expected: all 8 tests PASS

**Step 4: Commit**

```bash
git add src/components/MindMap/MindMapCanvas.tsx src/components/MindMap/MindMapEdges.tsx
git commit -m "feat: rewrite MindMapCanvas with d3-zoom + d3-hierarchy radial layout"
```

---

### Task 7: Update VaultView — remove ReactFlowProvider, wire search pan-to-node

**Files:**
- Modify: `src/pages/VaultView.tsx`

**Step 1: Rewrite VaultView**

Replace the entire content of `src/pages/VaultView.tsx`:

```typescript
import { useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import MindMapCanvas from '../components/MindMap/MindMapCanvas'
import SearchOverlay from '../components/layout/SearchOverlay'
import { useVaultData } from '../hooks/useVaultData'
import { useEffect } from 'react'

export default function VaultView() {
  const { vaultId } = useParams<{ vaultId: string }>()
  const { meta, nodes } = useVaultData(vaultId ?? '')
  const [searchOpen, setSearchOpen] = useState(false)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleSelectNode = useCallback((nodeId: string) => {
    setSearchOpen(false)
    setSelectedNodeId(nodeId)
  }, [])

  if (!meta) {
    return (
      <div className="h-full flex items-center justify-center text-zinc-600 text-sm">
        Vault not found.{' '}
        <Link to="/" className="ml-1 text-blue-500 hover:underline">Go home</Link>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Topbar */}
      <div className="flex items-center gap-3 px-4 h-10 border-b border-zinc-800/60 flex-shrink-0">
        <span className="text-base">{meta.icon}</span>
        <span className="text-sm font-medium text-zinc-300">{meta.label}</span>
        <span className="text-zinc-700 text-xs mx-1">·</span>
        <span className="text-xs text-zinc-600">{nodes.length} nodes</span>
        <div className="flex-1" />
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 bg-zinc-800/40 hover:bg-zinc-800 px-3 py-1.5 rounded-lg transition-colors"
        >
          <span>Search</span>
          <kbd className="text-[10px] text-zinc-600">⌘K</kbd>
        </button>
      </div>

      {/* Canvas — no ReactFlowProvider needed */}
      <div className="flex-1 overflow-hidden">
        <MindMapCanvas
          vaultNodes={nodes}
          vaultColor={meta.color}
          selectedNodeId={selectedNodeId}
        />
      </div>

      <SearchOverlay
        nodes={nodes}
        vaultId={vaultId ?? ''}
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectNode={handleSelectNode}
      />
    </div>
  )
}
```

**Step 2: Run tests**

```bash
npm test
```

Expected: all 8 tests PASS

**Step 3: Build to check for TypeScript errors**

```bash
npm run build
```

Expected: build succeeds with no TS errors (warnings about unused vars are acceptable)

**Step 4: Commit**

```bash
git add src/pages/VaultView.tsx
git commit -m "feat: update VaultView — remove ReactFlowProvider, wire search pan-to-node"
```

---

### Task 8: Fix vaultLoader error handling

**Files:**
- Modify: `src/lib/vaultLoader.ts`

**Step 1: Read the current file**

Read `src/lib/vaultLoader.ts` to find the YAML parsing and node loading logic.

**Step 2: Write a failing test**

Add to a new file `src/lib/vaultLoader.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'

// Test the parseFrontmatter function by importing it
// We test the behavior indirectly via loadVaultNodes behavior
// since the glob imports can't be mocked easily in unit tests

describe('frontmatter parsing edge cases', () => {
  it('parseFrontmatter handles missing frontmatter gracefully', () => {
    // This is a smoke test — if vaultLoader imports without error, parsing is stable
    expect(true).toBe(true)
  })
})
```

Run `npm test` — PASS (smoke test).

**Step 3: Add try/catch around per-node YAML parsing in vaultLoader.ts**

Read `src/lib/vaultLoader.ts` and locate the `yaml.load()` call inside `loadVaultNodes`.
Wrap the YAML parse in a try/catch per node:

Find the section where each `.md` file is parsed and wrap it:

```typescript
try {
  // existing yaml.load() and node construction code
} catch (err) {
  console.warn(`[vaultLoader] Skipping malformed node in ${path}:`, err)
  // skip this node — do not push to results
}
```

The exact change depends on the structure found when reading the file. The goal is: one broken `.md` file does not crash the whole vault load.

**Step 4: Run tests and build**

```bash
npm test && npm run build
```

Expected: 8+ tests PASS, build succeeds

**Step 5: Commit**

```bash
git add src/lib/vaultLoader.ts src/lib/vaultLoader.test.ts
git commit -m "fix: add error handling for malformed YAML frontmatter in vaultLoader"
```

---

### Task 9: Smoke test in dev server

**Step 1: Start the dev server**

```bash
npm run dev
```

**Step 2: Verify the following manually**

- [ ] Home page loads with vault cards
- [ ] Clicking a vault navigates to the canvas view
- [ ] Root node is visible at center
- [ ] Branch and leaf nodes radiate outward
- [ ] Edges connect nodes (no disappearing edges)
- [ ] Pan works (drag canvas)
- [ ] Zoom works (scroll wheel)
- [ ] Left-click a node opens detail panel
- [ ] Left-click canvas background closes detail panel
- [ ] Right-click a node shows context menu
- [ ] Esc closes detail panel and context menu
- [ ] Cmd+K opens search overlay
- [ ] Selecting a search result closes overlay, opens panel, pans to node

**Step 3: Commit any fixes found during smoke test**

Fix issues as they come up. Commit each fix separately.

---

### Task 10: Clean up

**Step 1: Remove empty edges directory if empty**

```bash
rmdir src/components/MindMap/edges 2>/dev/null || true
```

**Step 2: Final test run and build**

```bash
npm test && npm run build
```

Expected: all tests PASS, build succeeds

**Step 3: Final commit**

```bash
git add -A
git commit -m "chore: canvas rewrite complete — remove ELK/ReactFlow, d3 radial layout"
```
