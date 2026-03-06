import { expect, test, afterEach } from "vitest";
import { Future } from "../src/Future";
import { Deferred } from "../src/Deferred";
import { Result } from "../src/OptionResult";

const isCancelled = <A>(future: Future<A>) =>
  // @ts-expect-error - Access to a protected property
  future._state.tag === "Cancelled";

const isPanicked = <A>(future: Future<A>) =>
  // @ts-expect-error - Access to a protected property
  future._state.tag === "Panicked";

const getPanicError = <A>(future: Future<A>) => {
  // @ts-expect-error - Access to a protected property
  if (future._state.tag === "Panicked") {
    // @ts-expect-error - Access to a protected property
    return future._state.error;
  }
  throw new Error("Future is not panicked");
};

test("Future make value", async () => {
  const value = await Future.value(1);
  expect(value).toBe(1);
});

test("Future sync chaning", async () => {
  const value = await Future.value("one").map((s) => `${s}!`);
  expect(value).toBe("one!");
});

test("Future async chaning", async () => {
  const value = await Future.make((resolve) => {
    setTimeout(() => resolve(20), 25);
  })
    .map(String)
    .map((s) => `${s}!`);
  expect(value).toBe("20!");
});

test("Future tap", async () => {
  let value = 0;
  const result = await Future.value(99)
    .tap((x) => {
      value = x + 1;
    })
    .map((x) => x - 9);
  expect(value).toBe(100);
  expect(result).toBe(90);
});

test("Future flatMap", async () => {
  const result = await Future.value(59).flatMap((x) => Future.value(x + 1));
  expect(result).toBe(60);
});

test("Future multiple onResolve", async () => {
  let count = 0;
  const future = Future.make<number>((resolve) => {
    count++;
    resolve(count);
  });

  const result = await future;

  future.onResolve(() => {});
  future.onResolve(() => {});

  expect(result).toBe(1);
});

test("Future all", async () => {
  const result = await Future.all([
    Future.value(1),
    Future.make((resolve) => {
      setTimeout(() => resolve(2), 50);
    }),
    Future.make((resolve) => {
      setTimeout(() => resolve(3), 25);
    }),
    Future.make((resolve) => {
      setTimeout(() => resolve(undefined), 75);
    }).map(() => 4),
  ]);

  expect(result).toEqual([1, 2, 3, 4]);
});

test("Future allFromDict", async () => {
  const result = await Future.allFromDict({
    a: Future.value(1),
    b: Future.make((resolve) => {
      setTimeout(() => resolve(2), 50);
    }),
    c: Future.make((resolve) => {
      setTimeout(() => resolve(3), 25);
    }),
    d: Future.make((resolve) => {
      setTimeout(() => resolve(undefined), 75);
    }).map(() => 4),
  });

  expect(result).toEqual({ a: 1, b: 2, c: 3, d: 4 });
});

test("Future mapOk", async () => {
  const result = await Future.value(Result.Ok("one")).mapOk((x) => `${x}!`);
  expect(result).toEqual(Result.Ok("one!"));
});

test("Future mapOk error", async () => {
  const result = await Future.value(Result.Error("one")).mapOk((x) => `${x}!`);
  expect(result).toEqual(Result.Error("one"));
});

test("Future mapError", async () => {
  const result = await Future.value(Result.Error("one")).mapError(
    (x) => `${x}!`,
  );
  expect(result).toEqual(Result.Error("one!"));
});

test("Future mapError ok", async () => {
  const result = await Future.value(Result.Ok("one")).mapError((x) => `${x}!`);
  expect(result).toEqual(Result.Ok("one"));
});

test("Future mapOkToResult", async () => {
  const result = await Future.value(Result.Ok("one")).mapOkToResult((x) =>
    Result.Ok(`${x}!`),
  );
  expect(result).toEqual(Result.Ok("one!"));
});

test("Future mapOkToResult error", async () => {
  const result = await Future.value(Result.Error("one")).mapOkToResult((x) =>
    Result.Ok(`${x}!`),
  );
  expect(result).toEqual(Result.Error("one"));
});

test("Future mapErrorToResult", async () => {
  const result = await Future.value(Result.Error("one")).mapErrorToResult((x) =>
    Result.Error(`${x}!`),
  );
  expect(result).toEqual(Result.Error("one!"));
});

test("Future mapErrorToResult ok", async () => {
  const result = await Future.value(Result.Ok("one")).mapErrorToResult((x) =>
    Result.Error(`${x}!`),
  );
  expect(result).toEqual(Result.Ok("one"));
});

