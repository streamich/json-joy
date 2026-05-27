## Collaborative Slate binding

Integrates the JSON CRDT [Peritext](/rich-text) rich-text CRDT with
[Slate.js](https://github.com/ianstormtaylor/slate) (and
[Plate.js](https://platejs.org/)) for real-time collaborative rich-text editing.


## Installation

```
npm install @jsonjoy.com/collaborative-slate @jsonjoy.com/collaborative-peritext slate slate-react
```

For remote cursors, also install `@jsonjoy.com/collaborative-presence`.


## Usage

`bind` is the fastest way to connect a Slate editor to a Peritext node. It
returns an `unbind` cleanup function:

```tsx
import {createEditor} from 'slate';
import {withReact} from 'slate-react';
import {bind} from '@jsonjoy.com/collaborative-slate';

const editor = withReact(createEditor());

// `peritextRef` returns the PeritextApi from your json-joy model.
const peritextRef = () => model.s.toExt();
const unbind = bind(peritextRef, editor);

// When done (e.g. on unmount):
unbind();
```

Binding performs an initial sync, subscribes to remote CRDT changes, and
intercepts local Slate operations. Remote changes are applied outside the Slate
operation pipeline, so they never land on the undo stack.


## History and presence

- **Undo/redo** — compatible with `slate-history`. `SlateFacade` auto-installs
  `withHistory` if absent; remote changes use `HistoryEditor.withoutSaving()`.
- **Remote cursors** — the `useSlatePresence` hook plus `withPresenceLeaf` render
  colored carets and selection highlights from a shared `PresenceManager`.

For full control, use `SlateFacade` directly with `PeritextBinding`:

```ts
import {SlateFacade} from '@jsonjoy.com/collaborative-slate';
import {PeritextBinding} from '@jsonjoy.com/collaborative-peritext';

const facade = new SlateFacade(editor, peritextRef, {history: false});
const unbind = PeritextBinding.bind(peritextRef, facade);
```
