# `json-size`

This library implements methods to calculate the size of JSON objects.
It calculates the size of bytes necessary to store the final serialized JSON
in UTF-8 encoding.

## Usage

```ts
import {jsonSize} from 'json-joy/{lib,es6}/json-size';

jsonSize({1: 2, foo: 'bar'}); // 19
```

## Reference

- `jsonSize` &mdash; calculates exact JSON size, as `JSON.stringify()` would return.
- `jsonSizeApprox` &mdash; a faster version, which uses string nominal length for calculation.
- `jsonSizeFast` &mdash; the fastest version, which uses nominal values for all JSON types. See
  source code for description.
- `msgpackSizeFast` &mdash; same as `jsonSizeFast`, but for MessagePack values. In addition
  to regular JSON values it also supports binary data (by `Buffer` or `Uint8Array`),
  `JsonPackExtension`, and `JsonPackValue`.

## Performance

In most cases `json-size` will be faster than `JSON.stringify`.

```
node benchmarks/json-size.js
json-joy/json-size jsonSize() x 377,980 ops/sec ±0.12% (100 runs sampled), 2646 ns/op
json-joy/json-size jsonSizeApprox() x 377,841 ops/sec ±0.09% (98 runs sampled), 2647 ns/op
json-joy/json-size jsonSizeFast() x 2,229,344 ops/sec ±0.30% (101 runs sampled), 449 ns/op
json-joy/json-size msgpackSizeFast() x 1,260,284 ops/sec ±0.10% (96 runs sampled), 793 ns/op
JSON.stringify x 349,696 ops/sec ±0.08% (100 runs sampled), 2860 ns/op
JSON.stringify + utf8Count x 182,977 ops/sec ±0.10% (100 runs sampled), 5465 ns/op
Fastest is json-joy/json-size jsonSizeFast()
```
