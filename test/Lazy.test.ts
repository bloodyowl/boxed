import { expect, test } from "bun:test"
import { Lazy } from "../src/Lazy"

test("Lazy doesn't compute until access", () => {
  const lazy = Lazy(() => {
    expect(true).toBe(false)
  })
  expect(lazy).toBeDefined()
})

test("Lazy computes on access", () => {
  const lazy = Lazy(() => {
    return 1
  })
  expect(lazy.get()).toBe(1)
})

test("Lazy computes only once", () => {
  let count = 0
  const lazy = Lazy(() => {
    return ++count
  })
  expect(lazy.get()).toBe(1)
  expect(lazy.get()).toBe(1)
  expect(lazy.get()).toBe(1)
})
