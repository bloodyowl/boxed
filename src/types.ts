export type LooseRecord<T> = Record<PropertyKey, T>

export type JsonResult<A, E> =
  | { tag: "Ok"; value: A }
  | { tag: "Error"; error: E }

export type JsonAsyncData<A> =
  | { tag: "NotAsked" }
  | { tag: "Loading" }
  | { tag: "Done"; value: A }

export type JsonOption<A> = { tag: "None" } | { tag: "Some"; value: A }
