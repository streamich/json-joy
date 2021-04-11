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
json-joy/json-pack x 319,993 ops/sec ±0.94% (90 runs sampled), 3125 ns/op
JSON.stringify x 260,149 ops/sec ±0.44% (93 runs sampled), 3844 ns/op
@msgpack/msgpack x 203,601 ops/sec ±0.82% (90 runs sampled), 4912 ns/op
msgpack-lite x 58,392 ops/sec ±1.44% (90 runs sampled), 17126 ns/op
msgpack x 37,912 ops/sec ±0.83% (93 runs sampled), 26377 ns/op
msgpack5 x 16,283 ops/sec ±0.87% (91 runs sampled), 61413 ns/op
messagepack x 9,829 ops/sec ±2.46% (83 runs sampled), 101737 ns/op
```

Encoding a small 75 byte JSON object:

```
json-joy/json-pack x 2,903,882 ops/sec ±0.87% (94 runs sampled), 344 ns/op
JSON.stringify x 1,040,593 ops/sec ±0.58% (93 runs sampled), 961 ns/op
@msgpack/msgpack x 568,147 ops/sec ±1.27% (88 runs sampled), 1760 ns/op
msgpack-lite x 247,792 ops/sec ±0.85% (78 runs sampled), 4036 ns/op
msgpack x 133,727 ops/sec ±3.44% (73 runs sampled), 7478 ns/op
msgpack5 x 81,600 ops/sec ±0.83% (87 runs sampled), 12255 ns/op
messagepack x 78,630 ops/sec ±2.91% (81 runs sampled), 12718 ns/op
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
