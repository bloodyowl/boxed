---
title: AsyncData<Result<Ok, Error>>
sidebar_label: AsyncData<Result> helpers
---

A [AsyncData](./async-data) can contain a `Result` (e.g. to represent an asynchronous value that can fail). We provide some utility functions to deal with that case without having to unwrap the AsyncData result.

:::note
You can still use all the regular [AsyncData](./async-data) methods. The following helpers simply removes the need to unwrap the contained result.
:::

## Methods

### .mapOkToResult(f)

```ts
AsyncData<Result<A, E>>.mapOkToResult<B, F>(
  func: (value: A) => Result<B, F>,
): AsyncData<Result<B, E | F>>
```

Takes a `AsyncData<Result<Ok, Error>>` and a `f` function taking `Ok` and returning `Result<ReturnValue, Error>` and returns a new `AsyncData<Result<ReturnValue, Error>>`

```ts title="Examples"
AsyncData.Done(Result.Ok(3)).mapOkToResult((ok) => {
  return Result.Ok(ok * 2);
});
// AsyncData<Result.Ok<6>>

AsyncData.Done(Result.Ok(3)).mapOkToResult((ok) =>
  isEven(ok) ? Result.Ok(ok) : Result.Error("Odd number");
);
// AsyncData<Result.Error<"Odd number">>
```

### .mapErrorToResult(f)

```ts
AsyncData<Result<A, E>>.mapErrorToResult<B, F>(
  func: (value: E) => Result<B, F>,
): AsyncData<Result<A | B, F>>
```

Takes a `AsyncData<Result<Ok, Error>>` and a `f` function taking `Error` and returning `Result<ReturnValue, Error>` and returns a new `AsyncData<Result<ReturnValue, Error>>`

```ts title="Examples"
AsyncData.Done(Result.Error(3)).mapErrorToResult((error) => {
  return Result.Ok(ok * 2);
});
// AsyncData<Result.Ok<6>>

AsyncData.Done(Result.Error(3)).mapErrorToResult((error) =>
  isEven(error) ? Result.Ok(error) : Result.Error("Odd number");
);
// AsyncData<Result.Error<"Odd number">>
```

### .mapOk(f)

```ts
AsyncData<Result<A, E>>.mapOk<B>(
  func: (value: A) => B,
): AsyncData<Result<B, E>>
```

Takes a `AsyncData<Result<Ok, Error>>` and a `f` function taking `Ok` and returning `ReturnValue` and returns a new `AsyncData<Result<ReturnValue, Error>>`

```ts title="Examples"
AsyncData.Done(Result.Ok(3)).mapOk((ok) => {
  return ok * 2
})
// AsyncData<Result.Ok<6>>

AsyncData.Done(Result.Error("something")).mapOk((ok) => {
  return ok * 2
})
// AsyncData<Result.Error<"something">>
```

### .mapError(f)

```ts
AsyncData<Result<A, E>>.mapError<F>(
  func: (value: E) => F,
): AsyncData<Result<A, F>>
```

Takes a `AsyncData<Result<Ok, Error>>` and a `f` function taking `Error` and returning `ReturnValue` and returns a new `AsyncData<Result<Ok, ReturnValue>>`

```ts title="Examples"
AsyncData.Done(Result.Error(3)).mapError((error) => {
  return error * 2
})
// AsyncData<Result.Error<6>>

AsyncData.Done(Result.Ok("something")).mapError((ok) => {
  return ok * 2
})
// AsyncData<Result.Ok<"something">>
```

### .flatMapOk(f)

```ts
AsyncData<Result<A, E>>.flatMapOk<B, F>(
  func: (value: A) => AsyncData<Result<B, F>>,
): AsyncData<Result<B, E | F>>
```

Takes a `AsyncData<Result<Ok, Error>>` and a `f` function taking `Ok` returning a `AsyncData<Result<ReturnValue, Error>>`

