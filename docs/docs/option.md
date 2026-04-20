---
title: Option<Value>
sidebar_label: Option
---

The `Option` type can be used as a replacement for `null` and `undefined` when manipulating optional data. Contrary to `null` and `undefined`, an option is kind of like a box, that contains a value or not.

It can be useful to distinguish values between each other: you can represent `Some(None)` with options, whereas `undefined` or `null` replace the value they intend to make optional.

An option can have two possible states:

- `Some(value)`
- `None`

## Create an Option value

To create an option, use the `Some` and `None` constructors:

```ts
import { Option } from "@bloodyowl/boxed"

const aName = Option.Some("John")
const bName = Option.None()

// You can enforce the type using a type parameter
Option.Some<string>("John")
Option.None<string>()
```

You get interop with `null` and `undefined`:

```ts
// `value` being `null` or `undefined` makes a `None`
const a = Option.fromNullable(value)

// `value` being `null` makes a `None`
const b = Option.fromNull(value)

// `value` being `undefined` makes a `None`
const c = Option.fromUndefined(value)
```

:::tip Since v3.0.0
`Option` values are referentially equal if they contain the same value, meaning that `Option.Some(1) === Option.Some(1)`.
:::

## Methods

The option type provides a few manipulation functions:

### .map(f)

```ts
Option<A>.map<B>(f: (value: A) => B): Option<B>
```

If the option is `Some(value)` returns `Some(f(value))`, otherwise returns `None`.

```ts title="Examples"
Option.Some(2).map((x) => x * 2)
// Option.Some<4>

Option.None().map((x) => x * 2)
// Option.None
```

### .flatMap(f)

```ts
Option<A>.flatMap<B>(f: (value: A) => Option<B>): Option<B>
```

If the option is `Some(value)` returns `f(value)`, otherwise returns `None`.

```ts title="Examples"
Option.Some(3).flatMap((x) => (x > 2 ? Option.None() : Option.Some(2)))
// Option.None

Option.Some(1).flatMap((x) => (x > 2 ? Option.None() : Option.Some(2)))
// Option.Some<2>

option.flatMap((value) => value.optionalProperty)
// Option<optionalProperty>
```

### .filter(f)

```ts
Option<A>.filter(f: (value: A) => boolean): Option<A>
```

If the option is `Some(value)` and that `f(value)` is `true`, returns `Some(value)`, otherwise returns `None`.

```ts title="Examples"
Option.Some(3).filter((x) => x > 2)
// Option.Some(3)

Option.Some(1).filter((x) => x > 2)
// Option.None
```

### .getOr(defaultValue)

> Alias: `getWithDefault`

```ts
Option<A>.getOr(defaultValue: A): A
```

If the option is `Some(value)` returns `value`, otherwise returns `defaultValue`.

```ts title="Examples"
Option.Some(2).getOr(1)
// 2

Option.None().getOr(1)
// 1
```

### .mapOr(defaultValue, mapper)

```ts
Option<A>.mapOr(defaultValue: B, mapper: (a: A) => B): B
```

If the option is `Some(value)` returns `mapper(value)`, otherwise returns `defaultValue`.

```ts title="Examples"
Option.Some(2).mapOr(1, (x) => x * 2)
// 4

Option.None().mapOr(1, (x) => x * 2)
// 1
```

### .orElse(option)

```ts
Option<A>.orElse(fallback: Option<A>): Option<A>
```

If the option is `Some(value)` return it, otherwise return the fallback value.

```ts title="Examples"
Option.Some(2).orElse(Option.Some(3))
// Some<2>

Option.Some(2).orElse(Option.None())
// Some<2>

Option.None().orElse(Option.Some(3))
// Some<3>

Option.None().orElse(Option.None())
// None
```

### .get()

```ts
Option<A>.get(): A
```

Returns the value contained in `Some(value)`. Only usable within a `isSome()` check.

```ts title="Examples"
const value = option.get()
// does not compile

if (option.isSome()) {
  const value = option.get()
  // value
}
```

### .isSome()

```ts
Option<A>.isSome(): boolean
```

Type guard. Checks if the option is `Some(value)`

```ts title="Examples"
Option.Some(2).isSome()
// true

Option.None().isSome()
// false

if (option.isSome()) {
  const value = option.get()
}
```

### .isNone()

```ts
Option<A>.isNone(): boolean
```

Type guard. Checks if the option is `None`

```ts title="Examples"
Option.Some(2).isNone()
// false

Option.None().isNone()
// true
```

### .toNull()

```ts
Option<A>.toNull(): A | null
```

Returns `null` if the option is `None`, returns the value otherwise

```ts title="Examples"
Option.Some(2).toNull()
// 2

Option.None().toNull()
// null
```

### .toUndefined()

```ts
Option<A>.toUndefined(): A | undefined
```

Returns `undefined` if the option is `None`, returns the value otherwise

