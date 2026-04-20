import { Option } from "./OptionResult"

export const from = Array.from

export const of = Array.of

export const isArray = Array.isArray

export const findMap = <A, B>(
  array: ReadonlyArray<A>,
  func: (item: A) => Option<B>,
): Option<B> => {
  let index = -1
  while (++index < array.length) {
    const item = array[index] as A
    const mapped = func(item)
    if (mapped.isSome()) {
      return mapped
    }
  }
  return Option.None()
}

export const filterMap = <A, B>(
  array: ReadonlyArray<A>,
  func: (item: A) => Option<B>,
): Array<B> => {
  const result: Array<B> = []
  array.forEach((item) => {
    const mapped = func(item)
    if (mapped.isSome()) {
      result.push(mapped.get())
    }
  })
  return result
}

export const find = <A>(
  array: ReadonlyArray<A>,
  func: (item: A) => boolean,
): Option<A> => {
  let index = -1
  while (++index < array.length) {
    const item = array[index] as A
    if (func(item)) {
      return Option.Some(item)
    }
  }
  return Option.None()
}

export const findIndex = <A>(
  array: ReadonlyArray<A>,
  func: (item: A) => boolean,
): Option<number> => {
  let index = -1
  while (++index < array.length) {
    const item = array[index] as A
    if (func(item)) {
      return Option.Some(index)
    }
  }
  return Option.None()
}

const defaultCompare = <A>(a: A, b: A) => {
  if (a === b) {
    return 0
  }
  return a > b ? 1 : -1
}

export const binarySearchBy = <A>(
  sortedArray: ReadonlyArray<A>,
  key: A,
  compare = defaultCompare,
) => {
  if (sortedArray.length === 0) {
    return -1
  }
  let low = 0
  let high = sortedArray.length - 1
  while (true) {
    let mid = (low + (high - low) / 2) | 0
    if (mid === low || mid === high) {
      return high
    }
    let midItem = sortedArray[mid] as A
    let diff = compare(key, midItem)
    if (diff === 0) {
      return mid
    }
    if (diff > 0) {
      low = mid
      continue
    }
    if (diff < 0) {
      high = mid
      continue
    }
  }
}

export { unzip, zip } from "./ZipUnzip"