test("Future flatMapOk", async () => {
  const result = await Future.value(Result.Ok("one")).flatMapOk((x) =>
    Future.value(Result.Ok(`${x}!`)),
  );
  expect(result).toEqual(Result.Ok("one!"));
});

test("Future flatMapOk error", async () => {
  const result = await Future.value(Result.Error("one")).flatMapOk((x) =>
    Future.value(Result.Ok(`${x}!`)),
  );
  expect(result).toEqual(Result.Error("one"));
});

test("Future flatMapError", async () => {
  const result = await Future.value(Result.Error("one")).flatMapError((x) =>
    Future.value(Result.Error(`${x}!`)),
  );
  expect(result).toEqual(Result.Error("one!"));
});

test("Future flatMapError ok", async () => {
  const result = await Future.value(Result.Ok("one")).flatMapError((x) =>
    Future.value(Result.Ok(`${x}!`)),
  );
  expect(result).toEqual(Result.Ok("one"));
});

test("Future tapOk", async () => {
  let value = 0;
  const result = await Future.value(Result.Ok(99))
    .tapOk((x) => {
      value = x + 1;
    })
    .mapOk((x) => x - 9);
  expect(value).toBe(100);
  expect(result).toEqual(Result.Ok(90));
});

test("Future tapOk error", async () => {
  let value = 0;
  const result = await Future.value(Result.Error<number, number>(99))
    .tapOk((x) => {
      value = x + 1;
    })
    .mapOk((x) => x - 9);
  expect(value).toBe(0);
  expect(result).toEqual(Result.Error(99));
});

test("Future tapError", async () => {
  let value = 0;
  const result = await Future.value(Result.Error(99))
    .tapError((x) => {
      value = x + 1;
    })
    .mapError((x) => x - 9);
  expect(value).toBe(100);
  expect(result).toEqual(Result.Error(90));
});

test("Future tapError ok", async () => {
  let value = 0;
  const result = await Future.value(Result.Ok<number, number>(99))
    .tapError((x) => {
      value = x + 1;
    })
    .mapError((x) => x - 9);
  expect(value).toBe(0);
  expect(result).toEqual(Result.Ok(99));
});

test("Future cancels and runs cancel effect", async () => {
  let effect = 0;
  let counter = 0;
  const future = Future.make((resolve) => {
    const timeoutId = setTimeout(() => {
      counter++;
      resolve(1);
    }, 100);
    return () => {
      clearTimeout(timeoutId);
      effect++;
    };
  });
  future.cancel();
  expect(isCancelled(future)).toBe(true);
  expect(counter).toBe(0);
  expect(effect).toBe(1);
});

test("Future cancels", async () => {
  let counter = 0;
  const future = Future.make<number>((resolve) => {
    const timeoutId = setTimeout(() => {
      counter++;
      resolve(1);
    }, 100);
    return () => {
      clearTimeout(timeoutId);
    };
  });
  const future2 = future.map((item) => item + 1);
  future2.cancel();
  expect(isCancelled(future)).toBe(false);
  expect(isCancelled(future2)).toBe(true);
  await future;
  expect(counter).toBe(1);
});

test("Future doesn't cancel futures returned by flatMap", async () => {
  let counter = 0;
  let secondCounter = 0;
  const future = Future.make<number>((resolve) => {
    const timeoutId = setTimeout(() => {
      counter++;
      resolve(1);
    }, 10);
    return () => {
      clearTimeout(timeoutId);
    };
  });
  const future2 = Future.make<number>((resolve) => {
    const timeoutId = setTimeout(() => {
      secondCounter++;
      resolve(1);
    }, 10);
    return () => {
      clearTimeout(timeoutId);
    };
  });
  const future3 = future.flatMap(() => future2);
  const future4 = future.map((item) => item + 1);

  future4.cancel();
  expect(isCancelled(future)).toBe(false);
  expect(isCancelled(future2)).toBe(false);
  expect(isCancelled(future3)).toBe(false);
  expect(isCancelled(future4)).toBe(true);
  await Future.all([future, future2]);
  expect(counter).toBe(1);
  expect(secondCounter).toBe(1);
});

