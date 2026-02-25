---
id: async-await
label: Async / Await
type: leaf
summary: Syntactic sugar over Promises that makes async code read like synchronous code
tags: [concept, async, javascript]
parents: [javascript]
related: [promises, event-loop]
links: []
---

# Async / Await

`async`/`await` is syntactic sugar over Promises, introduced in ES2017.

## Rules

- `async` functions always return a Promise
- `await` pauses execution of the async function until the Promise settles
- `await` can only be used inside `async` functions (or top-level modules)
- Errors are handled with `try/catch` instead of `.catch()`

## Example

```js
async function fetchUser(id) {
  try {
    const res = await fetch(`/api/users/${id}`)
    const user = await res.json()
    return user
  } catch (err) {
    console.error('Failed:', err)
  }
}
```
