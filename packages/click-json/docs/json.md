## `<ClickableJson>`

`<ClickableJson>` renders any plain JavaScript value as a collapsible JSON
tree. Hovering a node exposes inline controls for editing the key, changing
the value, switching the type, deleting the entry, and inserting siblings.

The component is **declarative**: it always renders the value passed via the
`doc` prop. When the user edits the tree, the change is reported as a
[JSON Patch (RFC 6902)](https://datatracker.ietf.org/doc/html/rfc6902) array
through `onChange`. The component never mutates `doc` itself, so the parent
is in full control of state.


## Quick start

```ts
import * as React from 'react';
import {ClickableJson} from '@jsonjoy.com/click-json';
import {applyPatch, type Operation} from 'json-joy/lib/json-patch';

export const Editor: React.FC = () => {
  const [doc, setDoc] = React.useState<unknown>({foo: 'bar'});
  const onChange = (patch: Operation[]) => {
    const {doc: next} = applyPatch(doc, patch, {mutate: false});
    setDoc(next);
  };
  return <ClickableJson doc={doc} onChange={onChange} />;
};
```

A few things to notice:

- The component does not own the document. You decide whether to apply,
  buffer, or reject each patch.
- `applyPatch` from `json-joy/lib/json-patch` is the matching applier, but any
  RFC 6902 implementation will work.
- Omit `onChange` (or pass `readonly`) to get a non-editable viewer.


## Props

All props are optional except `doc`.

### Data

| Prop | Description |
|---|---|
| `doc: unknown` | The value to render. Anything serializable to JSON, plus `Uint8Array` for binary blobs. |
| `onChange: (patch: Operation[]) => void` | Called with a JSON Patch array on every user edit. If omitted, the tree is non-editable. |
| `onFocus: (pointer: string \| null) => void` | Called with the JSON pointer of the currently focused node, or `null` when focus is cleared. |
| `pfx: string` | JSON pointer prefix added to every emitted pointer. Useful when embedding the tree inside a larger document. Defaults to `""`. |

### Styling and behavior

These props come from the shared style context and apply to both
`<ClickableJson>` and `<ClickableJsonCrdt>`.

| Prop | Description |
|---|---|
| `readonly: boolean` | Disables editing. Equivalent to omitting `onChange`, but also hides hover affordances. Defaults to `false`. |
| `formal: boolean` | Renders quoted keys, quoted strings, and trailing commas (i.e. valid JSON). Only honored in `readonly` mode. Good for snapshots and logs. Defaults to `false`. |
| `compact: boolean` | Reduces spacing between elements for dense layouts. Defaults to `false`. |
| `collapsed: boolean` | Objects and arrays start collapsed. The user can still expand them. Defaults to `false`. |
| `noCollapseToggles: boolean` | Hides the `+` / `-` collapse buttons. Collapse still works by clicking brackets. Defaults to `false`. |
| `keepOrder: boolean` | Preserves insertion order of object keys. By default keys are sorted alphabetically. Defaults to `false`. |
| `fontSize: string` | Font size for the entire tree. Defaults to `"13.4px"`. |


## Use cases

### Read-only viewer

A pretty, collapsible alternative to `<pre>{JSON.stringify(doc, null, 2)}</pre>`.

```ts
<ClickableJson readonly doc={response} />
```

Add `formal` to render valid JSON syntax (quoted keys, trailing commas) and
`compact` to shrink whitespace.

### Embedded editor

Bind the tree to React state and apply patches yourself. The parent always
sees the latest document.

```ts
const [doc, setDoc] = React.useState(initial);
return (
  <ClickableJson
    doc={doc}
    onChange={(patch) => setDoc(applyPatch(doc, patch, {mutate: false}).doc)}
  />
);
```

### Sub-document inside a larger pointer space

Use `pfx` when the tree represents a slice of a bigger document, so emitted
patches are valid against the outer root.

```ts
<ClickableJson
  pfx="/users/42/profile"
  doc={profile}
  onChange={(patch) => applyToRoot(patch)}
/>
```

### Inspecting binary data

`Uint8Array` values render as a byte preview instead of expanding into a
numeric array.

```ts
<ClickableJson doc={{thumb: new Uint8Array([1, 2, 3])}} />
```

### Focus tracking

`onFocus` reports the JSON pointer of the currently focused node and `null`
when focus is cleared (the user pressed `Escape` or clicked outside).

```ts
<ClickableJson doc={doc} onFocus={(p) => console.log('focused', p)} />
```


## What the JSON Patch looks like

Each user action emits one or more RFC 6902 operations:

- Editing a value: `replace`
- Renaming a key: `move`
- Deleting a property or array item: `remove`
- Inserting into an object or array: `add`
- Switching a value's type: `replace` with the new typed value

Apply them with `json-joy/lib/json-patch`:

```ts
import {applyPatch} from 'json-joy/lib/json-patch';

const next = applyPatch(doc, patch, {mutate: false}).doc;
```


## Related

- [`<ClickableJsonCrdt>`](/libs/click-json/json-crdt) for editing a live [JSON CRDT](/libs/json-joy-js/json-crdt) `Model`.
- [`json-joy/lib/json-patch`](/libs/json-joy-js/json-patch) for applying the emitted patches.
