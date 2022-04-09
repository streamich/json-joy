# json-clone

Provides small and fast deep cloning functions.

- `clone()` &mdash; deeply clones a JSON-line value.
- `cloneBinary()` &mdash; same as `clone()` but also supports `Uint8Array` objects.

```ts
import {cloneBinary} from 'json-joy/lib/json-clone';

const obj = {foo: new Uint8Array([1, 2, 3])};
const cloned = cloneBinary(obj);

isDeepEqual(obj, cloned); // true
obj === cloned // false
obj.foo === cloned.foo // false
```
