# Mind Map Vault App — Plan

> **Historical document — kept for context, not accurate.** The stack table below still
> specifies `@xyflow/react` and `elkjs`; both were removed in the 2026-02-25 canvas rewrite
> in favour of d3 (`docs/plans/canvas-rewrite-design.md`). The project itself is now an
> archived artifact — see the status banner in `CLAUDE.md`.

## Context

A personal knowledge mind map web app that acts as a "vault" of condensed, interconnected information across any topic. The key differentiator from Notion/Obsidian is the visual graph representation with layered, expandable nodes rather than long-form writing.

**AI integration approach:** Claude Code in VS Code acts as the content writer by understanding the app's data schema and creating/editing structured Markdown files directly. No API costs — the AI part is the dev workflow itself.

**Design philosophy:** Auto-layout, auto-arrangement, out of the box — the user never manually positions nodes or manages layout. The app handles all visual organization.

---

## Tech Stack

| Concern             | Choice                                       | Reason                                                                            |
| ------------------- | -------------------------------------------- | --------------------------------------------------------------------------------- |
| Framework           | React + Vite + TypeScript                    | Solid ecosystem, great for interactive UIs                                        |
| Mind map renderer   | `@xyflow/react` (React Flow v12)             | Best-in-class node-based UI, custom nodes, minimap, extensible                    |
| Auto-layout         | `elkjs`                                      | Radial algorithm — root at center, branches radiate outward                       |
| Styling             | Tailwind CSS v4                              | Utility-first, excellent dark theme support                                       |
| Markdown rendering  | `react-markdown` + `@tailwindcss/typography` | Node detail panels with rich content                                              |
| Frontmatter parsing | `js-yaml` + custom parser                    | Browser-safe YAML frontmatter parsing (gray-matter removed — uses Node.js Buffer) |
| Search              | `fuse.js`                                    | Fuzzy search across all vault nodes                                               |
| Routing             | `react-router-dom` v7                        | SPA routing for home / vault / node views                                         |
| Package manager     | npm                                          | User preference                                                                   |
| Database            | Supabase (later phases)                      | Bookmarks, annotations, reading history                                           |
| Content storage     | `.md` files in `src/data/vaults/`            | Version-controlled, Claude Code editable, token-efficient                         |

---

## Data Architecture

### Why Markdown + YAML Frontmatter

Each node is a `.md` file with YAML frontmatter for metadata and a Markdown body for content. Advantages over JSON:

- **Token-efficient**: no string escaping, no backslash newlines, no quote overhead
- **Searchable by filename**: `closures.md`, `javascript.md` — browseable, greppable
- **Edges embedded**: `parents` and `related` fields in frontmatter — no separate edges file
- **Natural for Claude Code**: create a file per topic, plain text editing
- **Vite native**: `import.meta.glob('**/*.md', { as: 'raw' })` — no plugins needed

### File Layout

```
src/data/
  vaults/
    index.yml                 ← Registry of all vaults
    programming/
      _vault.yml              ← Vault metadata (label, color, root node ID)
      programming.md          ← Root node
      javascript.md           ← Branch node
      closures.md             ← Leaf node
    science/
      _vault.yml
      science.md
      ...
```

### Node File Schema (`.md`)

````markdown
---
id: closures
label: Closures
type: leaf
summary: Functions that capture variables from their surrounding lexical scope
tags: [concept, javascript]
parents: [javascript]
related: [scope, higher-order-functions]
links: []
---

# Closures

A **closure** is a function that retains access to its enclosing scope even after
the outer function has finished executing.

## Key Points

- Created every time a function is defined
- Enables data encapsulation and private variables
- Common in callbacks, event handlers, and module patterns

## Example

