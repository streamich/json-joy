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


## Benchmark

Below benchmark encodes random binary blobs of sizes 8, 16, 32, 64, 128, 256, 512, and 1024 byes.
`json-joy/util/base64` is faster, because for short strings (less than 40 chars) it uses a
native JavaScript implementation, which is faster and also works in browsers. For blobs larger
than 40 chars, it falls back to Node `Buffer` implementation, if available.

```
node benchmarks/util/base64/encode.js
json-joy/util/base64 encode(uint8) x 262,740 ops/sec ±0.63% (91 runs sampled), 3806 ns/op
fast-base64-encode x 47,657 ops/sec ±1.32% (86 runs sampled), 20983 ns/op
Buffer.from(uint8).toString('base64'); x 223,289 ops/sec ±0.79% (90 runs sampled), 4479 ns/op
Fastest is json-joy/util/base64 encode(uint8)
```
