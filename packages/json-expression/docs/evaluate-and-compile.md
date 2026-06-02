There are two ways to run an expression: interpret it with `evaluate`, or
JIT-compile it to a JavaScript function with `JsonExpressionCodegen`. Both
share the same operator set and produce identical results.

## `evaluate`

`evaluate` walks the expression tree once and returns the result. It is bound to
the full operator set, so you only pass the expression and a context with a
`Vars` instance:

```ts
import {evaluate, Vars} from '@jsonjoy.com/json-expression';

evaluate(['*', 2, ['$', '/x']], {vars: new Vars({x: 21})}); // => 42
```

Reach for `evaluate` when the expression runs once, changes often, or is
supplied at runtime --- there is no compile step to amortize.

## `JsonExpressionCodegen`

The codegen compiles an expression into a plain function `(vars) => result`.
Compiling has up-front cost but the returned function runs about an order of
magnitude faster, so it pays off when one expression runs against many inputs.

Unlike `evaluate`, the codegen needs the operator set passed explicitly:

```ts
import {JsonExpressionCodegen, Vars} from '@jsonjoy.com/json-expression';
import {operatorsMap} from '@jsonjoy.com/json-expression/lib/operators';

const codegen = new JsonExpressionCodegen({
  expression: ['*', 2, ['$', '/x']],
  operators: operatorsMap,
});
const fn = codegen.run().compile();

fn(new Vars({x: 21})); // => 42
fn(new Vars({x: 50})); // => 100
```

Call `.run()` once to build the code, then `.compile()` to get the function.
`.compile()` wraps execution so thrown non-`Error` values are normalized;
`.compileRaw()` skips that wrapper. `.generate()` returns the generated source
if you want to inspect what was produced.

## Constant folding

The compiler evaluates *pure* sub-expressions whose operands are all literals at
compile time, baking the result into the generated code:

```ts
// ['+', 1, 2] is folded to the constant 3 during compilation.
const fn = new JsonExpressionCodegen({
  expression: ['+', ['+', 1, 2], ['$', '/x']],
  operators: operatorsMap,
}).run().compile();
```

Operators that read input or otherwise have side effects --- `$`, `get`, `get?` --- are
marked impure and are never folded, so they re-run on every call.

## Matching with `createPattern`

The `matches` string operator needs a pattern compiler, supplied via the
`createPattern` option on *both* `evaluate` and the codegen. It receives the
pattern string and returns a `(value: string) => boolean` tester. This keeps the
choice of regex/glob engine (and its security trade-offs) in your hands:

```ts
const createPattern = (pattern: string) => {
  const re = new RegExp(pattern);
  return (value: string) => re.test(value);
};

evaluate(['matches', ['$', '/name'], 'A.*'], {
  vars: new Vars({name: 'Alice'}),
  createPattern,
}); // => true
```

Without `createPattern`, `matches` throws.

## Which to use

| Situation | Use |
|-----------|-----|
| Expression supplied at runtime, runs once | `evaluate` |
| One expression, many inputs (hot path) | `JsonExpressionCodegen` |
| Need to inspect generated JS | `JsonExpressionCodegen` + `.generate()` |
| Using `matches` | either, with `createPattern` |
