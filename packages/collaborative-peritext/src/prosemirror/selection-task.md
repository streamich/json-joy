# Task: Implement `getSelection()` and `setSelection()`

## Summary

Implement two methods on `ProseMirrorFacade` in
`packages/collaborative-peritext/src/prosemirror/ProseMirrorFacade.ts`:

```ts
/** Convert current ProseMirror selection to Peritext selection in CRDT-space. */
getSelection(peritext: PeritextApi): [range: Range<string>, startIsAnchor: boolean] | undefined {
  // ...
}

/** Set ProseMirror selection from Peritext CRDT-space selection. */
setSelection(peritext: PeritextApi, range: Range<string>, startIsAnchor: boolean): void {
  // ...
}
```

Both methods already have stubs in `ProseMirrorFacade.ts`. The signatures and
return types shown above are final. `PeritextApi` is imported from
`json-joy/lib/json-crdt-extensions`. `Range` is imported from
`json-joy/lib/json-crdt-extensions/peritext/rga/Range`.

See `selection-mapping.md` in the same directory for the full analysis of both
position models and the approach comparison. This task uses **Approach B**
(nested 1:1 block-to-block tree traversal) for `getSelection()` and a
**reverse flat-offset** approach for `setSelection()`.

---

## Precondition

Both methods may only be called when the ProseMirror document and the Peritext
block tree are **in sync** — i.e. after `.syncFromEditor()` or
`.syncFromModel()` has completed. The caller guarantees this. Under this
guarantee the PM `doc` node tree and Peritext `Fragment` block tree are
structurally isomorphic: child counts match at every nesting level, and
`peritextBlock.children[i]` corresponds to `pmNode.child(i)`.

---

## Part 1 — `getSelection()` (PM → Peritext)

### Algorithm: Approach B with sub-approach 5A

For each selection endpoint (PM `selection.anchor` and `selection.head`),
convert the PM integer position to a Peritext `Point` as follows:

#### Step 1 — Resolve the PM position

```ts
const resolved = doc.resolve(pmPos);
const leafDepth = resolved.depth;
```

`resolved.depth` is the nesting depth of the innermost block containing
the position. For a `TextSelection` this is always a textblock (leaf block).
- `depth 0` = `doc` ↔ `fragment.root`
- `depth 1` = first block level (e.g. paragraph)
- `depth N` = deeper nesting (e.g. `<blockquote><p>`)

#### Step 2 — Walk the Peritext block tree

Descend from `fragment.root` following the same child indices that PM uses:

```ts
const fragment = peritext.txt.blocks;
let block: Block = fragment.root;
for (let d = 0; d < leafDepth; d++) {
  block = block.children[resolved.index(d)];
}
```

After this loop, `block` is the Peritext `LeafBlock` corresponding to the PM
textblock that contains the position.

**Why `resolved.index(d)` is correct:** `resolved.index(d)` returns the child
index within `resolved.node(d)`. Iterating `d` from `0` to `leafDepth - 1`
navigates: `doc → child(index(0)) → child(index(1)) → …` which is exactly
how `ToPmNode.convert()` maps Peritext children to PM children.

#### Step 3 — Compute the Peritext gap position (sub-approach 5A)

```ts
const textOffset = resolved.parentOffset;
const markerViewPos = block.start.viewPos();
const peritextGap = markerViewPos + 1 + textOffset;
```

- `resolved.parentOffset` = `pos - start(leafDepth)` = the character offset
  within the PM textblock's content. This excludes the block's own open/close
  tags.
- `block.start.viewPos()` = the RGA view position of the `'\n'` block-split
  marker that starts this block.
- `+1` skips past the `'\n'` marker itself.
- `+textOffset` adds the character offset within the inline content.

#### Step 4 — Convert to a Peritext `Point`

```ts
const point = peritext.txt.pointIn(peritextGap);
```

`pointIn(gap)` creates a `Point` in the gap between characters. With default
`Anchor.After`, gap 0 → abs start, gap N → after char N-1.

#### Step 5 — Build the result

