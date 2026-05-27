`json-pack` implements fast [JSON][json] encoder and decoder. It is written in TypeScript
and has no external dependencies.

`json-pack` JSON codec supports binary data and is faster than the
native way to encode to a `Uint8Array`, however, JavaScript built-in JSON parser
is faster.


[json]: https://www.json.org/json-en.html


## Getting started

To get started you need to import `JsonEncoder` and `JsonDecoder` classes like
this:

```ts
import {JsonEncoder} from 'json-joy/es2020/json-pack/json/JsonEncoder';
import {JsonDecoder} from 'json-joy/es2020/json-pack/json/JsonDecoder';
import {Writer} from 'json-joy/es2020/util/buffers/Writer';
```


## Usage

Encode a JavaScript POJO to JSON (as `Uint8Array`):

```ts
const pojo = {
  id: 123,
  foo: 'bar',
  tags: ['a', 'b', 'c'],
  binary: new Uint8Array([1, 2, 3]),
};
const encoder = new JsonEncoder(new Writer());
const encoded = encoder.encode(pojo);
```

Decode JSON `Uint8Array` back to JavaScript POJO:

```ts
const decoder = new JsonDecoder();
const decoded = decoder.read(encoded);

console.log(decoded);
// {
//   id: 123,
//   foo: 'bar',
//   tags: [ 'a', 'b', 'c' ],
//   binary: Uint8Array(3) [ 1, 2, 3 ]
// }
```


## Binary data

If your POJO contains binary data, it will be encoded as a JSON string, when
decoding, it will be decoded back to a `Uint8Array`. `json-pack` encodes binary
blobs as data URLs.

```ts
const blob = encoder.encode({binary: new Uint8Array([1, 2, 3])});

console.log(Buffer.from(blob).toString());
// {"binary":"data:application/octet-stream;base64,AQID"}
```

~~~jj.note
`json-pack` ships with the fastest Base64 encoder and decoder for JavaScript.
It encodes binary data directly to a `Uint8Array` without any intermediate
encoding to a Base64 string.

Likewise, when parsing, it decodes Base64 strings directly from the `Uint8Array`
without any intermediate decoding to a string.
~~~


## Benchmarks

`json-pack` JSON encoder generally performs better than the native way using
` Buffer.from(JSON.stringify(obj))`. However, the native Node.js JSON decoder `JSON.parse(buf.toString())` is
faster than `json-pack` JSON decoder.

~~~jj.aside
Benchmark were performed using Node.js v20.2.0 on Apple M1 chip. The numbers show
the number of POJO objects encoded/decoded per second.
~~~

![json-codec-benchmark-results](https://appsets.jsonjoy.com/libraries/json-joy-js/json-pack/json-codec-results.png)


### Running the benchmarks

You can run the benchmarks yourself by cloning the `json-joy` repository and
running the following commands:

```
npx ts-node benchmarks/json-pack/bench.json.encoding.ts
npx ts-node benchmarks/json-pack/bench.json.decoding.ts
```