```ts title="Examples"
Option.Some(2).toUndefined()
// 2

Option.None().toUndefined()
// undefined
```

### .toResult(errorWhenNone)

```ts
Option<A>.toResult<E>(valueWhenNone: E): Result<A, E>
```

Returns `Ok` if the option is `Some`, returns `Error` otherwise

```ts title="Examples"
const a = Option.Some(1).toResult("NotFound")
// Ok<1>

const b = Option.None().toResult("NotFound")
// Error<"NotFound">
```

### .match()

```ts
Option<A>.match<B>(config: {
  Some: (value: A) => B;
  None: () => B;
}): B
```

Match the option state

```ts title="Examples"
const valueToDisplay = option.match({
  Some: (value) => value,
  None: () => "No value",
})
// value | "No value"
```

### .tap(func)

```ts
Option<A>.tap(func: (option: Option<A>) => unknown): Option<A>
```

Executes `func` with `option`, and returns `option`. Useful for logging and debugging.

```ts title="Examples"
option.tap(console.log).map((x) => x * 2)
```

### .tapSome(func)

```ts
Option<A>.tapSome(func: (option: A) => unknown): Option<A>
```

Executes `func` with `option`'s value if `Some`, and returns `option`. Useful for logging and debugging.

```ts title="Examples"
option.tapSome(console.log).map((x) => x * 2)
```

## Statics

### Option.fromNullable(value)

```ts
fromNullable(nullable: A | null | undefined): Option<A>
```

Creates an option from a nullable value, excluding `null` & `undefined`

```ts title="Examples"
Option.fromNullable(null)
// Option.None()

Option.fromNullable(undefined)
// Option.None()

Option.fromNullable(1)
// Option.Some(1)
```

### Option.fromNull(value)

```ts
fromNull(nullable: A | null): Option<A>
```

Creates an option from a nullable value, excluding `null`

```ts title="Examples"
Option.fromNull(null)
// Option.None()

Option.fromNull(undefined)
// Option.Some(undefined)

Option.fromNull(1)
// Option.Some(1)
```

### Option.fromUndefined(value)

```ts
fromUndefined(nullable: A | undefined): Option<A>
```

Creates an option from a nullable value, excluding `undefined`

```ts title="Examples"
Option.fromUndefined(null)
// Option.Some(null)

Option.fromUndefined(undefined)
// Option.None()

Option.fromUndefined(1)
// Option.Some(1)
```

### Option.fromPredicate(value, predicate)

```ts
fromPredicate(value: A, f: (value: A) => boolean): Option<A>
```

Creates an option from a value and a predicate. Will return `Some(value)` if predicate returns `true`, `None` if `false`

```ts title="Examples"
Option.fromPredicate(value, (value) => value % 2 === 0)
// Option<number> where `number` is even
```

### Option.isOption(value)

```ts
isOption(value: unknown): boolean
```

Type guard, checks if the provided value is an option.

```ts title="Examples"
Option.isOption(Option.Some(1))
// true

Option.isOption([])
// false
```

### Option.all(options)

```ts
all(options: Array<Option<A>>): Option<Array<A>>
```

Turns an "array of options of value" into a "option of array of value".

```ts title="Examples"
Option.all([Option.Some(1), Option.Some(2), Option.Some(3)])
// Some([1, 2, 3])

Option.all([Option.None(), Option.Some(2), Option.Some(3)])
// None
```

### Option.allFromDict(options)

```ts
allFromDict(options: Dict<Option<A>>): Option<Dict<A>>
```

Turns a "dict of options of value" into a "option of dict of value".

```ts title="Examples"
Option.allFromDict({ a: Option.Some(1), b: Option.Some(2), c: Option.Some(3) })
// Some({a: 1, b: 2, c: 3})

Option.allFromDict({ a: Option.None(), b: Option.Some(2), c: Option.Some(3) })
// None
```

## TS Pattern interop

```ts title="Examples"
import { match, P } from "ts-pattern"
import { Option } from "@bloodyowl/boxed"

match(myOption)
  .with(Option.P.Some(P.select()), (value) => console.log(value))
  .with(Option.P.None, () => "No value")
  .exhaustive()
```

## Cheatsheet

| Method                 | Input     | Function input | Function output | Returned value |
| ---------------------- | --------- | -------------- | --------------- | -------------- |
| [`map`](#mapf)         | `Some(x)` | `x`            | `y`             | `Some(y)`      |
| [`map`](#mapf)         | `None()`  | _not provided_ | _not executed_  | `None()`       |
| [`flatMap`](#flatmapf) | `Some(x)` | `x`            | `Some(y)`       | `Some(y)`      |
| [`flatMap`](#flatmapf) | `Some(x)` | `x`            | `None()`        | `None()`       |
| [`flatMap`](#flatmapf) | `None()`  | _not provided_ | _not executed_  | `None()`       |
