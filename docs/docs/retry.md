---
title: Retry
sidebar_label: Retry
---

When some operations can fail, you might want to implement a retry logic.

## Retry with maximum attempts

If `getUserById` outputs a `Result.Ok` value, the future resolves, if it outputs a `Result.Error`, it re-executes `getUserById`.

```ts
// retry immediately after failure
Future.retry(() => getUserById(userId), { max: 3 })
// Future<Result<...>>
```

## Retry with delay

The function you pass `Future.retry` takes an `attempt` parameter, which is the current number of attempts. The count starts at `0`.

```ts
// adding delay
Future.retry(
  (attempt) => {
    return Future.wait(attempt * 100).flatMap(() => getUserById(userId))
  },
  { max: 10 },
)
// Future<Result<...>>
```
