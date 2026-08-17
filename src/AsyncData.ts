import { keys, values } from "./Dict"
import { Option, Result } from "./OptionResult"
import { createStore } from "./referenceStore"
import { BOXED_TYPE } from "./symbols"
import { JsonAsyncData, LooseRecord } from "./types"
import { zip } from "./ZipUnzip"

const AsyncDataStore = createStore()

class __AsyncData<A> {
  static P = {
    Done: <const A>(value: A) => ({ tag: "Done", value }) as const,
    NotAsked: { tag: "NotAsked" } as const,
    Loading: { tag: "Loading" } as const,
  }
  /**
   * Create an AsyncData.Done value
   */
  static Done = <A = never>(value: A): AsyncData<A> => {
    const existing = AsyncDataStore.get(value)
    if (existing == undefined) {
      const asyncData = Object.create(ASYNC_DATA_PROTO) as Done<A>
      // @ts-expect-error
      asyncData.tag = "Done"
      // @ts-expect-error
      asyncData.value = value
      Object.freeze(asyncData)
      AsyncDataStore.set(value, asyncData)
      return asyncData
    } else {
      return existing as Done<A>
    }
  }

  /**
   * Create an AsyncData.Loading value
   */
  static Loading = <A = never>(): AsyncData<A> => LOADING as Loading<A>

  /**
   * Create an AsyncData.NotAsked value
   */
  static NotAsked = <A = never>(): AsyncData<A> => NOT_ASKED as NotAsked<A>

  /**
   * Turns an array of asyncData into an asyncData of array
   */
  static all = <AsyncDatas extends AsyncData<any>[] | []>(
    asyncDatas: AsyncDatas,
  ) => {
    const length = asyncDatas.length
    let acc = AsyncData.Done<Array<unknown>>([])
    let index = 0

    while (true) {
      if (index >= length) {
        return acc as AsyncData<{
          [K in keyof AsyncDatas]: AsyncDatas[K] extends AsyncData<infer T>
            ? T
            : never
        }>
      }

      const item = asyncDatas[index]

      if (item != null) {
        acc = acc.flatMap((array) => {
          return item.map((value) => {
            array.push(value)
            return array
          })
        })
      }

      index++
    }
  }

  /**
   * Turns an dict of asyncData into a asyncData of dict
   */
  static allFromDict = <Dict extends LooseRecord<AsyncData<any>>>(
    dict: Dict,
  ): AsyncData<{
    [K in keyof Dict]: Dict[K] extends AsyncData<infer T> ? T : never
  }> => {
    const dictKeys = keys(dict)

    return AsyncData.all(values(dict)).map((values) =>
      Object.fromEntries(zip(dictKeys, values)),
    )
  }

  static equals = <A>(
    a: AsyncData<A>,
    b: AsyncData<A>,
    equals: (a: A, b: A) => boolean,
  ) => {
    return a.tag === "Done" && b.tag === "Done"
      ? equals(a.value, b.value)
      : a.tag === b.tag
  }

  static isAsyncData = (value: unknown): value is AsyncData<unknown> =>
    // @ts-ignore
    value != null && value.__boxed_type__ === "AsyncData"

  static fromJSON = <A>(value: JsonAsyncData<A>) => {
    return value.tag === "NotAsked"
      ? AsyncData.NotAsked()
      : value.tag === "Loading"
        ? AsyncData.Loading()
        : AsyncData.Done(value.value)
  }

  map<B>(this: AsyncData<A>, func: (value: A) => B): AsyncData<B> {
    if (this === NOT_ASKED || this === LOADING) {
      return this as unknown as AsyncData<B>
    }
    return AsyncData.Done(func((this as Done<A>).value))
  }

  flatMap<B>(
    this: AsyncData<A>,
    func: (value: A) => AsyncData<B>,
  ): AsyncData<B> {
    if (this === NOT_ASKED || this === LOADING) {
      return this as unknown as AsyncData<B>
    }
    return func((this as Done<A>).value)
  }

  /**
   * For AsyncData<Result<*>>:
   *
   * Takes a callback taking the Ok value and returning a new result and returns an AsyncData with this new result
   */
  mapOkToResult<A, E, B, F>(
    this: AsyncData<Result<A, E>>,
    func: (value: A) => Result<B, F>,
  ): AsyncData<Result<B, F | E>> {
    return this.map((value) => {
      return value.match({
        Ok: (value) => func(value),
        Error: () => value as unknown as Result<B, E | F>,
      })
    })
  }

  /**
   * For AsyncData<Result<*>>:
   *
   * Takes a callback taking the Error value and returning a new result and returns an AsyncData with this new result
   */
  mapErrorToResult<A, E, B, F>(
    this: AsyncData<Result<A, E>>,
    func: (value: E) => Result<B, F>,
  ): AsyncData<Result<A | B, F>> {
    return this.map((value) => {
      return value.match({
        Error: (error) => func(error),
        Ok: () => value as unknown as Result<A | B, F>,
      })
    })
  }

  /**
   * For AsyncData<Result<*>>:
   *
   * Takes a callback taking the Ok value and returning a new ok value and returns an AsyncData resolving to this new result
   */
  mapOk<A, E, B>(
    this: AsyncData<Result<A, E>>,
    func: (value: A) => B,
  ): AsyncData<Result<B, E>> {
    return this.map((value) => {
      return value.match({
        Ok: (value) => Result.Ok(func(value)),
        Error: () => value as unknown as Result<B, E>,
      })
    })
  }

