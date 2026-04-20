import { Future } from "./Future"

export const Deferred = {
  make<Value>() {
    let resolve: (value: Value) => void
    const future = Future.make<Value>((_resolve) => {
      resolve = _resolve
    })
    // @ts-expect-error `resolver` is always defined
    return [future, resolve] as const
  },
}
