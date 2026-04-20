---
title: Lazy
sidebar_label: Lazy
---

## Lazy(f)

Creates a lazy value. The computation won't happen until the first access.

A `lazy` type exposes a `get` method that'll return the result from the computation.

```ts
import { Lazy } from "@bloodyowl/boxed"

const lazy = Lazy(() => {
  return myComputation()
})
```

## lazy.get()

Computes the value **once** and returns it.

```ts
lazy.get() // value is computed and return here
```
