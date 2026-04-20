---
title: Future<Result<Ok, Error>>
sidebar_label: Future<Result> helpers
---

A [Future](./future) can contain a `Result` (e.g. to represent an asynchronous value that can fail). We provide some utility functions to deal with that case without having to unwrap the Future result.

:::note
You can still use all the regular [Future](./future) methods. The following helpers simply removes the need to unwrap the contained result.
:::

## Methods

### .mapOkToResult(f)

```ts
Future<Result<A, E>>.mapOkToResult<B, F>(
  func: (value: A) => Result<B, F>,
  propagateCancel?: boolean
): Future<Result<B, E | F>>
```

Takes a `Future<Result<Ok, Error>>` and a `f` function taking `Ok` and returning `Result<ReturnValue, Error>` and returns a new `Future<Result<ReturnValue, Error>>`

```ts title="Examples"
Future.value(Result.Ok(3)).mapOkToResult((ok) => {
  return Result.Ok(ok * 2);
});
// Future<Result.Ok<6>>

Future.value(Result.Ok(3)).mapOkToResult((ok) =>
  isEven(ok) ? Result.Ok(ok) : Result.Error("Odd number");
);
// Future<Result.Error<"Odd number">>
```

### .mapErrorToResult(f)

```ts
Future<Result<A, E>>.mapErrorToResult<B, F>(
  func: (value: E) => Result<B, F>,
  propagateCancel?: boolean
): Future<Result<A | B, F>>
```

Takes a `Future<Result<Ok, Error>>` and a `f` function taking `Error` and returning `Result<Ok, ReturnError>` and returns a new `Future<Result<Ok, ReturnError>>`

```ts title="Examples"
Future.value(Result.Error(3)).mapErrorToResult((ok) => {
  return Result.Ok(ok * 2);
});
// Future<Result.Ok<6>>

Future.value(Result.Error(3)).mapErrorToResult((ok) =>
  isEven(ok) ? Result.Ok(ok) : Result.Error("Odd number");
);
// Future<Result.Error<"Odd number">>
```

### .mapOk(f)

```ts
Future<Result<A, E>>.mapOk<B>(
  func: (value: A) => B,
  propagateCancel?: boolean
): Future<Result<B, E>>
```

Takes a `Future<Result<Ok, Error>>` and a `f` function taking `Ok` and returning `ReturnValue` and returns a new `Future<Result<ReturnValue, Error>>`

```ts title="Examples"
Future.value(Result.Ok(3)).mapOk((ok) => {
  return ok * 2
})
// Future<Result.Ok<6>>

Future.value(Result.Error("something")).mapOk((ok) => {
  return ok * 2
})
// Future<Result.Error<"something">>
```

### .mapError(f)

```ts
Future<Result<A, E>>.mapError<F>(
  func: (value: E) => F,
  propagateCancel?: boolean
): Future<Result<A, F>>
```

Takes a `Future<Result<Ok, Error>>` and a `f` function taking `Error` and returning `ReturnValue` and returns a new `Future<Result<Ok, ReturnValue>>`

```ts title="Examples"
Future.value(Result.Error(3)).mapError((error) => {
  return error * 2
})
// Future<Result.Error<6>>

Future.value(Result.Ok("something")).mapError((ok) => {
  return ok * 2
})
// Future<Result.Ok<"something">>
```

### .flatMapOk(f)

```ts
Future<Result<A, E>>.flatMapOk<B, F>(
  func: (value: A) => Future<Result<B, F>>,
  propagateCancel?: boolean
): Future<Result<B, E | F>>
```

Takes a `Future<Result<Ok, Error>>` and a `f` function taking `Ok` returning a `Future<Result<ReturnValue, Error>>`

