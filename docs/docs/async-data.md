---
title: AsyncData<Value>
sidebar_label: AsyncData
---

The `AsyncData` type enables representing asynchronous flows (e.g. requests). The type represents the state as a discriminating union, avoiding manual management for loading flows.

`AsyncData` can have three possible states:

- `NotAsked`
- `Loading`
- `Done(value)`

## Create an AsyncData value

To create an async data, use the `NotAsked`, `Loading` and `Done` constructors:

```ts title="Examples"
import { AsyncData } from "@bloodyowl/boxed";

const notAsked = AsyncData.NotAsked();

const loading = AsyncData.Loading();

const done = AsyncData.Done(1);
```

:::tip Since v3.0.0
`AsyncData` values are referentially equal if they contain the same value, meaning that `AsyncData.Done(1) === AsyncData.Done(1)`.
:::

## Methods

The async data type provides a few manipulation functions:

### .map(f)

```ts
AsyncData<A>.map<B>(f: (value: A) => B): AsyncData<B>
```

If the asyncData is `Done(value)` returns `Done(f(value))`, otherwise returns the async data.

```ts title="Examples"
AsyncData.Done(2).map((x) => x * 2);
// AsyncData.Done<4>

AsyncData.Loading().map((x) => x * 2);
// AsyncData.Loading

AsyncData.NotAsked().map((x) => x * 2);
// AsyncData.NotAsked
```

### .flatMap(f)

```ts
AsyncData<A>.flatMap<B>(f: (value: A) => AsyncData<B>): AsyncData<B>
```

If the asyncData is `Done(value)` returns `f(value)`, otherwise returns the async data.

```ts title="Examples"
AsyncData.Done(3).flatMap((x) =>
  x > 2 ? AsyncData.NotAsked() : AsyncData.Done(2),
);
// AsyncData.NotAsked

AsyncData.Done(1).flatMap((x) =>
  x > 2 ? AsyncData.NotAsked() : AsyncData.Done(2),
);
// AsyncData.Done<2>

AsyncData.NotAsked().flatMap((x) =>
  x > 2 ? AsyncData.NotAsked() : AsyncData.Done(2),
);
// AsyncData.NotAsked

AsyncData.Loading().flatMap((x) =>
  x > 2 ? AsyncData.NotAsked() : AsyncData.Done(2),
);
// AsyncData.Loading
```

### .getOr(defaultValue)

> Alias: `getWithDefault`

```ts
AsyncData<A>.getOr(defaultValue: A): A
```

If the async data is `Done(value)` returns `value`, otherwise returns `defaultValue`.

```ts title="Examples"
AsyncData.Done(2).getOr(1);
// 2

AsyncData.Loading().getOr(1);
// 1

AsyncData.NotAsked().getOr(1);
// 1
```

### .mapOr(defaultValue, mapper)

```ts
AsyncData<A>.mapOr(defaultValue: B, mapper: (a: A) => B): B
```

If the option is `Done(value)` returns `mapper(value)`, otherwise returns `defaultValue`.

```ts title="Examples"
AsyncData.Done(2).mapOr(1, (x) => x * 2);
// 4

AsyncData.NotAsked().mapOr(1, (x) => x * 2);
// 1

AsyncData.Loading().mapOr(1, (x) => x * 2);
// 1
```

### .get()

```ts
AsyncData<A>.get(): A
```

Returns the value contained in `Done(value)`. Only usable within a `isDone()` check.

```ts title="Examples"
const value = asyncData.get();
// does not compile

if (asyncData.isDone()) {
  const value = asyncData.get();
  // value
}
```

### .isDone()

```ts
AsyncData<A>.isDone(): boolean
```

Type guard. Checks if the option is `Done(value)`

```ts title="Examples"
AsyncData.Done(2).isDone();
// true

AsyncData.Loading().isDone();
// false

AsyncData.NotAsked().isDone();
// false

if (asyncData.isDone()) {
  const value = asyncData.get();
}
```

### .isLoading()

```ts
AsyncData<A>.isLoading(): boolean
```

Type guard. Checks if the option is `Loading`

```ts title="Examples"
AsyncData.Done(2).isLoading();
// false

AsyncData.Loading().isLoading();
// true

AsyncData.NotAsked().isLoading();
// false
```

### .isNotAsked()

```ts
AsyncData<A>.isNotAsked(): boolean
```

Type guard. Checks if the option is `NotAsked`

