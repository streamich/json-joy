# json-equal

This library contains the fastest JSON deep comparison algorithms.

- `deepEqual` &mdash; deep comparison of JSON objects. Faster than `fast-deep-equal` and
  `fast-equals` packages.
- `$$deepEqual` &mdash; if the comparison JSON object is known in advance, this function
  can pre-compile a javascript function for comparison, which is about an order of magnitude
  faster than `deepEqual`.


## Reference


### `deepEqual`

```ts
import {deepEqual} from 'lib/json-equal/deepEqual';

deepEqual(a, b); // true/false
```


### `$$deepEqual`

```ts
import {$$deepEqual} from 'lib/json-equal/$$deepEqual';

const js = $$deepEqual(a);
const fn = eval(js);

fn(b); // true/false
```


## Benchmarks

```
node benchmarks/json-equal/bench.deepEqual.js
json-equal (v1) x 873,303 ops/sec ±0.34% (96 runs sampled), 1145 ns/op
json-equal (v2) x 664,673 ops/sec ±0.44% (97 runs sampled), 1504 ns/op
json-equal (v3) x 710,572 ops/sec ±0.15% (100 runs sampled), 1407 ns/op
fast-deep-equal x 620,740 ops/sec ±0.34% (101 runs sampled), 1611 ns/op
fast-equals x 812,390 ops/sec ±0.11% (101 runs sampled), 1231 ns/op
lodash.isEqual x 182,440 ops/sec ±0.18% (98 runs sampled), 5481 ns/op
json-equal/deepEqualCodegen x 6,161,316 ops/sec ±0.30% (101 runs sampled), 162 ns/op
json-equal/deepEqualCodegen (with codegen) x 47,583 ops/sec ±0.11% (100 runs sampled), 21016 ns/op
Fastest is json-equal/deepEqualCodegen
```
