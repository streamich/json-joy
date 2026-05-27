## Collaborative plain text editor binding

Binds any generic plain text editor to a JSON CRDT
[`str` node](https://jsonjoy.com/specs/json-crdt/model-document/node-types#The-str-RGA-String-Node-Type),
so multiple users can edit the same text concurrently. It powers the
`<input>`, `<textarea>`, CodeMirror, Monaco, and Ace integrations.


## Installation

```
npm install json-joy @jsonjoy.com/collaborative-str
```


## Basic usage

The minimal integration implements only `get()` and `set()`. Pass them to
`StrBinding.bind`, which sets up two-way syncing and returns an `unbind`
function. The first argument is a getter for the `str` node; the third enables
polling the editor for local edits:

```ts
import {StrBinding} from '@jsonjoy.com/collaborative-str';

const unbind = StrBinding.bind(
  () => model.api.str(['path', 'to', 'string']),
  {
    get: () => input.value,
    set: (text) => { input.value = text; },
  },
  true,
);

// When done:
unbind();
```


## Granular sync with `EditorFacade`

Implementing more of the `EditorFacade` interface lets the binding apply remote
edits in place instead of replacing the whole value, and report local edits
precisely:

- `ins(position, text)` / `del(position, length)` — apply remote changes granularly.
- `onchange` — notify the binding of local edits as `[position, remove, insert]` tuples.
- `getSelection()` / `setSelection()` — preserve the caret and selection across remote edits.
- `getLength()` — faster length lookups than `get().length`.

Construct the binding directly when you need control over its lifecycle:

```ts
import {StrBinding, type EditorFacade} from '@jsonjoy.com/collaborative-str';

const editor: EditorFacade = {
  get: () => input.value,
  set: (text) => { input.value = text; },
  // optional: ins, del, onchange, getSelection, setSelection, getLength
};

const binding = new StrBinding(() => model.api.str(['path', 'to', 'string']), editor);
binding.syncFromModel();
binding.bind(/* polling? */ true);

// When done:
binding.unbind();
```
