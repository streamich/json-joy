## Codecs

`json-type` ships JIT-compiled encoders for four wire formats: a textual
JSON encoder, a JSON binary encoder (writes UTF-8 bytes directly), CBOR,
and MessagePack. Each one takes a type and produces a specialized
function that knows exactly what fields to write, in what order, with no
per-call schema lookup.

Decoders live in [`@jsonjoy.com/json-pack`](https://github.com/streamich/json-joy/tree/master/packages/json-pack) --- json-type only generates the encoders.


## JSON text

`JsonTextCodegen` emits a function that produces a JSON string.

```ts
import {t, JsonTextCodegen} from '@jsonjoy.com/json-type';

const User = t.Object(
  t.Key('id', t.str),
  t.Key('age', t.Number({format: 'u32'})),
);

const toJson = JsonTextCodegen.get(User);

toJson({id: 'u_1', age: 30});
// '{"id":"u_1","age":30}'
```

The generated function bakes string-literal property names into the
output. With `noJsonEscape: true` on a `str` field, the encoder also
skips the escape pass --- useful for fields you've already validated to
contain safe characters (slugs, UUIDs, ASCII identifiers).


## JSON binary

`JsonCodegen` writes the same JSON output to a binary `Writer`. Use this
inside encoders that need to interleave already-encoded JSON with other
binary frames, or to avoid an intermediate `String -> Uint8Array` step.

```ts
import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {JsonCodegen} from '@jsonjoy.com/json-type/lib/codegen/binary/json/JsonCodegen';
import {JsonEncoder} from '@jsonjoy.com/json-pack/lib/json/JsonEncoder';

const encoder = new JsonEncoder(new Writer());
const encode = JsonCodegen.get(User);

encode({id: 'u_1', age: 30}, encoder);
const bytes = encoder.writer.flush();   // Uint8Array
```


## CBOR and MessagePack

`CborCodegen` and `MsgPackCodegen` follow the same pattern: write into a
caller-owned encoder backed by a `Writer`.

```ts
import {CborEncoder} from '@jsonjoy.com/json-pack/lib/cbor/CborEncoder';
import {CborCodegen} from '@jsonjoy.com/json-type/lib/codegen/binary/cbor/CborCodegen';

const encoder = new CborEncoder(new Writer());
const encode = CborCodegen.get(User);

encode({id: 'u_1', age: 30}, encoder);
const cbor = encoder.writer.flush();
```

```ts
import {MsgPackEncoder} from '@jsonjoy.com/json-pack/lib/msgpack/MsgPackEncoder';
import {MsgPackCodegen} from '@jsonjoy.com/json-type/lib/codegen/binary/msgpack/MsgPackCodegen';

const encoder = new MsgPackEncoder(new Writer());
const encode = MsgPackCodegen.get(User);

encode({id: 'u_1', age: 30}, encoder);
```

Both codecs respect the `format` hint on `num` to pick the smallest fixed
encoding, the `format` hint on `str` to skip UTF-8 validation when ASCII
is guaranteed, and the per-field optionality on `obj` to emit
optional-aware object headers.


## Embedded `Value`

Any spot in a schema that's typed `any` (or otherwise unknown at compile
time) can be filled at runtime with a `Value` --- a `{data, type?}` pair.
Codecs detect a `Value` and either recurse into a specialized codec for
its type or fall back to a generic encoder:

```ts
import {unknown} from '@jsonjoy.com/json-type';

const type = t.object({payload: t.any});
const encode = CborCodegen.get(type);

encode({payload: unknown({nested: true})}, encoder);
```

`Value`s with a `type` reuse the cached codec for that type; bare
`unknown(data)` falls back to the encoder's generic `writeAny`.


## Capacity estimator

`CapacityEstimatorCodegen` returns a function that gives an upper bound
on the byte size of a value when encoded. This is what the binary
codecs use to size their write buffer in a single allocation, but you can
call it directly to pre-size buffers for streaming use cases.

```ts
import {CapacityEstimatorCodegen} from '@jsonjoy.com/json-type';

const estimate = CapacityEstimatorCodegen.get(User);
const upper = estimate({id: 'u_1', age: 30});   // number of bytes (upper bound)
```


## Caching

Like `ValidatorCodegen`, all codecs use a `lazyKeyedFactory` cache keyed
by type identity. Reuse the same `Type` reference and you get the
already-compiled function back; cloning or rebuilding a type forces
recompilation.


## Which encoder to pick

| Format | Use it when |
|---|---|
| JSON text | The consumer expects a JSON string and you don't care about bytes. |
| JSON binary | You write JSON into a binary frame stream or want one `Uint8Array` directly. |
| CBOR | You want the most compact, self-describing binary; numbers and binaries are first-class. |
| MessagePack | You need MessagePack-compatible output for an existing consumer. |
