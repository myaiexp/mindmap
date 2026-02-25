---
id: higher-order-functions
label: Higher-Order Functions
type: leaf
summary: Functions that take other functions as arguments or return functions as results
tags: [concept, functional, javascript]
parents: [javascript]
related: [closures]
links: []
---

# Higher-Order Functions

A higher-order function (HOF) either:
1. **Takes** one or more functions as arguments, or
2. **Returns** a function as its result

## Built-in Examples

```js
[1, 2, 3].map(x => x * 2)       // [2, 4, 6]
[1, 2, 3].filter(x => x > 1)    // [2, 3]
[1, 2, 3].reduce((acc, x) => acc + x, 0) // 6
```

## Custom Example

```js
function withLogging(fn) {
  return (...args) => {
    console.log('Calling with', args)
    return fn(...args)
  }
}
```