```js
function counter() {
  let count = 0;
  return () => ++count;
}
````

````

**Node types:**
- `root` — Central concept of the vault (one per vault)
- `branch` — Major topic area
- `leaf` — Specific concept, detail, or subtopic
- `resource` — External link or reference
- `note` — Personal annotation

**Frontmatter fields:**
- `id` — Unique within vault, matches filename (kebab-case)
- `label` — Display name on the canvas
- `type` — `root | branch | leaf | resource | note`
- `summary` — 1-2 sentence plain text description (shown on node hover / search results)
- `tags` — Array of strings for filtering
- `parents` — Array of node IDs this node connects to as a child (determines tree hierarchy)
- `related` — Array of node IDs for cross-connections (rendered as dashed edges, don't affect layout)
- `links` — Array of URLs (shown in detail panel)

### Vault Metadata (`_vault.yml`)

```yaml
id: programming
label: Programming
description: Languages, paradigms, tools, and concepts
icon: "💻"
color: "#6366f1"
root: programming
created: 2026-02-21
````

### Vault Registry (`index.yml`)

```yaml
vaults:
  - id: programming
    label: Programming
    icon: "💻"
    color: "#6366f1"
  - id: science
    label: Science
    icon: "🔬"
    color: "#10b981"
```

---

## Project Structure

```
mindmap/
├── src/
│   ├── components/
│   │   ├── MindMap/
│   │   │   ├── MindMapCanvas.tsx       ← React Flow canvas + ELK layout
│   │   │   ├── nodes/
│   │   │   │   ├── RootNode.tsx        ← Styled root node component
│   │   │   │   ├── BranchNode.tsx      ← Styled branch node component
│   │   │   │   └── LeafNode.tsx        ← Styled leaf node component
│   │   │   ├── edges/
│   │   │   │   └── FloatingEdge.tsx    ← Floating bezier edge (border-intersection, works radially)
│   │   │   └── NodeDetailPanel.tsx     ← Slide-in panel with markdown content
│   │   ├── layout/
│   │   │   ├── AppShell.tsx            ← Main layout wrapper
│   │   │   ├── Sidebar.tsx             ← Vault list + navigation
│   │   │   └── SearchOverlay.tsx       ← Full-screen fuzzy search (Cmd+K)
│   │   └── VaultCard.tsx              ← Card on home page
│   ├── hooks/
│   │   ├── useVaultData.ts            ← Load vault .md files, parse frontmatter, build graph
│   │   ├── useELKLayout.ts            ← Compute ELK positions, return positioned nodes
│   │   └── useSearch.ts               ← Fuse.js search across active vault
│   ├── data/
│   │   ├── vaults/
│   │   │   ├── index.yml
│   │   │   └── programming/           ← Seed vault with real example content
│   │   │       ├── _vault.yml
│   │   │       ├── programming.md
│   │   │       ├── javascript.md
│   │   │       └── ...
│   │   └── schema.ts                  ← TypeScript types for vault data
│   ├── lib/
│   │   ├── elk.ts                     ← ELK instance + layout computation
│   │   └── vaultLoader.ts             ← Parse .md files into graph data
│   ├── pages/
│   │   ├── Home.tsx                   ← Vault grid / selector
│   │   └── VaultView.tsx              ← Full mind map view
│   ├── App.tsx                        ← Router setup
│   ├── main.tsx
│   └── index.css                      ← Tailwind + React Flow CSS imports
├── PLAN.md
├── CLAUDE.md
├── MINDMAP_SCHEMA.md                  ← Schema reference for Claude Code content authoring
├── .gitignore
├── vite.config.ts
├── tailwind.config.ts
└── package.json
```

---

## Features

### Core Mind Map Canvas

- React Flow with ELK **Radial** layout — root at center, branches radiate outward in all directions
- Pan and zoom (mouse wheel / trackpad) — no manual node dragging needed
- Custom node components styled by type: `root` > `branch` > `leaf` (size + color hierarchy)
- **FloatingEdge** — bezier curves that connect at the nearest node border face, direction-aware
- Solid grey curves for `parent-child` hierarchy; dashed vault-color lines for `related` cross-edges
- Built-in React Flow `MiniMap` for orientation
- Fit-to-view on vault load

### Node Detail Panel

- Click any node → slide-in panel from right
- Shows: label, summary, full rendered Markdown content, tags, external links
- Panel can be pinned open while browsing the graph
- Keyboard: `Escape` to close

### Search (Cmd+K)

- Global search overlay triggered by Cmd+K / Ctrl+K
- Fuse.js fuzzy search across all nodes in current vault (label + summary + tags)
- Arrow keys to navigate results, Enter to focus the node on the canvas
- Optionally search across all vaults simultaneously