  /**
   * For AsyncData<Result<*>>:
   *
   * Takes a callback taking the Error value and returning a new error value and returns an AsyncData to this new result
   *
   */
  mapError<A, E, B>(
    this: AsyncData<Result<A, E>>,
    func: (value: E) => B,
  ): AsyncData<Result<A, B>> {
    return this.map((value) => {
      return value.match({
        Ok: () => value as unknown as Result<A, B>,
        Error: (error) => Result.Error(func(error)),
      })
    })
  }

  /**
   * For AsyncData<Result<*>>:
   *
   * Takes a callback taking the Ok value and returning an AsyncData
   */
  flatMapOk<A, E, B, F>(
    this: AsyncData<Result<A, E>>,
    func: (value: A) => AsyncData<Result<B, F>>,
  ): AsyncData<Result<B, F | E>> {
    return this.flatMap((value) => {
      return value.match({
        Ok: (value) => func(value) as AsyncData<Result<B, F | E>>,
        Error: () => AsyncData.Done(value as unknown as Result<B, F | E>),
      })
    })
  }

  /**
   * For AsyncData<Result<*>>:
   *
   * Takes a callback taking the Error value and returning an AsyncData
   */
  flatMapError<A, E, B, F>(
    this: AsyncData<Result<A, E>>,
    func: (value: E) => AsyncData<Result<B, F>>,
  ): AsyncData<Result<A | B, F>> {
    return this.flatMap((value) => {
      return value.match({
        Ok: () => AsyncData.Done(value as unknown as Result<A | B, F>),
        Error: (error) => func(error) as AsyncData<Result<A | B, F>>,
      })
    })
  }

  /**
   * Returns the value. Use within `if (asyncData.isDone()) { ... }`
   */
  get(this: Done<A>) {
    return this.value
  }

  /**
   * @deprecated
   */
  getWithDefault(this: AsyncData<A>, defaultValue: A): A {
    if (this === NOT_ASKED || this === LOADING) {
      return defaultValue
    }
    return (this as Done<A>).value
  }

  getOr(this: AsyncData<A>, defaultValue: A): A {
    if (this === NOT_ASKED || this === LOADING) {
      return defaultValue
    }
    return (this as Done<A>).value
  }

  /**
   * Return the loaded value if present, otherwise throw an error
   */
  getOrThrow(this: AsyncData<A>): A | never {
    if (this === NOT_ASKED || this === LOADING) {
      throw new Error("Tried to unwrap an incomplete AsyncData");
    }
    return (this as Done<A>).value;
  }

  /**
   * Maps the value if present, returns the fallback otherwise
   *
   * (AsyncData\<A>, B, A => B) => B
   */
  mapOr<B>(this: AsyncData<A>, defaultValue: B, mapper: (value: A) => B): B {
    if (this === NOT_ASKED || this === LOADING) {
      return defaultValue
    }
    return mapper((this as Done<A>).value)
  }

  match<B1, B2 = B1, B3 = B1 | B2>(
    this: AsyncData<A>,
    config: {
      Done: (value: A) => B1
      Loading: () => B2
      NotAsked: () => B3
    },
  ): B1 | B2 | B3 {
    if (this === NOT_ASKED) {
      return config.NotAsked()
    }
    if (this === LOADING) {
      return config.Loading()
    }
    return config.Done((this as Done<A>).value)
  }

  tap(this: AsyncData<A>, func: (asyncData: AsyncData<A>) => unknown) {
    func(this)
    return this
  }

  toOption(this: AsyncData<A>): Option<A> {
    if (this === NOT_ASKED || this === LOADING) {
      return Option.None()
    }
    return Option.Some((this as Done<A>).value)
  }

  isDone(this: AsyncData<A>): this is Done<A> {
    return this !== NOT_ASKED && this !== LOADING
  }

  isLoading(this: AsyncData<A>): this is Loading<A> {
    return this === LOADING
  }

  isNotAsked(this: AsyncData<A>): this is NotAsked<A> {
    return this === NOT_ASKED
  }

  toJSON(this: AsyncData<A>): JsonAsyncData<A> {
    return this.match<JsonAsyncData<A>>({
      NotAsked: () => ({ [BOXED_TYPE]: "AsyncData", tag: "NotAsked" }),
      Loading: () => ({ [BOXED_TYPE]: "AsyncData", tag: "Loading" }),
      Done: (value) => ({ [BOXED_TYPE]: "AsyncData", tag: "Done", value }),
    })
  }
}

// @ts-expect-error
__AsyncData.prototype.__boxed_type__ = "AsyncData"

const ASYNC_DATA_PROTO = __AsyncData.prototype

const LOADING = (() => {
  const asyncData = Object.create(ASYNC_DATA_PROTO) as Loading<unknown>
  // @ts-expect-error
  asyncData.tag = "Loading"
  Object.freeze(asyncData)
  return asyncData
})()

const NOT_ASKED = (() => {
  const asyncData = Object.create(ASYNC_DATA_PROTO) as NotAsked<unknown>
  // @ts-expect-error
  asyncData.tag = "NotAsked"
  Object.freeze(asyncData)
  return asyncData
})()

interface Done<A> extends Readonly<__AsyncData<A>> {
  readonly tag: "Done"
  readonly value: A
}

interface Loading<A> extends Readonly<__AsyncData<A>> {
  readonly tag: "Loading"
}

interface NotAsked<A> extends Readonly<__AsyncData<A>> {
  readonly tag: "NotAsked"
}

export const AsyncData = __AsyncData
export type AsyncData<A> = Done<A> | Loading<A> | NotAsked<A>