```ts title="Examples"
Future.value(Result.Ok(3)).flatMapOk((ok) => Future.value(Result.Ok(ok * 2)))
// Future<Result.Ok<6>>

Future.value(Result.Ok(3)).flatMapOk((ok) => Future.value(Result.Error("Nope")))
// Future<Result.Error<"Nope">>

Future.value(Result.Error("Error")).flatMapOk((ok) =>
  Future.value(Result.Ok(ok * 2)),
)
// Future<Result.Error<"Error">>
```

### .flatMapError(f)

```ts
Future<Result<A, E>>.flatMapError<B, F>(
  func: (value: E) => Future<Result<B, F>>,
  propagateCancel?: boolean
): Future<Result<A | B, F>>
```

Takes a `Future<Result<Ok, Error>>` and a `f` function taking `Error` returning a `Future<Result<Ok, ReturnValue>>`

```ts title="Examples"
Future.value(Result.Ok(3)).flatMapError((error) =>
  Future.value(Result.Ok(ok * 2)),
)
// Future<Result.Ok<3>>

Future.value(Result.Error("Error")).flatMapError((error) =>
  Future.value(Result.Error("Nope")),
)
// Future<Result.Error<"Nope">>

Future.value(Result.Error("Error")).flatMapError((error) =>
  Future.value(Result.Ok(1)),
)
// Future<Result.Ok<1>>
```

### .tapOk(f)

```ts
Future<Result<A, E>>.tapOk(func: (value: A) => unknown): Future<Result<A, E>>
```

Runs `f` if value is `Ok` with the future value, and returns the original future. Useful for debugging.

```ts title="Examples"
future.tapOk(console.log)
```

### .tapError(f)

```ts
Future<Result<A, E>>.tapError(func: (value: E) => unknown): Future<Result<A, E>>
```

Runs `f` if value is `Error` with the future value, and returns the original future. Useful for debugging.

```ts title="Examples"
future.tapError(console.log)
```

### .resultToPromise()

```ts
Future<Result<A, E>>.resultToPromise(): Promise<A>
```

Takes a `Future<Result<Ok, Error>>` and returns a `Promise<Ok>`, rejecting the promise with `Error` in this state.

```ts title="Examples"
Future.value(Result.Ok(1)).resultToPromise()
// Promise<1>

Future.value(Result.Reject(1)).resultToPromise()
// Promise (rejected with 1)
```

## Statics

### Future.all(resultFutures)

You can combine the `all` helpers from `Future` and `Result`:

```ts title="Examples"
const futures = [
  Future.value(Result.Ok(1)),
  Future.value(Result.Ok(2)),
  Future.value(Result.Ok(3)),
]

Future.all(futures).map(Result.all)
// Future<Result.Ok<[1, 2, 3]>>
```

Let's see the types at each step:

```ts title="Examples"
// Array<Future<Result<number, never>>>
// -> [Future<Result.Ok<1>>, Future<Result.Ok<2>>, Future<Result.Ok<3>>]
const input = [
  Future.value(Result.Ok(1)),
  Future.value(Result.Ok(2)),
  Future.value(Result.Ok(3)),
]

// Future<Array<Result<number, never>>>
// -> Future<[Result.Ok<1>>, Result.Ok<2>>, Result.Ok<3>]>
const step1 = Future.all(input)

// Future<Result<Array<number>, never>>
// -> Future<[Result.Ok<[1, 2, 3]>>
const step2 = step1.map(Result.all)
```

### Future.allFromDict(resultFutures)

Like as `all`, you can combine the `allFromDict`:

```ts title="Examples"
const futures = {
  a: Future.value(Result.Ok(1)),
  b: Future.value(Result.Ok(2)),
  c: Future.value(Result.Ok(3)),
}

Future.allFromDict(futures).map(Result.allFromDict)
// Future<[Result.Ok<{a: 1, b: 2, c: 3}>>
```

Let's see the types at each step:

