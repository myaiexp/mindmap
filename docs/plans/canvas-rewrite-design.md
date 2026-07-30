# Mindmap Canvas Rewrite Design

**Date:** 2026-02-25
**Status:** Approved

---

## Problem

The current canvas implementation is a repurposed top-down hierarchical mindmap converted to radial layout without a proper rethink. The tech stack (React Flow + ELK + custom FloatingEdge) is fighting against the actual use case:

- React Flow is designed for interactive node editors — this app is read-only (AI populates content)
- ELK radial layout + FloatingEdge is a fragile combination with hand-rolled intersection math
- Clicking a branch node simultaneously collapses it AND opens the detail panel (dual-purpose bug)
- Edges disappear when collapse pushes nodes outside the viewport (React Flow culls long edges)
- Fit-to-view uses a hardcoded 50ms timeout that fails unpredictably

---

## Approach

Replace the canvas layer with a purpose-built read-only visualization stack:

- **d3-hierarchy** for radial tree layout math (node positions)
- **d3-zoom** for pan/zoom on the container
- **CSS-transformed div layer** for React node components (absolute positioned)
- **SVG layer** (same transform, behind nodes) for all edges

React owns rendering, D3 owns math. No graph editing framework.

---

## What Changes

**Removed entirely:**
- `@xyflow/react` and all React Flow packages
- `elkjs` and `elk.ts`
- `useELKLayout.ts`
- `edges/FloatingEdge.tsx`

**Rewritten:**
- `MindMapCanvas.tsx` — new canvas with d3-zoom + SVG edge layer + positioned node divs
- `useRadialLayout.ts` — replaces `useELKLayout.ts`, uses d3-hierarchy + d3-tree radial projection

**Unchanged:**
- `vaultLoader.ts`, `useVaultData.ts`, `useSearch.ts`
- `nodes/RootNode.tsx`, `nodes/BranchNode.tsx`, `nodes/LeafNode.tsx`
- `NodeDetailPanel.tsx`
- `SearchOverlay.tsx`
- `Sidebar.tsx`, `AppShell.tsx`
- All vault data files

---

## Architecture

### Rendering Layers

```
<div container>          ← d3-zoom applied here
  <svg>                  ← edge layer (hierarchy + related edges), same transform
  <div node-layer>       ← absolute positioned React node components
```

### Layout (useRadialLayout.ts)

- `d3.tree()` with radial projection
- Input: flat vault nodes array
- Output: positioned nodes `{ id, x, y, data }` + edges `{ source, target, type, pathData }`
- Node separation increases with depth to prevent outer ring crowding
- Synchronous (no async race conditions like ELK)

### Edges (SVG)

- **Hierarchy edges:** smooth bezier curves via `d3.linkRadial()` — naturally follows radial geometry
- **Cross-reference edges:** dashed bezier curves in vault accent color, between cartesian positions of the two nodes
- All edges rendered behind node layer — nodes always on top
- No viewport culling — SVG edges share the same coordinate space as nodes

---

## Interactions

### Click Behavior

- **Left click any node** → opens detail panel for that node
- **Left click same node or canvas background** → closes detail panel
- **Right click any node** → custom context menu (native right-click suppressed). Minimal for now — placeholder for future actions (collapse subtree, copy link, etc.). Closes on click outside or Escape.

### No Collapse by Default

Collapse/expand is not a primary interaction. The graph renders fully. Collapse may be added later via the right-click context menu. Vault size is managed by adding/removing content, not hiding nodes.

### Detail Panel

Unchanged from current implementation — slides in from right, Escape closes it, shows node content via react-markdown.

### Search (pan-to-node fix)

Selecting a search result:
1. Closes the search overlay
2. Opens the detail panel for the selected node
3. Smoothly pans the canvas to center on that node

Currently a `// TODO` — this gets implemented in the rewrite.

---

## Initial Viewport

On vault load, the canvas centers on the root node with a zoom level calculated from node count rather than fitting everything:

```
zoom = min(1.0, targetRadius / graphRadius)
targetRadius = window.innerWidth / 2 (fallback: 640px for 1280px screens)
```

Small vaults: everything visible at comfortable zoom.
Large vaults: centered on root, branches visible, outer leaves require panning.

---

## Error Handling

- Malformed YAML frontmatter: try/catch per node, skip and log — vault loads with remaining nodes
- Missing `parents`/`related` references: filtered silently with console warning
- Empty vault (no nodes): single centered root node, no edges
- Loading state: small spinner while layout computes (synchronous, fast)

---

## Out of Scope

- Node creation/editing via UI (AI populates content via source files)
- Multi-vault cross-references
- Layout switching (tree/force/hierarchical) — future feature
- Export (PNG/Markdown) — future feature
- Tag filtering UI — future feature
- Supabase integration — future feature