```ts
const selection = this.view.state.selection;
const p1 = resolve(selection.anchor);
const p2 = resolve(selection.head);
const range = peritext.txt.rangeFromPoints(p1, p2);
// `rangeFromPoints` auto-orders so that range.start <= range.end spatially.
// Determine which end of the Range is the anchor:
const startIsAnchor = selection.anchor <= selection.head;
return [range, startIsAnchor];
```

If `anchor < head`, the PM selection goes left-to-right. After
`rangeFromPoints` reorders, `range.start` is the left point (which came from
`anchor`), so `startIsAnchor = true`.

If `anchor > head` (backwards selection), `range.start` is the left point
(which came from `head`), so `startIsAnchor = false`.

If `anchor === head` (collapsed caret), `startIsAnchor = true` (convention).

### Edge Cases

| Case | Handling |
|------|----------|
| Disposed facade | Return `undefined` early |
| Empty paragraph (`parentOffset = 0`) | `peritextGap = markerViewPos + 1` → after the `'\n'`, correct |
| Collapsed caret (`anchor === head`) | Both resolve to the same `Point`, range is collapsed, `startIsAnchor = true` |
| First/virtual block (no explicit marker) | `block.start` still has a valid `viewPos()` (the fragment start). `viewPos()` returns `0` for abs-start with `Anchor.After`. The formula `0 + 1 + textOffset` is only correct if there IS a `'\n'` at position 0. If the first block is virtual (no marker), `viewPos()` is 0 and there is no actual `'\n'`. In that case use: `peritextGap = textOffset` (no `+1`). Detect by checking `!block.marker` (the marker property is `undefined` for virtual blocks). |

### Virtual-block handling

```ts
const hasMarker = !!block.marker;
const peritextGap = hasMarker
  ? block.start.viewPos() + 1 + textOffset
  : textOffset;
```

`Block.marker` is the `OverlayPoint` associated with the block's `'\n'`
split character. For the leading block when no explicit first marker exists,
`marker` is `undefined` and the block's text starts at RGA position 0 with
no preceding `'\n'`.

### Complete implementation

```ts
getSelection(peritext: PeritextApi): [range: Range<string>, startIsAnchor: boolean] | undefined {
  if (this._disposed) return;
  const view = this.view;
  const selection = view.state.selection;
  const doc = view.state.doc;
  const txt = peritext.txt;
  const fragment = txt.blocks;

  const resolve = (pmPos: number): Point<string> => {
    const resolved = doc.resolve(pmPos);
    const leafDepth = resolved.depth;
    let block: Block<string> = fragment.root;
    for (let d = 0; d < leafDepth; d++)
      block = block.children[resolved.index(d)];
    const textOffset = resolved.parentOffset;
    const hasMarker = !!(block as LeafBlock<string>).marker;
    const peritextGap = hasMarker
      ? block.start.viewPos() + 1 + textOffset
      : textOffset;
    return txt.pointIn(peritextGap);
  };

  const p1 = resolve(selection.anchor);
  const p2 = resolve(selection.head);
  const range = txt.rangeFromPoints(p1, p2);
  const startIsAnchor = selection.anchor <= selection.head;
  return [range, startIsAnchor];
}
```

### Imports needed

```ts
import {Block, LeafBlock} from 'json-joy/lib/json-crdt-extensions';
import {Point} from 'json-joy/lib/json-crdt-extensions/peritext/rga/Point';
```

Verify exact import paths against the existing barrel exports in
`json-joy/lib/json-crdt-extensions/index.ts` and
`json-joy/lib/json-crdt-extensions/peritext/index.ts`.
`Block` and `LeafBlock` may need to be imported from their specific files:

```ts
import {Block} from 'json-joy/lib/json-crdt-extensions/peritext/block/Block';
import {LeafBlock} from 'json-joy/lib/json-crdt-extensions/peritext/block/LeafBlock';
```

---

## Part 2 — `setSelection()` (Peritext → PM)

### Approach: Reverse flat-offset via `Point.viewPos()`

The reverse direction (Peritext `Range` → PM selection) is simpler because
ProseMirror provides `TextSelection.create(doc, anchor, head)` which takes
flat integer positions and internally calls `doc.resolve()` to validate them.
We just need to compute the correct PM flat integer for each Peritext `Point`.

This avoids implementing a reverse tree walk. ProseMirror handles the
structural resolution.