test("Future cancels to the top if specified", async () => {
  let counter = 0;
  let secondCounter = 0;
  let effect = 0;
  const future = Future.make<number>((resolve) => {
    const timeoutId = setTimeout(() => {
      counter++;
      resolve(1);
    }, 10);
    return () => {
      effect++;
      clearTimeout(timeoutId);
    };
  });
  const future2 = Future.make<number>((resolve) => {
    const timeoutId = setTimeout(() => {
      secondCounter++;
      resolve(1);
    }, 10);
    return () => {
      clearTimeout(timeoutId);
    };
  });
  const future3 = future.flatMap(() => future2, true);
  const future4 = future.map((item) => item + 1, true);

  future4.cancel();
  expect(isCancelled(future)).toBe(true);
  expect(isCancelled(future2)).toBe(false);
  expect(isCancelled(future3)).toBe(true);
  expect(isCancelled(future4)).toBe(true);
  await future2;
  expect(counter).toBe(0);
  expect(effect).toBe(1);
  expect(secondCounter).toBe(1);
});

test("Future cancels promise and runs cancel effect up the dependents", async () => {
  let counter = 0;
  const future = Future.make<number>((resolve) => {
    const timeoutId = setTimeout(() => {
      counter++;
      resolve(1);
    }, 10);
    return () => {
      clearTimeout(timeoutId);
    };
  });

  const future2 = future.map((item) => item + 1);

  future.cancel();
  expect(isCancelled(future)).toBe(true);
  expect(isCancelled(future2)).toBe(true);

  expect(counter).toBe(0);
});

test("Future doesn't consider flatMap returned as dependents", async () => {
  let counter = 0;
  let secondCounter = 0;
  const future = Future.make<number>((resolve) => {
    const timeoutId = setTimeout(() => {
      counter++;
      resolve(1);
    }, 10);
    return () => {
      clearTimeout(timeoutId);
    };
  });

  const future2 = Future.make<number>((resolve) => {
    const timeoutId = setTimeout(() => {
      secondCounter++;
      resolve(1);
    }, 10);
    return () => {
      clearTimeout(timeoutId);
    };
  });

  const future3 = future.flatMap(() => future2);
  const future4 = future.map((item) => item + 1);

  future.cancel();
  expect(isCancelled(future)).toBe(true);
  expect(isCancelled(future2)).toBe(false);
  expect(isCancelled(future3)).toBe(true);
  expect(isCancelled(future4)).toBe(true);

  await future2;
  expect(counter).toBe(0);
  expect(secondCounter).toBe(1);
});

test("Future fromPromise", async () => {
  const value = await Future.fromPromise(Promise.resolve("one")).mapOk(
    (value) => `${value}!`,
  );
  expect(value).toEqual(Result.Ok("one!"));
});

test("Future fromPromise", async () => {
  const value = await Future.fromPromise(Promise.reject("one")).mapError(
    (value) => `${value}!`,
  );
  expect(value).toEqual(Result.Error("one!"));
});

test("Future toPromise", async () => {
  const value = await Future.value(1).toPromise();
  expect(value).toEqual(1);
});

test("Future resultToPromise", async () => {
  const value = await Future.value(Result.Ok(1)).resultToPromise();
  expect(value).toEqual(1);
});

test("Future resultToPromise", async () => {
  try {
    await Future.value(Result.Error(1)).resultToPromise();
    expect(false).toBe(true);
  } catch (err) {
    expect(err).toEqual(1);
  }
});

test("Future isFuture", async () => {
  expect(Future.isFuture(Future.value(1))).toEqual(true);
  expect(Future.isFuture(Promise.resolve(1))).toEqual(false);
  expect(Future.isFuture(1)).toEqual(false);
  expect(Future.isFuture([])).toEqual(false);
  expect(Future.isFuture({})).toEqual(false);
});

test("Future doesn't hang", async () => {
  const future = Future.make((resolve) => {
    setTimeout(() => resolve(0), 10);
  });
  return future
    .flatMap(() => Future.value(1))
    .flatMap(() => future.flatMap(() => Future.value(2)))
    .tap((value) => expect(value).toEqual(2));
});

