JSON Expression is a small expression language whose syntax *is* JSON. An
expression is a JSON array whose first element names an operator; the remaining
elements are operands. Everything else is a literal.

```ts
['+', 1, 2]; // => 3
['and', ['>', ['$', '/age'], 18], ['starts', ['$', '/name'], 'A']];
```

Expressions can be **evaluated** directly, or **JIT-compiled** to a JavaScript
function that runs roughly an order of magnitude faster. The same expression
and the same operators back both paths, so you can prototype with `evaluate`
and switch to the compiler in hot code without changing the expression.

This package is the reference implementation of the
[JSON Expression specification](/specs/json-expression), which defines the
language and its operators independent of any one runtime.

## Install

```
npm install @jsonjoy.com/json-expression
```

## Quick start

Evaluate an expression against some input data:

```ts
import {evaluate, Vars} from '@jsonjoy.com/json-expression';

const expression = ['+', 1, ['$', '/foo']];
evaluate(expression, {vars: new Vars({foo: 2})}); // => 3
```

Or compile it once and reuse the function:

```ts
import {JsonExpressionCodegen, Vars} from '@jsonjoy.com/json-expression';
import {operatorsMap} from '@jsonjoy.com/json-expression/lib/operators';

const codegen = new JsonExpressionCodegen({
  expression: ['+', 1, ['$', '/foo']],
  operators: operatorsMap,
});
const fn = codegen.run().compile();

fn(new Vars({foo: 2})); // => 3
fn(new Vars({foo: 9})); // => 10
```

See [Evaluate and compile](/libs/json-expression/evaluate-and-compile) for when
to use each.

## Data model and syntax rules

An expression is plain JSON, parsed by three rules:

1. An expression is a valid JSON value.
2. **Arrays are operator calls.** The first element is the operator name (a
   string), the rest are operand expressions, evaluated recursively. For
   example `['$', '/some/path']` reads a value from the input.
3. **Everything else is a literal** --- numbers, strings, booleans, `null`, and
   objects. To use a *literal array*, wrap it in an extra array so it reads as a
   one-element expression: `[[1, 2, 3]]` evaluates to `[1, 2, 3]`, and `[[]]`
   evaluates to `[]`.

~~~jj.note
Rule 3 is the one that trips people up: a bare `[1, 2, 3]` is read as a call to
the operator named `1`. Box literal arrays as `[[1, 2, 3]]`.
~~~

Operators have **aliases** --- a readable word form and often a symbolic form.
`['add', 1, 2]` and `['+', 1, 2]` are the same expression, as are `['get', '/x']`
and `['$', '/x']`. The tables on the operator pages list every alias. For the
formal grammar and the authoritative operator list, see the
[JSON Expression spec](/specs/json-expression).

## Example: filtering an event stream

Given CloudEvents-shaped input:

```ts
{
  specversion: '1.0',
  type: 'com.example.someevent',
  datacontenttype: 'application/json',
  data: {appinfoA: 'abc'},
}
```

a single expression decides whether an event is interesting:

```ts
[
  'and',
  ['==', ['$', '/specversion'], '1.0'],
  ['starts', ['$', '/type'], 'com.example.'],
  ['in', [['application/octet-stream', 'application/json']], ['$', '/datacontenttype']],
  ['==', ['$', '/data/appinfoA'], 'abc'],
];
```

Compile it once and run it over every event in the stream.

## Operator reference

| Page | Covers |
|------|--------|
| [Variables](/libs/json-expression/variables) | Reading input: `$` / `get`, `get?`, default values, named variables, the `Vars` container |
| [Evaluate and compile](/libs/json-expression/evaluate-and-compile) | `evaluate()`, `JsonExpressionCodegen`, constant folding, the `createPattern` option |
| [Math and logic](/libs/json-expression/math-and-logic) | Arithmetic, comparison, logical, bitwise, and branching (`if`, `throw`) |
| [Strings and types](/libs/json-expression/strings-and-types) | `type`/casts, type guards, `len`/`member`, string operators and validators, binary reads |
| [Collections](/libs/json-expression/collections) | Array operators (incl. `filter`/`map`/`reduce`), object operators, and `jp.add` |
