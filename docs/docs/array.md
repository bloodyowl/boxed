---
title: Array
sidebar_label: Array
---

```ts
import { Array } from "@bloodyowl/boxed";
```

## Array.filterMap(array, func)

Returns an array containing the `Option.Some` values returned by `func` for each array item.

This function can be useful to refine the types of an array.

```ts title="Examples"
Array.filterMap([1, 2, 3], (x) => (isEven(x) ? Option.Some(x) : Option.None())); // [2]
```

## Array.findMap(array, func)

Returns the first `Option.Some` value returned by `func` for each array item.

```ts title="Examples"
Array.findMap([1, 2, 3], (x) => (isEven(x) ? Option.Some(x) : Option.None())); // Option.Some(2)
```

## Array.find(array, predicate)

Return the first item in the array for which `predicate` returns true.

The function returns an `Option` so that we can distinguish between a found nullish value and a not found value.

```ts title="Examples"
Array.find(array, (x) => x === undefined);
// Some(undefined) if found
// None if not found
```

## Array.findIndex(array, predicate)

Return the first index in the array for which `predicate` returns true.

The function returns an `Option`.

```ts title="Examples"
Array.findIndex(array, (x) => x === undefined);
// Some(index) if found
// None if not found
```

## Array.binarySearchBy(sortedArray, item, compare)

Performs a binary search on the array.

Returns the index of the item if there's an exact match, return the index of the first superior value if not. Return `-1` if the array is empty.

```ts title="Examples"
const index = Array.binarySearchBy(array, "my value");
```

## Array.zip(arrayA, arrayB)

Create an array of pairs from two arrays.

```ts title="Examples"
Array.zip([1, 2, 3], ["one", "two", "three"]);
// [[1, "one"], [2, "two"], [3, "three"]]
```

## Array.unzip(arrayOfPairs)

Turns an array of pairs into two arrays.

```ts title="Examples"
Array.unzip([
  [1, "one"],
  [2, "two"],
  [3, "three"],
]);
// [[1, 2, 3], ["one", "two", "three"]]
```

## Array.from(arrayLike)

[Array.from](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Array/from), reexported for convenience when Boxed `Array` shadows the `Array` constructor in scope.

```ts title="Examples"
Array.from({ length: 3 }, (_, key) => key); // [0, 1, 2]
```

## Array.of(...items)

[Array.of](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/of), reexported for convenience when Boxed `Array` shadows the `Array` constructor in scope.

```ts title="Examples"
Array.of(1, 2, 3); // [1, 2, 3]
```

## Array.isArray(value)

[Array.isArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray), reexported for convenience when Boxed `Array` shadows the `Array` constructor in scope.

```ts title="Examples"
Array.isArray("");
// false

Array.isArray([1, 2, 3]);
// true
```
