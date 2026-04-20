import { keys, values } from "./Dict"
import { Result } from "./OptionResult"
import { LooseRecord } from "./types"
import { zip } from "./ZipUnzip"

export class __Future<A> {
  /**
   * Creates a new future from its initializer function (like `new Promise(...)`)
   */
  static make = <A>(
    init: (resolver: (value: A) => void) => (() => void) | void,
  ): Future<A> => {
    const future = Object.create(FUTURE_PROTO) as Future<A>
    const resolver = (value: A) => {
      if (future._state.tag === "Pending") {
        const resolveCallbacks = future._state.resolveCallbacks
        future._state = { tag: "Resolved", value }
        resolveCallbacks?.forEach((func) => func(value))
      }
    }
    future._state = { tag: "Pending" }
    future._state.cancel = init(resolver)
    return future as Future<A>
  }

  static isFuture = (value: unknown): value is Future<unknown> =>
    value != null && Object.prototype.isPrototypeOf.call(FUTURE_PROTO, value)

  /**
   * Creates a future resolved to the passed value
   */
  static value = <A>(value: A): Future<A> => {
    const future = Object.create(FUTURE_PROTO)
    future._state = { tag: "Resolved", value }
    return future as Future<A>
  }

  /**
   * Converts a Promise to a Future\<Result\<Value, unknown>>
   */
  static fromPromise<A, E = unknown>(
    promise: Promise<A>,
  ): Future<Result<A, E>> {
    return Future.make((resolve) => {
      promise.then(
        (ok) => resolve(Result.Ok(ok)),
        (error: E) => resolve(Result.Error(error)),
      )
    })
  }

  /**
   * Turns an array of futures into a future of array
   */
  static all = <const Futures extends readonly Future<any>[] | []>(
    futures: Futures,
    propagateCancel = false,
  ) => {
    const length = futures.length
    let acc = Future.value<Array<unknown>>([])
    let index = 0

    while (true) {
      if (index >= length) {
        return acc as unknown as Future<{
          [K in keyof Futures]: Futures[K] extends Future<infer T> ? T : never
        }>
      }

      const item = futures[index]

      if (item != null) {
        acc = acc.flatMap((array) => {
          return item.map((value) => {
            array.push(value)
            return array
          }, propagateCancel)
        }, propagateCancel)
      }

      index++
    }
  }

  /**
   * Turns an dict of futures into a future of dict
   */
  static allFromDict = <const Dict extends LooseRecord<Future<any>>>(
    dict: Dict,
  ): Future<{
    [K in keyof Dict]: Dict[K] extends Future<infer T> ? T : never
  }> => {
    const dictKeys = keys(dict)

    return Future.all(values(dict)).map((values) =>
      Object.fromEntries(zip(dictKeys, values)),
    )
  }

  static wait = (ms: number) =>
    Future.make<void>((resolve) => {
      const timeoutId = setTimeout(() => resolve(), ms)
      return () => clearTimeout(timeoutId)
    })

  static retry = <A, E>(
    getFuture: (attempt: number) => Future<Result<A, E>>,
    { max }: { max: number },
  ): Future<Result<A, E>> => {
    const run = (attempt: number): Future<Result<A, E>> =>
      getFuture(attempt).flatMapError((error) => {
        if (attempt + 1 < max) {
          return run(attempt + 1)
        } else {
          return Future.value(Result.Error(error))
        }
      })

    return run(0)
  }

  static concurrent = <const Futures extends readonly (() => Future<any>)[]>(
    array: Futures,
    { concurrency }: { concurrency: number },
  ) => {
    return Future.make((resolve) => {
      const returnValue = Array(array.length)
      let index = concurrency - 1
      let done = 0

      if (array.length === 0) {
        resolve([])
        return
      }

      const run = (func: () => Future<any>, currentIndex: number) =>
        func().tap((value) => {
          returnValue[currentIndex] = value
          if (++done < array.length) {
            const next = array[++index]
            if (next != undefined) {
              run(next, index)
            }
          } else {
            resolve(returnValue)
          }
        })

      array.slice(0, concurrency).forEach(run)
    }) as unknown as Future<{
      [K in keyof Futures]: Futures[K] extends () => Future<infer T> ? T : never
    }>
  }