```ts title="Examples"
AsyncData.Done(Result.Ok(3)).flatMapOk((ok) =>
  AsyncData.Done(Result.Ok(ok * 2)),
)
// AsyncData<Result.Ok<6>>

AsyncData.Done(Result.Ok(3)).flatMapOk((ok) =>
  AsyncData.Done(Result.Error("Nope")),
)
// AsyncData<Result.Error<"Nope">>

AsyncData.Done(Result.Error("Error")).flatMapOk((ok) =>
  AsyncData.Done(Result.Ok(ok * 2)),
)
// AsyncData<Result.Error<"Error">>
```

### .flatMapError(f)

```ts
AsyncData<Result<A, E>>.flatMapError<B, F>(
  func: (value: E) => AsyncData<Result<B, F>>,
): AsyncData<Result<A | B, F>>
```

Takes a `AsyncData<Result<Ok, Error>>` and a `f` function taking `Error` returning a `AsyncData<Result<Ok, ReturnValue>>`

```ts title="Examples"
AsyncData.Done(Result.Ok(3)).flatMapError((error) =>
  AsyncData.Done(Result.Ok(ok * 2)),
)
// AsyncData<Result.Ok<3>>

AsyncData.Done(Result.Error("Error")).flatMapError((error) =>
  AsyncData.Done(Result.Error("Nope")),
)
// AsyncData<Result.Error<"Nope">>

AsyncData.Done(Result.Error("Error")).flatMapError((error) =>
  AsyncData.Done(Result.Ok(1)),
)
// AsyncData<Result.Ok<1>>
```

## Cheatsheet

| Method                                   | Input                 | Function input | Function output       | Returned value        |
| ---------------------------------------- | --------------------- | -------------- | --------------------- | --------------------- |
| [`mapOkToResult`](#mapoktoresultf)       | `AsyncData(Ok(x))`    | `x`            | `Ok(y)`               | `AsyncData(Ok(y))`    |
| [`mapOkToResult`](#mapoktoresultf)       | `AsyncData(Ok(x))`    | `x`            | `Error(f)`            | `AsyncData(Error(f))` |
| [`mapOkToResult`](#mapoktoresultf)       | `AsyncData(Error(e))` | _not provided_ | _not executed_        | `AsyncData(Error(e))` |
| [`mapErrorToResult`](#maperrortoresultf) | `AsyncData(Error(e))` | `e`            | `Ok(y)`               | `AsyncData(Ok(y))`    |
| [`mapErrorToResult`](#maperrortoresultf) | `AsyncData(Error(e))` | `e`            | `Error(f)`            | `AsyncData(Error(f))` |
| [`mapErrorToResult`](#maperrortoresultf) | `AsyncData(Ok(x))`    | _not provided_ | _not executed_        | `AsyncData(Ok(x))`    |
| [`mapOk`](#mapokf)                       | `AsyncData(Ok(x))`    | `x`            | `y`                   | `AsyncData(Ok(y))`    |
| [`mapOk`](#mapokf)                       | `AsyncData(Error(e))` | _not provided_ | _not executed_        | `AsyncData(Error(e))` |
| [`mapError`](#maperrorf)                 | `AsyncData(Ok(x))`    | _not provided_ | _not executed_        | `AsyncData(Ok(x))`    |
| [`mapError`](#maperrorf)                 | `AsyncData(Error(e))` | `e`            | `f`                   | `AsyncData(Error(f))` |
| [`flatMapOk`](#flatmapokf)               | `AsyncData(Ok(x))`    | `x`            | `AsyncData(Ok(y))`    | `AsyncData(Ok(y))`    |
| [`flatMapOk`](#flatmapokf)               | `AsyncData(Ok(x))`    | `x`            | `AsyncData(Error(f))` | `AsyncData(Error(f))` |
| [`flatMapOk`](#flatmapokf)               | `AsyncData(Error(e))` | _not provided_ | _not executed_        | `AsyncData(Error(e))` |
| [`flatMapError`](#flatmaperrorf)         | `AsyncData(Ok(x))`    | _not provided_ | _not executed_        | `AsyncData(Ok(x))`    |
| [`flatMapError`](#flatmaperrorf)         | `AsyncData(Error(e))` | `e`            | `AsyncData(Ok(y))`    | `AsyncData(Ok(y))`    |
| [`flatMapError`](#flatmaperrorf)         | `AsyncData(Error(e))` | `e`            | `AsyncData(Error(f))` | `AsyncData(Error(f))` |
