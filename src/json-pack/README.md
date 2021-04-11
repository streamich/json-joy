# JSON Pack

Fast and lean implementation of [MessagePack](https://github.com/msgpack/msgpack/blob/master/spec.md) codec.

- Fastest implementation of MessagePack in JavaScript.
- Small footprint, small bundle size.
- Works in Node.js and browser.
- Supports binary fields.
- Supports extensions.
- Supports precomputed MessagePack values.


## Benchmarks

Faster than built-in `JSON.stringify` and `JSON.parse`, and any other library.

Encoding a 584 byte JSON object:

```
node benchmarks/json-pack.js
json-joy/json-pack 298,448 ops/sec ±0.82% (91 runs sampled), 3351 ns/op
JSON.stringify x 245,893 ops/sec ±0.66% (90 runs sampled), 4067 ns/op
@msgpack/msgpack x 193,003 ops/sec ±0.98% (90 runs sampled), 5181 ns/op
msgpack-lite x 55,477 ops/sec ±1.40% (88 runs sampled), 18025 ns/op
msgpack x 36,258 ops/sec ±0.78% (89 runs sampled), 27580 ns/op
msgpack5 x 13,168 ops/sec ±0.78% (88 runs sampled), 75944 ns/op
messagepack x 9,023 ops/sec ±4.97% (79 runs sampled), 110833 ns/op
```

Decoding a 584 byte JSON object:

```
node benchmarks/json-pack.Decoder.js 
json-joy/json-pack x 258,215 ops/sec ±0.97% (90 runs sampled), 3873 ns/op
JSON.parse x 224,616 ops/sec ±0.72% (91 runs sampled), 4452 ns/op
@msgpack/msgpack x 196,799 ops/sec ±0.74% (93 runs sampled), 5081 ns/op
msgpack x 62,323 ops/sec ±0.74% (92 runs sampled), 16045 ns/op
msgpack-lite x 52,794 ops/sec ±0.75% (92 runs sampled), 18941 ns/op
msgpack5 x 30,240 ops/sec ±0.76% (93 runs sampled), 33069 ns/op
messagepack x 2,740 ops/sec ±10.15% (49 runs sampled), 364983 ns/op
```


## Usage

### Basic usage

Use `Encoder` to encode plain JSON values.

```ts
import {Encoder, Decoder} from 'json-joy/{lib,es6,esm}/json-pack';

const encoder = new Encoder();
const decoder = new Decoder();
const buffer = encoder.encode({foo: 'bar'});
const obj = decoder.decode(buffer);

console.log(obj); // { foo: 'bar' }
```

Use `EncoderFull` to encode data that is more complex than plain JSON. For
example, encode binary data using `ArrayBuffer`:

```ts
import {EncoderFull, Decoder} from 'json-joy/{lib,es6,esm}/json-pack';

const encoder = new EncoderFull();
const decoder = new Decoder();
const buffer = encoder.encode({foo: new Uint8Array([1, 2, 3]).buffer});
const obj = decoder.decode(buffer);
console.log(obj); // { foo: ArrayBuffer { [1, 2, 3] } }
```


### Pre-computed values

You might have already encoded MessagePack value, to insert it into a bigger
MessagePack object as-is use `JsonPackValue` wrapper.

```ts
import {EncoderFull, Decoder, JsonPackValue} from 'json-joy/{lib,es6,esm}/json-pack';

const encoder = new EncoderFull();
const decoder = new Decoder();
const buffer = encoder.encode({foo: 'bar'});
const value = new JsonPackValue(buffer);
const buffer2 = encode({baz: value});

const obj = decoder.decode(buffer2);
console.log(obj); // { baz: { foo: 'bar' } }
```

### Extensions

Use `JsonPackExtension` wrapper to encode extensions.

```ts
import {EncoderFull, Decoder, JsonPackExtension} from 'json-joy/{lib,es6,esm}/json-pack';

const ext = new JsonPackExtension(1, new Uint8Array(8));
const encoder = new EncoderFull();
const decoder = new Decoder();
const buffer = encoder.encode({foo: ext});

const obj = decoder.decode(buffe2);
console.log(obj); // { foo: JsonPackExtension } 
```
