# JSON Pack

Fast and lean implementation of [MessagePack](https://github.com/msgpack/msgpack/blob/master/spec.md) codec.

- Fast, fastest implementation of MessagePack in JavaScript.
- Small footprint, small bundle size.
- Works in Node.js and browser.
- Supports binary fields.
- Supports extensions.


## Benchmarks

Faster than `JSON.stringify`:

```
node benchmarks/json-pack.js 
json-joy/json-pack x 292,094 ops/sec ±0.58% (91 runs sampled), 3424 ns/op
JSON.stringify x 252,531 ops/sec ±0.88% (94 runs sampled), 3960 ns/op
@msgpack/msgpack x 195,198 ops/sec ±0.82% (91 runs sampled), 5123 ns/op
msgpack-lite x 56,574 ops/sec ±1.54% (89 runs sampled), 17676 ns/op
msgpack x 37,120 ops/sec ±0.84% (92 runs sampled), 26940 ns/op
msgpack5 x 14,664 ops/sec ±0.90% (90 runs sampled), 68195 ns/op
messagepack x 7,872 ops/sec ±2.45% (81 runs sampled), 127038 ns/op
```


## Usage

Basic usage:

```ts
import {Encoder, decode} from 'json-joy/json-pack';

const encoder = new Encoder();
const buffer = encoder.encode({foo: 'bar'});
const obj = decode(buffer);

console.log(obj); // { foo: 'bar' }
```

Encode binary data using `ArrayBuffer`:

```ts
import {Encoder, decode} from 'json-joy/json-pack';

const encoder = new Encoder();
const buffer = encoder.encode({foo: new Uint8Array([1, 2, 3]).buffer});
const obj = decode(buffer);
console.log(obj); // { foo: ArrayBuffer { [1, 2, 3] } }
```

Encode Msgpack value as is:

```ts
import {Encoder, decode, JsonPackValue} from 'json-joy/json-pack';

const encoder = new Encoder();
const buffer = encoder.encode({foo: 'bar'});
const value = new JsonPackValue(buffer);
const buffer2 = encode({baz: value});

const obj = decode(buffer2);
console.log(obj); // { baz: { foo: 'bar' } }
```

Encode Msgpack extension:

```ts
import {Encoder, decode, JsonPackExtension} from 'json-joy/json-pack';

const ext = new JsonPackExtension(1, new Uint8Array(8));
const encoder = new Encoder();
const buffer = encoder.encode({foo: ext});

const obj = decode(buffer2);
console.log(obj); // { foo: JsonPackExtension } 
```
