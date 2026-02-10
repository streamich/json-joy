# ProseMirror ↔ Peritext Selection Mapping

## Problem

Transform a ProseMirror selection (pair of integer offsets) into a Peritext
CRDT selection (pair of `Point<T>` objects, each being `(charID, Anchor)`).

This document analyses the two position models, walks through worked examples,
and evaluates several implementation approaches.

---

## 1. Position Models

### 1.1 ProseMirror Positions

A ProseMirror position is a single integer that counts **boundary crossings**
starting from 0 at the very beginning of the `doc` node:

| construct | units consumed |
|-----------|---------------|
| open tag of a block node | 1 |
| close tag of a block node | 1 |
| one text character | 1 |
| one inline atom (image, embed, etc.) | 1 |

So a block node of text length _L_ at nesting depth _d_ contributes
_2 · d_ tag-units plus _L_ character-units in the enclosing ancestors. The
immediate block itself contributes its own open (1) + content (_L_) + close (1).

The ProseMirror `ResolvedPos` API (`doc.resolve(pos)`) exposes rich
structural information:

- `depth` — nesting depth (0 = doc)
- `parent` — immediate parent `Node`
- `parentOffset` — offset within parent (includes child block tags)
- `textOffset` — offset within the direct text content (0 if at a child block
  boundary)
- `index(d)` — child index at depth _d_
- `node(d)` — node at depth _d_

### 1.2 Peritext Positions

Peritext stores the entire document in a single RGA string. Block structure
is encoded by **block-split markers**: a `'\n'` character inserted at the
_beginning_ of each leaf block's text span. The type/nesting information for
each `'\n'` is stored as a `Marker` slice (an `OverlayPoint` in the overlay
tree), not as extra characters.

A Peritext **view position** (as returned by `Point.viewPos()` or consumed by
`Peritext.pointAt(pos)` / `Peritext.pointIn(pos)`) counts **all visible
characters** in the RGA, including the `'\n'` block-split characters.

A Peritext **Point** is `(id: ITimestampStruct, anchor: Anchor)`:

- `Anchor.After` (1) — the caret is **after** the referenced character.
- `Anchor.Before` (0) — the caret is **before** the referenced character.

Convenience constructors:

| API | input | semantics |
|-----|-------|-----------|
| `pointAt(pos, anchor?)` | char index (0 = first char) | attaches _at_ the character |
| `pointIn(pos, anchor?)` | gap index (0 = before first char) | attaches _in_ the gap between characters |
| `pos2point(at)` | `number \| [number, Anchor] \| Point` | generic converter |

For cursor positions the natural fit is `pointIn(gapPos)`, because a caret
in a text editor sits _between_ characters.

---

## 2. Worked Examples

### 2.1 Two flat paragraphs

```
ProseMirror DOM:   <doc> <p> H e l l o </p> <p> W o r l d </p> </doc>
PM offset:          0     1  2 3 4 5 6   7    8  9 ...       13  14
```

Peritext RGA string: `\nHello\nWorld` (length 12)

```
Peritext view pos:   0  1 2 3 4 5  6  7 8 9 10 11
Character:           \n H e l l o  \n W o r l  d
```

Mapping (only valid cursor positions shown):

| PM pos | meaning | Peritext gap pos | Peritext meaning |
|--------|---------|-----------------|------------------|
| 1 | start of 1st `<p>`, before 'H' | 1 | after '\n₁', before 'H' |
| 2 | after 'H' | 2 | after 'H' |
| 3 | after 'e' | 3 | after 'e' |
| 6 | after 'o' | 6 | after 'o' |
| 8 | start of 2nd `<p>`, before 'W' | 7 | after '\n₂', before 'W' |
| 9 | after 'W' | 8 | after 'W' |
| 13 | after 'd' | 12 | after 'd' |

**Pattern:** For position inside block _i_ (0-indexed) at text offset _t_
within that block:

```
pmPos  = Σ(j=0..i-1)(Lⱼ + 2) + 1 + t          // +2 per preceding block (open+close), +1 for current open
ptGap  = Σ(j=0..i-1)(Lⱼ + 1) + 1 + t          // +1 per preceding block ('\n'), +1 for current '\n'
```

Difference = _i_ (one extra unit per preceding block, from the close tags).

### 2.2 Nested blockquote

```
ProseMirror:  <doc> <blockquote> <p> H i </p> </blockquote> </doc>
PM offset:     0          1       2  3 4   5         6        7
```

