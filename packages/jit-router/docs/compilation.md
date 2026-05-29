## Compilation

`router.compile()` turns the registered route table into a single
JavaScript function. There's no interpreter loop, no array of patterns to
walk, no per-call lookup --- just hand-shaped branches over the input
string.

The cost is paid once at compile time. The matcher is then as fast as the
JS engine can run the generated code.


## How the codegen works


1. **Tree construction.** Every route is decomposed into a list of *steps*
   (exact / until / regex). Steps are inserted into a hybrid structure:
   - A Radix tree for shared prefixes of exact text.
   - Branch lists for parameter and regex steps.
   This lets routes that share a prefix (`GET /api/users/...`,
   `GET /api/users/{id}`, `GET /api/orgs`) collapse into one descent.

2. **Code generation.** The tree is walked once. At each node, the
   codegen emits the cheapest possible JS:
   - Exact steps become `str.charCodeAt(i) === C` comparisons or fused
     multi-char checks via the `emitStringMatch` helper.
   - Until steps become `indexOf` + `slice` pairs.
   - Regex steps inline a precompiled `RegExp` and call `.exec` on a
     slice of the input.
   Successful matches `return new Match(data, params)` immediately ---
   no further branches considered.

3. **Function creation.** The generated source is wrapped in a `new
   Function(...)` call and returned.


## Inspecting the output

Print the routing tree before compilation:

```ts
console.log(router.toString());
```

Print the generated matcher source:

```ts
const matcher = router.compile();
console.log(matcher.toString());
```

Both are stable enough to commit to a fixture file when tracking
regressions in routing precedence.


## Performance characteristics

Empirically against `find-my-way` (the router used by Fastify), on the
realistic benchmark suite shipped with the package:

| Workload | jit-router | find-my-way | speedup |
|---|---|---|---|
| Combined 60-route benchmark | ~1.8 M ops/s | ~390 K ops/s | ~4.6x |
| Static `GET /ping` | ~150 M ops/s | ~14 M ops/s | ~10x |
| Single-param `GET /users/{id}` | ~24.2 M ops/s | ~5.8 M ops/s | ~4.2x |
| Deep path ``GET /api/collections/`{id}/documents/{id}/revisions/{id}` | ~7.1 M ops/s | ~2.8 M ops/s | ~2.5x |

Numbers are from the JIT-compiled matcher running steady-state, the first
few calls pay the V8 warm-up tax like any hot function.

The full benchmark, exactly as published in the package, is in
`src/__bench__/realistic.bench.ts` --- run with `ts-node` and your
results will be in the same ballpark, modulo CPU.


## When to recompile

`compile()` is not free --- it walks the tree, allocates strings, and
calls `new Function`. Build the matcher once and reuse it.

For dynamic routing tables (rare in HTTP, common in plugin systems), batch
your `add` calls and recompile after each batch:

```ts
for (const plugin of plugins) plugin.register(router);
const matcher = router.compile();
```

The cost scales linearly with the number of routes, with hundreds of
routes the compile step is still a few milliseconds on a modern laptop.


## Determinism and precedence

The codegen visits step types in a fixed order: exact steps first, then
until steps, then regex steps. Within each, insertion order is preserved.
If two routes can match the same input, the first registered wins.

For HTTP-style routing this almost always matches intuition: literal
routes take precedence over parameterized ones; parameterized over regex.
If you need a less specific route to win, register it first.
