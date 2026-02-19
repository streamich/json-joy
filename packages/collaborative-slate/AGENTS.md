# Slate.js + Peritext Integration — Developer Reference

This document provides paths, concepts, and patterns for developing the Slate.js ↔ Peritext CRDT binding in `@jsonjoy.com/collaborative-slate`.

## Overview

The integration uses a **facade pattern**: a `SlateFacade` class (implementing the editor-agnostic `RichtextEditorFacade` interface) bridges Slate.js to the editor-agnostic `PeritextBinding` connector, which synchronizes edits with the Peritext CRDT.

```
Slate Editor
    ↓ (onChange/selection → SlateFacade)
SlateFacade (RichtextEditorFacade impl)
    ↓
PeritextBinding (editor-agnostic connector)
    ↓
Peritext CRDT (json-joy)
```

## Essential Paths

### Slate.js Integration (This Package)
- **Main facade**: `src/SlateFacade.ts`
  - `get()` → converts editor state to `ViewRange`
  - `set()` → applies CRDT changes to editor
  - `getSelection()` / `setSelection()` → sync selection to/from CRDT-space
  - `onchange` → intercepts `editor.onChange` for local→CRDT sync

- **Position utilities**: `src/util.ts`
  - `slatePointToGap()` — Slate `{path, offset}` → Peritext gap integer
  - `slatePointToPoint()` — Slate point → CRDT-space `Point<string>`
  - `pointToSlatePoint()` — CRDT point → Slate `{path, offset}`

- **Exports**: `src/index.ts`
  - `SlateFacade`, `SlateFacadeOpts`, `PeritextBinding`

### ProseMirror Integration (Reference Pattern)
- **Facade**: `packages/collaborative-peritext/src/prosemirror/ProseMirrorFacade.ts`
  - Plugin-based approach (wrap `EditorView` with `Plugin`)
  - Fast-path extraction via `tryExtractPeritextOperation()`
  - Transaction origin tracking (`TransactionOrigin` enum)
- **Converters**: `packages/collaborative-peritext/src/prosemirror/sync/`
  - `FromPm.ts` — PM doc → `ViewRange`
  - `toPmNode.ts` — `Fragment` → PM doc with caching
  - `applyPatch.ts` — granular tree-diff for minimal updates
- **Position utils**: `packages/collaborative-peritext/src/prosemirror/util.ts`
  - `pmPosToGap()`, `pmPosToPoint()`, `pointToPmPos()`

### Peritext Core (json-joy)
- **Peritext main**: `packages/json-joy/src/json-crdt-extensions/peritext/Peritext.ts`
  - Entry point: `Peritext<T>` class
  - Methods: `insAt()`, `delAt()`, `delStr()`, `refresh()`
  - Selection: `txt.rangeFromPoints()`, `txt.pointIn()`

- **Block tree**: `packages/json-joy/src/json-crdt-extensions/peritext/block/`
  - `Fragment<T>` — rich-text slice with root block
  - `Block<T>` / `LeafBlock<T>` — block hierarchy
  - `Inline<T>` — text runs with formatting

- **CRDT positions**: `packages/json-joy/src/json-crdt-extensions/peritext/rga/`
  - `Point<T>` — CRDT-aware position (survives concurrent edits)
  - `Range<T>` — start/end pair in CRDT-space

- **Conversions**: `packages/json-joy/src/json-crdt-extensions/slate/`
  - `FromSlate.ts` — Slate doc → `ViewRange`
  - `toSlate.ts` — `Fragment` → Slate `Descendant[]`

### RichtextEditorFacade (Interface)
**File**: `packages/collaborative-peritext/src/types.ts`

```typescript
interface RichtextEditorFacade {
  get(): ViewRange;  // Editor state → [text, pos, slices]
  set(fragment: Fragment<string>): void;  // Apply CRDT state
  onchange?: (change: PeritextOperation | void) => PeritextRef | void;  // Local edit
  getSelection?(peritext: PeritextApi): PeritextSelection | undefined;
  setSelection?(peritext: PeritextApi, range: Range<string>, startIsAnchor: boolean): void;
  dispose?(): void;
}
```

### PeritextBinding (Editor-Agnostic Connector)
**File**: `packages/collaborative-peritext/src/PeritextBinding.ts`

```typescript
class PeritextBinding {
  static bind(peritext: PeritextRef, editor: RichtextEditorFacade): () => void
  syncFromEditor(operation: PeritextOperation | void): PeritextRef
  syncFromModel(): void
}
```

## Key Concepts

### ViewRange (Peritext's View Format)
A 3-tuple representing rich-text state:
```typescript
type ViewRange = [
  text: string,           // Flat text content
  textPosition: number,   // Start position (usually 0)
  slices: ViewSlice[],   // Annotations & block splits
];
```

Each `ViewSlice` encodes inline formatting (bold, italic) and block boundaries (paragraph, heading).

### PeritextOperation (Fast Path)
For simple single-character edits:
```typescript
type PeritextOperation = [gap: number, deleteLen: number, insertText: string];
```

- **gap** — integer position (like an offset into flat text)
- **deleteLen** — chars to remove
- **insertText** — chars to insert

The `SlateFacade.onchange` handler tries to extract this for `insert_text` / `remove_text` ops. If the operation is too complex (multiple ops, block splits, mark changes), it passes `undefined` and the binding falls back to a full merge via `txt.editor.merge(viewRange)`.

### Position Mapping