Peritext: `\nHi` (single '\n' marker with path `['blockquote', 'paragraph']`)

```
Peritext view pos:  0  1 2
Character:          \n H i
```

| PM pos | meaning | Peritext gap pos |
|--------|---------|-----------------|
| 2 | inside `<p>`, before 'H' | 1 |
| 3 | after 'H' | 2 |
| 4 | after 'i' | 3 |

The close tags of both `</p>` (pos 5) and `</blockquote>` (pos 6) have **no
Peritext equivalent**. The open tags of `<blockquote>` (pos 1) and `<p>`
(pos 2) together map to the single `'\n'` at Peritext pos 0. Only the
innermost open tag "counts" as the `'\n'`; the outer opens are nesting
overhead.

### 2.3 Empty paragraph

```
ProseMirror:  <doc> <p></p> </doc>
PM offset:     0     1   2   3
```

Peritext: `\n` (just the block-split marker, length 1)

| PM pos | meaning | Peritext gap pos |
|--------|---------|-----------------|
| 1 | inside empty `<p>` | 1 |

The only valid cursor position is PM 1, which maps to Peritext gap 1 (after
the `'\n'`).

---

## 3. Approaches

### 3.1 Approach A — Flat Offset Walk

**Idea:** Walk the ProseMirror document tree from position 0 in document order,
keeping two counters: `pmOffset` (ProseMirror units) and `ptOffset` (Peritext
view-position units). Stop when `pmOffset` equals the target. The current
`ptOffset` is the answer.

#### Algorithm

```
function pmPosToPeritextGap(doc, targetPmPos):
    pmOff = 0
    ptOff = 0

    function walk(node):
        if node is text:
            chars = node.text.length
            if pmOff + chars >= targetPmPos:
                ptOff += (targetPmPos - pmOff)
                pmOff = targetPmPos
                return FOUND
            pmOff += chars
            ptOff += chars
            return CONTINUE

        // block node
        isLeaf = node has no block children (only text / inline atoms)
        pmOff += 1   // open tag
        if isLeaf:
            ptOff += 1   // '\n' block split
        if pmOff >= targetPmPos:
            return FOUND
        for child in node.content:
            if walk(child) == FOUND: return FOUND
        pmOff += 1   // close tag
        if pmOff >= targetPmPos:
            return FOUND
        return CONTINUE

    for child in doc.content:
        if walk(child) == FOUND: break
    return ptOff
```

More concretely, the walk can use ProseMirror's
`doc.nodesBetween(0, targetPmPos + 1, callback)` or
`doc.descendants(callback)`, though these don't give per-node open/close
events directly. A manual recursive traversal is cleaner.

#### Peritext conversion

Once we have `ptGap` (the Peritext gap / caret position):

```ts
const point = peritext.pointIn(ptGap);
```

#### Pros
- Simple, self-contained — only needs the PM `doc` node, no Peritext block
  tree access.
- Handles any nesting depth uniformly.
- O(B + T) where B = number of blocks, T = text length up to the target
  position. In practice very fast (documents are small, and we short-circuit
  at the target).

#### Cons
- Must walk from the start of the document for each selection endpoint (though
  both endpoints can be computed in a single left-to-right walk).
- Relies on the ProseMirror ↔ Peritext content already being in sync. If
  they diverge, the flat offset will be incorrect.
- Does not naturally produce block/inline identity information (just a number).
- Handling of nested non-leaf blocks requires care: only the innermost
  (leaf) block emits a `'\n'`, outer wrapper blocks contribute open/close
  tags in PM with no Peritext counterpart.

#### Nesting rule

For a block node at depth _d_ inside the PM tree, the contribution is:

| PM units | Peritext units | comment |
|---------|---------------|---------|
| 1 (open) | 0 | if the block has block children (non-leaf) |
| 1 (open) | 1 | if the block is a leaf (has text content or is empty) |
| text | text | 1:1 for characters |
| 1 (close) | 0 | always |

The walk naturally captures this: `ptOff += 1` only fires for leaf blocks.

---

### 3.2 Approach B — Nested Block-to-Block Tree Mapping

**Idea:** Use PM's `ResolvedPos` (`doc.resolve(pmPos)`) to extract the
**index path** (child indices at each nesting depth). Walk the same index
path in the Peritext `Fragment` block tree to reach the corresponding
`LeafBlock`. Then use `parentOffset` to locate the exact character within
that block and convert it to a Peritext `Point`.

#### Why the trees are guaranteed to be isomorphic

