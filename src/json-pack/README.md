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

Encoding:

```
node benchmarks/json-pack.js 
json-joy/json-pack x 376,192 ops/sec ±0.49% (93 runs sampled), 2658 ns/op
JSON.stringify x 242,030 ops/sec ±0.50% (93 runs sampled), 4132 ns/op
@msgpack/msgpack x 188,164 ops/sec ±0.95% (89 runs sampled), 5315 ns/op
msgpack-lite x 54,859 ops/sec ±1.55% (87 runs sampled), 18229 ns/op
msgpack x 36,078 ops/sec ±0.79% (91 runs sampled), 27718 ns/op
msgpack5 x 11,850 ops/sec ±0.78% (89 runs sampled), 84388 ns/op
messagepack x 8,972 ops/sec ±2.34% (82 runs sampled), 111457 ns/op
```

Decoding:

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
import {Encoder, Decoder} from 'json-joy/json-pack';

const encoder = new Encoder();
const decoder = new Decoder();
const buffer = encoder.encode({foo: 'bar'});
const obj = decoder.decode(buffer);

console.log(obj); // { foo: 'bar' }
```

Use `EncoderFull` to encode data that is more complex than plain JSON. For
example, encode binary data using `ArrayBuffer`:

```ts
import {EncoderFull, Decoder} from 'json-joy/json-pack';

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
import {EncoderFull, Decoder, JsonPackValue} from 'json-joy/json-pack';

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
import {EncoderFull, Decoder, JsonPackExtension} from 'json-joy/json-pack';

const ext = new JsonPackExtension(1, new Uint8Array(8));
const encoder = new EncoderFull();
const decoder = new Decoder();
const buffer = encoder.encode({foo: ext});

const obj = decoder.decode(buffe2);
console.log(obj); // { foo: JsonPackExtension } 
```
