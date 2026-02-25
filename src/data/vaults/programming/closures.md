---
id: closures
label: Closures
type: leaf
summary: Functions that retain access to variables from their enclosing lexical scope
tags: [concept, javascript, functional]
parents: [javascript]
related: [scope, higher-order-functions]
links:
  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures
---

# Closures

A closure is a function bundled with its lexical environment — the variables that were in scope when the function was defined.

## Key Points

- Closures are created every time a function is defined
- The enclosed variables are "captured" by reference, not by value
- Enables **data encapsulation** and private state
- Common in callbacks, event handlers, and module patterns

## Example

```js
function counter() {
  let count = 0
  return () => ++count
}

const inc = counter()
inc() // 1
inc() // 2
```

`count` persists between calls because `inc` closes over it.
