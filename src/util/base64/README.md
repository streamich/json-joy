# Base64


## Encoder

- Implements Base64 encoding algorithm compatible with Node's Buffer.
- Isomorphic&mdash;it can be used in, both, Node and the browser.
- Faster than the Node's implementation for short blobs, smaller than 40 bytes.
- Uses Node's implementation for long blobs, if available. Hence, it also works
  in browser, but in Node environment will perform faster for short strings.


### Usage

Use encoder compatible with Node's Buffer:

```ts
import {toBase64} from 'json-joy/{lib,es2020}/util/base64';

toBase64(new Uint8Array([1, 2, 3]));
```

Create your custom encoder:

```ts
import {createToBase64} from 'json-joy/{lib,es2020}/util/base64';

const encode = createToBase64('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+_');

encode(new Uint8Array([1, 2, 3]));
```


### Benchmark

Below benchmark encodes random binary blobs of sizes 8, 16, 32, 64, 128, 256, 512, and 1024 byes.
`json-joy/util/base64` is faster, because for short strings (less than 40 chars) it uses a
native JavaScript implementation, which is faster and also works in browsers. For blobs larger
than 40 chars, it falls back to Node `Buffer` implementation, if available.

Encoding:

```
node benchmarks/util/base64/encode.js
json-joy/util/base64 toBase64(uint8) x 1,257,419 ops/sec ±1.19% (93 runs sampled), 795 ns/op
json-joy/util/base64 createToBase64()(uint8) x 868,953 ops/sec ±0.96% (96 runs sampled), 1151 ns/op
js-base64 x 974,991 ops/sec ±0.73% (94 runs sampled), 1026 ns/op
fast-base64-encode x 428,545 ops/sec ±1.67% (96 runs sampled), 2333 ns/op
base64-js x 295,165 ops/sec ±1.59% (98 runs sampled), 3388 ns/op
Buffer.from(uint8).toString('base64'); x 973,173 ops/sec ±0.65% (95 runs sampled), 1028 ns/op
Fastest is json-joy/util/base64 toBase64(uint8)
```

Decoding:

```
node benchmarks/util/base64/decode.js
json-joy/util/base64 fromBase64(str) x 602,268 ops/sec ±1.09% (88 runs sampled), 1660 ns/op
json-joy/util/base64 createFromBase64()(str) x 392,345 ops/sec ±0.96% (91 runs sampled), 2549 ns/op
Buffer.from(str, 'base64') x 498,609 ops/sec ±1.66% (93 runs sampled), 2006 ns/op
base64-js x 439,246 ops/sec ±0.94% (89 runs sampled), 2277 ns/op
js-base64 x 151,694 ops/sec ±0.51% (99 runs sampled), 6592 ns/op
Fastest is json-joy/util/base64 fromBase64(str)
```


## Decoder

- Uses Node.js built-in `Buffer`, if available.
- When `Buffer` is not available, uses JavaScript implementation.


### Usage

Use decoder compatible with Node's Buffer:

```ts
import {toBase64, fromBase64} from 'json-joy/{lib,es2020}/util/base64';

fromBase64(toBase64(new Uint8Array([1, 2, 3])));
```

Create your custom encoder:

```ts
import {createFromBase64} from 'json-joy/{lib,es2020}/util/base64';

const decoder = createFromBase64('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+_');

decoder(toBase64(new Uint8Array([1, 2, 3])));
```