  // Not accessible from the outside
  private _state:
    | {
        tag: "Pending"
        resolveCallbacks?: Array<(value: A) => void>
        cancel?: void | (() => void)
        cancelCallbacks?: Array<() => void>
      }
    | { tag: "Cancelled" }
    | { tag: "Resolved"; value: A }

  protected constructor() {
    this._state = { tag: "Pending" }
  }

  /**
   * Runs the callback with the future value when resolved
   */
  onResolve(func: (value: A) => void) {
    if (this._state.tag === "Pending") {
      this._state.resolveCallbacks = this._state.resolveCallbacks ?? []
      this._state.resolveCallbacks.push(func)
    } else if (this._state.tag === "Resolved") {
      func(this._state.value)
    }
  }

  /**
   * Runs the callback if and when the future is cancelled
   */
  onCancel(func: () => void) {
    if (this._state.tag === "Pending") {
      this._state.cancelCallbacks = this._state.cancelCallbacks ?? []
      this._state.cancelCallbacks.push(func)
    } else if (this._state.tag === "Cancelled") {
      func()
    }
  }

  /**
   * Cancels the future
   */
  cancel() {
    if (this._state.tag === "Pending") {
      const { cancel, cancelCallbacks } = this._state
      // We have to set the future as cancelled first to avoid an infinite loop
      this._state = { tag: "Cancelled" }
      if (cancel != undefined) {
        // @ts-ignore Compiler doesn't like that `cancel` is potentially `void`
        cancel()
      }
      cancelCallbacks?.forEach((func) => func())
    }
  }

  /**
   * Returns the Future containing the value from the callback
   *
   * (Future\<A>, A => B) => Future\<B>
   */
  map<B>(func: (value: A) => B, propagateCancel = false): Future<B> {
    const future = Future.make<B>((resolve) => {
      this.onResolve((value) => {
        resolve(func(value))
      })

      if (propagateCancel) {
        return () => {
          this.cancel()
        }
      }
    })

    this.onCancel(() => {
      future.cancel()
    })

    return future
  }

  then(func: (value: A) => void) {
    this.onResolve(func)
    return this
  }

  /**
   * Returns the Future containing the value from the callback
   *
   * (Future\<A>, A => Future\<B>) => Future\<B>
   */
  flatMap<B>(
    func: (value: A) => Future<B>,
    propagateCancel = false,
  ): Future<B> {
    const future = Future.make<B>((resolve) => {
      this.onResolve((value) => {
        const returnedFuture = func(value)
        returnedFuture.onResolve(resolve)
        returnedFuture.onCancel(() => future.cancel())
      })

      if (propagateCancel) {
        return () => {
          this.cancel()
        }
      }
    })

    this.onCancel(() => {
      future.cancel()
    })

    return future
  }

  /**
   * Runs the callback and returns `this`
   */
  tap(this: Future<A>, func: (value: A) => unknown): Future<A> {
    this.onResolve(func)
    return this
  }

  /**
   * For Future<Result<*>>:
   *
   * Runs the callback with the value if ok and returns `this`
   */
  tapOk<A, E>(
    this: Future<Result<A, E>>,
    func: (value: A) => unknown,
  ): Future<Result<A, E>> {
    this.onResolve((value) => {
      value.match({
        Ok: (value) => func(value),
        Error: () => {},
      })
    })

    return this
  }

  /**
   * For Future<Result<*>>:
   *
   * Runs the callback with the error if in error and returns `this`
   */
  tapError<A, E>(
    this: Future<Result<A, E>>,
    func: (value: E) => unknown,
  ): Future<Result<A, E>> {
    this.onResolve((value) => {
      value.match({
        Ok: () => {},
        Error: (error) => func(error),
      })
    })

    return this
  }

