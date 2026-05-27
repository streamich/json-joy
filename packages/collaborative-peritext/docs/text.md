## Collaborative rich-text editor binding

Binds any generic rich-text editor to a JSON CRDT `peritext` node, enabling
real-time collaborative rich-text editing. Peritext is json-joy's rich-text
CRDT, see the [rich text](/rich-text) overview for background.


## Installation

```
npm install json-joy @jsonjoy.com/collaborative-peritext
```


## Usage

Implement a `RichtextEditorFacade` for your editor and bind it to the
document's `peritext` node. `PeritextBinding.bind` sets up two-way syncing and
returns an `unbind` function. The first argument is a getter for the
`PeritextApi` node:

```ts
import {PeritextBinding, type RichtextEditorFacade} from '@jsonjoy.com/collaborative-peritext';

const editor: RichtextEditorFacade = {
  get: () => toViewRange(myEditor),
  set: (fragment) => renderFragment(myEditor, fragment),
  // optional: onchange, getSelection, setSelection, dispose
};

const unbind = PeritextBinding.bind(() => peritextApi, editor);

// When done:
unbind();
```


## The `RichtextEditorFacade`

The binding talks to your editor through this interface. The more methods you
implement, the more granular the sync:

- `get()` — return the current editor content as a `ViewRange`.
- `set(fragment)` — render a Peritext `Fragment` into the editor.
- `onchange` — report local edits as `[position, remove, insert]`; may return a `PeritextRef` to re-anchor.
- `getSelection()` / `setSelection()` — map the editor selection to and from stable CRDT-space ranges.
- `dispose()` — clean up listeners when the binding is unbound.
