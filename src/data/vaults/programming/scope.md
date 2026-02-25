---
id: scope
label: Scope
type: leaf
summary: The region of code where a variable is accessible
tags: [concept, javascript]
parents: [javascript]
related: [closures]
links: []
---

# Scope

Scope determines the visibility and lifetime of variables.

## Types

- **Global scope** — accessible everywhere
- **Function scope** — `var` declarations are function-scoped
- **Block scope** — `let` and `const` are block-scoped (`{}`)
- **Module scope** — top-level variables in ES modules are module-scoped

## Lexical vs Dynamic

JavaScript uses **lexical (static) scoping** — scope is determined by where the function is written, not where it's called.
