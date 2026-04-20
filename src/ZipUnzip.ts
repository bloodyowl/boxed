export const unzip = <TupleArray extends [any, any][]>(array: TupleArray) => {
  const length = array.length
  const arrayA = Array(length)
  const arrayB = Array(length)
  let index = -1
  while (++index < length) {
    const match = array[index]
    if (match !== undefined) {
      arrayA[index] = match[0]
      arrayB[index] = match[1]
    }
  }
  return [arrayA, arrayB] as [
    {
      [I in keyof TupleArray]: TupleArray[I] extends [any, any]
        ? TupleArray[I][0] extends infer T
          ? T
          : never
        : never
    },
    {
      [I in keyof TupleArray]: TupleArray[I] extends [any, any]
        ? TupleArray[I][1] extends infer T
          ? T
          : never
        : never
    },
  ]
}

export const zip = <ArrayA extends any[], ArrayB extends any[]>(
  arrayA: ArrayA,
  arrayB: ArrayB,
) => {
  const length = Math.min(arrayA.length, arrayB.length)
  const array = Array(length)
  let index = -1
  while (++index < length) {
    array[index] = [arrayA[index], arrayB[index]]
  }
  return array as [
    {
      [I in keyof ArrayA]: ArrayA[I] extends infer T ? T : never
    }[number],
    {
      [I in keyof ArrayB]: ArrayB[I] extends infer T ? T : never
    }[number],
  ][]
}