**Slate positions** are `{path: number[], offset: number}`:
- `path` — indices through editor tree (e.g., `[0, 2]` = second child of root, third text node)
- `offset` — character position within a text node

**Peritext positions** are CRDT-space `Point<string>`:
- Track character IDs with anchor (before/after)
- Survive concurrent edits (unlike flat offsets)
- Obtained via `txt.pointIn(gap)` or `txt.pointStart()` / `txt.pointEnd()`

**Conversion**: Slate path walks the block tree to find the leaf, then sums text lengths before that node. This produces the flat "gap" integer, which maps to a Peritext `Point`.

## Patterns from ProseMirror

### 1. Plugin / Interception Pattern
ProseMirror: Uses a `Plugin` that overrides `view.update()` to intercept document changes.

**Slate equivalent** (in `SlateFacade`): Override `editor.onChange` to intercept saves.

### 2. Transaction Origin Tracking
ProseMirror: Uses `tr.setMeta(key, {orig: REMOTE})` to tag remote transactions.

**Slate equivalent**: Use a `_isRemote` flag on the facade; check it in `onChange` to skip the callback.

### 3. Fast Path with Fallback
ProseMirror: `tryExtractPeritextOperation()` inspects the single `ReplaceStep`.

**Slate equivalent**: `tryExtractPeritextOperation()` inspects single `insert_text` / `remove_text` operations from `editor.operations`.

### 4. Caching (Optional, Phase 2)
ProseMirror: `toPmNode.cache` with double-buffered `Map<hash, Node>`.

**Slate equivalent** (future): Could implement similar caching keyed by `Block.hash` to avoid re-creating unchanged subtrees.

### 5. Selection Round-Trip
ProseMirror: `getSelection()` walks resolved positions → converts to `Point` objects.

**Slate equivalent**: Same logic, but walk Slate's path array instead of ProseMirror's `ResolvedPos`.

## Development Tasks (Phases)

### Phase 1: Core Binding ✅ (DONE)
- ✅ `SlateFacade` with `get()`, `set()`, `onchange`
- ✅ Position utilities (`slatePointToGap`, `slatePointToPoint`, `pointToSlatePoint`)
- ✅ Story component accepting `Model` prop
- ✅ Exports in `index.ts`

### Phase 2: Granular Patching (Optional)
- `applyPatch()` — tree-diff old vs. new Slate tree, apply via `Transforms` for minimal updates
- `toSlateNode` caching by `Block.hash`
- Profile to confirm React's vDOM diffing is sufficient

### Phase 3: Selection & History
- Full `getSelection()` / `setSelection()` tests
- Undo/redo via `slate-history` plugin (similar to ProseMirror's history)
- Selection state preservation across remote edits

### Phase 4: Presence & Polish
- `withPresence()` plugin for remote cursors (like ProseMirror presence)
- Side-by-side multi-editor story
- Fuzz testing against known traces

## Testing Resources

### Existing Test Traces
**Path**: `packages/collaborative-peritext/src/slate/sync/__tests__/fixtures/traces/`

Pre-recorded test cases (similar to ProseMirror):
- `10-chars.ts` — basic character insertion
- `20-insert-chars.ts`, `30-delete-chars.ts` — text operations
- `60-add-inline-formatting.ts` — mark application
- `70-block-splits.ts` — block structure changes

Use these to validate round-trip conversions (Slate → Peritext → Slate).

### Fuzz Testing
**File**: `packages/collaborative-peritext/src/slate/sync/__tests__/tools/fuzzer.ts`

Generates random Slate operations, records traces, and validates round-trip consistency.

### Merge Tests
**File**: `packages/collaborative-peritext/src/slate/sync/__tests__/merge.spec.ts`

Tests the full merge path (`txt.editor.merge(viewRange)`) for complex edits.

## Common Gotchas

1. **Normalization**: Slate normalizes documents after every edit. Remote patches must produce normalized documents or suppression is needed.

2. **Selection validity**: After replacing `editor.children`, validate the current selection points to valid paths; otherwise, clear it.

3. **Mark boundaries**: The fast path skips on mark changes at insertion boundaries (unlike ProseMirror, which can infer mark extension automatically). Fall back to full merge when marks differ.

4. **Block tree depth**: Slate paths can be arbitrarily deep (nested blocks). The position mapper must handle this correctly.

5. **Slate React integration**: `editor.onChange` is called by Slate React after rendering. The override must call the original to ensure React updates.

## Quick Reference: Imports

```typescript
// From @jsonjoy.com/collaborative-peritext
import {SlateFacade} from '@jsonjoy.com/collaborative-peritext/lib/slate/SlateFacade';
import {PeritextBinding} from '@jsonjoy.com/collaborative-peritext/lib/PeritextBinding';
import {FromSlate} from '@jsonjoy.com/collaborative-peritext/lib/slate/sync/FromSlate';
import {toSlate} from '@jsonjoy.com/collaborative-peritext/lib/slate/sync/toSlate';

// From json-joy
import {Peritext, Point, Range} from 'json-joy/lib/json-crdt-extensions';
import {Fragment, Block, LeafBlock, Inline} from 'json-joy/lib/json-crdt-extensions/peritext';

// From slate
import {Editor, Descendant, Path, Point as SlatePoint} from 'slate';
```

## Resources

- **Slate.js docs**: https://docs.slatejs.org
- **json-joy Peritext docs**: See `packages/json-joy/README.md`
- **ProseMirror integration**: `packages/collaborative-peritext/src/prosemirror/`
- **Prior art survey**: `.docs/peritext/slate/PRIOR_ART.md`
