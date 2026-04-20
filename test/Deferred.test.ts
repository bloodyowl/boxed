import { expect, test } from "bun:test"
import { Deferred } from "../src/Deferred"

test("Deferred", async () => {
  const [future, resolve] = Deferred.make()

  future.onResolve((n) => {
    expect(n).toEqual(1)
  })

  resolve(1)

  await future
})
