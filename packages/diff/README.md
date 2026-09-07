# `@jsonjoy.com/diff`

Fast diff algorithms for strings, lines, and binary data. Zero dependencies.

- `str` — character-level string diffing (Myers-style, with common
  prefix/suffix and overlap optimizations), patch normalization, inversion,
  and caret-aware `diffEdit` for text inputs.
- `line` — line-level diffing built on top of `str`, with per-line patch
  aggregation and in-place modification (`MIX`) detection.
- `lines` — token-based line diff: a faster, `MIX`-free alternative to `line`,
  built on `tok`; returns a `line`-compatible `LinePatch`.
- `bin` — `Uint8Array` diffing via a binary-to-string mapping over `str`.
- `optimize` — optional patch post-processing: `coarsen` (cost models for
  fewer or byte-cheaper operations), `align` (slide edits onto word/line
  boundaries, losslessly), `semantic` (coarsen toward human-readable hunks),
  and `shiftDown` (place hunk boundaries the way GNU `diff` places them).
  Loaded only when imported, so `str`-only users don't pay for it.
- `tok` — Myers diff over any token sequence `T[]` (interned to integers),
  returning run-length operations.
- `word` — word-level string diff built on `tok`; operation boundaries fall on
  word boundaries. Returns a `str`-compatible patch.
- `format` — the wire formats: turns a `LinePatch` plus its two line arrays into
  diff text in all eight styles — `normal`, `unified` (`-u`/`-U n`), `context`
  (`-c`/`-C n`), `ed` (`-e`), `forwardEd` (`-f`), `rcs` (`-n`), `sideBySide`
  (`-y`) and `ifdef` (`-D` and the `--*-format` little languages) — each a
  generator of chunks, so no diff text is ever assembled into one string.
- `limits` — opt-in bounds for `str`, `lines` and `tok`: a deterministic
  `maxCost`, an optional wall-clock `deadline`, and a `hitLimit` flag when the
  result is no longer guaranteed minimal. Diffing is unbounded unless you pass
  them. `defaultLineCost(n, m)` is the calibrated bound **for line-sized
  elements**; there is no calibrated bound for character input, and using that
  one on a large `str.diff` can be slower than passing nothing.

```ts
import {str} from '@jsonjoy.com/diff';

const src = 'hello world';
const patch = str.diff(src, 'hello there world');
str.apply(patch, src.length, onInsert, onDelete);
str.src(patch); // 'hello world'
str.dst(patch); // 'hello there world'
```

Or deep-import a single module:

```ts
import * as str from '@jsonjoy.com/diff/lib/str';
```

Post-improve a patch (opt-in, kept out of `str` so it is only loaded on demand):

```ts
import * as str from '@jsonjoy.com/diff/lib/str';
import {coarsen, byteSizeModel} from '@jsonjoy.com/diff/lib/optimize';

const patch = str.diff(src, dst); // minimal, most operations
coarsen(patch); // fewer operations, larger edit volume
coarsen(patch, byteSizeModel()); // smaller serialized size
```

```ts
import * as str from '@jsonjoy.com/diff/lib/str';
import {align} from '@jsonjoy.com/diff/lib/optimize';

// Move edits onto word/line boundaries without changing what is inserted or deleted.
align(str.diff('The cat.', 'The cow and the cat.'));
// [[0, 'The '], [1, 'cow and the '], [0, 'cat.']]
```

```ts
import * as word from '@jsonjoy.com/diff/lib/word';

word.diff('the cat runs', 'the dog runs');
// [[0, 'the '], [-1, 'cat'], [1, 'dog'], [0, ' runs']]
```

Write a diff. Lines carry no terminators, so a file that does not end in one is
a flag: `diffKeys` encodes it for the *diff* — without it two files differing
only in their final newline compare equal and you get no diff at all — and
`srcNoEol`/`dstNoEol` place the `\ No newline at end of file` marker in the
output. Diff the keys, format the lines:

```ts
import * as lines from '@jsonjoy.com/diff/lib/lines';
import {diffKeys, unified} from '@jsonjoy.com/diff/lib/format';

/** 'a\nb' is two lines, the second unterminated. */
const split = (text: string): [lines: string[], noEol: boolean] => {
  if (text === '') return [[], false];
  const noEol = !text.endsWith('\n');
  return [(noEol ? text : text.slice(0, -1)).split('\n'), noEol];
};

const [src, srcNoEol] = split(await readFile('a.txt', 'utf8'));
const [dst, dstNoEol] = split(await readFile('b.txt', 'utf8'));
const patch = lines.diff(diffKeys(src, srcNoEol), diffKeys(dst, dstNoEol));
for (const chunk of unified(src, dst, patch, {oldName: 'a.txt', newName: 'b.txt', srcNoEol, dstNoEol}))
  process.stdout.write(chunk);
```

The other seven styles take the same three arguments; `context` also takes labels
and a width, `ed` and `rcs` carry neither:

```ts
import {context, ed, forwardEd, ifdef, normal, rcs, sideBySide} from '@jsonjoy.com/diff/lib/format';

normal(src, dst, patch); // 3a4 / 5d4 / 7,8c6,9
context(src, dst, patch, {context: 1, oldName: 'a.txt', newName: 'b.txt'});
ed(src, dst, patch); // an ed script, bottom-up
forwardEd(src, dst, patch); // the same commands top-down: c2 / d2 3
rcs(src, dst, patch); // d3 1 / a3 2
sideBySide(src, dst, patch, {width: 80}); // two columns with a | / < / > gutter
ifdef(src, dst, patch, {
  groupFormat: ['%=', '#ifndef X\n%<#endif /* ! X */\n', '#ifdef X\n%>#endif /* X */\n', '%<%>'],
  lineFormat: ['%l\n', '%l\n', '%l\n'],
});
```

The last two print **both files**, so unlike every other style they write
something when nothing changed — a caller wanting GNU's exit-code semantics
reads `hunks()` for the verdict and these for the output.

Read a diff. The style is detected, prose and mail headers around the hunks are
skipped, a multi-file patch splits into one `FilePatch` each, and a malformed
hunk is *reported* rather than thrown — so a caller can reject that hunk and
still apply the rest, which is what a `.rej` file is:

```ts
import {parse} from '@jsonjoy.com/diff/lib/format';

for (const file of parse(await readFile('fix.patch', 'utf8'))) {
  console.log(file.oldName, '->', file.newName, file.meta?.renameFrom ? '(renamed)' : '');
  for (const {code, line, message} of file.errors) console.warn(`line ${line}: ${code}: ${message}`);
  for (const hunk of file.hunks) console.log(hunk.oldStart, hunk.oldCount, hunk.lines.length);
}
```

Names come back exactly as written, `a/`…`b/` prefixes and `/dev/null` included,
so a `-p` strip applies to what was on the wire. Two limits are the formats', not
the parser's: an `ed` script records neither the deleted text (its hunks carry
`oldCount` and no `DEL` lines — a blind delete) nor a missing final newline, and
`rcs` is not read back at all, since a `d3 1` names lines whose text the format
never wrote down.
