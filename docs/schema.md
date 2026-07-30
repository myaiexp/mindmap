# Mind Map Vault — Schema Reference

This file documents the data format for all vault content. It exists for Claude Code
to reference when adding or modifying mind map content.

---

## Directory Structure

```
src/data/vaults/
  index.yml                 ← Registry of all vaults
  <vault-id>/
    _vault.yml              ← Vault metadata
    <node-id>.md            ← One file per node
```

---

## `index.yml` — Vault Registry

Lists every vault the app will load. Add a new entry here when creating a new vault.

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

| Field   | Type                                              | Description                                                    |
| ------- | ------------------------------------------------- | -------------------------------------------------------------- |
| `id`    | string                                            | Kebab-case, matches the vault directory name                   |
| `label` | Display name shown in the sidebar and home screen |
| `icon`  | string                                            | Emoji or single character                                      |
| `color` | string                                            | Hex color — used as the vault's accent color throughout the UI |

---

## `_vault.yml` — Vault Metadata

One file per vault directory. Defines the vault's display properties and which node is the root.

```yaml
id: programming
label: Programming
description: Languages, paradigms, tools, and concepts
icon: "💻"
color: "#6366f1"
root: programming
created: 2026-02-21
```

| Field         | Type   | Description                                                     |
| ------------- | ------ | --------------------------------------------------------------- |
| `id`          | string | Must match the directory name and `index.yml` entry             |
| `label`       | string | Display name                                                    |
| `description` | string | Short description shown on the home screen vault card           |
| `icon`        | string | Emoji or single character                                       |
| `color`       | string | Hex color                                                       |
| `root`        | string | Node `id` of the central root node (usually same as vault `id`) |
| `created`     | string | ISO date `YYYY-MM-DD`                                           |

---

## Node Files (`.md`) — Full Schema

Each node is a single `.md` file. The filename must match the node's `id` field.

### Frontmatter Fields

```yaml
---
id: closures
label: Closures
type: leaf
summary: Functions that capture variables from their surrounding lexical scope
tags: [concept, javascript]
parents: [javascript]
related: [scope, higher-order-functions]
links:
  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures
---
```

| Field     | Type     | Required | Description                                                     |
| --------- | -------- | -------- | --------------------------------------------------------------- |
| `id`      | string   | yes      | Unique within vault, kebab-case, matches filename               |
| `label`   | string   | yes      | Display name on the canvas node                                 |
| `type`    | string   | yes      | See node types below                                            |
| `summary` | string   | yes      | 1–2 sentence plain-text description                             |
| `tags`    | string[] | no       | Array of lowercase strings for filtering                        |
| `parents` | string[] | no       | Node IDs this node is a child of (drives tree layout)           |
| `related` | string[] | no       | Node IDs for cross-connections (dashed edges, no layout effect) |
| `links`   | string[] | no       | Full URLs shown in the detail panel                             |

### Node Types

| Type       | Description                                                  | Visual                        |
| ---------- | ------------------------------------------------------------ | ----------------------------- |
| `root`     | Central concept of the vault. One per vault. No `parents`.   | Large, glowing, centered      |
| `branch`   | A major topic area with multiple children                    | Medium, accent-colored border |
| `leaf`     | A specific concept, detail, or technique                     | Small, compact                |
| `resource` | External reference. Primarily uses `links`, minimal content. | Icon + URL label              |
| `note`     | Personal annotation or observation                           | Italic, subtle style          |

### Markdown Body

Everything below the closing `---` is the node's full content, rendered as Markdown
in the detail panel. Supports all standard Markdown: headers, lists, bold, italic,
code blocks, blockquotes, and links.

````markdown
---
id: closures
label: Closures
type: leaf
summary: Functions that retain access to their enclosing scope after it has closed
tags: [concept]
parents: [javascript]
related: [scope, higher-order-functions, iife]
links:
  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures
---

# Closures

A **closure** is formed when a function is defined inside another function and
retains access to the outer function's variables even after the outer function returns.

## Key Properties

- Closures capture variables **by reference**, not by value
- Each closure instance has its own independent copy of closed-over variables
- The closed-over scope persists as long as the closure exists

## Common Uses

- **Data encapsulation** — create private state without classes
- **Partial application** — pre-fill arguments to a function
- **Event handlers** — retain context across async calls

## Example

```js
function makeCounter() {
  let count = 0;
  return {
    increment: () => ++count,
    value: () => count,
  };
}

const counter = makeCounter();
counter.increment(); // 1
counter.increment(); // 2
counter.value();     // 2
````

````

---

## Edge Semantics

Edges are not stored separately — they are derived from the `parents` and `related`
fields of each node file when the vault loads.

| Field | Edge type | Layout effect | Visual |
|---|---|---|---|
| `parents` | `parent-child` | Yes — drives ELK radial hierarchy | Solid grey bezier curve (FloatingEdge — connects at nearest border face) |
| `related` | `related` | No — rendered after layout | Dashed straight line in vault accent color |

### Rules

- A node with no `parents` (or `parents: []`) is treated as the vault root
- Multiple parents are allowed (creates a DAG rather than strict tree)
- `related` connections can point to any node in the vault, including ancestors
- Self-references are ignored

---

## Complete Vault Example

### `src/data/vaults/programming/_vault.yml`

```yaml
id: programming
label: Programming
description: Languages, paradigms, tools, and concepts
icon: "💻"
color: "#6366f1"
root: programming
created: 2026-02-21
````

### `src/data/vaults/programming/programming.md`

```markdown
---
id: programming
label: Programming
type: root
summary: The practice of writing instructions for computers to execute
tags: [meta]
parents: []
related: []
links: []
---

# Programming

Programming is the process of designing and writing source code that a computer
can execute to perform a specific task or solve a problem.
```

### `src/data/vaults/programming/javascript.md`

```markdown
---
id: javascript
label: JavaScript
type: branch
summary: Dynamic, interpreted language originally built for the web
tags: [language, frontend, backend]
parents: [programming]
related: [typescript]
links:
  - https://developer.mozilla.org/en-US/docs/Web/JavaScript
---

# JavaScript

A lightweight, interpreted, prototype-based language with first-class functions.
Originally designed for browsers; now also widely used server-side via Node.js.

## Key Characteristics

- **Dynamic typing** — types checked at runtime
- **Prototype-based** inheritance model
- **Event-driven** and non-blocking I/O via the event loop
- **First-class functions** — functions are values
```

### `src/data/vaults/programming/closures.md`

```markdown
---
id: closures
label: Closures
type: leaf
summary: Functions that retain access to their enclosing scope after it has closed
tags: [concept]
parents: [javascript]
related: [scope]
links: []
---

# Closures

...
```

This produces the graph: `programming → javascript → closures`, with no cross-edges.

---

## Conventions Summary

- **IDs**: lowercase kebab-case, unique per vault, matches filename
- **Labels**: title case, concise (1–4 words ideal)
- **Summaries**: plain text, 1–2 sentences, no Markdown formatting
- **Tags**: lowercase, reuse existing tags within a vault for consistency
- **Content depth**: condensed > exhaustive — a 10-line focused entry beats a 200-line dump
- **One concept per node**: if a node's content covers 3 distinct ideas, split it into children
