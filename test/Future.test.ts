import { expect, test } from "bun:test"
import { Future } from "../src/Future"
import { Result } from "../src/OptionResult"

const isCancelled = <A>(future: Future<A>) =>
  // @ts-expect-error - Access to a protected property
  future._state.tag === "Cancelled"

test("Future make value", async () => {
  const value = await Future.value(1)
  expect(value).toBe(1)
})

test("Future sync chaning", async () => {
  const value = await Future.value("one").map((s) => `${s}!`)
  expect(value).toBe("one!")
})

test("Future async chaning", async () => {
  const value = await Future.make((resolve) => {
    setTimeout(() => resolve(20), 25)
  })
    .map(String)
    .map((s) => `${s}!`)
  expect(value).toBe("20!")
})

test("Future tap", async () => {
  let value = 0
  const result = await Future.value(99)
    .tap((x) => {
      value = x + 1
    })
    .map((x) => x - 9)
  expect(value).toBe(100)
  expect(result).toBe(90)
})

test("Future flatMap", async () => {
  const result = await Future.value(59).flatMap((x) => Future.value(x + 1))
  expect(result).toBe(60)
})

test("Future multiple onResolve", async () => {
  let count = 0
  const future = Future.make<number>((resolve) => {
    count++
    resolve(count)
  })

  const result = await future

  future.onResolve(() => {})
  future.onResolve(() => {})

  expect(result).toBe(1)
})

test("Future all", async () => {
  const result = await Future.all([
    Future.value(1),
    Future.make((resolve) => {
      setTimeout(() => resolve(2), 50)
    }),
    Future.make((resolve) => {
      setTimeout(() => resolve(3), 25)
    }),
    Future.make((resolve) => {
      setTimeout(() => resolve(undefined), 75)
    }).map(() => 4),
  ])

  expect(result).toEqual([1, 2, 3, 4])
})

test("Future allFromDict", async () => {
  const result = await Future.allFromDict({
    a: Future.value(1),
    b: Future.make((resolve) => {
      setTimeout(() => resolve(2), 50)
    }),
    c: Future.make((resolve) => {
      setTimeout(() => resolve(3), 25)
    }),
    d: Future.make((resolve) => {
      setTimeout(() => resolve(undefined), 75)
    }).map(() => 4),
  })

  expect(result).toEqual({ a: 1, b: 2, c: 3, d: 4 })
})

test("Future mapOk", async () => {
  const result = await Future.value(Result.Ok("one")).mapOk((x) => `${x}!`)
  expect(result).toEqual(Result.Ok("one!"))
})

test("Future mapOk error", async () => {
  const result = await Future.value(Result.Error("one")).mapOk((x) => `${x}!`)
  expect(result).toEqual(Result.Error("one"))
})

test("Future mapError", async () => {
  const result = await Future.value(Result.Error("one")).mapError(
    (x) => `${x}!`,
  )
  expect(result).toEqual(Result.Error("one!"))
})

test("Future mapError ok", async () => {
  const result = await Future.value(Result.Ok("one")).mapError((x) => `${x}!`)
  expect(result).toEqual(Result.Ok("one"))
})

test("Future mapOkToResult", async () => {
  const result = await Future.value(Result.Ok("one")).mapOkToResult((x) =>
    Result.Ok(`${x}!`),
  )
  expect(result).toEqual(Result.Ok("one!"))
})

test("Future mapOkToResult error", async () => {
  const result = await Future.value(Result.Error("one")).mapOkToResult((x) =>
    Result.Ok(`${x}!`),
  )
  expect(result).toEqual(Result.Error("one"))
})

test("Future mapErrorToResult", async () => {
  const result = await Future.value(Result.Error("one")).mapErrorToResult((x) =>
    Result.Error(`${x}!`),
  )
  expect(result).toEqual(Result.Error("one!"))
})

test("Future mapErrorToResult ok", async () => {
  const result = await Future.value(Result.Ok("one")).mapErrorToResult((x) =>
    Result.Error(`${x}!`),
  )
  expect(result).toEqual(Result.Ok("one"))
})

test("Future flatMapOk", async () => {
  const result = await Future.value(Result.Ok("one")).flatMapOk((x) =>
    Future.value(Result.Ok(`${x}!`)),
  )
  expect(result).toEqual(Result.Ok("one!"))
})

test("Future flatMapOk error", async () => {
  const result = await Future.value(Result.Error("one")).flatMapOk((x) =>
    Future.value(Result.Ok(`${x}!`)),
  )
  expect(result).toEqual(Result.Error("one"))
})

test("Future flatMapError", async () => {
  const result = await Future.value(Result.Error("one")).flatMapError((x) =>
    Future.value(Result.Error(`${x}!`)),
  )
  expect(result).toEqual(Result.Error("one!"))
})

test("Future flatMapError ok", async () => {
  const result = await Future.value(Result.Ok("one")).flatMapError((x) =>
    Future.value(Result.Ok(`${x}!`)),
  )
  expect(result).toEqual(Result.Ok("one"))
})

