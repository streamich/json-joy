# `json` codec for JSON Patch+ patches

`json` codec implements the nominal human-friendly encoding of JSON Patch+
operations like described [JSON Patch specification](https://datatracker.ietf.org/doc/html/rfc6902).

Operations are encoded using JSON objects, for example, `add` operations:

```json
{"op": "add", "path": "/foo/bar", "value": 123}
```

## Usage

```ts
import {OpTest, OpReplace} from 'json-joy/{lib,es6,ems}/json-patch';
import {encode, decode} from 'json-joy/{lib,es6,ems}/json-patch/codec/json';

const patch = [new OpTest('/foo', 'bar'), new OpReplace('/foo', 'baz')];

const encoded = encode(patch);
const decoded = decode(encoded);
```
