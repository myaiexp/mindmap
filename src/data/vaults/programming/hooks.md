---
id: hooks
label: React Hooks
type: leaf
summary: Functions that let you use state and lifecycle features in function components
tags: [concept, react, ui]
parents: [react]
related: []
links:
  - https://react.dev/reference/react
---

# React Hooks

Hooks allow function components to "hook into" React features previously only available in class components.

## Core Hooks

| Hook          | Purpose                                          |
| ------------- | ------------------------------------------------ |
| `useState`    | Local component state                            |
| `useEffect`   | Side effects (data fetching, subscriptions, DOM) |
| `useRef`      | Mutable ref that doesn't trigger re-render       |
| `useMemo`     | Memoize expensive computations                   |
| `useCallback` | Memoize callbacks to avoid re-renders            |
| `useContext`  | Consume a React context                          |

## Rules of Hooks

1. Only call hooks at the **top level** (not inside loops or conditionals)
2. Only call hooks from **React functions** (components or custom hooks)
