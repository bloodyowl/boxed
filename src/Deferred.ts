import { Future } from "./Future";

export const Deferred = {
  make<Value>() {
    let resolve: (value: Value) => void;
    let panic: (error: unknown) => void;
    const future = Future.make<Value>((_resolve, _panic) => {
      resolve = _resolve;
      panic = _panic;
    });
    // @ts-expect-error `resolve` and `panic` are always defined
    return [future, resolve, panic] as const;
  },
};
