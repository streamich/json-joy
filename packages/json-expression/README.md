# JSON Expression

[JSON Expression](https://jsonjoy.com/specs/json-expression) is an s-expression based language for JSON. It is designed to
be a more human-readable and writable alternative to JSON. It uses JSON as its
data model and syntax.

JSON Expressions are JIT compiled to efficient machine code.

JSON Expression is a simple JSON DSL, which allows to write expressions and
evaluate expressions.

For example, the following expression

```js
['+', 1, 2]; // 1 + 2
```

evaluates to 3.


## Usage

`json-expression` library can immediately evaluate expressions or it can
compile an efficient expression to a function, which will execute about
an order of magnitude faster.

Evaluating expression immediately as-is.

```ts
import {evaluate} from '@jsonjoy.com/json-expression';

const expression = ['+', 1, ['$', '/foo']];
const data = {foo: 2};

evaluate(expression, {data}); // 3
```

Pre-compiling expression to an optimized function.

```ts
import {JsonExpressionCodegen} from '@jsonjoy.com/json-expression';

const expression = ['+', 1, ['$', '/foo']];
const codegen = new JsonExpressionCodegen({expression});
const fn = codegen.run().compile();
const data = {foo: 2};

fn({data}); // 3
```


## Documentation

`json-expression` library supports few dozen operators, see full list in `Expr`
type [here](./types.ts).

Parsing rules:

1. JSON Expression is a valid JSON value.
2. All expressions are JSON arrays, which start with a string which specifies
   the operator and remaining array elements are operands. For example, the
   "get" operator fetches some value from supplied data using JSON
   Pointer:`["get", "/some/path"]`.
3. All other values are treated as literals. Except for arrays, which need to
   be enclosed in square brackets. For example, to specify an empty array, you
   box your array in square brackets: `[[]]`. This evaluates to an empty array
   JSON value `[]`.


## Use Cases

Consider you application receives a stream of JSON Cloud Events, like this:

```js
{
  "specversion" : "1.0",
  "type" : "com.example.someevent",
  "source" : "/mycontext",
  "subject": null,
  "id" : "C234-1234-1234",
  "time" : "2018-04-05T17:31:00Z",
  "comexampleextension1" : "value",
  "comexampleothervalue" : 5,
  "datacontenttype" : "application/json",
  "data" : {
      "appinfoA" : "abc",
      "appinfoB" : 123,
      "appinfoC" : true
  }
}
```

You could write and compile a JSON Expression to efficiently filter out events
you are interested in, for example your expression could look like this:

```js
[
  'and',
  ['==', ['$', '/specversion'], '1.0'],
  ['starts', ['$', '/type'], 'com.example.'],
  ['in', ['$', '/datacontenttype'], [['application/octet-stream', 'application/json']]],
  ['==', ['$', '/data/appinfoA'], 'abc'],
];
```


## Benchmark

```
node benchmarks/json-expression/main.js
json-joy/json-expression JsonExpressionCodegen x 14,557,786 ops/sec ±0.09% (100 runs sampled), 69 ns/op
json-joy/json-expression JsonExpressionCodegen with codegen x 170,098 ops/sec ±0.13% (101 runs sampled), 5879 ns/op
json-joy/json-expression evaluate x 864,956 ops/sec ±0.10% (101 runs sampled), 1156 ns/op
json-logic-js x 821,799 ops/sec ±0.18% (99 runs sampled), 1217 ns/op
Fastest is json-joy/json-expression JsonExpressionCodegen
```
