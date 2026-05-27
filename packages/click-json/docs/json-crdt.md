## `<ClickableJsonCrdt>`

`<ClickableJsonCrdt>` renders a live [JSON CRDT](/libs/json-joy-js/json-crdt)
document. Unlike `<ClickableJson>`, which works against a plain JavaScript
value and emits JSON Patch operations, this component reads from and
writes **directly to** the `Model`. All edits go through the model's typed API
(`model.api.*`), so the resulting CRDT patches are produced by `json-joy`
itself and immediately applied locally.

Beyond rendering, the component is a small inspector for the CRDT layer:

- Each node displays its logical ID (`sid.seq`) next to the value.
- The type switcher lets the user convert between every CRDT node kind:
  `con`, `val`, `obj`, `vec`, `arr`, `str`, `bin`.
- Known extensions (`mval`, `peritext`, `quill`) are detected automatically
  and rendered with a dedicated view, with a one-click toggle back to the raw
  `vec` representation.
- `model.api.onReset` is subscribed, so swapping the model contents
  (e.g. after sync or rebase) re-renders the tree.


## Quick start

```ts
import * as React from 'react';
import {Model} from 'json-joy/lib/json-crdt';
import {ClickableJsonCrdt} from '@jsonjoy.com/click-json';

const model = Model.create({title: 'Hello', tags: ['crdt']});

export const Editor: React.FC = () => {
  React.useSyncExternalStore(model.api.subscribe, () => model.tick);
  return <ClickableJsonCrdt model={model} />;
};
```

The `useSyncExternalStore` line re-renders the component whenever the model
advances. The inspector itself also subscribes (for `onReset`), but external
subscriptions are how you keep the surrounding React tree in sync.


## Props

| Prop | Description |
|---|---|
| `model: Model<any>` | The `json-joy` JSON CRDT model to render and edit. Required. |
| `showRoot: boolean` | When `true`, render the root `val` wrapper. When `false`, render only its inner node. Turn on to inspect the implicit root container. Defaults to `false`. |
| `onFocus: (id: string \| null) => void` | Called with the logical ID of the currently focused CRDT node, or `null` when focus clears. |
| `readonly: boolean` | Disables in-place editing while still showing the tree and the node IDs. Defaults to `false`. |
| `compact: boolean` | Reduces spacing between elements for dense layouts. Defaults to `false`. |

The model itself is the source of truth: any changes a peer makes (after a
remote patch is applied) are picked up the next time the surrounding
component re-renders.


## Using it with a schema

Build a model with a schema to opt into typed nodes (`str`, `vec`, `bin`,
typed `val`, etc.). Without a schema, primitive values are inferred (strings
become `str`, numbers and booleans become `con`, objects become `obj`, and
arrays become `arr`).

```ts
import {Model} from 'json-joy/lib/json-crdt';
import {s} from 'json-joy/lib/json-crdt-patch';

const schema = s.obj({
  title: s.str('Hello'),
  tags: s.arr([s.str('crdt'), s.str('json')]),
  thumb: s.bin(new Uint8Array([1, 2, 3])),
  count: s.con(0),
});

const model = Model.create(schema);
```

The inspector exposes the schema choices: the type switcher next to each
value lets the user convert, for example, a `con` integer to a `val<con>` so
it can later be replaced atomically.


## Working with extensions

`ModelWithExt` provides the extension registry. When an extension node is
present, `<ClickableJsonCrdt>` renders its specialized view (for example, the
`peritext` node renders the rich-text payload). The toolbar shows a button to
toggle back to the underlying `vec` representation so the CRDT structure is
still inspectable.

```ts
import {ModelWithExt} from 'json-joy/lib/json-crdt-extensions';
import {s} from 'json-joy/lib/json-crdt-patch';

const model = ModelWithExt.create(
  s.obj({
    body: ModelWithExt.ext.peritext.new('Hello, world.'),
    choices: ModelWithExt.ext.mval.new(123),
  }),
);

<ClickableJsonCrdt model={model} />;
```

Recognized extensions out of the box:

- `mval`: multi-value register (concurrent writes shown as alternatives).
- `peritext`: collaborative rich-text node.
- `quill`: Quill-flavored rich-text node.


## Use cases

### Live debugger for a CRDT document

Drop the component anywhere in a development build to see the CRDT structure
of any model, including logical IDs and extension nodes:

```ts
<ClickableJsonCrdt model={model} showRoot readonly />
```

### In-place editor

Without `readonly`, edits go straight to the model and produce CRDT patches
that can be observed via `model.api.onPatch` and shipped to peers:

```ts
React.useEffect(() => {
  return model.api.onPatch.listen((patch) => transport.send(patch));
}, [model]);

<ClickableJsonCrdt model={model} />;
```

### Side-by-side with a transport

Pair the inspector with a re-rendering subscription and a network layer to
get a tiny collaborative playground:

```ts
const Demo: React.FC<{model: Model}> = ({model}) => {
  React.useSyncExternalStore(model.api.subscribe, () => model.tick);
  return (
    <>
      <ClickableJsonCrdt model={model} showRoot onFocus={console.log} />
      <pre style={{fontSize: 10}}>{String(model.root)}</pre>
    </>
  );
};
```

### Reacting to model resets

The component listens to `model.api.onReset` and rebuilds its internal node
references when the model contents are replaced (e.g. after `model.reset(...)`
or a server snapshot). No extra wiring is required on the caller side.


## What you cannot do here

- Emit RFC 6902 JSON Patches. Use [`<ClickableJson>`](/libs/click-json/json) for that.
- Show patches from remote peers as a stream. Subscribe to `model.api.onPatch`
  and render them yourself; the inspector only mirrors the current state of
  the model.


## Related

- [JSON CRDT](/libs/json-joy-js/json-crdt) for the core CRDT model, patch types, and extension registry used by `ModelWithExt`.
- [`<ClickableJson>`](/libs/click-json/json) for the POJO variant of this component.
