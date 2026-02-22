# @jsonjoy.com/collaborative-prosemirror

Real-time collaborative editing for [ProseMirror](https://prosemirror.net/),
powered by [JSON CRDT](https://jsonjoy.com/specs/json-crdt) and
[Peritext](https://www.inkandswitch.com/peritext/) rich-text CRDT.


## Features

- **Two-way binding** between a ProseMirror `EditorView` and a Peritext CRDT
  model — local edits are written to the CRDT, remote CRDT changes are
  patched into ProseMirror with minimal DOM churn.
- **Remote cursor & selection rendering** — optional presence plugin draws
  colored carets and selection highlights for every connected peer, driven
  entirely by CSS animations (no JS timers).
- **Undo/redo support** — works with the standard `prosemirror-history` plugin;
  remote changes are excluded from the undo stack automatically.


## Installation

```bash
npm install @jsonjoy.com/collaborative-prosemirror
```


### Peer dependencies

The package requires ProseMirror core libraries and `json-joy` to be installed
in your project:

```bash
npm install json-joy @jsonjoy.com/collaborative-peritext prosemirror-model prosemirror-state prosemirror-view prosemirror-history
```

For collaborative presence (remote cursors), also install:

```bash
npm install @jsonjoy.com/collaborative-presence
```


## Quick start

```ts
import {ModelWithExt, ext} from 'json-joy/lib/json-crdt-extensions';
import {EditorState} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';
import {schema} from 'prosemirror-schema-basic';
import {ProseMirrorFacade} from '@jsonjoy.com/collaborative-prosemirror';
import {PeritextBinding} from '@jsonjoy.com/collaborative-peritext';

// 1. Create a ProseMirror editor as usual.
const doc = schema.nodes.doc.createAndFill()!;
const view = new EditorView(document.querySelector('#editor')!, {
  state: EditorState.create({doc}),
});

// 2. Obtain a PeritextRef — a function that returns the PeritextApi from your
//    JSON CRDT model. How you create the model depends on your setup; for
//    example:
const json = {"type":"doc","content":[
  {"type":"paragraph","content":[{"type":"text","text":"Hello, ProseMirror!"}]},
]};
const model = ModelWithExt.create(ext.peritext.new(''));
const viewRange = FromPm.convert(mySchema.nodeFromJSON(json));
const txt = model.s.toExt().txt;
txt.editor.merge(viewRange);
txt.refresh();
const peritextRef = () => model.s.toExt();

// 3. Create the facade and bind it to the model.
const facade = new ProseMirrorFacade(view, peritextRef);
const unbind = PeritextBinding.bind(peritextRef, facade);

// 4. When done, clean up.
unbind();
facade.dispose();
view.destroy();
```


## Options

`ProseMirrorFacade` accepts an optional third argument — a `ProseMirrorFacadeOpts` object:

```ts
const facade = new ProseMirrorFacade(view, peritextRef, {
  history: true,        // default: auto-detect
  presence: manager,    // default: disabled
});
```

### `history`

Controls whether the `prosemirror-history` undo/redo plugin is installed.

| Value        | Behavior                                                     |
| ------------ | ------------------------------------------------------------ |
| `undefined`  | **(default)** Install history only when the editor state does not already contain a history plugin. |
| `true`       | Always install the history plugin.                           |
| `false`      | Never install the history plugin — useful when you handle undo/redo externally. |

### `presence`

Enables the collaborative presence plugin that renders remote cursors and
selection highlights.

| Value                  | Behavior                                                   |
| ---------------------- | ---------------------------------------------------------- |
| `undefined` / `false`  | **(default)** Presence plugin is not installed.            |
| `PresenceManager`      | Install with default presence settings.                    |
| `PresencePluginOpts`   | Install with full control over rendering and timing. See below. |

#### `PresencePluginOpts`

```ts
interface PresencePluginOpts {
  manager: PresenceManager;
  renderCursor?: CursorRenderer;
  renderSelection?: SelectionRenderer;
  userFromMeta?: (meta: Meta) => PresenceUser | undefined;
  fadeAfterMs?: number;   // default: 3000
  dimAfterMs?: number;    // default: 30000
  hideAfterMs?: number;   // default: 60000
  gcIntervalMs?: number;  // default: 5000
}
```


## Architecture

### Sync flow

1. **Local edit to CRDT**: ProseMirror transactions are intercepted by the sync
   plugin. Simple single-step edits are extracted as `PeritextOperation` tuples;
   complex edits trigger a full document merge via full document diff.
2. **CRDT to ProseMirror**: When the CRDT model changes (e.g. a remote patch
   arrives), `PeritextBinding` calls `facade.set()`. The `ToPmNode` converter
   builds a new ProseMirror document from the Peritext `Fragment`, reusing
   cached block nodes. `applyPatch` then diffs the old and new documents and
   emits minimal transaction steps.
