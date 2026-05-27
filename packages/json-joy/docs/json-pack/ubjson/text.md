`json-pack` implements fast [UBJSON][ubjson] encoder and decoder. It is written in TypeScript
and has no external dependencies.

~~~jj.note
`json-pack` UBJSON codec supports all JSON types as well as binary data, using
the ``js Uint8Array`` class. So, you can encode and decode any JSON POJO and
binary data.

However, `json-pack` UBJSON decoder does not support [*Optimized Format*](https://ubjson.org/type-reference/container-types/).
Hence, if you will try to decode a UBJSON document that uses *Optimized Format*,
the decoder will throw an error.
~~~

[ubjson]: https://ubjson.org/


## Getting started

To get started you need to import `UbjsonEncoder` and `UbjsonDecoder` classes like
this:

```ts
import {UbjsonEncoder} from 'json-joy/es2020/json-pack/ubjson/UbjsonEncoder';
import {UbjsonDecoder} from 'json-joy/es2020/json-pack/ubjson/UbjsonDecoder';
import {Writer} from 'json-joy/es2020/util/buffers/Writer';
```


## Usage

Encode a JavaScript POJO to UBJSON:

```ts
const pojo = {
  id: 123,
  foo: 'bar',
  tags: ['a', 'b', 'c'],
  binary: new Uint8Array([1, 2, 3]),
};
const encoder = new UbjsonEncoder(new Writer());
const encoded = encoder.encode(pojo);

console.log(encoded);
// Uint8Array(56) [
//   123, 85,  2, 105, 100,  85, 123,  85,   3, 102, 111, 111,
//    83, 85,  3,  98,  97, 114,  85,   4, 116,  97, 103, 115,
//    91, 83, 85,   1,  97,  83,  85,   1,  98,  83,  85,   1,
//    99, 93, 85,   6,  98, 105, 110,  97, 114, 121,  91,  36,
//    85, 35, 85,   3,   1,   2,   3, 125
// ]
```

Decode UBJSON back to JavaScript POJO:

```ts
const decoder = new UbjsonDecoder();
const decoded = decoder.read(encoded);

console.log(decoded);
// {
//   id: 123,
//   foo: 'bar',
//   tags: [ 'a', 'b', 'c' ],
//   binary: Uint8Array(3) [ 1, 2, 3 ]
// }
```


## Benchmarks

`json-pack` ships the fastest UBJSON encoder and decoder in NPM ecosystem. The
encoder is at least 20x faster than `@shelacek/ubjson`.

~~~jj.aside
Benchmark were performed using Node.js v20.2.0 on Apple M1 chip. The numbers show
the number of POJO objects encoded/decoded per second.
~~~


### Encoding

![ubjson-encoding-benchmark-results](https://appsets.jsonjoy.com/libraries/json-joy-js/json-pack/ubjson-encoding-results.png)


### Decoding

![ubjson-decoding-benchmark-results](https://appsets.jsonjoy.com/libraries/json-joy-js/json-pack/ubjson-decoding-results.png)


### Running the benchmarks

You can run the benchmarks yourself by cloning the `json-joy` repository and
running the following commands:

```
npx ts-node benchmarks/json-pack/bench.ubjson.encoding.ts
npx ts-node benchmarks/json-pack/bench.ubjson.decoding.ts
```