  /**
   * For Future<Result<*>>:
   *
   * Takes a callback taking the Ok value and returning a new result and returns a future resolving to this new result
   */
  mapOkToResult<A, E, B, F>(
    this: Future<Result<A, E>>,
    func: (value: A) => Result<B, F>,
    propagateCancel = false,
  ): Future<Result<B, F | E>> {
    return this.map((value) => {
      return value.match({
        Ok: (value) => func(value),
        Error: () => value as unknown as Result<B, E | F>,
      })
    }, propagateCancel)
  }

  /**
   * For Future<Result<*>>:
   *
   * Takes a callback taking the Error value and returning a new result and returns a future resolving to this new result
   */
  mapErrorToResult<A, E, B, F>(
    this: Future<Result<A, E>>,
    func: (value: E) => Result<B, F>,
    propagateCancel = false,
  ): Future<Result<A | B, F>> {
    return this.map((value) => {
      return value.match({
        Error: (error) => func(error),
        Ok: () => value as unknown as Result<A | B, F>,
      })
    }, propagateCancel)
  }

  /**
   * For Future<Result<*>>:
   *
   * Takes a callback taking the Ok value and returning a new ok value and returns a future resolving to this new result
   */
  mapOk<A, E, B>(
    this: Future<Result<A, E>>,
    func: (value: A) => B,
    propagateCancel = false,
  ): Future<Result<B, E>> {
    return this.map((value) => {
      return value.match({
        Ok: (value) => Result.Ok(func(value)),
        Error: () => value as unknown as Result<B, E>,
      })
    }, propagateCancel)
  }

  /**
   * For Future<Result<*>>:
   *
   * Takes a callback taking the Error value and returning a new error value and returns a future resolving to this new result
   */
  mapError<A, E, B>(
    this: Future<Result<A, E>>,
    func: (value: E) => B,
    propagateCancel = false,
  ): Future<Result<A, B>> {
    return this.map((value) => {
      return value.match({
        Ok: () => value as unknown as Result<A, B>,
        Error: (error) => Result.Error(func(error)),
      })
    }, propagateCancel)
  }

  /**
   * For Future<Result<*>>:
   *
   * Takes a callback taking the Ok value and returning a future
   */
  flatMapOk<A, E, B, F>(
    this: Future<Result<A, E>>,
    func: (value: A) => Future<Result<B, F>>,
    propagateCancel = false,
  ): Future<Result<B, F | E>> {
    return this.flatMap((value) => {
      return value.match({
        Ok: (value) => func(value) as Future<Result<B, F | E>>,
        Error: () => Future.value(value as unknown as Result<B, F | E>),
      })
    }, propagateCancel)
  }

  /**
   * For Future<Result<*>>:
   *
   * Takes a callback taking the Error value and returning a future
   */
  flatMapError<A, E, B, F>(
    this: Future<Result<A, E>>,
    func: (value: E) => Future<Result<B, F>>,
    propagateCancel = false,
  ): Future<Result<A | B, F>> {
    return this.flatMap((value) => {
      return value.match({
        Ok: () => Future.value(value as unknown as Result<A | B, F>),
        Error: (error) => func(error) as Future<Result<A | B, F>>,
      })
    }, propagateCancel)
  }

  /**
   * Converts the future into a promise
   */
  toPromise(): Promise<A> {
    return new Promise((resolve) => {
      this.onResolve(resolve)
    })
  }

  /**
   * For Future<Result<*>>:
   *
   * Converts the future into a promise (rejecting if in Error)
   */
  resultToPromise<A, E>(this: Future<Result<A, E>>): Promise<A> {
    return new Promise((resolve, reject) => {
      this.onResolve((value) => {
        value.match({
          Ok: resolve,
          Error: reject,
        })
      })
    })
  }
}

const FUTURE_PROTO = Object.create(
  null,
  Object.getOwnPropertyDescriptors(__Future.prototype),
)

export const Future = __Future
export type Future<A> = __Future<A>