#### Why this is efficient

`Point.viewPos()` is O(log N) in the RGA skip-list — this gives us the
Peritext gap position. Converting the gap position to a PM flat integer
requires knowing the cumulative block-tag overhead up to that point. We use
the **same tree walk**, but in the Peritext→PM direction: navigate the
Peritext block tree to find which `LeafBlock` a `Point` falls in, then
compute the PM position from the block's position in the PM tree.

#### Algorithm

For each endpoint (`range.start` and `range.end`):

##### Step 1 — Get the Peritext view position

```ts
const viewPos = point.viewPos();
```

This is the flat gap position in the RGA (counting all visible chars
including `'\n'` splits).

##### Step 2 — Find which LeafBlock contains this position

Walk `fragment.root.children` to find the `LeafBlock` whose text range spans
the given view position. Each block's extent is:
- block start: `block.start.viewPos()` (the `'\n'` marker position, or 0 for virtual first block)
- block end: `block.end.viewPos()` (exclusive — the next marker, or end of text)

Binary search or linear scan through the root's children (and recurse for
nested blocks):

```ts
function findLeafBlock(block: Block, viewPos: number): [LeafBlock, depth: number, indexPath: number[]] {
  // If it's a leaf, we're done
  if (block.isLeaf()) return [block as LeafBlock, 0, []];
  const children = block.children;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    const childEnd = child.end.viewPos();
    if (viewPos <= childEnd) {
      const [leaf, d, path] = findLeafBlock(child, viewPos);
      return [leaf, d + 1, [i, ...path]];
    }
  }
  // Fallback: last child
  const last = children[children.length - 1];
  const [leaf, d, path] = findLeafBlock(last, viewPos);
  return [leaf, d + 1, [children.length - 1, ...path]];
}
```

##### Step 3 — Compute the PM flat position

Once we have the `LeafBlock` and the `indexPath` (the child indices at each
depth from the root), compute the PM position:

```ts
// Accumulate PM position by walking doc with the indexPath
let pmPos = 0;       // start of doc content
let pmNode = doc;
for (const idx of indexPath) {
  // Each preceding sibling contributes its full nodeSize
  for (let i = 0; i < idx; i++) {
    pmPos += pmNode.child(i).nodeSize;
  }
  pmPos += 1;        // enter the block node (open tag)
  pmNode = pmNode.child(idx);
}
// Now pmPos is at the start of the leaf block's content
// Add the text offset within the block
const hasMarker = !!(leaf as LeafBlock).marker;
const textOffset = hasMarker
  ? viewPos - (leaf.start.viewPos() + 1)
  : viewPos;
pmPos += textOffset;
```

##### Simpler alternative: use `doc.resolve()` in reverse

Actually, there is an even simpler approach. We can compute the PM position
**arithmetically** without an explicit tree walk, by leveraging a key insight:

**The PM position and Peritext view position differ only by the cumulative
number of block close tags up to that point.** Each leaf block adds one extra
PM unit (close tag) vs Peritext. Non-leaf wrappers add two extra PM units
(open + close) per nesting level.

But this arithmetic is fragile with nesting. The tree-walk approach above is
more robust. However, there is an even simpler option:

##### Simplest approach: reuse `getSelection`'s tree walk in reverse

Given `viewPos` from the Peritext `Point`, find the containing `LeafBlock`
in the Peritext tree, then compute `pmPos` from the PM doc's structure using
`indexPath`:

