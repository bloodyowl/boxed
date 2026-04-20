const Benchmark = require("benchmark")
const { Future, Result } = require("../../dist/Boxed")
const fp = require("fp-ts")
const effect = require("effect")

const suite = new Benchmark.Suite()

const getRandom = () => Promise.resolve(~~(Math.random() * 2))

suite.add("fp-ts TaskEither", {
  defer: true,
  fn: (deferred) => {
    fp.function
      .pipe(
        fp.taskEither.tryCatch(getRandom, String),
        fp.taskEither.flatMap((x) =>
          x % 2 === 0
            ? fp.taskEither.right(x)
            : fp.taskEither.left(new TypeError()),
        ),
      )()
      .then((x) => {
        deferred.resolve()
      })
  },
})

suite.add("effect Effect", {
  defer: true,
  fn: (deferred) => {
    effect
      .pipe(
        effect.Effect.tryPromise(getRandom),
        effect.Effect.flatMap((x) =>
          x % 2 === 0
            ? effect.Effect.succeed(x)
            : effect.Effect.fail(new TypeError()),
        ),
        effect.Effect.runPromiseExit,
      )
      .then(() => {
        deferred.resolve()
      })
  },
})

suite.add("Future", {
  defer: true,
  fn: (deferred) => {
    Future.fromPromise(getRandom())
      .mapOkToResult((x) =>
        x % 2 === 0 ? Result.Ok(x) : Result.Error(new TypeError()),
      )
      .onResolve(() => {
        deferred.resolve()
      })
  },
})

suite.on("cycle", function (event) {
  console.log(String(event.target))
})

suite.run({ async: true })
