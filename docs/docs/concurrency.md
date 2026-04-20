---
title: Concurrency
sidebar_label: Concurrency
---

While you have a simple `Future.all` to run all futures in parallel (like `Promise.all` does), you might want to limit the concurrency at which you execute operations.

Using `Future.concurrent`, you can specify the maximum concurrency for your array of operations.

```ts
Future.concurrent(
  userIds.map((userId) => {
    // notice we return a function
    return () => getUserById(userId)
  }),
  { concurrency: 10 },
)
```
