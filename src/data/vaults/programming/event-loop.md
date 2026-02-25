---
id: event-loop
label: Event Loop
type: leaf
summary: JavaScript's concurrency model — a message queue processed by a single thread
tags: [concept, async, javascript]
parents: [javascript]
related: [promises, async-await]
links:
  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop
---

# Event Loop

The event loop allows JavaScript to perform non-blocking I/O despite being single-threaded, by deferring work to the system and processing results via a callback queue.

## Components

- **Call stack** — synchronous execution frame
- **Web APIs / Node APIs** — handle async work (timers, fetch, fs)
- **Microtask queue** — Promises, `queueMicrotask` — processed after each task
- **Macrotask queue** — `setTimeout`, `setInterval`, I/O callbacks

## Order of Execution

1. Run current synchronous code to completion
2. Drain the **microtask queue** completely
3. Pick one **macrotask** from the queue
4. Repeat
