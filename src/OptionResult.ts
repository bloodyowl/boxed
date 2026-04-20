import { keys, values } from "./Dict"
import { createStore } from "./referenceStore"
import { BOXED_TYPE } from "./symbols"
import { JsonOption, JsonResult, LooseRecord } from "./types"
import { zip } from "./ZipUnzip"

const SomeStore = createStore()

class __Option<A> {
  static P = {
    Some: <const A>(value: A) => ({ tag: "Some", value }) as const,
    None: { tag: "None" } as const,
  }

  static Some = <A = never>(value: A): Option<A> => {
    const existing = SomeStore.get(value)
    if (existing == undefined) {
      const option = Object.create(OPTION_PROTO) as Some<A>
      // @ts-expect-error
      option.tag = "Some"
      // @ts-expect-error
      option.value = value
      Object.freeze(option)
      SomeStore.set(value, option)
      return option
    } else {
      return existing as Some<A>
    }
  }

  static None = <A = never>(): Option<A> => NONE as None<A>

  static isOption = (value: unknown): value is Option<unknown> =>
    // @ts-ignore
    value != null && value.__boxed_type__ === "Option"

  /**
   * Create an Option from a nullable value
   */
  static fromNullable = <A>(nullable: A | null | undefined): Option<A> => {
    return nullable == null ? (NONE as None<A>) : Option.Some<A>(nullable)
  }

  /**
   * Create an Option from a value | null
   */
  static fromNull = <A>(nullable: A | null): Option<A> => {
    return nullable === null ? (NONE as None<A>) : Option.Some<A>(nullable)
  }

  /**
   * Create an Option from a undefined | value
   */
  static fromUndefined = <A>(nullable: A | undefined): Option<A> => {
    return nullable === undefined ? (NONE as None<A>) : Option.Some<A>(nullable)
  }

  /**
   * Create an Option from a value & predicate
   */

  static fromPredicate<A, B extends A>(
    value: A,
    predicate: (value: A) => value is B,
  ): Option<B>
  static fromPredicate<A>(value: A, predicate: (value: A) => boolean): Option<A>
  static fromPredicate<A>(
    value: A,
    predicate: (value: A) => boolean,
  ): Option<A> {
    if (predicate(value)) {
      return Option.Some(value)
    } else {
      return NONE as Option<A>
    }
  }

