---
title: Dict
sidebar_label: Dict
---

```ts
import { Dict } from "@bloodyowl/boxed"
```

## Dict.entries(dict)

Returns the entries in the dict.

Contrary to the TS bindings for `Object.entries`, the types are refined.

```ts title="Examples"
const index = Dict.entries({ foo: 1, bar: 2, baz: 3 })
// [["foo", 1], ["bar", 2], ["baz", 3]];
```

## Dict.fromEntries(entries)

Returns a dict from the provided `[key, value]` pairs.

```ts title="Examples"
const dict = Dict.fromEntries([
  ["foo", 1],
  ["bar", 2],
  ["baz", 3],
])
// { foo: 1, bar: 2, baz: 3 };
```

## Dict.keys(dict)

Returns the keys in the dict.

Contrary to the TS bindings for `Object.keys`, the types are refined.

```ts title="Examples"
const index = Dict.keys({ foo: 1, bar: 2, baz: 3 })
// ["foo", "bar", "baz"];
```

## Dict.values(dict)

Returns the values in the dict.

Contrary to the TS bindings for `Object.values`, the types are refined.

```ts title="Examples"
const index = Dict.values({ foo: 1, bar: 2, baz: 3 })
// [1, 2, 3];
```

## Dict.fromOptional(dictOfOptions)

Takes a dict whose values are `Option<unknown>` and returns a dict containing only the values contained in `Some`.

```ts title="Examples"
Dict.fromOptional({
  foo: Option.Some(1),
  bar: Option.None(),
  baz: Option.None(),
})
// {foo: 1}

Dict.fromOptional({
  foo: Option.Some(1),
  bar: Option.Some(2),
  baz: Option.None(),
})
// {foo: 1, bar: 2}

Dict.fromOptional({
  foo: Option.None(),
  bar: Option.None(),
  baz: Option.None(),
})
// {}
```
