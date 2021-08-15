# `json-size`

This library implements methods to calculate the size of JSON objects.
It calculates the size of bytes necessary to store the final serialized JSON
in UTF-8 encoding.

## Usage

```ts
import {jsonSize} from 'json-joy/{lib,es6}/json-size';

jsonSize({1: 2, foo: 'bar'}) // 19
```

## Performance

In most cases `json-size` will be faster than `JSON.stringify`.

```
node benchmarks/json-size
json-joy/json-size x 450,036 ops/sec ±0.44% (98 runs sampled), 2222 ns/op
JSON.stringify + utf8Count x 244,640 ops/sec ±0.44% (97 runs sampled), 4088 ns/op
Fastest is json-joy/json-size
```
