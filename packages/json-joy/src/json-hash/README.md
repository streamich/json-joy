# `json-hash`

Computes a 32-bit hash given an arbitrary JSON value. Sorts keys, so objects
with different key orders will have the same hash.

Implements DJB2 hash function.

```ts
import {hash} from 'json-joy/lib/json-hash';

const num1 = hash({
  foo: 1,
  bar: 2,
});

const num2 = hash({
  bar: 2,
  foo: 1,
});

num1 === num2; // true
```