  /**
   * Turns an array of options into an option of array
   */
  static all = <Options extends Option<any>[] | []>(options: Options) => {
    const length = options.length
    let acc = Option.Some<Array<unknown>>([])
    let index = 0

    while (true) {
      if (index >= length) {
        return acc as Option<{
          [K in keyof Options]: Options[K] extends Option<infer T> ? T : never
        }>
      }

      const item = options[index]

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
   * Turns an dict of options into a options of dict
   */
  static allFromDict = <Dict extends LooseRecord<Option<any>>>(
    dict: Dict,
  ): Option<{
    [K in keyof Dict]: Dict[K] extends Option<infer T> ? T : never
  }> => {
    const dictKeys = keys(dict)

    return Option.all(values(dict)).map((values) =>
      Object.fromEntries(zip(dictKeys, values)),
    )
  }

  static equals = <A>(
    a: Option<A>,
    b: Option<A>,
    equals: (a: A, b: A) => boolean,
  ): boolean => {
    return a.isSome() && b.isSome() ? equals(a.get(), b.get()) : a.tag === b.tag
  }

  static fromJSON = <A>(value: JsonOption<A>) => {
    return value.tag === "None" ? Option.None() : Option.Some(value.value)
  }

  /**
   * Returns the Option containing the value from the callback
   *
   * (Option\<A>, A => B) => Option\<B>
   */
  map<B>(this: Option<A>, func: (value: A) => B): Option<B> {
    if (this === NONE) {
      return this as unknown as Option<B>
    }
    return Option.Some(func((this as Some<A>).value))
  }

  /**
   * Returns the Option containing the value from the callback
   *
   * (Option\<A>, A => Option\<B>) => Option\<B>
   */
  flatMap<B>(this: Option<A>, func: (value: A) => Option<B>): Option<B> {
    if (this === NONE) {
      return this as unknown as Option<B>
    }
    return func((this as Some<A>).value)
  }

  /**
   * Returns the Option if its value matches the predicate, otherwise false
   *
   * (Option\<A>, A => boolean) => Option\<A>
   */
  filter<B extends A>(
    this: Option<A>,
    func: (value: A) => value is B,
  ): Option<B>
  filter(this: Option<A>, func: (value: A) => boolean): Option<A>
  filter(this: Option<A>, func: (value: A) => boolean): Option<A> {
    if (this === NONE) {
      return this as unknown as Option<A>
    }
    return func((this as Some<A>).value) ? this : (NONE as None<A>)
  }

  /**
   * Returns the value. Use within `if (Option.isSome()) { ... }`
   */
  get(this: Some<A>) {
    return this.value
  }
  /**
   * Return the value if present, and the fallback otherwise
   *
   * (Option\<A>, A) => A
   * @deprecated
   */
  getWithDefault(this: Option<A>, defaultValue: A): A {
    if (this === NONE) {
      return defaultValue
    }
    return (this as Some<A>).value
  }
  /**
   * Return the value if present, and the fallback otherwise
   *
   * (Option\<A>, A) => A
   */
  getOr(this: Option<A>, defaultValue: A): A {
    if (this === NONE) {
      return defaultValue
    }
    return (this as Some<A>).value
  }

  /**
   * Return the value if present, and the fallback otherwise
   *
   * (Option\<A>, Option\<A>) => Option\<A>
   */
  orElse(this: Option<A>, other: Option<A>): Option<A> {
    if (this === NONE) {
      return other
    }
    return this
  }

  /**
   * Maps the value if present, returns the fallback otherwise
   *
   * (Option\<A>, B, A => B) => B
   */
  mapOr<B>(this: Option<A>, defaultValue: B, mapper: (value: A) => B): B {
    if (this === NONE) {
      return defaultValue
    }
    return mapper((this as Some<A>).value)
  }

  /**
   * Explodes the Option given its case
   */
  match<B1, B2 = B1>(
    this: Option<A>,
    config: { Some: (value: A) => B1; None: () => B2 },
  ): B1 | B2 {
    if (this === NONE) {
      return config.None()
    }
    return config.Some((this as Some<A>).value)
  }

  /**
   * Runs the callback and returns `this`
   */
  tap(this: Option<A>, func: (option: Option<A>) => unknown): Option<A> {
    func(this)
    return this
  }

  /**
   * Runs the callback if some and returns `this`
   */
  tapSome(this: Option<A>, func: (option: A) => unknown): Option<A> {
    if (this === NONE) {
      return this
    }
    func((this as Some<A>).value)
    return this
  }

  /**
   * Converts the Option\<A> to a `A | undefined`
   */
  toUndefined(this: Option<A>): A | undefined {
    if (this === NONE) {
      return undefined
    }
    return (this as Some<A>).value
  }

  /**
   * Converts the Option\<A> to a `A | null`
   */
  toNull(this: Option<A>): A | null {
    if (this === NONE) {
      return null
    }
    return (this as Some<A>).value
  }

  /**
   * Takes the option and turns it into Ok(value) is Some, or Error(valueWhenNone)
   */
  toResult<E>(this: Option<A>, valueWhenNone: E): Result<A, E> {
    return this.match({
      Some: (ok) => Result.Ok(ok),
      None: () => Result.Error(valueWhenNone),
    })
  }

  /**
   * Typeguard
   */
  isSome(this: Option<A>): this is Some<A> {
    return this !== NONE
  }

  /**
   * Typeguard
   */
  isNone(this: Option<A>): this is None<A> {
    return this === NONE
  }

  toJSON(this: Option<A>): JsonOption<A> {
    return this.match<JsonOption<A>>({
      None: () => ({ [BOXED_TYPE]: "Option", tag: "None" }),
      Some: (value) => ({ [BOXED_TYPE]: "Option", tag: "Some", value }),
    })
  }
}

// @ts-expect-error
__Option.prototype.__boxed_type__ = "Option"

const OPTION_PROTO = __Option.prototype

const NONE = (() => {
  const option = Object.create(OPTION_PROTO) as None<unknown>
  // @ts-expect-error
  option.tag = "None"
  Object.freeze(option)
  return option
})()

interface Some<A> extends __Option<A> {
  readonly tag: "Some"
  readonly value: A
}

interface None<A> extends __Option<A> {
  readonly tag: "None"
}

export const Option = __Option
export type Option<A> = Some<A> | None<A>

const OkStore = createStore()
const ErrorStore = createStore()

class __Result<A, E> {
  static P = {
    Ok: <const A>(value: A) => ({ tag: "Ok", value }) as const,
    Error: <const E>(error: E) => ({ tag: "Error", error }) as const,
  }

  static Ok = <A = never, E = never>(value: A): Result<A, E> => {
    const existing = OkStore.get(value)
    if (existing == undefined) {
      const result = Object.create(RESULT_PROTO) as Ok<A, E>
      // @ts-expect-error
      result.tag = "Ok"
      // @ts-expect-error
      result.value = value
      Object.freeze(result)
      OkStore.set(value, result)
      return result
    } else {
      return existing as Ok<A, E>
    }
  }

  static Error = <A = never, E = never>(error: E): Result<A, E> => {
    const existing = ErrorStore.get(error)
    if (existing == undefined) {
      const result = Object.create(RESULT_PROTO) as Error<A, E>
      // @ts-expect-error
      result.tag = "Error"
      // @ts-expect-error
      result.error = error
      Object.freeze(result)
      ErrorStore.set(error, result)
      return result
    } else {
      return existing as Error<A, E>
    }
  }

  static isResult = (value: unknown): value is Result<unknown, unknown> =>
    // @ts-ignore
    value != null && value.__boxed_type__ === "Result"

  /**
   * Runs the function and resolves a result of its return value, or to an error if thrown
   */
  static fromExecution = <A, E = unknown>(func: () => A): Result<A, E> => {
    try {
      return Result.Ok(func())
    } catch (error) {
      return Result.Error(error) as Result<A, E>
    }
  }

  /**
   * Takes the promise and resolves a result of its value, or to an error if rejected
   */
  static fromPromise = async <A, E = unknown>(
    promise: Promise<A>,
  ): Promise<Result<A, E>> => {
    try {
      const value = await promise
      return Result.Ok<A, E>(value)
    } catch (error) {
      return Result.Error<A, E>(error as E)
    }
  }

  /**
   * Takes the option and turns it into Ok(value) is Some, or Error(valueWhenNone)
   */
  static fromOption = <A, E>(
    option: Option<A>,
    valueWhenNone: E,
  ): Result<A, E> => {
    return option.toResult(valueWhenNone)
  }

  /**
   * Turns an array of results into an result of array
   */
  static all = <Results extends Result<any, any>[] | []>(results: Results) => {
    const length = results.length
    let acc = Result.Ok<Array<unknown>, unknown>([])
    let index = 0

    while (true) {
      if (index >= length) {
        return acc as Result<
          {
            [K in keyof Results]: Results[K] extends Result<infer T, any>
              ? T
              : never
          },
          {
            [K in keyof Results]: Results[K] extends Result<any, infer T>
              ? T
              : never
          }[number]
        >
      }

      const item = results[index]

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
   * Turns an dict of results into a results of dict
   */
  static allFromDict = <Dict extends LooseRecord<Result<any, any>>>(
    dict: Dict,
  ): Result<
    {
      [K in keyof Dict]: Dict[K] extends Result<infer T, any> ? T : never
    },
    {
      [K in keyof Dict]: Dict[K] extends Result<any, infer T> ? T : never
    }[keyof Dict]
  > => {
    const dictKeys = keys(dict)

    return Result.all(values(dict)).map((values) =>
      Object.fromEntries(zip(dictKeys, values)),
    )
  }

  static equals = <A, E>(
    a: Result<A, E>,
    b: Result<A, E>,
    equals: (a: A, b: A) => boolean,
  ) => {
    if (a.tag !== b.tag) {
      return false
    }
    if (a.isError() && b.isError()) {
      return true
    }

    if (a.isOk() && b.isOk()) {
      return equals(a.get(), b.get())
    }

    return false
  }

  static fromJSON = <A, E>(value: JsonResult<A, E>): Result<A, E> => {
    return value.tag === "Ok"
      ? Result.Ok(value.value)
      : Result.Error(value.error)
  }

  /**
   * Returns the Result containing the value from the callback
   *
   * (Result\<A, E>, A => B) => Result\<B>
   */
  map<B>(this: Result<A, E>, func: (value: A) => B): Result<B, E> {
    return this.tag === "Ok"
      ? Result.Ok(func(this.value))
      : (this as unknown as Result<B, E>)
  }

  /**
   * Returns the Result containing the error returned from the callback
   *
   * (Result\<A, E>, E => F) => Result\<F>
   */
  mapError<F>(this: Result<A, E>, func: (value: E) => F): Result<A, F> {
    return this.tag === "Ok"
      ? (this as unknown as Result<A, F>)
      : Result.Error(func(this.error))
  }

  /**
   * Returns the Result containing the value from the callback
   *
   * (Result\<A, E>, A => Result\<B, F>) => Result\<B, E | F>
   */
  flatMap<B, F>(
    this: Result<A, E>,
    func: (value: A) => Result<B, F>,
  ): Result<B, F | E> {
    return this.tag === "Ok"
      ? func(this.value)
      : (this as unknown as Result<B, F | E>)
  }

  /**
   * Returns the Result containing the value from the callback
   *
   * (Result\<A, E>, E => Result\<A, F>) => Result\<A | B, F>
   */
  flatMapError<B, F>(
    this: Result<A, E>,
    func: (value: E) => Result<B, F>,
  ): Result<A | B, F> {
    return this.tag === "Ok"
      ? (this as unknown as Result<A | B, F>)
      : func(this.error)
  }
  /**
   * Returns the value. Use within `if (result.isOk()) { ... }`
   */
  get(this: Ok<A, E>) {
    return this.value
  }

  /**
   * Returns the error. Use within `if (result.isError()) { ... }`
   */
  getError(this: Error<A, E>) {
    return this.error
  }

  /**
   * Return the value if present, and the fallback otherwise
   *
   * (Result\<A, E>, A) => A
   * @deprecated
   */
  getWithDefault(this: Result<A, E>, defaultValue: A): A {
    return this.tag === "Ok" ? this.value : defaultValue
  }

  /**
   * Return the value if present, and the fallback otherwise
   *
   * (Result\<A, E>, A) => A
   */
  getOr(this: Result<A, E>, defaultValue: A): A {
    return this.tag === "Ok" ? this.value : defaultValue
  }

  /**
   * Maps the value if present, returns the fallback otherwise
   *
   * (Result\<A, E>, B, A => B) => B
   */
  mapOr<B>(this: Result<A, E>, defaultValue: B, mapper: (value: A) => B): B {
    if (this.tag === "Error") {
      return defaultValue
    }
    return mapper((this as Ok<A, E>).value)
  }

  /**
   * Explodes the Result given its case
   */
  match<B1, B2 = B1>(
    this: Result<A, E>,
    config: { Ok: (value: A) => B1; Error: (error: E) => B2 },
  ): B1 | B2 {
    return this.tag === "Ok" ? config.Ok(this.value) : config.Error(this.error)
  }

  /**
   * Runs the callback and returns `this`
   */
  tap(
    this: Result<A, E>,
    func: (result: Result<A, E>) => unknown,
  ): Result<A, E> {
    func(this)
    return this
  }

  /**
   * Runs the callback if ok and returns `this`
   */
  tapOk(this: Result<A, E>, func: (value: A) => unknown): Result<A, E> {
    if (this.tag === "Ok") {
      func(this.value)
    }
    return this
  }

  /**
   * Runs the callback if error and returns `this`
   */
  tapError(this: Result<A, E>, func: (error: E) => unknown): Result<A, E> {
    if (this.tag === "Error") {
      func(this.error)
    }
    return this
  }

  /**
   * Return an option of the value
   *
   * (Result\<A, E>) => Option\<A>
   */
  toOption(this: Result<A, E>): Option<A> {
    return this.tag === "Ok" ? Option.Some(this.value) : (NONE as None<A>)
  }

  /**
   * Typeguard
   */
  isOk(this: Result<A, E>): this is Ok<A, E> {
    return this.tag === "Ok"
  }

  /**
   * Typeguard
   */
  isError(this: Result<A, E>): this is Error<A, E> {
    return this.tag === "Error"
  }

  toJSON(this: Result<A, E>): JsonResult<A, E> {
    return this.match<JsonResult<A, E>>({
      Ok: (value) => ({ [BOXED_TYPE]: "Result", tag: "Ok", value }),
      Error: (error) => ({ [BOXED_TYPE]: "Result", tag: "Error", error }),
    })
  }
}

// @ts-expect-error
__Result.prototype.__boxed_type__ = "Result"

const RESULT_PROTO = __Result.prototype

interface Ok<A, E> extends __Result<A, E> {
  readonly tag: "Ok"
  readonly value: A
}

interface Error<A, E> extends __Result<A, E> {
  readonly tag: "Error"
  readonly error: E
}

export const Result = __Result
export type Result<A, E> = Ok<A, E> | Error<A, E>