### Vault Switching

- Sidebar with vault list (icon, label, node count)
- Vaults lazy-loaded from `index.yml` → individual vault directories
- Smooth transition between vaults

### Expand / Collapse Subtrees

- Click any branch or root node to toggle collapse of its children
- Collapsed subtrees show a folded indicator on the node
- ELK layout recomputes after each toggle for clean re-arrangement

### Node Types & Visual Hierarchy

- `root`: Large, glowing accent ring, always in center
- `branch`: Medium, vault accent color, prominent label
- `leaf`: Compact, muted, details on hover
- `resource`: Icon + URL label, opens external link in new tab
- `note`: Italic text, subtle distinction from factual nodes

### Claude Code Content Authoring

- `MINDMAP_SCHEMA.md` — full schema reference with examples
- `CLAUDE.md` — project-level instructions: how to add nodes, create vaults, connect nodes
- Files are the single source of truth: create a `.md` file → hot reload shows it on the graph

### Future / Later

- **Supabase**: Bookmarks, annotations, reading history
- **Layout switching**: Toggle between tree, force-directed, hierarchical
- **Tag filtering**: Show only nodes matching selected tags
- **Breadcrumb trail**: Path from root to selected node
- **Node as full page**: `/vault/:id/node/:nodeId` for deep-link to a node's detail
- **Export**: Vault as PNG image or structured Markdown

---

## Visual Design

- **Background**: Dark, near-black (`#0a0a0a`) with subtle dot/grid pattern
- **Vault accent colors**: Each vault has a theme color; nodes inherit tints
- **Typography**: Inter or Geist for UI; monospace for code in detail panels
- **Edges**: Thin smooth bezier curves, subtle glow on hover
- **Nodes**: Rounded rectangles, glass-effect background, colored border by type
- **Detail panel**: Slide in from right, backdrop blur, pinnable

---

## Auto-Layout (ELK Radial)

```typescript
// src/lib/elk.ts
const graph = {
  id: 'root',
  layoutOptions: {
    'elk.algorithm': 'radial',
    'elk.radial.centerOnRoot': 'true',
    'elk.radial.radius': '150',        // px between concentric rings — increase if nodes overlap
    'elk.spacing.nodeNode': '20',
    'elk.radial.wedgeCriteria': 'NODE_SIZE',
  },
  children: nodes.map(n => ({ id: n.id, ...NODE_DIMS[n.type] })),
  // Only parent-child edges drive the layout hierarchy
  edges: parentEdges,
};
```

`related` edges are rendered by React Flow as dashed `straight` lines after layout without influencing positions.

### FloatingEdge

Hierarchy edges use a custom `FloatingEdge` component (`src/components/MindMap/edges/FloatingEdge.tsx`) that:

1. Reads absolute node positions via `useInternalNode()` from React Flow internals
2. Computes the border intersection point on each node (the face closest to the other node)
3. Draws a bezier curve between those two border points with direction-aware control handles

This is necessary because fixed Top/Bottom handles break in a radial layout where edges arrive from all directions.

---

## Key Dependencies

```
@xyflow/react        React Flow v12 — canvas + node system
elkjs                ELK layout algorithms (radial)
js-yaml              YAML parsing for .md frontmatter, _vault.yml, and index.yml
fuse.js              Fuzzy search
react-markdown       Markdown rendering in detail panel
react-router-dom     SPA routing
tailwindcss v4       Styling
@tailwindcss/typography  Prose styles for markdown panel
```

Note: `gray-matter` was removed — it depends on Node.js `Buffer` and crashes in the browser.
Frontmatter is parsed with a lightweight regex + `js-yaml` in `src/lib/vaultLoader.ts`.

---

## Verification

1. `npm run dev` → app opens at `localhost:5173`
2. Home page shows vault cards from `index.yml`
3. Opening a vault renders all `.md` nodes with ELK auto-layout (no overlapping)
4. Clicking a node opens the detail panel with rendered Markdown
5. Cmd+K search overlay finds nodes by name, summary, or tags
6. Collapsing a branch hides children and ELK recomputes cleanly
7. Adding a new `.md` file to a vault directory + hot reload shows the node on the graph
8. Multiple vaults switchable from sidebar