test("Future concurrent", async () => {
  let parallel = 0;

  const result = await Future.concurrent(
    [
      () =>
        Future.make<0>((resolve) => {
          expect(++parallel).toBeLessThanOrEqual(2);
          setTimeout(() => resolve(0), 100);
        }).tap(() => {
          --parallel;
        }),
      () =>
        Future.make<1>((resolve) => {
          expect(++parallel).toBeLessThanOrEqual(2);
          resolve(1);
        }).tap(() => {
          --parallel;
        }),
      () =>
        Future.make<2>((resolve) => {
          expect(++parallel).toBeLessThanOrEqual(2);
          setTimeout(() => resolve(2), 50);
        }).tap(() => {
          --parallel;
        }),
      () =>
        Future.make<3>((resolve) => {
          expect(++parallel).toBeLessThanOrEqual(2);
          setTimeout(() => resolve(3), 25);
        }).tap(() => {
          --parallel;
        }),
      () =>
        Future.make((resolve) => {
          expect(++parallel).toBeLessThanOrEqual(2);
          setTimeout(() => resolve(undefined), 75);
        })
          .map(() => 4)
          .tap(() => {
            --parallel;
          }),
    ],
    { concurrency: 2 },
  );

  expect(result).toEqual([0, 1, 2, 3, 4]);

  const empty = await Future.concurrent([], { concurrency: 1 });
  expect(empty).toEqual([]);
});

test("Future try", async () => {
  let attempts = 0;
  const value = await Future.retry(
    (attempt) => {
      if (++attempts === 5) {
        return Future.value<Result<number, number>>(Result.Ok(attempt));
      } else {
        return Future.make<Result<number, number>>((resolve) => {
          setTimeout(() => resolve(Result.Error(1)));
        });
      }
    },
    { max: 6 },
  );

  expect(attempts).toBe(5);
  expect(value).toEqual(Result.Ok(4));
});

test("Future try on last", async () => {
  let attempts = 0;
  const value = await Future.retry(
    (attempt) => {
      if (++attempts === 5) {
        return Future.value<Result<number, number>>(Result.Ok(attempt));
      } else {
        return Future.make<Result<number, number>>((resolve) => {
          setTimeout(() => resolve(Result.Error(1)));
        });
      }
    },
    { max: 5 },
  );

  expect(attempts).toBe(5);
  expect(value).toEqual(Result.Ok(4));
});

test("Future try on last", async () => {
  let attempts = 0;
  const value = await Future.retry(
    (attempt) => {
      if (++attempts === 5) {
        return Future.value<Result<number, number>>(Result.Ok(attempt));
      } else {
        return Future.make<Result<number, number>>((resolve) => {
          setTimeout(() => resolve(Result.Error(1)));
        });
      }
    },
    { max: 4 },
  );

  expect(attempts).toBe(4);
  expect(value).toEqual(Result.Error(1));
});

// --- Panic channel tests ---

test("map callback throw panics the derived future (sync source)", () => {
  const error = new Error("boom");
  const future = Future.value(1).map(() => {
    throw error;
  });
  expect(isPanicked(future)).toBe(true);
  expect(getPanicError(future)).toBe(error);
});

test("map callback throw panics the derived future (async source)", async () => {
  const error = new Error("boom");
  const [source, resolve] = Deferred.make<number>();
  const derived = source.map(() => {
    throw error;
  });

  expect(isPanicked(derived)).toBe(false);
  resolve(1);
  expect(isPanicked(derived)).toBe(true);
  expect(getPanicError(derived)).toBe(error);
});

test("mapOk callback throw panics the derived future", () => {
  const error = new Error("boom");
  const future = Future.value(Result.Ok(1)).mapOk(() => {
    throw error;
  });
  expect(isPanicked(future)).toBe(true);
  expect(getPanicError(future)).toBe(error);
});

test("flatMap callback throw panics the derived future", () => {
  const error = new Error("boom");
  const future = Future.value(1).flatMap(() => {
    throw error;
  });
  expect(isPanicked(future)).toBe(true);
  expect(getPanicError(future)).toBe(error);
});

test("tap callback throw panics the derived future", () => {
  const error = new Error("boom");
  const future = Future.value(1).tap(() => {
    throw error;
  });
  expect(isPanicked(future)).toBe(true);
  expect(getPanicError(future)).toBe(error);
});

test("tapOk callback throw panics the derived future", () => {
  const error = new Error("boom");
  const future = Future.value(Result.Ok(1)).tapOk(() => {
    throw error;
  });
  expect(isPanicked(future)).toBe(true);
  expect(getPanicError(future)).toBe(error);
});

test("flatMap returning panicked future panics derived", () => {
  const error = new Error("inner panic");
  const panicked = Future.make<number>((_resolve, panic) => {
    panic(error);
  });
  const derived = Future.value(1).flatMap(() => panicked);
  expect(isPanicked(derived)).toBe(true);
  expect(getPanicError(derived)).toBe(error);
});

