# `@jsonjoy.com/diff`

Fast diff algorithms for strings, lines, and binary data. Zero dependencies.

- `str` — character-level string diffing (Myers-style, with common
  prefix/suffix and overlap optimizations), patch normalization, inversion,
  and caret-aware `diffEdit` for text inputs.
- `line` — line-level diffing built on top of `str`, with per-line patch aggregation.
- `bin` — `Uint8Array` diffing via a binary-to-string mapping over `str`.

```ts
import {str} from '@jsonjoy.com/diff';

const patch = str.diff('hello world', 'hello there world');
str.apply(patch, src.length, /* ... */);
str.src(patch); // 'hello world'
str.dst(patch); // 'hello there world'
```

Or deep-import a single module:

```ts
import * as str from '@jsonjoy.com/diff/lib/str';
```