test("Future tapOk", async () => {
  let value = 0
  const result = await Future.value(Result.Ok(99))
    .tapOk((x) => {
      value = x + 1
    })
    .mapOk((x) => x - 9)
  expect(value).toBe(100)
  expect(result).toEqual(Result.Ok(90))
})

test("Future tapOk error", async () => {
  let value = 0
  const result = await Future.value(Result.Error<number, number>(99))
    .tapOk((x) => {
      value = x + 1
    })
    .mapOk((x) => x - 9)
  expect(value).toBe(0)
  expect(result).toEqual(Result.Error(99))
})

test("Future tapError", async () => {
  let value = 0
  const result = await Future.value(Result.Error(99))
    .tapError((x) => {
      value = x + 1
    })
    .mapError((x) => x - 9)
  expect(value).toBe(100)
  expect(result).toEqual(Result.Error(90))
})

test("Future tapError ok", async () => {
  let value = 0
  const result = await Future.value(Result.Ok<number, number>(99))
    .tapError((x) => {
      value = x + 1
    })
    .mapError((x) => x - 9)
  expect(value).toBe(0)
  expect(result).toEqual(Result.Ok(99))
})

test("Future cancels and runs cancel effect", async () => {
  let effect = 0
  let counter = 0
  const future = Future.make((resolve) => {
    const timeoutId = setTimeout(() => {
      counter++
      resolve(1)
    }, 100)
    return () => {
      clearTimeout(timeoutId)
      effect++
    }
  })
  future.cancel()
  expect(isCancelled(future)).toBe(true)
  expect(counter).toBe(0)
  expect(effect).toBe(1)
})

test("Future cancels", async () => {
  let counter = 0
  const future = Future.make<number>((resolve) => {
    const timeoutId = setTimeout(() => {
      counter++
      resolve(1)
    }, 100)
    return () => {
      clearTimeout(timeoutId)
    }
  })
  const future2 = future.map((item) => item + 1)
  future2.cancel()
  expect(isCancelled(future)).toBe(false)
  expect(isCancelled(future2)).toBe(true)
  await future
  expect(counter).toBe(1)
})

test("Future doesn't cancel futures returned by flatMap", async () => {
  let counter = 0
  let secondCounter = 0
  const future = Future.make<number>((resolve) => {
    const timeoutId = setTimeout(() => {
      counter++
      resolve(1)
    }, 10)
    return () => {
      clearTimeout(timeoutId)
    }
  })
  const future2 = Future.make<number>((resolve) => {
    const timeoutId = setTimeout(() => {
      secondCounter++
      resolve(1)
    }, 10)
    return () => {
      clearTimeout(timeoutId)
    }
  })
  const future3 = future.flatMap(() => future2)
  const future4 = future.map((item) => item + 1)

  future4.cancel()
  expect(isCancelled(future)).toBe(false)
  expect(isCancelled(future2)).toBe(false)
  expect(isCancelled(future3)).toBe(false)
  expect(isCancelled(future4)).toBe(true)
  await Future.all([future, future2])
  expect(counter).toBe(1)
  expect(secondCounter).toBe(1)
})

test("Future cancels to the top if specified", async () => {
  let counter = 0
  let secondCounter = 0
  let effect = 0
  const future = Future.make<number>((resolve) => {
    const timeoutId = setTimeout(() => {
      counter++
      resolve(1)
    }, 10)
    return () => {
      effect++
      clearTimeout(timeoutId)
    }
  })
  const future2 = Future.make<number>((resolve) => {
    const timeoutId = setTimeout(() => {
      secondCounter++
      resolve(1)
    }, 10)
    return () => {
      clearTimeout(timeoutId)
    }
  })
  const future3 = future.flatMap(() => future2, true)
  const future4 = future.map((item) => item + 1, true)

  future4.cancel()
  expect(isCancelled(future)).toBe(true)
  expect(isCancelled(future2)).toBe(false)
  expect(isCancelled(future3)).toBe(true)
  expect(isCancelled(future4)).toBe(true)
  await future2
  expect(counter).toBe(0)
  expect(effect).toBe(1)
  expect(secondCounter).toBe(1)
})

test("Future cancels promise and runs cancel effect up the dependents", async () => {
  let counter = 0
  const future = Future.make<number>((resolve) => {
    const timeoutId = setTimeout(() => {
      counter++
      resolve(1)
    }, 10)
    return () => {
      clearTimeout(timeoutId)
    }
  })

  const future2 = future.map((item) => item + 1)

  future.cancel()
  expect(isCancelled(future)).toBe(true)
  expect(isCancelled(future2)).toBe(true)

  expect(counter).toBe(0)
})