```ts title="Examples"
// Dict<Future<Result<number, never>>>
// -> {a: Future<Result.Ok<1>>, b: Future<Result.Ok<2>>, c: Future<Result.Ok<3>>—
const input = {
  a: Future.value(Result.Ok(1)),
  b: Future.value(Result.Ok(2)),
  c: Future.value(Result.Ok(3)),
}

// Future<Dict<Result<number, never>>>
// -> Future<{a: Result.Ok<1>>, b: Result.Ok<2>>, c: Result.Ok<3>}>
const step1 = Future.all(input)

// Future<Result<Array<number>, never>>
// -> Future<[Result.Ok<{a: 1, b: 2, c: 3}>>
const step2 = step1.map(Result.all)
```

### Future.retry(getFuture)

```ts
retry(getFuture: () => Future<Result<A, E>>, {max: number}): Future<Result<A, E>>
```

Runs the future getter, if the future resolves with a `Result.Error`, retries until hitting `max` attempts.

The function provides a 0-based `attempt` count to the function if you need to implement delay logic.

```ts title="Examples"
// retry immediately after failure
Future.retry(
  (attempt) => {
    return getUserById(userId)
  },
  { max: 3 },
)
// Future<Result<...>>

// adding delay
Future.retry(
  (attempt) => {
    return Future.wait(attempt * 100).flatMap(() => getUserById(userId))
  },
  { max: 10 },
)
// Future<Result<...>>
```

## Cheatsheet

| Method                                   | Input              | Function input | Function output    | Returned value     |
| ---------------------------------------- | ------------------ | -------------- | ------------------ | ------------------ |
| [`mapOkToResult`](#mapoktoresultf)       | `Future(Ok(x))`    | `x`            | `Ok(y)`            | `Future(Ok(y))`    |
| [`mapOkToResult`](#mapoktoresultf)       | `Future(Ok(x))`    | `x`            | `Error(f)`         | `Future(Error(f))` |
| [`mapOkToResult`](#mapoktoresultf)       | `Future(Error(e))` | _not provided_ | _not executed_     | `Future(Error(e))` |
| [`mapErrorToResult`](#maperrortoresultf) | `Future(Error(e))` | `e`            | `Ok(y)`            | `Future(Ok(y))`    |
| [`mapErrorToResult`](#maperrortoresultf) | `Future(Error(e))` | `e`            | `Error(f)`         | `Future(Error(f))` |
| [`mapErrorToResult`](#maperrortoresultf) | `Future(Ok(x))`    | _not provided_ | _not executed_     | `Future(Ok(x))`    |
| [`mapOk`](#mapokf)                       | `Future(Ok(x))`    | `x`            | `y`                | `Future(Ok(y))`    |
| [`mapOk`](#mapokf)                       | `Future(Error(e))` | _not provided_ | _not executed_     | `Future(Error(e))` |
| [`mapError`](#maperrorf)                 | `Future(Ok(x))`    | _not provided_ | _not executed_     | `Future(Ok(x))`    |
| [`mapError`](#maperrorf)                 | `Future(Error(e))` | `e`            | `f`                | `Future(Error(f))` |
| [`flatMapOk`](#flatmapokf)               | `Future(Ok(x))`    | `x`            | `Future(Ok(y))`    | `Future(Ok(y))`    |
| [`flatMapOk`](#flatmapokf)               | `Future(Ok(x))`    | `x`            | `Future(Error(f))` | `Future(Error(f))` |
| [`flatMapOk`](#flatmapokf)               | `Future(Error(e))` | _not provided_ | _not executed_     | `Future(Error(e))` |
| [`flatMapError`](#flatmaperrorf)         | `Future(Ok(x))`    | _not provided_ | _not executed_     | `Future(Ok(x))`    |
| [`flatMapError`](#flatmaperrorf)         | `Future(Error(e))` | `e`            | `Future(Ok(y))`    | `Future(Ok(y))`    |
| [`flatMapError`](#flatmaperrorf)         | `Future(Error(e))` | `e`            | `Future(Error(f))` | `Future(Error(f))` |