Precondition: after every `.syncFromEditor()` or `.syncFromModel()`, both
trees represent the same document. Specifically:

1. `Fragment.build()` constructs the Peritext block tree from overlay markers
   in document order. Children are appended via `push()`, preserving order.
2. `ToPmNode.convert(fragment)` walks `root.children[0..n-1]` in order and
   produces `pmChildren[0..n-1]` with the exact same loop:
   ```ts
   for (let i = 0; i < length; i++)
       pmChildren[i] = this.convBlock(children[i]);
   ```
3. For non-leaf `Block` nodes, `convBlock` recurses the same way:
   `pmChildren[i] = this.convBlock(children[i])`.
4. For `LeafBlock` nodes, `convInlines(block)` produces inline PM text nodes.

There is **no reordering, filtering, or splitting**. The i-th Peritext child
is always the i-th PM child. Existing unit + fuzz tests verify this.

#### Algorithm (detailed)

```
function pmPosToPeritextPoint(doc, pmPos, fragment):
    resolved = doc.resolve(pmPos)

    // Step 1: Find the leaf-block depth.
    // Walk down from depth 0 (doc). The leaf block is the deepest
    // node whose PM type is a block node (isBlock=true).
    // In a flat doc:   depth 0=doc, depth 1=paragraph  → leafDepth=1
    // In a nested doc: depth 0=doc, depth 1=blockquote, depth 2=p → leafDepth=2
    leafDepth = resolved.depth
    // resolved.depth already points at the innermost block for typical
    // TextSelection positions (PM resolves to the textblock level).

    // Step 2: Build the index path from depth 1 down to leafDepth.
    // Depth 0 is "doc" → maps to fragment.root.
    indexPath = []
    for d = 1 to leafDepth:
        indexPath.push(resolved.index(d - 1))
        // resolved.index(d-1) = child index within node(d-1) where node(d) lives

    // Step 3: Walk the Peritext block tree along the same path.
    block = fragment.root
    for idx in indexPath:
        block = block.children[idx]
    // `block` is now a LeafBlock (or a leaf-level Block for empty blocks).

    // Step 4: Convert parentOffset to the Peritext view position.
    // PM's parentOffset = pos - start(leafDepth) = char offset within the block.
    textOffset = resolved.parentOffset

    // Step 5: Resolve within the LeafBlock.
    // Option A — arithmetic:
    //   The block's start Point sits on the marker '\n'. viewPos() of
    //   the marker char is its RGA position. The inline text begins
    //   1 char after that (past the '\n').
    //   peritextGap = block.start.viewPos() + 1 + textOffset
    //   return peritext.pointIn(peritextGap)
    //
    // Option B — walk Inline objects:
    //   iterate block.texts0(), accumulate inline lengths,
    //   find the inline containing textOffset, then step into it.
    //   (described in detail below)
```

#### Step 5 — Two sub-approaches for intra-block resolution

##### 5A: Arithmetic (fast, simple)

```ts
const markerViewPos = block.start.viewPos();
// marker '\n' occupies one character position, inline text follows
const peritextGap = markerViewPos + 1 + textOffset;
return peritext.pointIn(peritextGap);
```

