import { expect, test } from "bun:test"
import { AsyncData } from "../src/AsyncData"
import { Option, Result } from "../src/OptionResult"
import { decode, encode } from "../src/Serializer"

test("Serializer", () => {
  const start = {
    value: AsyncData.Done(
      Result.Ok(
        Result.Error({
          value: Option.Some(1),
          nothing: Option.None(),
          loading: AsyncData.Loading(),
          notAsked: AsyncData.NotAsked(),
          nullable: null,
          undefinable: undefined,
          string: "Hello",
          number: 1209,
          boolean: true,
          array: [1, 2, 3],
          object: { a: 1, b: "two" },
        }),
      ),
    ),
  }
  expect(encode(start)).toEqual(encode(start))
  expect(encode(start)).toContain("__boxed_type__")
  expect(decode(encode(start))).toEqual(start)
  expect(decode(encode(start)).value.map(() => "Hello")).toEqual(
    AsyncData.Done("Hello"),
  )
  expect(encode(null)).toEqual("null")
  expect(encode(undefined)).toEqual(undefined)
})
