const Benchmark = require("benchmark")
const fp = require("fp-ts")
const effect = require("effect")
const { Result } = require("../../dist/Boxed")

const suite = new Benchmark.Suite()

suite.add("fp-ts Result", () => {
  return fp.function.pipe(
    fp.either.right(1),
    fp.either.map((x) => x * 2),
    fp.either.getOrElse(() => 10),
  )
})

suite.add("effect Result", () => {
  return effect.pipe(
    effect.Either.right(1),
    effect.Either.map((x) => x * 2),
    effect.Either.getOrElse(() => 10),
  )
})

suite.add("Boxed Result", () => {
  return Result.Ok(1)
    .map((x) => x * 2)
    .getOr(10)
})

suite.on("cycle", function (event) {
  console.log(String(event.target))
})

suite.run({ async: true })
