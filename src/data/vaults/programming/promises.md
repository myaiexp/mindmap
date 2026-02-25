---
id: promises
label: Promises
type: leaf
summary: Objects representing the eventual completion or failure of an asynchronous operation
tags: [concept, async, javascript]
parents: [javascript]
related: [event-loop, async-await]
links:
  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
---

# Promises

A Promise is a proxy for a value not yet known — it represents an async operation that will settle (resolve or reject) in the future.

## States

- **Pending** — initial state
- **Fulfilled** — operation succeeded, value available
- **Rejected** — operation failed, reason available

## Key Methods

- `.then(onFulfilled, onRejected)` — chain handlers
- `.catch(onRejected)` — handle errors
- `.finally(fn)` — runs regardless of outcome
- `Promise.all([...])` — wait for all, fail fast
- `Promise.allSettled([...])` — wait for all, no fail fast
