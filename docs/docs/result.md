---
title: Result<Ok, Error>
sidebar_label: Result
---

The `Result` can replace exception flows.

Exceptions can be tricky to handle: there's nothing in the type system that tracks if an error has been handled, which is error prone, and adds to your mental overhead. `Result` helps as it **makes the value hold the success state**, making it dead-simple to track with a type-system.

Just like the `Option` type, the `Result` type is a box that can have two states:

- `Ok(value)`
- `Error(error)`

## Create a Result value

To create a result, use the `Ok` and `Error` constructors:

```ts
import { Result } from "@bloodyowl/boxed"

const ok = Result.Ok(1)

const notOk = Result.Error("something happened")
```

You can convert an option to a `Result`:

```ts
import { Result, Option } from "@bloodyowl/boxed"

const a = Result.fromOption(Option.Some(1), "NotFound")
// Ok<1>

const b = Result.fromOption(Option.None(), "NotFound")
// Error<"NotFound">
```

You get interop with exceptions and promises:

```ts
// Let's say you have some function that throws an error
const init = (id: string) => {
  if (id.length !== 24) {
    throw new Error()
  }
  return new Client({ id })
}

const result = Result.fromExecution(() => init(id))
// Here, result will either be:
// - Ok(client)
// - Error(error)

// It works with promises too:

const value = await Result.fromPromise(() => fetch("/api"))
// `value` will either be:
// - Ok(res)
// - Error(error)
```

:::tip Since v3.0.0
`Result` values are referentially equal if they contain the same value, meaning that `Result.Ok(1) === Result.Ok(1)` and `Result.Error(1) === Result.Error(1)`.
:::

## Methods

The result type provides a few manipulation functions:

### .map(f)

```ts
Result<A, E>.map<B>(f: (value: A) => B): Result<B, E>
```

If the result is `Ok(value)` returns `Ok(f(value))`, otherwise returns `Error(error)`.

```ts title="Examples"
Result.Ok(2).map((x) => x * 2)
// Result.Ok<4>

Result.Ok(2).map((x) => Result.Ok(x * 2))
// Result.Ok<Result.Ok<4>>
```

### .mapError(f)

```ts
Result<A, E>.mapError<F>(f: (value: E) => F): Result<A, F>
```

If the result is `Error(error)` returns `Error(f(error))`, otherwise returns `Ok(value)`.

```ts title="Examples"
Result.Error(2).mapError((x) => x * 2)
// Result.Error<4>

Result.Error(2).mapError((x) => Result.Ok(x * 2))
// Result.Error<Result.Ok<4>>
```

### .flatMap(f)

```ts
Result<A, E>.flatMap<B, F>(f: (value: A) => Result<B, F>): Result<B, F | E>
```

If the result is `Ok(value)` returns `f(value)`, otherwise returns `Error(error)`.

```ts title="Examples"
Result.Ok(1).flatMap((x) => (x > 2 ? Result.Error("some error") : Result.Ok(2)))
// Result.Ok<2>

Result.Ok(3).flatMap((x) => (x > 2 ? Result.Error("some error") : Result.Ok(2)))
// Result.Error<"some error">

Result.Error("initial error").flatMap((x) =>
  x > 2 ? Result.Error("some error") : Result.Ok(2),
)
// Result.Error<"initial error">
```

### .flatMapError(f)

```ts
Result<A, E>.flatMapError<B, F>(f: (value: E) => Result<B, F>): Result<A | B, F>
```

If the result is `Error(error)` returns `f(error)`, otherwise returns `Ok(value)`.

```ts title="Examples"
Result.Error(3).flatMapError((x) =>
  x > 2 ? Result.Error("some error") : Result.Ok(2),
)
// Result.Error<"some error">

Result.Error(1).flatMapError((x) =>
  x > 2 ? Result.Error("some error") : Result.Ok(2),
)
// Result.Ok<2>

Result.Ok("ok").flatMapError((x) =>
  x > 2 ? Result.Error("some error") : Result.Ok(2),
)
// Result.Ok<"ok">
```

### .getOr(defaultValue)

