import { expect, test } from "bun:test"
import {
  binarySearchBy,
  filterMap,
  find,
  findIndex,
  findMap,
  from,
  isArray,
  of,
  unzip,
  zip,
} from "../src/Array"
import { Option } from "../src/OptionResult"

test("Array.filterMap", () => {
  expect(
    filterMap([1, 2, 3, 4], (a: number) =>
      Option.fromNullable(a % 2 === 0 ? a * 2 : null),
    ),
  ).toEqual([4, 8])

  expect(
    filterMap([1, 2, 3, 4], (a: number) =>
      Option.fromNullable(a % 2 === 0 ? a * 2 : undefined),
    ),
  ).toEqual([4, 8])

  expect(
    filterMap([1, 2, 3, 4, undefined, null], (a) =>
      Option.fromNullable(a != null ? a : null),
    ),
  ).toEqual([1, 2, 3, 4])
})

test("Array.findMap", () => {
  expect(
    findMap([1, 2, 3, 4], (a: number) =>
      Option.fromNullable(a % 2 === 0 ? a * 2 : null),
    ),
  ).toEqual(Option.Some(4))

  expect(
    findMap([1, 2, 3, 4], (a: number) =>
      Option.fromNullable(a % 2 === 0 ? a * 2 : undefined),
    ),
  ).toEqual(Option.Some(4))

  expect(
    findMap([1, 2, 3, 4, undefined, null], (a) =>
      Option.fromNullable(a != null ? a : null),
    ),
  ).toEqual(Option.Some(1))

  expect(
    findMap(
      [
        () => Option.None(),
        () => Option.None(),
        () => Option.None(),
        () => Option.Some(1),
      ],
      (f) => f(),
    ),
  ).toEqual(Option.Some(1))
})

test("Array.find", () => {
  expect(find([1, undefined, 2], (a) => a === undefined)).toEqual(
    Option.Some(undefined),
  )

  expect(find([1, 2, 3], (a) => a > 4)).toEqual(Option.None())

  expect(find([1, undefined, 2], (a) => a === 1)).toEqual(Option.Some(1))

  expect(
    find([Option.Some(1), Option.None(), Option.Some(2)], (x) => x.isNone()),
  ).toEqual(Option.Some(Option.None()))
})

test("Array.findIndex", () => {
  expect(findIndex([1, undefined, 2], (a) => a === undefined)).toEqual(
    Option.Some(1),
  )

  expect(findIndex([1, undefined, 2], (a) => a === 1)).toEqual(Option.Some(0))

  expect(
    findIndex([Option.Some(1), Option.None(), Option.Some(2)], (x) =>
      x.isNone(),
    ),
  ).toEqual(Option.Some(1))
})

test("Array.binarySearchBy", () => {
  expect(binarySearchBy([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5)).toEqual(4)
  expect(binarySearchBy([1, 2, 3, 4, 6, 7, 8, 9, 10], 5)).toEqual(4)
  expect(binarySearchBy([], 2)).toEqual(-1)
})

test("Array.of", () => {
  expect(of(1, 2, 3)).toEqual([1, 2, 3])

  expect(from({ length: 3 }, (_, index) => index)).toEqual([0, 1, 2])

  expect(isArray([])).toEqual(true)
  expect(isArray({ length: 0 })).toEqual(false)
})

test("Array.zip", () => {
  expect(zip([1, 2, 3], ["one", "two", "three"])).toEqual([
    [1, "one"],
    [2, "two"],
    [3, "three"],
  ])
  expect(zip([1, 2], ["one", "two", "three"])).toEqual([
    [1, "one"],
    [2, "two"],
  ])
  expect(zip([1, 2, 3], ["one", "two"])).toEqual([
    [1, "one"],
    [2, "two"],
  ])
})

test("Array.unzip", () => {
  expect(
    unzip([
      [1, "one"],
      [2, "two"],
      [3, "three"],
    ]),
  ).toEqual([
    [1, 2, 3],
    ["one", "two", "three"],
  ])
})
