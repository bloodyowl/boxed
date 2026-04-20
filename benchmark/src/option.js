const Benchmark = require("benchmark")
const fp = require("fp-ts")
const effect = require("effect")
const { Option } = require("../../dist/Boxed")

const suite = new Benchmark.Suite()

suite.add("fp-ts Option none", () => {
  return fp.function.pipe(
    fp.option.fromNullable(null),
    fp.option.map((x) => x * 2),
    fp.option.getOrElse(() => 10),
  )
})

suite.add("fp-ts Option some", () => {
  return fp.function.pipe(
    fp.option.fromNullable(10),
    fp.option.map((x) => x * 2),
    fp.option.getOrElse(() => 10),
  )
})

suite.add("fp-ts Option some chain", () => {
  return fp.function.pipe(
    fp.option.fromNullable(10),
    fp.option.chain((x) => fp.option.some(x * 2)),
    fp.option.getOrElse(() => 10),
  )
})

suite.add("effect Option none", () => {
  return effect.pipe(
    effect.Option.fromNullable(null),
    effect.Option.map((x) => x * 2),
    effect.Option.orElse(() => 10),
  )
})

suite.add("effect Option some", () => {
  return effect.pipe(
    effect.Option.fromNullable(10),
    effect.Option.map((x) => x * 2),
    effect.Option.getOrElse(() => 10),
  )
})

suite.add("effect Option some chain", () => {
  return effect.pipe(
    effect.Option.fromNullable(10),
    effect.Option.flatMap((x) => effect.Option.some(x * 2)),
    effect.Option.getOrElse(() => 10),
  )
})

suite.add("Boxed Option none", () => {
  return Option.fromNullable(null)
    .map((x) => x * 2)
    .getOr(10)
})

suite.add("Boxed Option some", () => {
  return Option.fromNullable(10)
    .map((x) => x * 2)
    .getOr(10)
})

suite.add("Boxed Option some flatMap", () => {
  return Option.fromNullable(10)
    .flatMap((x) => Option.Some(x * 2))
    .getOr(10)
})

suite.on("cycle", function (event) {
  console.log(String(event.target))
})

suite.run({ async: true })