> Alias: `getWithDefault`

```ts
Result<A, E>.getOr(defaultValue: A): A
```

If the result is `Ok(value)` returns `value`, otherwise returns `defaultValue`.

```ts title="Examples"
Result.Ok(2).getOr(1)
// 2

Result.Error(2).getOr(1)
// 1
```

### .getOrThrow()

```ts
Result<A, E>.getOrThrow(): A | never
```

If the result is `Ok(value)` returns `value`, otherwise will throw an error.

```ts title="Examples"
const value = Result.Ok(1).getOrThrow();
// 2

const value = Result.Error(2).getOrThrow();
// Uncaught: Tried to unwrap a Result.Error value
```

### .mapOr(defaultValue, mapper)

```ts
Result<A, E>.mapOr(defaultValue: B, mapper: (a: A) => B): B
```

If the option is `Ok(value)` returns `mapper(value)`, otherwise returns `defaultValue`.

```ts title="Examples"
Result.Ok(2).mapOr(1, (x) => x * 2)
// 4

Result.Error("error").mapOr(1, (x) => x * 2)
// 1
```

### .get()

```ts
Result<A, E>.get(): A
```

Returns the value contained in `Ok(value)`. Only usable within a `isOk()` check.

```ts title="Examples"
const value = result.get()
// does not compile

if (result.isOk()) {
  const value = result.get()
  // value
}
```

### .getError()

```ts
Result<A, E>.getError(): E
```

Returns the error contained in `Error(error)`. Only usable within a `isError()` check.

```ts title="Examples"
const error = result.getError()
// does not compile

if (result.isError()) {
  const error = result.getError()
  // error
}
```

### .isOk()

```ts
Result<A, E>.isOk(): boolean
```

Type guard. Checks if the result is `Ok(value)`

```ts title="Examples"
Result.Ok(2).isOk()
// true

Result.Error(2).isOk()
// false

if (result.isOk()) {
  const value = result.get()
}
```

### .isError()

```ts
Result<A, E>.isError(): boolean
```

Type guard. Checks if the result is `Error(error)`

```ts title="Examples"
Result.Ok(2).isError()
// false

Result.Error().isError()
// true

if (result.isError()) {
  const value = result.getError()
}
```

### .toOption()

```ts
Result<A, E>.toOption(): Option<A>
```

If the result is `Ok(value)` returns `Some(value)`, otherwise returns `None`.

```ts title="Examples"
Result.Ok(2).toOption()
// Option.Some<2>

Result.Error(2).toOption()
// Option.None
```

### .match()

```ts
Result<A, E>.match<B>(config: {
  Ok: (value: A) => B;
  Error: (error: E) => B;
}): B
```

Match the result state

```ts title="Examples"
const valueToDisplay = result.match({
  Ok: (value) => value,
  Error: (error) => {
    console.error(error)
    return "fallback"
  },
})
```

### .tap(func)

```ts
Result<A, E>.tap(func: (result: Result<A, E>) => unknown): Result<A, E>
```

Executes `func` with `result`, and returns `result`. Useful for logging and debugging.

```ts title="Examples"
result.tap(console.log).map((x) => x * 2)
```

### .tapOk(func)

```ts
Result<A, E>.tapOk(func: (value: A) => unknown): Result<A, E>
```

Executes `func` with `ok`, and returns `result`. Useful for logging and debugging. No-op if `result` is an error.

```ts title="Examples"
result.tapOk(console.log).map((x) => x * 2)
```

### .tapError(func)

```ts
Result<A, E>.tapError(func: (error: E) => unknown): Result<A, E>
```

Executes `func` with `error`, and returns `result`. Useful for logging and debugging. No-op if `result` is ok.

```ts title="Examples"
result.tapError(console.log).map((x) => x * 2)
```

## Statics

### Result.isResult(value)

```ts
isResult(value: unknown): boolean
```

Type guard, checks if the provided value is a result.

```ts title="Examples"
Result.isResult(Result.Ok(1))
// true

Result.isResult([])
// false
```

### Result.all(results)

