---
title: Design choices
sidebar_label: Design choices
---

## Chaining API

Most functional programming libraries in JavaScript provide a data-last API (`map(func)(value)`) along with a `pipe` function to chain operations.

While this approach works well in languages that include some kind of native pipe operator, we consider that it doesn't provide a good enough developer experience in your TypeScript code editor: it makes it tedious to inspect a value in a `pipe` chain and doesn't provide autocomplete natively.

For this reason, we decided to use good ol'chaining, reducing the number of imports, making your code more expressive, easier to read and inspect.

## Eager over lazy

More often than not, these functional programming libraries use lazy initialisation, meaning your code won't execute until you tell it to explicitely (e.g. with a `run` call at the end).

In the vast majority of cases we've seen, this is not something that's wanted. For the few cases where laziness is wanted, making a function that returns the data-structure or using a `Deferred` does the job pretty well.

```ts
const eagerFuture = Future.make((resolve) => resolve(1))

const lazyFuture = () => Future.make((resolve) => resolve(1))

const [deferred, resolve] = Deferred.make<number>()
```

## Naming

Rather than using naming from abstract theory, if a concept exists in JavaScript built-ins, Boxed will provide similar naming (e.g. we provide `Future.all` to mimic `Promise.all` rather than `Future.sequenceArray`).