test("chain of 3+ combinators: source panic propagates to all", () => {
  const error = new Error("source panic");
  const [source, , panic] = Deferred.make<number>();

  const d1 = source.map((x) => x + 1);
  const d2 = d1.map((x) => x + 2);
  const d3 = d2.map((x) => x + 3);

  panic(error);

  expect(isPanicked(d1)).toBe(true);
  expect(isPanicked(d2)).toBe(true);
  expect(isPanicked(d3)).toBe(true);
  expect(getPanicError(d3)).toBe(error);
});

test("parent panic propagates without executing child callback", () => {
  const [source, , panic] = Deferred.make<number>();
  let called = false;
  const derived = source.map(() => {
    called = true;
    return 42;
  });

  panic(new Error("parent panic"));

  expect(called).toBe(false);
  expect(isPanicked(derived)).toBe(true);
});

test("flatMap: inner future panics propagates to outer", async () => {
  const error = new Error("inner");
  const inner = Future.make<number>((_resolve, panic) => {
    setTimeout(() => panic(error), 10);
  });
  const outer = Future.value(1).flatMap(() => inner);

  await new Promise((r) => setTimeout(r, 50));
  expect(isPanicked(outer)).toBe(true);
  expect(getPanicError(outer)).toBe(error);
});

test("catchPanic recovers panic with fallback value", () => {
  const future = Future.make<number>((_resolve, panic) => {
    panic(new Error("boom"));
  });

  let resolved: number | undefined;
  future.catchPanic(() => 42).onResolve((v) => {
    resolved = v;
  });

  expect(resolved).toBe(42);
});

test("catchPanic returning Future resolves", async () => {
  const future = Future.make<number>((_resolve, panic) => {
    panic(new Error("boom"));
  });

  const recovered = await future.catchPanic(() => Future.value(99));
  expect(recovered).toBe(99);
});

test("catchPanic returning panicked Future re-panics", () => {
  const error1 = new Error("first");
  const error2 = new Error("second");
  const future = Future.make<number>((_resolve, panic) => {
    panic(error1);
  });

  const recovered = future.catchPanic(() =>
    Future.make<number>((_r, p) => p(error2)),
  );
  expect(isPanicked(recovered)).toBe(true);
  expect(getPanicError(recovered)).toBe(error2);
});

test("catchPanic handler throws re-panics with handler error", () => {
  const handlerError = new Error("handler threw");
  const future = Future.make<number>((_resolve, panic) => {
    panic(new Error("original"));
  });

  const recovered = future.catchPanic(() => {
    throw handlerError;
  });
  expect(isPanicked(recovered)).toBe(true);
  expect(getPanicError(recovered)).toBe(handlerError);
});

test("tapPanic side-effect called with panic value", () => {
  const error = new Error("boom");
  let captured: unknown;
  const future = Future.make<number>((_resolve, panic) => {
    panic(error);
  });

  const tapped = future.tapPanic((e) => {
    captured = e;
  });

  expect(captured).toBe(error);
  expect(isPanicked(tapped)).toBe(true);
  expect(getPanicError(tapped)).toBe(error);
});

test("tapPanic throw re-panics with new error", () => {
  const newError = new Error("tap threw");
  const future = Future.make<number>((_resolve, panic) => {
    panic(new Error("original"));
  });

  const tapped = future.tapPanic(() => {
    throw newError;
  });
  expect(isPanicked(tapped)).toBe(true);
  expect(getPanicError(tapped)).toBe(newError);
});

test("tapPanic on resolved future is a no-op", async () => {
  let called = false;
  const result = await Future.value(42).tapPanic(() => {
    called = true;
  });
  expect(called).toBe(false);
  expect(result).toBe(42);
});

test("panicToResult: resolved becomes Result.Ok", async () => {
  const result = await Future.value(42).panicToResult();
  expect(result).toEqual(Result.Ok(42));
});

test("panicToResult: panicked becomes Result.Error", async () => {
  const error = new Error("boom");
  const result = await Future.make<number>((_resolve, panic) => {
    panic(error);
  }).panicToResult();
  expect(result).toEqual(Result.Error(error));
});

test("toPromise rejects on panic", async () => {
  const error = new Error("boom");
  const future = Future.make<number>((_resolve, panic) => {
    panic(error);
  });

  try {
    await future.toPromise();
    expect(false).toBe(true);
  } catch (err) {
    expect(err).toBe(error);
  }
});

test("resultToPromise rejects on panic", async () => {
  const error = new Error("boom");
  const future = Future.make<Result<number, string>>((_resolve, panic) => {
    panic(error);
  });

  try {
    await future.resultToPromise();
    expect(false).toBe(true);
  } catch (err) {
    expect(err).toBe(error);
  }
});