```ts
all(options: Array<Result<A, E>>): Result<Array<A>, E>
```

Turns an "array of results of value" into a "result of array of value".

```ts title="Examples"
Result.all([Result.Ok(1), Result.Ok(2), Result.Ok(3)])
// Result.Ok<[1, 2, 3]>

Result.all([Result.Error("error"), Result.Ok(2), Result.Ok(3)])
// Result.Error<"error">
```

### Result.allFromDict(results)

```ts
allFromDict(options: Dict<Result<A, E>>): Result<Dict<A>, E>
```

Turns a "dict of results of value" into a "result of dict of value".

```ts title="Examples"
Result.allFromDict({ a: Result.Ok(1), b: Result.Ok(2), c: Result.Ok(3) })
// Result.Ok<{a: 1, b: 2, c: 3}>

Result.allFromDict({
  a: Result.Error("error"),
  b: Result.Ok(2),
  c: Result.Ok(3),
})
// Result.Error<"error">
```

### Result.fromExecution(() => value)

```ts
fromExecution<A, E>(func: () => A) => Result<A, E>
```

Takes a function returning `Value` that can throw an `Error` and returns a `Result<Value, Error>`

```ts title="Examples"
Result.fromExecution(() => 1)
// Result.Ok<1>

Result.fromExecution(() => {
  throw "Something went wrong"
})
// Result.Error<"Something went wrong">
```

### Result.fromPromise(promise)

```ts
fromPromise<A, E>(promise: Promise<A>) => Promise<Result<A, E>>
```

Takes a `Promise<Value>` that can fail with `Error` and returns a `Promise<Result<Value, Error>>`

```ts title="Examples"
await Result.fromPromise(Promise.resolve(1))
// Result.Ok<1>

await Result.fromPromise(Promise.reject(1))
// Result.Error<1>
```

### Result.fromOption(option, valueIfNone)

```ts
fromOption<A, E>(option: Option<A>, valueWhenNone: E): Result<A, E>
```

Takes a function returning `Value` that can throw an `Error` and returns a `Result<Value, Error>`

```ts title="Examples"
const a = Result.fromOption(Option.Some(1), "NotFound")
// Result.Ok<1>

const b = Result.fromOption(Option.None(), "NotFound")
// Result.Error<"NotFound">
```

## TS Pattern interop

```ts
import { match, P } from "ts-pattern"
import { Result } from "@bloodyowl/boxed"

match(myResult)
  .with(Result.P.Ok(P.select()), (value) => console.log(value))
  .with(Result.P.Error(P.select()), (error) => {
    console.error(error)
    return "fallback"
  })
  .exhaustive()
```

## Cheatsheet

| Method                           | Input      | Function input | Function output | Returned value |
| -------------------------------- | ---------- | -------------- | --------------- | -------------- |
| [`map`](#mapf)                   | `Ok(x)`    | `x`            | `y`             | `Ok(y)`        |
| [`map`](#mapf)                   | `Error(e)` | _not provided_ | _not executed_  | `Error(e)`     |
| [`mapError`](#maperrorf)         | `Ok(x)`    | _not provided_ | _not executed_  | `Ok(x)`        |
| [`mapError`](#maperrorf)         | `Error(e)` | `e`            | `f`             | `Error(f)`     |
| [`flatMap`](#flatmapf)           | `Ok(x)`    | `x`            | `Ok(y)`         | `Ok(y)`        |
| [`flatMap`](#flatmapf)           | `Ok(x)`    | `x`            | `Error(f)`      | `Error(f)`     |
| [`flatMap`](#flatmapf)           | `Error(e)` | _not provided_ | _not executed_  | `Error(e)`     |
| [`flatMapError`](#flatmaperrorf) | `Ok(x)`    | _not provided_ | _not executed_  | `Ok(x)`        |
| [`flatMapError`](#flatmaperrorf) | `Error(e)` | `e`            | `Ok(y)`         | `Ok(y)`        |
| [`flatMapError`](#flatmaperrorf) | `Error(e)` | `e`            | `Error(f)`      | `Error(f)`     |