test("Future doesn't consider flatMap returned as dependents", async () => {
  let counter = 0
  let secondCounter = 0
  const future = Future.make<number>((resolve) => {
    const timeoutId = setTimeout(() => {
      counter++
      resolve(1)
    }, 10)
    return () => {
      clearTimeout(timeoutId)
    }
  })

  const future2 = Future.make<number>((resolve) => {
    const timeoutId = setTimeout(() => {
      secondCounter++
      resolve(1)
    }, 10)
    return () => {
      clearTimeout(timeoutId)
    }
  })

  const future3 = future.flatMap(() => future2)
  const future4 = future.map((item) => item + 1)

  future.cancel()
  expect(isCancelled(future)).toBe(true)
  expect(isCancelled(future2)).toBe(false)
  expect(isCancelled(future3)).toBe(true)
  expect(isCancelled(future4)).toBe(true)

  await future2
  expect(counter).toBe(0)
  expect(secondCounter).toBe(1)
})

test("Future fromPromise", async () => {
  const value = await Future.fromPromise(Promise.resolve("one")).mapOk(
    (value) => `${value}!`,
  )
  expect(value).toEqual(Result.Ok("one!"))
})

test("Future fromPromise", async () => {
  const value = await Future.fromPromise(Promise.reject("one")).mapError(
    (value) => `${value}!`,
  )
  expect(value).toEqual(Result.Error("one!"))
})

test("Future toPromise", async () => {
  const value = await Future.value(1).toPromise()
  expect(value).toEqual(1)
})

test("Future resultToPromise", async () => {
  const value = await Future.value(Result.Ok(1)).resultToPromise()
  expect(value).toEqual(1)
})

test("Future resultToPromise", async () => {
  try {
    await Future.value(Result.Error(1)).resultToPromise()
    expect(false).toBe(true)
  } catch (err) {
    expect(err).toEqual(1)
  }
})

test("Future isFuture", async () => {
  expect(Future.isFuture(Future.value(1))).toEqual(true)
  expect(Future.isFuture(Promise.resolve(1))).toEqual(false)
  expect(Future.isFuture(1)).toEqual(false)
  expect(Future.isFuture([])).toEqual(false)
  expect(Future.isFuture({})).toEqual(false)
})

test("Future doesn't hang", async () => {
  const future = Future.make((resolve) => {
    setTimeout(() => resolve(0), 10)
  })
  return future
    .flatMap(() => Future.value(1))
    .flatMap(() => future.flatMap(() => Future.value(2)))
    .tap((value) => expect(value).toEqual(2))
})

test("Future concurrent", async () => {
  let parallel = 0

  const result = await Future.concurrent(
    [
      () =>
        Future.make<0>((resolve) => {
          expect(++parallel).toBeLessThanOrEqual(2)
          setTimeout(() => resolve(0), 100)
        }).tap(() => {
          --parallel
        }),
      () =>
        Future.make<1>((resolve) => {
          expect(++parallel).toBeLessThanOrEqual(2)
          resolve(1)
        }).tap(() => {
          --parallel
        }),
      () =>
        Future.make<2>((resolve) => {
          expect(++parallel).toBeLessThanOrEqual(2)
          setTimeout(() => resolve(2), 50)
        }).tap(() => {
          --parallel
        }),
      () =>
        Future.make<3>((resolve) => {
          expect(++parallel).toBeLessThanOrEqual(2)
          setTimeout(() => resolve(3), 25)
        }).tap(() => {
          --parallel
        }),
      () =>
        Future.make((resolve) => {
          expect(++parallel).toBeLessThanOrEqual(2)
          setTimeout(() => resolve(undefined), 75)
        })
          .map(() => 4)
          .tap(() => {
            --parallel
          }),
    ],
    { concurrency: 2 },
  )

  expect(result).toEqual([0, 1, 2, 3, 4])

  const empty = await Future.concurrent([], { concurrency: 1 })
  expect(empty).toEqual([])
})

test("Future try", async () => {
  let attempts = 0
  const value = await Future.retry(
    (attempt) => {
      if (++attempts === 5) {
        return Future.value<Result<number, number>>(Result.Ok(attempt))
      } else {
        return Future.make<Result<number, number>>((resolve) => {
          setTimeout(() => resolve(Result.Error(1)))
        })
      }
    },
    { max: 6 },
  )

  expect(attempts).toBe(5)
  expect(value).toEqual(Result.Ok(4))
})

test("Future try on last", async () => {
  let attempts = 0
  const value = await Future.retry(
    (attempt) => {
      if (++attempts === 5) {
        return Future.value<Result<number, number>>(Result.Ok(attempt))
      } else {
        return Future.make<Result<number, number>>((resolve) => {
          setTimeout(() => resolve(Result.Error(1)))
        })
      }
    },
    { max: 5 },
  )

  expect(attempts).toBe(5)
  expect(value).toEqual(Result.Ok(4))
})

test("Future try on last", async () => {
  let attempts = 0
  const value = await Future.retry(
    (attempt) => {
      if (++attempts === 5) {
        return Future.value<Result<number, number>>(Result.Ok(attempt))
      } else {
        return Future.make<Result<number, number>>((resolve) => {
          setTimeout(() => resolve(Result.Error(1)))
        })
      }
    },
    { max: 4 },
  )

  expect(attempts).toBe(4)
  expect(value).toEqual(Result.Error(1))
})
