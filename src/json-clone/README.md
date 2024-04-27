# json-clone

Provides small and fast deep cloning functions.

- `clone()` &mdash; deeply clones a JSON-like value.
- `cloneBinary()` &mdash; same as `clone()` but also supports `Uint8Array` objects.

```ts
import {cloneBinary} from 'json-joy/lib/json-clone';

const obj = {foo: new Uint8Array([1, 2, 3])};
const cloned = cloneBinary(obj);

isDeepEqual(obj, cloned); // true
obj === cloned; // false
obj.foo === cloned.foo; // false
```

## Benchmarks

```
node benchmarks/json-clone/main.js
json-joy/json-clone clone() x 2,015,507 ops/sec ±1.52% (100 runs sampled)
JSON.parse(JSON.stringify()) x 410,189 ops/sec ±0.94% (98 runs sampled)
v8.deserialize(v8.serialize(obj)) x 146,059 ops/sec ±2.16% (79 runs sampled)
lodash x 582,504 ops/sec ±0.68% (97 runs sampled)
Fastest is json-joy/json-clone clone()
```
