import { Option } from "./OptionResult"
import { LooseRecord } from "./types"

export const fromEntries = Object.fromEntries

export const entries = <T extends LooseRecord<unknown>>(value: T) => {
  return Object.entries(value) as {
    [K in keyof T]-?: [K, T[K]]
  }[keyof T][]
}

export const keys = <T extends LooseRecord<unknown>>(value: T) =>
  Object.keys(value) as (keyof T)[]

export const values = <T extends LooseRecord<unknown>>(value: T) =>
  Object.values(value) as T[keyof T][]

const hasOwnProperty = Object.prototype.hasOwnProperty

export const fromOptional = <Dict extends LooseRecord<Option<any>>>(
  dict: Dict,
): {
  [K in keyof Dict]?: Dict[K] extends Option<infer T> ? T : never
} => {
  const result: Record<PropertyKey, unknown> = {}
  for (const key in dict) {
    if (hasOwnProperty.call(dict, key)) {
      const item = dict[key]
      if (item === undefined) {
        // should happen, but let's make the compiler happy
        continue
      }
      if (item.isSome()) {
        result[key] = item.get()
      }
    }
  }

  return result as {
    [K in keyof Dict]?: Dict[K] extends Option<infer T> ? T : never
  }
}
