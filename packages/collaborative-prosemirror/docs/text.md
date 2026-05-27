## Collaborative ProseMirror binding

Real-time collaborative editing for [ProseMirror](https://prosemirror.net/),
powered by JSON CRDT and the [Peritext](/rich-text) rich-text CRDT. Local edits
are written to the CRDT; remote changes are patched back into ProseMirror with
minimal DOM churn.


## Installation

```
npm install @jsonjoy.com/collaborative-prosemirror @jsonjoy.com/collaborative-peritext json-joy prosemirror-model prosemirror-state prosemirror-view prosemirror-history
```

For remote cursors, also install `@jsonjoy.com/collaborative-presence`.


## Usage

Create your ProseMirror `EditorView` as usual, then bind a `ProseMirrorFacade`
to the document's Peritext node via `PeritextBinding`:

```ts
import {ProseMirrorFacade} from '@jsonjoy.com/collaborative-prosemirror';
import {PeritextBinding} from '@jsonjoy.com/collaborative-peritext';

// `peritextRef` returns the PeritextApi from your json-joy model.
const peritextRef = () => model.s.toExt();

const facade = new ProseMirrorFacade(view, peritextRef);
const unbind = PeritextBinding.bind(peritextRef, facade);

// When done:
unbind();
facade.dispose();
```


## Options

`ProseMirrorFacade` accepts an optional third argument:

- `history` — install the `prosemirror-history` undo/redo plugin (defaults to
  auto-detect). Remote changes are kept off the undo stack.
- `presence` — a `PresenceManager` (or `PresencePluginOpts`) that renders remote
  carets and selection highlights.

```ts
const facade = new ProseMirrorFacade(view, peritextRef, {
  history: true,
  presence: manager,
});
```
