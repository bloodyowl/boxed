const weakRefFallbackMap = new WeakMap()

interface WeakRefLike<T extends WeakKey> {
  deref(): T | undefined
}

// We can replicate the WeakRef for older browsers using a `WeakMap` using
// the weakref-like instace as key.
const WeakRefWithLegacyFallback =
  typeof WeakRef === "function"
    ? WeakRef
    : class WeakRefWithFallback {
        constructor(value: unknown) {
          weakRefFallbackMap.set(this, value)
        }
        deref() {
          return weakRefFallbackMap.get(this)
        }
      }
// For each tag variant that can contain a value (`Some`, `Ok`, `Error`, `Done`), we create a store.
// The store enables us to keep a map of `value` to the container of this `value`.

// The container is stored through a `WeakRef`, ensuring that we don't prevent the containers
// from being garbage-collected.
export const createStore = () => {
  const store = new Map<unknown, WeakRefLike<object>>()

  // We subscribe to the garbage collection, to make sure we don't keep in memory
  // some values that we don't need as keys, because if all instances of a container of
  // a given value have been garbage collected, there isn't any comparison required.

  // For instance, let's say we have an object `x`, and create a `Option.Some(x)`:
  // 1. As long as `Option.Some(x)` isn't garbage collected,
  //    it means that the value needs to remain stable as it can be compared to
  //    another `Option.Some(x)`.
  // 2. If all references to `Option.Some(x)` are garbage collected, it means that
  //    it's safe to dispose, as we don't have anymore requirement for comparison.
  // 3. If we re-create an `Option.Some(x)` afterwards, the first one re-created is
  //    the new basis for comparison.
  const registry =
    typeof FinalizationRegistry === "function"
      ? new FinalizationRegistry((value) => {
          store.delete(value)
        })
      : undefined

  return {
    set: (key: unknown, value: object) => {
      store.set(key, new WeakRefWithLegacyFallback(value))
      // Older browsers that don't have `FinalizationRegistry` don't benefit
      // from the memory cleanup, but that's fine as a best-effort thing
      if (registry !== undefined) {
        registry.register(value, key)
      }
    },
    get: (key: unknown): unknown => {
      const value = store.get(key)
      if (value !== undefined) {
        return value.deref()
      }
    },
  }
}