```ts
const setSelection = (peritext: PeritextApi, range: Range<string>, startIsAnchor: boolean): void => {
  if (this._disposed) return;
  const view = this.view;
  const doc = view.state.doc;
  const txt = peritext.txt;
  const fragment = txt.blocks;

  const toPmPos = (point: Point<string>): number => {
    const viewPos = point.viewPos();
    // Find the leaf block containing this point
    let block: Block<string> = fragment.root;
    let pmNode: PmNode = doc;
    let pmPos = 0;
    while (!block.isLeaf()) {
      const children = block.children;
      let found = false;
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const childEndView = child.end.viewPos();
        if (viewPos <= childEndView) {
          // This child contains our point
          // Sum PM sizes of preceding siblings
          for (let j = 0; j < i; j++)
            pmPos += pmNode.child(j).nodeSize;
          pmPos += 1; // open tag of this block
          block = child;
          pmNode = pmNode.child(i);
          found = true;
          break;
        }
      }
      if (!found) {
        // Fallback to last child
        const lastIdx = children.length - 1;
        for (let j = 0; j < lastIdx; j++)
          pmPos += pmNode.child(j).nodeSize;
        pmPos += 1;
        block = children[lastIdx];
        pmNode = pmNode.child(lastIdx);
      }
    }
    // block is now a LeafBlock, pmPos is at the start of its content
    const hasMarker = !!(block as LeafBlock<string>).marker;
    const textOffset = hasMarker
      ? viewPos - (block.start.viewPos() + 1)
      : viewPos;
    return pmPos + textOffset;
  };

  // Determine anchor and head from range + startIsAnchor
  const anchorPoint = startIsAnchor ? range.start : range.end;
  const headPoint = startIsAnchor ? range.end : range.start;
  const anchor = toPmPos(anchorPoint);
  const head = toPmPos(headPoint);

  // Create and dispatch the PM selection
  const { TextSelection } = require('prosemirror-state');
  const newSelection = TextSelection.create(doc, anchor, head);
  const tr = view.state.tr.setSelection(newSelection);
  const meta: TransactionMeta = { orig: TransactionOrigin.REMOTE };
  tr.setMeta(SYNC_PLUGIN_KEY, meta);
  view.dispatch(tr);
};
```

**Note on the import:** `TextSelection` should be imported at the top of the
file rather than using `require()`. The pseudocode above uses `require()` only
for illustration. Add to the top-level imports:

```ts
import {TextSelection} from 'prosemirror-state';
```

### `toPmPos` inner loop explained

1. Start at `fragment.root` (Peritext) and `doc` (PM), with `pmPos = 0`.
2. At each non-leaf level, find which child's range contains `viewPos`:
   - Compare `viewPos` to `child.end.viewPos()` for each child.
   - Sum `pmNode.child(j).nodeSize` for all preceding siblings `j < i` — this
     accounts for all their content + open/close tags.
   - Add `1` for the current child's open tag.
   - Descend into both `block.children[i]` and `pmNode.child(i)`.
3. At the leaf level, `pmPos` is the PM position at the start of the
   textblock's content. Add `textOffset` (the character offset derived from
   the Peritext view position minus the block's text start).

### Edge Cases

| Case | Handling |
|------|----------|
| Disposed facade | Return early (no-op) |
| Collapsed range (caret) | `anchor === head` in PM — works naturally |
| Virtual first block (no marker) | `hasMarker = false`, `textOffset = viewPos` — no `+1` adjustment |
| Point at absolute start | `viewPos = 0`. If first block is virtual, `textOffset = 0`, PM pos = inner position of first block. If first block has marker, `viewPos = 0` is ON the marker — but this shouldn't happen for a valid cursor position (cursor is always after the marker). Handle by clamping `textOffset` to `≥ 0`. |
| Point at absolute end | `viewPos = str.length()`. The tree walk falls through to the last child at each level. `textOffset` ends up at the end of the last block. |
| Transaction origin | Mark the transaction as `REMOTE` so the plugin's `update` handler won't re-emit a selection change back to Peritext (avoids echo loops). |

### Transaction marking

The `setSelection` dispatch must set `TransactionOrigin.REMOTE` so the
`update` handler in the plugin (which calls `self.onselection?.()`) does NOT
fire — otherwise it would echo the selection back. The existing `set()` method
already does this for content changes. Apply the same pattern:

```ts
const meta: TransactionMeta = { orig: TransactionOrigin.REMOTE };
tr.setMeta(SYNC_PLUGIN_KEY, meta);
```

---

## Implementation Checklist

1. **Add imports** to `ProseMirrorFacade.ts`:
   - `TextSelection` from `prosemirror-state`
   - `Block` from `json-joy/lib/json-crdt-extensions/peritext/block/Block`
   - `LeafBlock` from `json-joy/lib/json-crdt-extensions/peritext/block/LeafBlock`
   - `Point` from `json-joy/lib/json-crdt-extensions/peritext/rga/Point`
   - `PeritextApi` is already imported.
   - `Range` is already imported.

