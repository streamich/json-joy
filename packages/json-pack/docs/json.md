Two related things live here: a **binary JSON codec** that reads and writes
standard JSON as `Uint8Array` (often faster than the native `JSON` on the hot
path, and integer-keyed), and **JSON Binary**, a small extension that lets plain
JSON carry `Uint8Array` values.

## Binary JSON codec

`JsonEncoder` encodes a value to UTF-8 JSON bytes; `JsonDecoder` parses JSON
bytes back to a value. The encoder needs a `Writer` to write into.

```ts
import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {JsonEncoder, JsonDecoder} from '@jsonjoy.com/json-pack/lib/json';

const encoder = new JsonEncoder(new Writer());
const decoder = new JsonDecoder();

const buf = encoder.encode({id: 123});  // Uint8Array of `{"id":123}`
decoder.decode(buf);                    // {id: 123}
```

| Class | Use |
|-------|-----|
| `JsonEncoder` | Encode a value to JSON bytes |
| `JsonEncoderStable` | Same, with object keys sorted (deterministic output) |
| `JsonEncoderDag` | [DAG-JSON](https://ipld.io/specs/codecs/dag-json/spec/): binary as `{"/": {"bytes": "<base64>"}}` |
| `JsonDecoder` | Parse JSON bytes to a value |
| `JsonDecoderDag` | DAG-JSON decoding |

This codec emits ordinary JSON, so its output is readable by any JSON parser ---
the win is speed and working directly in bytes without a `string` round-trip.

## JSON Binary

Standard JSON has no way to represent a `Uint8Array`. The `json-binary` module
solves this with drop-in `stringify` / `parse` that encode binary as a base64
data-URI string, leaving everything else as normal JSON.

```ts
import {stringify, parse} from '@jsonjoy.com/json-pack/lib/json-binary';

const doc = {name: 'file', body: new Uint8Array([1, 2, 3])};

const json = stringify(doc);
// {"name":"file","body":"data:application/octet-stream;base64,AQID"}

const back = parse(json);
// {name: 'file', body: Uint8Array [1, 2, 3]}  -- restored as a Uint8Array
```

`stringify(value, replacer?, space?)` mirrors `JSON.stringify`'s signature, and
`parse(json)` mirrors `JSON.parse`. Values that are not `Uint8Array` pass
through unchanged, so the output stays valid JSON for any consumer --- only this
`parse` revives the binary. `stringifyBinary(uint8)` returns the data-URI string
for a single buffer.
