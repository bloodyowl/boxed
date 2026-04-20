type Ref<T> = { contents: T }

const NOT_COMPUTED = Symbol("NOT_COMPUTED")

export const Lazy = <Value>(func: () => Value): { get: () => Value } => {
  const value: Ref<Value | typeof NOT_COMPUTED> = { contents: NOT_COMPUTED }
  return {
    get() {
      if (value.contents === NOT_COMPUTED) {
        value.contents = func()
      }
      return value.contents
    },
  }
}