2. **Implement `getSelection()`** following Part 1 above.

3. **Implement `setSelection()`** following Part 2 above.

4. **Mark `setSelection` transaction as REMOTE** using `SYNC_PLUGIN_KEY` and
   `TransactionOrigin.REMOTE` (already available in the file as private
   module-level constants).

5. **Handle the virtual-first-block edge case** in both methods: check
   `block.marker` to decide whether to add `+1` for the `'\n'`.

6. **Verify** with the existing ProseMirror stories
   (`ProseMirrorFacade.stories.tsx`) — type text, move cursor, check that
   `getSelection()` returns sane values.

7. **Test round-trip**: call `getSelection()` to get a `Range`, then
   `setSelection()` with that `Range` — the PM selection should be unchanged.

---

## File Locations

| What | Path |
|------|------|
| Implementation target | `packages/collaborative-peritext/src/prosemirror/ProseMirrorFacade.ts` |
| Approach analysis | `packages/collaborative-peritext/src/prosemirror/selection-mapping.md` |
| Peritext `PeritextApi` | `json-joy/src/json-crdt-extensions/peritext/PeritextApi.ts` |
| Peritext `Peritext` class | `json-joy/src/json-crdt-extensions/peritext/Peritext.ts` |
| `Point` class (`.viewPos()`, `.step()`) | `json-joy/src/json-crdt-extensions/peritext/rga/Point.ts` |
| `Range` class | `json-joy/src/json-crdt-extensions/peritext/rga/Range.ts` |
| `Block` / `LeafBlock` | `json-joy/src/json-crdt-extensions/peritext/block/Block.ts`, `LeafBlock.ts` |
| `Fragment` (block tree) | `json-joy/src/json-crdt-extensions/peritext/block/Fragment.ts` |
| `ToPmNode` (PT→PM converter, shows 1:1 mapping) | `packages/collaborative-peritext/src/prosemirror/toPmNode.ts` |
| `FromPm` (PM→PT flat converter) | `packages/collaborative-peritext/src/prosemirror/FromPm.ts` |
| `PeritextBinding` (sync orchestrator) | `packages/collaborative-peritext/src/PeritextBinding.ts` |

---

## Key API Reference

### ProseMirror

| API | Returns | Notes |
|-----|---------|-------|
| `doc.resolve(pos)` | `ResolvedPos` | O(depth). Resolves flat pos into tree-aware pos. |
| `resolved.depth` | `number` | Depth of innermost block (0 = doc). |
| `resolved.index(d)` | `number` | Child index within `node(d)`. |
| `resolved.parentOffset` | `number` | `pos - start(depth)` = offset within leaf block content. |
| `resolved.node(d)` | `Node` | PM node at depth `d`. |
| `node.child(i)` | `Node` | i-th child node. |
| `node.nodeSize` | `number` | Total size including open/close tags. |
| `TextSelection.create(doc, anchor, head?)` | `TextSelection` | Create selection from flat positions. Validates via `doc.resolve()`. |

### Peritext

| API | Returns | Notes |
|-----|---------|-------|
| `peritext.txt.blocks` | `Fragment<string>` | The block tree. `.root` is the root `Block`. |
| `fragment.root.children` | `Block[]` | Top-level child blocks. |
| `block.children` | `Block[]` | Child blocks (empty for `LeafBlock`). |
| `block.isLeaf()` | `boolean` | `true` for `LeafBlock`. |
| `block.marker` | `OverlayPoint \| undefined` | `undefined` for virtual first block. |
| `block.start.viewPos()` | `number` | RGA view position of the block's start `'\n'`. |
| `block.end.viewPos()` | `number` | RGA view position of the block's end (exclusive). |
| `point.viewPos()` | `number` | Gap position in the flat RGA string. O(log N). |
| `txt.pointIn(gap, anchor?)` | `Point<string>` | Create Point at gap position (caret-style). |
| `txt.rangeFromPoints(p1, p2)` | `Range<string>` | Auto-orders the two points into a Range. |
| `txt.range(start, end?)` | `Range<string>` | Create Range from already-ordered Points. |
