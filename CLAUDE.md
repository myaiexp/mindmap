# Mind Map Vault — Claude Code Instructions

Personal knowledge mind map web app. Mind map content lives as Markdown files in
`src/data/vaults/`. Claude Code is the primary content author. The app reads these
files at build time and renders them as an interactive radial graph.

## Stack

React 18, TypeScript, Vite, Tailwind CSS 4, d3 (radial tree layout + zoom/pan),
react-markdown, fuse.js (search), react-router-dom. Tests: Vitest + Testing Library.

## Project Structure

```
src/
  App.tsx                     ← Router setup
  pages/
    Home.tsx                  ← Vault selection
    VaultView.tsx             ← Vault mind map view
  components/
    layout/                   ← AppShell, Sidebar, SearchOverlay
    MindMap/
      MindMapCanvas.tsx       ← d3-zoom SVG canvas
      MindMapEdges.tsx        ← Bezier path edges
      ContextMenu.tsx         ← Right-click context menu
      NodeDetailPanel.tsx     ← Expanded node detail panel
      nodes/                  ← BranchNode, LeafNode, RootNode components
  hooks/
    useRadialLayout.ts        ← d3-hierarchy radial tree layout
    useSearch.ts              ← Fuse.js search
    useVaultData.ts           ← Vault data loading
  lib/
    vaultLoader.ts            ← Parses vault YAML/MD files
  data/
    schema.ts                 ← TypeScript types (VaultNode, VaultMeta, VaultIndex)
    vaults/
      index.yml               ← Registry of all vaults
      <vault-id>/
        _vault.yml            ← Vault metadata (label, color, icon, root node)
        <node-id>.md          ← One file per node (YAML frontmatter + Markdown body)
docs/plans/                   ← Archived design docs (canvas rewrite)
```

---

## Adding a Node to an Existing Vault

1. Create a new file: `src/data/vaults/<vault-id>/<node-id>.md`
2. Add YAML frontmatter between `---` delimiters
3. Write Markdown content below the second `---`
4. Connect it by adding its `id` to the `parents` or `related` list of an existing node
   (or add the existing node's id to this node's `parents` field)

**Minimal example:**

```markdown
---
id: event-loop
label: Event Loop
type: leaf
summary: JavaScript's concurrency model based on a message queue
tags: [concept, async]
parents: [javascript]
related: [callbacks, promises]
links: []
---

# Event Loop

The event loop allows JavaScript to perform non-blocking operations despite
being single-threaded, by offloading operations to the system kernel.
```

---

## Creating a New Vault

1. Create directory: `src/data/vaults/<vault-id>/`
2. Create `_vault.yml` with vault metadata
3. Create the root node as `<vault-id>.md` with `type: root` and no `parents`
4. Add the vault to `src/data/vaults/index.yml`

**`_vault.yml` example:**

```yaml
id: mathematics
label: Mathematics
description: Pure and applied math concepts
icon: "∑"
color: "#f59e0b"
root: mathematics
created: 2026-02-21
```

**Root node example (`mathematics.md`):**

```markdown
---
id: mathematics
label: Mathematics
type: root
summary: The abstract science of number, quantity, and space
tags: [meta]
parents: []
related: []
links: []
---

# Mathematics

An overview of the mathematics vault...
```

**`index.yml` entry to add:**

```yaml
  - id: mathematics
    label: Mathematics
    icon: "∑"
    color: "#f59e0b"
```

---

## Node ID Conventions

- Lowercase kebab-case only: `machine-learning`, `gradient-descent`, `event-loop`
- Must be unique within the vault
- Must match the filename: `event-loop.md` → `id: event-loop`
- Descriptive and specific: prefer `closures` over `js-concept-1`

---

## Node Types

| Type       | Use for                                                            |
| ---------- | ------------------------------------------------------------------ |
| `root`     | The single central concept of the vault — one per vault            |
| `branch`   | A major topic area with multiple sub-concepts                      |
| `leaf`     | A specific concept, technique, or detail                           |
| `resource` | An external reference or link (minimal content, primarily `links`) |
| `note`     | A personal observation or annotation                               |

---

## Content Guidelines

- **`summary`**: 1–2 sentences, plain text, no Markdown. Shown on search results and node hover.
- **`content` (Markdown body)**: Condensed and factual. This is a knowledge map, not a wiki.
  Use headers, bullet lists, bold for key terms, and code blocks where relevant.
  Aim for depth over length — a well-organized 10-line entry beats a 200-line wall of text.
- **`tags`**: Use existing tags when possible. Check other files in the vault for tag conventions.
- **`parents`**: The node(s) this one hangs from in the tree hierarchy. Usually just one parent.
- **`related`**: Cross-connections to conceptually adjacent nodes. These render as dashed edges
  and don't affect the tree layout.
- **`links`**: Full URLs only. Include only high-quality references (MDN, official docs, papers).

---

## Commands

| Command          | Purpose              |
| ---------------- | -------------------- |
| `npm run dev`    | Dev server (Vite)    |
| `npm run build`  | Type-check + build   |
| `npm run test`   | Run tests (Vitest)   |
| `npm run lint`   | ESLint               |

## Workflow Tips

- Hot reload is active during `npm run dev` — saving a file updates the graph immediately
- When expanding a topic, prefer adding `leaf` nodes under an existing `branch` over making
  everything a top-level branch
- Cross-vault connections are not supported yet — keep nodes scoped to their vault
