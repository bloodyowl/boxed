import { expect, test } from "bun:test"
import { entries, fromOptional, keys, values } from "../src/Dict"
import { Option } from "../src/OptionResult"

test("Dict.entries", () => {
  expect(entries({ foo: 1, bar: 2 })).toEqual([
    ["foo", 1],
    ["bar", 2],
  ])
})

test("Dict.keys", () => {
  expect(keys({ foo: 1, bar: 2 })).toEqual(["foo", "bar"])
})

test("Dict.values", () => {
  expect(values({ foo: 1, bar: 2 })).toEqual([1, 2])
})

test("Dict.fromOptional", () => {
  expect(fromOptional({})).toEqual({})
  expect(
    fromOptional({
      a: Option.Some(1),
      b: Option.Some(2),
      c: Option.Some(3),
    }),
  ).toEqual({ a: 1, b: 2, c: 3 })
  expect(
    fromOptional({
      a: Option.None(),
      b: Option.Some(2),
      c: Option.Some(3),
    }),
  ).toEqual({ b: 2, c: 3 })
  expect(
    fromOptional({
      a: Option.Some(1),
      b: Option.None(),
      c: Option.Some(3),
    }),
  ).toEqual({ a: 1, c: 3 })
  expect(
    fromOptional({
      a: Option.None(),
      b: Option.None(),
      c: Option.None(),
    }),
  ).toEqual({})
})