This works because:
- `block.start.viewPos()` is the RGA position of the `'\n'` marker.
- The inline content of the block begins at `markerViewPos + 1`.
- `textOffset` counts inline characters within the block (PM's
  `parentOffset` already excludes the block's own open/close tags).
- `peritext.pointIn(gap)` converts a gap (caret) position from the
  flat RGA view space into a `Point`.

Time: O(1) after tree navigation (ignoring `viewPos()`, which is O(log N)
in the RGA skip-list).

##### 5B: Inline walk (direct CRDT position, no `pointIn` needed)

```ts
let remaining = textOffset;
for (let iter = block.texts0(), inline; (inline = iter()); ) {
    const len = inline.text().length;          // or: inline.length()
    if (remaining <= len) {
        // The target position is within this Inline.
        if (remaining === 0) {
            // Caret is at the very start of this inline
            return inline.start.clone();       // already a Point
        }
        // Clone the start point and step forward by `remaining` chars
        const point = inline.start.clone();
        point.step(remaining);
        return point;
    }
    remaining -= len;
}
// If we fall through, position is at the very end of the block
return block.end.clone();
```

Advantages of 5B:
- Produces a `Point` directly in CRDT space — no intermediate view-position
  number, no calls to `pointIn` / `str.find()`.
- `Point.step(n)` walks the RGA skip-list forward by _n_ visible characters,
  naturally skipping deleted chunks. It directly yields the character ID,
  ready to be used for cursor `.set()`.
- More robust: avoids potential off-by-one issues from arithmetic involving
  view positions across block boundaries.

Disadvantage:
- O(I + T) where I = number of inlines in the block, T = textOffset
  (due to `inline.text().length` calls and `point.step()`).
  In practice this is very small — most blocks have 1–5 inlines and
  short text.

#### Full implementation sketch

```ts
getSelection(fragment: Fragment<string>, peritext: Peritext): {
    anchor: Point; head: Point; anchorSide: CursorAnchor;
} | null {
    if (this._disposed) return null;
    const selection = this.view.state.selection;
    const doc = this.view.state.doc;

    const resolve = (pmPos: number): Point => {
        const resolved = doc.resolve(pmPos);
        const leafDepth = resolved.depth;

        // Walk Peritext tree
        let block: Block | LeafBlock = fragment.root;
        for (let d = 0; d < leafDepth; d++) {
            block = block.children[resolved.index(d)];
        }

        // Intra-block resolution via inline walk
        const textOffset = resolved.parentOffset;
        let remaining = textOffset;
        for (let iter = block.texts0(), inline; (inline = iter()); ) {
            const len = inline.text().length;
            if (remaining <= len) {
                if (remaining === 0) return inline.start.clone();
                const pt = inline.start.clone();
                pt.step(remaining);
                return pt;
            }
            remaining -= len;
        }
        return block.end.clone();
    };

    const anchor = resolve(selection.anchor);
    const head = resolve(selection.head);
    const anchorSide = selection.anchor <= selection.head
        ? CursorAnchor.Start : CursorAnchor.End;
    return { anchor, head, anchorSide };
}
```

#### Resolved.index() depth semantics — critical detail

ProseMirror's `resolved.index(depth)` returns the child index within
`node(depth)`. To walk from `doc` (depth 0) down to `node(leafDepth)`:

```
node(0)                  = doc
node(0).child(index(0))  = node(1)    // first block level
node(1).child(index(1))  = node(2)    // second block level (if nested)
...
node(d).child(index(d))  = node(d+1)
```

So the loop is:

```ts
let block = fragment.root;                     // ≡ node(0) = doc
for (let d = 0; d < leafDepth; d++) {
    block = block.children[resolved.index(d)]; // descend one level
}
```

This matches the PM tree exactly because `ToPmNode` maps
`peritextBlock.children[i]` → `pmNode.child(i)` at every level.

#### Why `parentOffset` is the correct text offset

`parentOffset = pos - start(depth)` where `start(depth)` is the flat PM
position of the opening of `node(depth)`'s content. For a leaf textblock:

```
<p>  H  e  l  l  o  </p>
 ^   ^              ^
 |   start(depth)   end
 pos of open tag
```

If `pos = start(depth) + 3`, then `parentOffset = 3`, meaning the cursor is
after the 3rd character of the paragraph's inline content.

In Peritext, the leaf block's inline content (from `texts0()`) starts _after_
the `'\n'` marker. So `parentOffset = 3` means "3 characters into the inline
text of this block" — exactly the offset we pass to the Inline walk.

#### Handling special positions

| PM position | `resolved.depth` | `parentOffset` | Peritext mapping |
|-------------|------------------|----------------|------------------|
| Just inside an empty `<p>` | depth of `<p>` | 0 | After the `'\n'` marker: `inline.start` of first (empty) inline, or `block.start.clone()` stepped by 1 |
| At end of block text | depth of `<p>` | `block.content.size` | `block.end.clone()` (the fallthrough case) |
| At boundary between blocks | PM resolves into one or the other block — `Selection.near()` | — | Tree walk lands in the correct block |
| Inside a deeply nested block | `resolved.depth` = total nesting | Loop descends all levels | Works uniformly |

#### Pros

- O(depth) tree navigation + O(I) inline walk — near-instant for any
  realistic document.
- Produces CRDT `Point` directly when using sub-approach 5B — no intermediate
  flat-offset arithmetic.
- Structurally verified: trees are guaranteed isomorphic after sync.
- Identifies the specific `LeafBlock` and `Inline` — useful for setting
  block-level cursor constraints, formatting queries, etc.
- `doc.resolve()` is O(depth) — extremely cheap.

#### Cons

- **Requires Peritext `Fragment` reference** at selection-read time. The
  `ProseMirrorFacade` needs a way to access it (e.g., stored on the instance
  after each `set()` call).
- **Requires trees to be in sync** — but this is guaranteed by the binding
  contract and verified by tests.
- Slightly more code than a flat walk — but more maintainable and
  structurally clear.

---

### 3.3 Approach C — Position Map from `FromPm`

**Idea:** Augment the `FromPm` conversion (which already walks the PM tree
to produce the flat `ViewRange`) to also produce a **PM-offset → Peritext-offset
mapping**. Then `getSelection()` simply looks up both endpoints in this map.

#### Algorithm

Extend `FromPm` (or a parallel walker) so that during the recursive `conv()`
traversal, it tracks the current PM offset alongside the Peritext text offset.
At each character position, record the mapping.

The map can be:

1. **Sparse array / sorted list of breakpoints:** Record only positions where
   the PM-to-Peritext delta changes (i.e., at block boundaries). Between
   breakpoints, the relationship is linear with slope 1. Binary-search for the
   target PM pos.

2. **Dense array:** `pmToPeritextGap[pmPos] = peritextGap` for every valid PM
   position. Direct O(1) lookup.

3. **Formula + block index:** Store per-block `(pmStart, ptStart, length)`.
   For a PM pos, binary-search the block, then `ptGap = block.ptStart +
   (pmPos - block.pmStart)`.

#### Pros
- O(1) or O(log B) lookup at selection time — fastest possible.
- Decouples mapping computation from selection reading: the map is built once
  per render cycle (during `set()`) and reused for all selection events until
  the next render.
- Does not need access to the Peritext block tree at selection time.
- Can naturally capture the mapping for inline atoms/embeds during the same walk.

#### Cons
- Must be kept in sync: the map must be rebuilt every time the PM document
  changes. If `set()` is called (remote change), rebuild. If local edits
  happen (the doc changes without `set()`), the map is stale.
- Adds memory overhead (though modest: one entry per block boundary is tiny).
- Requires modifying `FromPm` or duplicating its traversal logic.
- The map is PM→Peritext direction only. For the reverse (`setSelection`, set
  PM selection from Peritext cursor), a separate Peritext→PM map or reverse
  lookup is needed. (The reverse conversion is needed when applying remote
  cursor changes.)

---

### 3.4 Approach D — Hybrid: `resolve()` + Cumulative Block Metadata

**Idea:** Precompute per-block metadata (cumulative Peritext offset at the
start of each block) during the `set()` / render cycle, keyed by PM node
identity or block index. At selection time, use `doc.resolve(pmPos)` to find
the block, look up its precomputed base offset, and add `textOffset`.

This is a lightweight variant of Approach C, storing only per-block data
rather than a full position map.

#### Data structure

```ts
// Built during set() / render
interface BlockMapping {
    pmNode: PmNode;           // the PM leaf block node
    pmStartPos: number;       // PM position at the start of this block's content
    ptBaseGap: number;        // Peritext gap position at the start of this block's text
                              // (= block.start.viewPos() + 1, i.e., after the '\n')
}
blockMappings: BlockMapping[];  // one per leaf block, in document order
```

#### Selection-time lookup

```ts
const resolved = doc.resolve(pmPos);
// Find the leaf block depth
let d = resolved.depth;
while (d > 0 && resolved.node(d).isTextblock === false) d--;
const blockNode = resolved.node(d);
const mapping = blockMappings.find(m => m.pmNode === blockNode);
// (or binary-search by pmStartPos)
const textOffset = pmPos - resolved.start(d);   // offset within block content
const ptGap = mapping.ptBaseGap + textOffset;
return peritext.pointIn(ptGap);
```

#### Pros
- Fast lookup: O(log B) with binary search, O(1) with a `Map`.
- Small memory footprint.
- `doc.resolve()` is very cheap.

#### Cons
- Still requires rebuilding on every doc change.
- `pmNode` identity comparison assumes PM nodes are reused across renders
  (true with ProseMirror's immutable data model and structural sharing).
  More reliable to key by `pmStartPos`.
- Same sync-staleness concern as Approach C.

---

## 4. Comparison

| | A: Flat Walk | B: Nested Tree | C: FromPm Map | D: Hybrid resolve |
|---|---|---|---|---|
| **Lookup cost** | O(N) walk | O(depth + I) resolve + tree nav + inline walk | O(1) or O(log B) | O(log B) |
| **Build cost** | none (computed on demand) | none (uses existing trees) | O(N) per doc change | O(B) per doc change |
| **Needs Peritext tree?** | No | Yes (Fragment) | No | Optionally |
| **Handles nesting** | Naturally (leaf detection) | Naturally (tree nav, verified 1:1) | Naturally (walk covers it) | Naturally |
| **Robustness** | Good (self-contained) | Excellent (trees guaranteed in sync) | Good | Good |
| **Complexity** | Low | Medium | Medium | Medium |
| **Produces CRDT Point** | Indirectly (via `pointIn`) | Directly (via `Point.step()`) | Indirectly | Indirectly |
| **Reverse mapping** | Needs separate impl | Symmetric (can navigate PT→PM) | Needs reverse map | Needs reverse map |
| **Inline atoms** | Works (PM atom = 1 unit, PT = 1 char) | Works (1:1 in inline walk) | Works | Works |

_N = total characters up to target, B = number of blocks, I = inlines in the target block, depth = nesting depth._

---

## 5. Recommendations

### Primary: Approach B (Nested Block-to-Block Tree Mapping)

Given that the PM and Peritext trees are **guaranteed** to be structurally
isomorphic after every sync (verified by unit and fuzz tests), **Approach B
is the best fit**:

1. **Direct CRDT output** — sub-approach 5B produces a `Point` directly via
   `Point.step()`, avoiding intermediate flat-offset arithmetic and the
   `str.find()` binary-search that `pointIn()` requires.
2. **Structural robustness** — leverages the tree isomorphism that already
   exists and is tested, rather than computing a parallel flat-offset mapping.
3. **Near-instant** — `doc.resolve()` is O(depth), tree descent is O(depth),
   and the inline walk within one block is O(I) where I is typically 1–5.
4. **Rich context** — the resolved `LeafBlock` and `Inline` can be used for
   formatting queries, block constraints, and cursor anchoring.

The `ProseMirrorFacade` needs access to the latest `Fragment` (or the
`Peritext` instance). This can be provided via the existing `PeritextRef`
callback or by storing the `Fragment` after each `set()` call.

### Approach A: useful as a fallback / cross-check

The flat walk can serve as a **debug assertion** to verify Approach B during
development, or as a self-contained fallback that does not need the Peritext
tree.

### Approach D: future optimisation (unlikely needed)

If profiling shows the per-keystroke inline walk is too slow for very large
blocks (unlikely), Approach D's precomputed per-block base offsets can
replace the inline walk portion of Approach B.

---

## 6. Converting the Result to a Peritext Point

Once we have `peritextGapPos` (a caret position in the Peritext view space,
counting all chars including `'\n'` splits):

```ts
// Gap position → CRDT Point
const point: Point<T> = peritext.pointIn(peritextGapPos);
// — or via the Editor helper —
const point: Point<T> = peritext.editor.pos2point(peritextGapPos);
```

For a full selection (anchor + head):

```ts
const anchorGap = pmToPeritextGap(doc, selection.anchor);
const headGap   = pmToPeritextGap(doc, selection.head);
const anchorPt  = peritext.pointIn(anchorGap);
const headPt    = peritext.pointIn(headGap);

// Determine direction
const anchorSide = selection.anchor <= selection.head
    ? CursorAnchor.Start
    : CursorAnchor.End;

// Apply to Peritext cursor
const cursor = peritext.editor.cursor;
cursor.set(anchorPt, headPt, anchorSide);
```

---

## 7. Edge Cases

| Case | PM behaviour | Peritext behaviour | Notes |
|------|-------------|-------------------|-------|
| Empty paragraph `<p></p>` | pos inside = after open tag (1 unit) | after '\n' (gap pos = block.start.viewPos() + 1) | textOffset = 0 in both |
| Cursor between two blocks | PM pos is between close and open tags — typically not a valid `TextSelection` position | No direct equivalent — cursor must be inside a block | PM `Selection.near()` resolves to nearest valid pos |
| First virtual block | If first marker is not at pos 0, Peritext inserts a virtual default `<p>` | Fragment.build() skips the virtual block if the first marker is at viewPos 0 | Need to handle the virtual-block case consistently |
| Inline atom / embed | 1 PM unit, produces 1 inline content unit | 1 character in the RGA (typically a special char or embed marker) | 1:1 mapping, no extra handling |
| Nested `<blockquote><p>…</p></blockquote>` | 2 extra open/close tags vs flat `<p>` | Same '\n' count (1 per leaf) — nesting is in the marker type only | The walk must not emit '\n' for non-leaf wrappers |
| Multiple nested levels | Each PM wrapper adds 2 units overhead | Only the leaf's single '\n' counts | Walk detects leaf by checking if any child is text/inline |
