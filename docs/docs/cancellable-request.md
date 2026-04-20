---
title: Cancellable Request
sidebar_label: Cancellable Request
---

When using the naive `fetch`, cancelling a request can be inelegant:

```ts
import { useEffect } from "react"
import { Result } from "@bloodyowl/boxed"

const callMyApi = (url, { signal }) => {
  return fetch(url, { signal })
    .then((res) => res.json())
    .then((json) => Result.Ok(res))
    .catch((error) => Result.Error(error))
}

// ...
useEffect(() => {
  // Implementation details leak to your components
  const controller = new AbortController()
  callMyApi("/users", { signal: controller.signal })
    .then((res) => res.json())
    .then((json) => setState(Result.Ok(json)))
    .catch((error) => setState(Result.Error(error)))
  return () => controller.abort()
}, [])
```

Using `Future` can make this easier:

```ts
import { useEffect } from "react"
import { Future, Result } from "@bloodyowl/boxed"

const callMyApi = (url: string) =>
  Future.make((resolve) => {
    const controller = new AbortController()

    fetch(url, { signal: controller.signal })
      .then((res) => res.json())
      .then((json) => resolve(Result.Ok(json)))
      .catch((error) => resolve(Result.Error(error)))

    // Here, the implementation detail is managed in place
    return () => controller.abort()
  })

// And the noise dissapears from your components!
useEffect(() => {
  const request = callMyApi("/api").tap(setState)
  return () => request.cancel()
}, [])
```
