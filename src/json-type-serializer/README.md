# json-type-serializer

Fast JSON and MessagePack serializers for [`json-type`](../json-type/README.md). This
library produces pre-compiled JSON or MessagePack serializers, which serialize
your data according to your JSON Type schema in the most efficient way.

Usually you can get few times boost in performance, when using pre-compiled
serializer, see benchmark below.


## Usage

### JSON

```ts
import {t} from 'json-joy/lib/json-type';
import {JsonSerializerCodegen} from 'json-joy/lib/json-type-serializer';
import {encoder} from 'json-joy/lib/json-pack/util';

const type = t.Object([
  t.Field('id', t.num),
  t.Field('name', t.str),
]);

const jsonCodegen = new JsonSerializerCodegen({
  type,
});

const jsonSerializer = jsonCodegen.run().compile();

console.log(jsonSerializer.toString());
// function toJson(r0){
// var s = '';
// s += "{\"id\":";
// s += r0.id;
// s += ",\"name\":";
// s += asString(r0.name);
// s += "}";
// return s;
// }

console.log(jsonSerializer({
  id: 123,
  name: 'John',
}));
// {"id":123,"name":"John"}
```


### MessagePack

```ts
import {t} from 'json-joy/lib/json-type';
import {MsgPackSerializerCodegen} from 'json-joy/lib/json-type-serializer';
import {encoder} from 'json-joy/lib/json-pack/util';

const type = t.Object([
  t.Field('id', t.num),
  t.Field('name', t.str),
]);

const msgpackCodegen = new MsgPackSerializerCodegen({
  type,
  encoder,
});

const msgpackSerializer = msgpackCodegen.run().compile();

console.log(msgpackSerializer({
  id: 123,
  name: 'John',
}));
// Uint8Array(15) [
//   130, 162, 105, 100, 123,
//   164, 110,  97, 109, 101,
//   164,  74, 111, 104, 110
// ]
```


## Demo

See demo [here](../demo/json-type-serializer.ts). Run it with:

```
npx ts-node src/demo/json-type-serializer.ts
```


## Benchmark

```
node benchmarks/json-type-serializer/msgpack.js
json-joy/json-type-serializer MsgPackSerializerCodegen x 1,569,105 ops/sec ±2.61% (80 runs sampled), 637 ns/op
json-joy/json-type-serializer JsonSerializerCodegen x 1,647,911 ops/sec ±1.01% (95 runs sampled), 607 ns/op
json-joy/json-pack x 480,285 ops/sec ±1.41% (92 runs sampled), 2082 ns/op
JSON.stringify() x 505,549 ops/sec ±0.95% (95 runs sampled), 1978 ns/op
Fastest is json-joy/json-type-serializer JsonSerializerCodegen,json-joy/json-type-serializer MsgPackSerializerCodegen
```
