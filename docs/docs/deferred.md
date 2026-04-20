---
title: Deferred<Value>
sidebar_label: Deferred
---

## Deferred.make()

Returns a future and its resolver:

```ts
import { Deferred } from "@bloodyowl/boxed"

const [future, resolve] = Deferred.make<string>()

// subscribe to the promise
future.onResolve(console.log)

// resolve from elsewhere
resolve("Hello!")
```
