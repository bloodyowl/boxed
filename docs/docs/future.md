---
title: Future<Value>
sidebar_label: Future<Value>
---

The `Future` is a replacement for `Promise`.

## Main differences with Promises

- Futures don't handle rejection state, instead leaving it to a contained `Result`
- Futures have built-in cancellation (and don't reject like the fetch `signal` API does)
- Futures don't "swallow" futures that are returned from `map` and `flatMap`
- Future callbacks run synchronously

:::info
Even though we're diverging from `Promise`, you can `await` a `Future`.
:::

## Create a Future

```ts title="Examples"
import { Future } from "@bloodyowl/boxed"

// Value
const future = Future.value(1)

// Simple future
const otherFuture = Future.make((resolve) => {
  resolve(1)
})

// Future with cancellation effect
const otherFuture = Future.make((resolve) => {
  const timeoutId = setTimeout(() => {
    resolve(1)
  }, 1000)
  return () => clearTimeout(timeoutId)
})
```

## Methods

### .onResolve(f)

```ts
Future<A>.onResolve(func: (value: A) => void): void
```

Runs `f` with the future value as argument when available.

```ts title="Examples"
Future.value(1).onResolve(console.log)
// Log: 1
```

### .onCancel(f)

```ts
Future<A>.onCancel(func: () => void): void
```

Runs `f` when the future is cancelled.

```ts title="Examples"
future.onCancel(() => {
  // do something
})
```

### .map(f)

```ts
Future<A>.map<B>(func: (value: A) => B, propagateCancel?: boolean): Future<B>
```

Takes a `Future<A>` and returns a new `Future<f<A>>`

```ts title="Examples"
Future.value(3).map((x) => x * 2)
// Future<6>
```

### .flatMap(f)

```ts
Future<A>.flatMap<B>(func: (value: A) => Future<B>, propagateCancel?: boolean): Future<B>
```

Takes a `Future<A>`, and returns a new future taking the value of the future returned by `f(A)`

```ts title="Examples"
Future.value(3).flatMap((x) => Future.value(x * 2))
// Future<6>
```

### .tap(f)

```ts
Future<A>.tap(func: (value: A) => unknown): Future<A>
```

Runs `f` with the future value, and returns the original future. Useful for debugging.

```ts title="Examples"
Future.value(3).tap(console.log)
// Log: 3
// Future<3>
```

### .toPromise()

```ts
Future<A>.toPromise(): Promise<A>
```

Takes a `Future<T>` and returns a `Promise<T>`

```ts title="Examples"
Future.value(1).toPromise()
// Promise<1>
```

## [Future\<Result\<Ok, Error>>](/future-result)

We provide [some special helpers](/future-result) for `Future`s containing a `Result`.

## Statics

### Future.isFuture(value)

```ts
isFuture(value: unknown): boolean
```

Type guard, checks if the provided value is a future.

```ts title="Examples"
Future.isFuture(Future.value(1))
// true

Future.isFuture([])
// false
```

### Future.all(futures)

```ts
all(futures: Array<Future<A>>): Future<Array<A>>
```

Turns an "array of futures of values" into a "future of array of value".

```ts title="Examples"
Future.all([Future.value(1), Future.value(2), Future.value(3)])
// Future<[1, 2, 3]>
```

### Future.concurrent(futureGetters, options)

```ts
all(futures: Array<() => Future<A>>, {concurrency: number}): Future<Array<A>>
```

Like `Future.all` with a max concurrency, and in order to control the flow, provided with functions returning futures.

```ts title="Examples"
Future.concurrent(
  userIds.map((userId) => {
    // notice we return a function
    return () => getUserById(userId)
  }),
  { concurrency: 10 },
)
// Future<[...]>
```

### Future.wait(ms)

```ts
wait(ms: number): Future<void>
```

Helper to create a future that resolves after `ms` (in milliseconds).

```ts title="Examples"
Future.wait(1000).tap(() => console.log("Hey"))
// Logs "Hey" after 1s
```

### Future.allFromDict(futures)

```ts
allFromDict(futures: Dict<Future<A>>): Future<Dict<A>>
```

Turns a "dict of futures of values" into a "future of dict of value".

```ts title="Examples"
Future.allFromDict({
  a: Future.value(1),
  b: Future.value(2),
  c: Future.value(3),
})
// Future<{a: 1, b: 2, c: 3}>
```

### Future.fromPromise(promise)

```ts
fromPromise<A>(promise: Promise<A>): Future<Result<A, unknown>>
```

Takes a `Promise<T>` and returns a [`Future<Result<T, Error>>`](/future-result)

```ts title="Examples"
Future.fromPromise(Promise.resolve(1))
// Future<Result.Ok<1>>

Future.fromPromise(Promise.reject(1))
// Future<Result.Error<1>>
```

## Cancellation

### Basics

In JavaScript, `Promises` are not cancellable.

That can be limiting at times, especially when using `React`'s `useEffect`, that let's you return a cancellation effect in order to prevent unwanted side-effects.

You can return a cleanup effect from the future `init` function:

```ts
const future = Future.make((resolve) => {
  const timeoutId = setTimeout(() => {
    resolve(1)
  }, 1000)
  // will run on cancellation
  return () => clearTimeout(timeoutId)
})
```

To cancel a `future`, call `future.cancel()`.

```ts
future.cancel()
```

:::note
You can only `cancel` a pending future.

Calling cancel on a resolved future is a no-op, meaning the future will keep its resolved state.
:::

A cancelled future will automatically cancel any future created from it (e.g. from `.map` or `.flatMap`):

```ts
const future = Future.make((resolve) => {
  const timeoutId = setTimeout(() => {
    resolve(1)
  }, 1000)
  // will run on cancellation
  return () => clearTimeout(timeoutId)
})

const future2 = future.map((x) => x * 2)

future.cancel() // Both `future` and `future2` are cancelled
```

### Bubbling cancellation

All `.map*` and `.flatMap*` methods take an extra parameter called `propagateCancel`, it enables the returned future `cancel` to bubble up cancellation to its depedencies:

```ts
// disabled by default: cancelling `future2` will not cancel `future`
const future2 = future.map((x) => x * 2)

// optin: cancelling `future2` will cancel `future`
const future2 = future.map((x) => x * 2, true)
```

This can be useful at call site:

```ts
const request = apiCall().map(parse, true)

request.cancel() // will run the cleanup effect in `apiCall`
```

## Cheatsheet

| Method                 | Input       | Function input | Function output | Returned value |
| ---------------------- | ----------- | -------------- | --------------- | -------------- |
| [`map`](#mapf)         | `Future(x)` | `x`            | `y`             | `Future(y)`    |
| [`flatMap`](#flatmapf) | `Future(x)` | `x`            | `Future(y)`     | `Future(y)`    |