```ts title="Examples"
AsyncData.Done(2).isNotAsked();
// false

AsyncData.Loading().isNotAsked();
// false

AsyncData.NotAsked().isNotAsked();
// true
```

### .toOption()

```ts
AsyncData<A>.toOption(): Option<A>
```

If the result is `Done(value)` returns `Some(value)`, otherwise returns `None`.

```ts title="Examples"
Result.Done(2).toOption();
// Option.Some<2>

Result.Loading().toOption();
// Option.None

Result.NotAsked().toOption();
// Option.None
```

### .match()

```ts
AsyncData<A>.match<B>(config: {
  Done: (value: A) => B;
  Loading: () => B;
  NotAsked: () => B;
}): B;
```

Match the async data state

```ts title="Examples"
const valueToDisplay = result.match({
  Done: (value) => value,
  Loading: () => "Loading ...",
  NotAsked: () => "",
});
```

### .tap(func)

```ts
AsyncData<A>.tap(func: (asyncData: AsyncData<A>) => unknown): AsyncData<A>
```

Executes `func` with `asyncData`, and returns `asyncData`. Useful for logging and debugging.

```ts title="Examples"
asyncData.tap(console.log).map((x) => x * 2);
```

## Statics

### AsyncData.isAsyncData(value)

```ts
isAsyncData(value: unknown): boolean
```

Type guard, checks if the provided value is an asyncData.

```ts title="Examples"
AsyncData.isAsyncData(AsyncData.Done(1));
// true

AsyncData.isAsyncData([]);
// false
```

### AsyncData.all(asyncDatas)

```ts
all(asyncDatas: Array<AsyncData<A>>): AsyncData<Array<A>>
```

Turns an "array of asyncDatas of value" into a "asyncData of array of value".

```ts title="Examples"
AsyncData.all([AsyncData.Done(1), AsyncData.Done(2), AsyncData.Done(3)]);
// AsyncData.Done<[1, 2, 3]>

AsyncData.all([Result.NotAsked(), AsyncData.Done(2), AsyncData.Done(3)]);
// AsyncData.NotAsked

AsyncData.all([Result.Loading(), AsyncData.Done(2), AsyncData.Done(3)]);
// AsyncData.Loading
```

### AsyncData.allFromDict(asyncDatas)

```ts
allFromDict(asyncDatas: Dict<AsyncData<A>>): AsyncData<Dict<A>>
```

Turns a "dict of asyncDatas of value" into a "asyncData of dict of value".

```ts title="Examples"
AsyncData.allFromDict({
  a: AsyncData.Done(1),
  b: AsyncData.Done(2),
  c: AsyncData.Done(3),
});
// AsyncData.Done<{a: 1, b: 2, c: 3}>

AsyncData.allFromDict({
  a: Result.NotAsked(),
  b: AsyncData.Done(2),
  c: AsyncData.Done(3),
});
// AsyncData.NotAsked

AsyncData.allFromDict({
  a: Result.Loading(),
  b: AsyncData.Done(2),
  c: AsyncData.Done(3),
});
// AsyncData.Loading
```

## TS Pattern interop

```ts title="Examples"
import { match, P } from "ts-pattern";
import { AsyncData } from "@bloodyowl/boxed";

match(asyncData)
  .with(AsyncData.P.Done(P.select()), (value) => console.log(value))
  .with(AsyncData.P.Loading, () => "Loading ...")
  .with(AsyncData.P.NotAsked, () => "")
  .exhaustive();
```

## Cheatsheet

| Method                 | Input        | Function input | Function output | Returned value |
| ---------------------- | ------------ | -------------- | --------------- | -------------- |
| [`map`](#mapf)         | `Done(x)`    | `x`            | `y`             | `Done(y)`      |
| [`map`](#mapf)         | `Loading()`  | _not provided_ | _not executed_  | `Loading()`    |
| [`map`](#mapf)         | `NotAsked()` | _not provided_ | _not executed_  | `NotAsked()`   |
| [`flatMap`](#flatmapf) | `Done(x)`    | `x`            | `Done(y)`       | `Done(y)`      |
| [`flatMap`](#flatmapf) | `Done(x)`    | `x`            | `Loading()`     | `Loading()`    |
| [`flatMap`](#flatmapf) | `Done(x)`    | `x`            | `NotAsked()`    | `NotAsked()`   |
| [`flatMap`](#flatmapf) | `Loading()`  | _not provided_ | _not executed_  | `Loading()`    |
| [`flatMap`](#flatmapf) | `NotAsked()` | _not provided_ | _not executed_  | `NotAsked()`   |
