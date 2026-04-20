---
title: Nested optional values
sidebar_label: Nested optional values
---

Managing optionality with `undefined` and `null` can lead to tedious code, especially when dealing with default values.

Let's assume that we have the following values in scope:

```ts
declare var input: string | undefined
declare function parseInput(input: string): Array<string>
declare function transform(input: Array<string>): Array<string> | undefined
declare function print(input: Array<string>): string
declare function prettify(input: string): string
```

Here, `parse` always returns an `Array<string>`, and `transform` can return either an `Array<string>` or `undefined`.

Handling this using `null` or `undefined` values would lead to code like the following:

```ts
const parsed = input != undefined ? parseInput(input) : undefined
// Keep the `parsed` value if `transform` doesn't output
const transformed =
  parsed != undefined ? (transform(parsed) ?? parsed) : undefined
// Fallback at the end
const printed = transformed != undefined ? print(transformed) : undefined
const value = printed != undefined ? prettify(printed) : "fallback"
```

We lose a lot of the code intent, as we're distracted with some unnecessary complexity.

Now, let's tweak our values so that we use the `Option` type instead of `undefined`:

```ts
declare var input: Option<string>
declare function parseInput(input: string): Array<string>
declare function transform(input: Array<string>): Option<Array<string>>
declare function print(input: Array<string>): string
declare function prettify(input: string): string
```

Using `Option`, the same code as above can be written as follows:

```ts
input
  .map(parseInput)
  .flatMap(transform)
  .map(print)
  .map(prettify)
  .getOr("fallback")
```

Here, the **intent** of the code is clearly represented, making it much easier to follow.

If we need quick interop with existing code returning `undefined` or `null` values, Boxed provides transformers:

If we were to assume again that we have:

```ts
declare var input: string | undefined
declare function parseInput(input: string): Array<string>
declare function transform(input: Array<string>): Array<string> | undefined
declare function print(input: Array<string>): string
declare function prettify(input: string): string
```

We'd simplfy need to write the following:

```ts
Option.fromNullable(input)
  .map(parseInput)
  .flatMap((input) => Option.fromNullable(transform(input)))
  .map(print)
  .map(prettify)
  .getOr("fallback")
```