test("await panicked future throws", async () => {
  const error = new Error("boom");
  const future = Future.make<number>((_resolve, panic) => {
    panic(error);
  });

  try {
    await future;
    expect(false).toBe(true);
  } catch (err) {
    expect(err).toBe(error);
  }
});

test("fromPromise(...).mapOk(throws) settles as panic", async () => {
  const error = new Error("mapOk boom");
  const future = Future.fromPromise(Promise.resolve(1)).mapOk(() => {
    throw error;
  });

  await new Promise((r) => setTimeout(r, 10));
  expect(isPanicked(future)).toBe(true);
  expect(getPanicError(future)).toBe(error);
});

test("Future.onPanic listener called on panic", () => {
  let captured: unknown;
  const unsubscribe = Future.onPanic((e) => {
    captured = e;
  });

  const error = new Error("global");
  Future.make<number>((_resolve, panic) => {
    panic(error);
  });

  expect(captured).toBe(error);
  unsubscribe();
});

test("Future.onPanic unsubscribe works", () => {
  let callCount = 0;
  const unsubscribe = Future.onPanic(() => {
    callCount++;
  });

  Future.make<number>((_resolve, panic) => {
    panic(new Error("first"));
  });
  expect(callCount).toBe(1);

  unsubscribe();

  Future.make<number>((_resolve, panic) => {
    panic(new Error("second"));
  });
  expect(callCount).toBe(1);
});

test("Future.onPanic listener throw does not crash", () => {
  const unsubscribe = Future.onPanic(() => {
    throw new Error("listener crash");
  });

  expect(() => {
    Future.make<number>((_resolve, panic) => {
      panic(new Error("trigger"));
    });
  }).not.toThrow();

  unsubscribe();
});

test("init throws panics the future", () => {
  const error = new Error("init boom");
  const future = Future.make<number>(() => {
    throw error;
  });
  expect(isPanicked(future)).toBe(true);
  expect(getPanicError(future)).toBe(error);
});

test("init calls panic explicitly", () => {
  const error = new Error("explicit panic");
  const future = Future.make<number>((_resolve, panic) => {
    panic(error);
  });
  expect(isPanicked(future)).toBe(true);
  expect(getPanicError(future)).toBe(error);
});

test("resolve then panic stays resolved", () => {
  let panicFn: (error: unknown) => void;
  const future = Future.make<number>((resolve, panic) => {
    resolve(42);
    panicFn = panic;
  });
  panicFn!(new Error("late panic"));

  let resolved: number | undefined;
  future.onResolve((v) => {
    resolved = v;
  });
  expect(resolved).toBe(42);
  expect(isPanicked(future)).toBe(false);
});

test("panic then resolve stays panicked", () => {
  let resolveFn: (value: number) => void;
  const future = Future.make<number>((resolve, panic) => {
    panic(new Error("first"));
    resolveFn = resolve;
  });
  resolveFn!(42);

  expect(isPanicked(future)).toBe(true);
  let resolved = false;
  future.onResolve(() => {
    resolved = true;
  });
  expect(resolved).toBe(false);
});

test("callbacks called at most once on panic", () => {
  let count = 0;
  const future = Future.make<number>((_resolve, panic) => {
    panic(new Error("first"));
    panic(new Error("second"));
  });

  future.onPanic(() => {
    count++;
  });

  expect(count).toBe(1);
});

test("Deferred.make exposes panic as third element", () => {
  const [future, resolve, panic] = Deferred.make<number>();
  expect(typeof resolve).toBe("function");
  expect(typeof panic).toBe("function");

  panic(new Error("deferred panic"));
  expect(isPanicked(future)).toBe(true);
});

test("concurrent propagates panic from individual future", async () => {
  const error = new Error("concurrent panic");
  const future = Future.concurrent(
    [
      () => Future.value(1),
      () =>
        Future.make<number>((_resolve, panic) => {
          panic(error);
        }),
      () => Future.value(3),
    ],
    { concurrency: 3 },
  );

  expect(isPanicked(future)).toBe(true);
  expect(getPanicError(future)).toBe(error);
});

test("concurrent propagates panic from throwing factory", () => {
  const error = new Error("factory throw");
  const future = Future.concurrent(
    [
      () => Future.value(1),
      () => {
        throw error;
      },
      () => Future.value(3),
    ],
    { concurrency: 3 },
  );

  expect(isPanicked(future)).toBe(true);
  expect(getPanicError(future)).toBe(error);
});
