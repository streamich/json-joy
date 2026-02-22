# @jsonjoy.com/collaborative-slate

Integrates [json-joy](https://github.com/streamich/json-joy) JSON CRDT (Peritext) with
[Slate.js](https://github.com/ianstormtaylor/slate) and [Plate.js](https://github.com/udecode/plate),
enabling real-time collaborative rich-text editing.


## Installation

```bash
npm install @jsonjoy.com/collaborative-slate @jsonjoy.com/collaborative-peritext slate slate-react
```

For presence (remote cursors), also install:

```bash
npm install @jsonjoy.com/collaborative-presence
```


## Basic setup

The `bind` function is the fastest way to connect a Slate editor to a json-joy Peritext node.

```tsx
import React, {useEffect, useMemo} from 'react';
import {createEditor} from 'slate';
import {Slate, Editable, withReact} from 'slate-react';
import {bind} from '@jsonjoy.com/collaborative-slate';

function Editor({peritextRef, initialValue}) {
  const editor = useMemo(() => withReact(createEditor()), []);

  useEffect(() => {
    // bind() returns an unbind cleanup function
    const unbind = bind(peritextRef, editor);
    return unbind;
  }, [editor, peritextRef]);

  return (
    <Slate editor={editor} initialValue={initialValue}>
      <Editable />
    </Slate>
  );
}
```

`peritextRef` is a zero-argument function that returns the current `PeritextApi` from your model:

```ts
const peritextRef = () => model.s.toExt();
```

### Binding lifecycle

When `bind` is called it:

1. Performs an initial sync — reads the current CRDT state and writes it into the Slate editor.
2. Subscribes to model changes — any remote patch applied to the JSON CRDT automatically
   propagates into the Slate editor.
3. Intercepts `editor.onChange` — every local Slate operation is forwarded to the CRDT.

When the returned `unbind` function is called (on component unmount) it:

1. Unsubscribes all listeners from the CRDT.
2. Restores the editor's original `onChange` hook.

Remote changes are applied outside the Slate operation pipeline so they do not appear on the undo
stack when the history plugin is active.


## Setup with history (undo/redo)

The binding is compatible with the `slate-history` `withHistory` plugin. By default `SlateFacade`
detects whether `withHistory` is already installed on the editor and installs it automatically if
not. Remote changes are always applied using `HistoryEditor.withoutSaving()`, so undo and redo
only affect local edits.

```tsx
import {useMemo, useEffect} from 'react';
import {createEditor} from 'slate';
import {withReact} from 'slate-react';
import {withHistory} from 'slate-history';
import {bind} from '@jsonjoy.com/collaborative-slate';

function Editor({peritextRef, initialValue}) {
  // withHistory can be applied before withReact so that SlateFacade can
  // detect its presence. Alternatively, omit withHistory entirely and let
  // SlateFacade install it (default behaviour).
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  useEffect(() => {
    const unbind = bind(peritextRef, editor);
    return unbind;
  }, [editor, peritextRef]);

  // ...
}
```

To explicitly control whether history is installed, use `SlateFacade` directly:

```ts
import {SlateFacade} from '@jsonjoy.com/collaborative-slate';
import {PeritextBinding} from '@jsonjoy.com/collaborative-peritext';

// history: false — never install withHistory (e.g. you manage it yourself)
// history: true  — always install withHistory even if already present
const facade = new SlateFacade(editor, peritextRef, {history: false});
const unbind = PeritextBinding.bind(peritextRef, facade);
```


## Presence (remote cursors)

Presence requires a `PresenceManager` instance shared across all peers (e.g. distributed via
your transport layer). Use the `useSlatePresence` hook to receive remote cursors and produce
Slate decorations, and `withPresenceLeaf` (or `PresenceLeaf`) to render them.

```tsx
import React, {useMemo, useEffect, useCallback} from 'react';
import {createEditor} from 'slate';
import {Slate, Editable, withReact} from 'slate-react';
import {bind, useSlatePresence, withPresenceLeaf} from '@jsonjoy.com/collaborative-slate';

function Editor({peritextRef, presenceManager, initialValue}) {
  const editor = useMemo(() => withReact(createEditor()), []);

  // Set up CRDT binding
  useEffect(() => {
    const unbind = bind(peritextRef, editor);
    return unbind;
  }, [editor, peritextRef]);

  // Set up presence
  const {decorate, sendLocalPresence} = useSlatePresence({
    manager: presenceManager,
    peritext: peritextRef,
    editor,
  });

  // Wrap your leaf renderer so remote carets and highlights are drawn
  const renderLeaf = useCallback(
    withPresenceLeaf((props) => <span {...props.attributes}>{props.children}</span>),
    [],
  );

  return (
    <Slate
      editor={editor}
      initialValue={initialValue}
      onChange={() => sendLocalPresence()}
    >
      <Editable decorate={decorate} renderLeaf={renderLeaf} />
    </Slate>
  );
}
```

### Selection and presence behavior

- `decorate` returns Slate range decorations for every remote peer's selection. Each
  decoration carries either a `presenceHighlight` (background color string) or a
  `presenceCaret` (position and display metadata) property.
- `sendLocalPresence` converts the current Slate selection to a stable range in CRDT coordinates and
  publishes it through the `PresenceManager`. Call it inside `onChange` so peers receive
  updates on every selection change.
- Peers whose last update is older than `hideAfterMs` (default 60 s) are hidden. Carets
  dim after `dimAfterMs` (default 30 s) and name labels fade after `fadeAfterMs`
  (default 3 s).
- A garbage-collection timer removes stale peers every `gcIntervalMs` (default 5 s). Pass
  `gcIntervalMs: 0` to disable it and call `manager.removeOutdated()` manually.


## Customizing user name, color, and cursor rendering

### User name and color

Pass a `userFromMeta` function to `useSlatePresence`. It receives the `meta` field of each
peer's presence payload and should return a `PresenceUser` object:

```ts
const {decorate, sendLocalPresence} = useSlatePresence({
  manager: presenceManager,
  peritext: peritextRef,
  editor,
  userFromMeta: (meta) => ({
    name: meta.displayName,   // shown in the label above the caret
    color: meta.color,        // CSS color string, e.g. '#e040fb'
  }),
});
```

When `userFromMeta` is omitted, a deterministic color is generated from the peer's process ID
and the name label shows the first four characters of that ID.

### Custom cursor rendering

For full control over caret appearance, replace `withPresenceLeaf` with a custom `renderLeaf`
that reads the `presenceCaret` and `presenceHighlight` properties directly:

```tsx
import type {RenderLeafProps} from 'slate-react';
import type {PresenceDecoration} from '@jsonjoy.com/collaborative-slate';

type LeafProps = RenderLeafProps & {leaf: RenderLeafProps['leaf'] & PresenceDecoration};

const MyLeaf = ({attributes, children, leaf}: LeafProps) => {
  const {presenceCaret, presenceHighlight} = leaf;
  return (
    <span
      {...attributes}
      style={presenceHighlight ? {backgroundColor: presenceHighlight} : undefined}
    >
      {presenceCaret && (
        <span
          style={{
            position: 'relative',
            display: 'inline',
            borderLeft: `2px solid ${presenceCaret.color}`,
          }}
        >
          <span
            style={{
              position: 'absolute',
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              background: presenceCaret.color,
              color: '#fff',
              fontSize: 11,
              padding: '1px 4px',
              borderRadius: 3,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}
          >
            {presenceCaret.name}
          </span>
        </span>
      )}
      {children}
    </span>
  );
};
```

`presenceCaret` is of type `PresenceCaretInfo`:

| Property | Type | Description |
|---|---|---|
| `peerId` | `string` | Unique identifier for the remote peer |
| `color` | `string` | CSS color assigned to this peer |
| `name` | `string` | Display name (or first 4 chars of peerId) |
| `receivedAt` | `number` | Timestamp of the most recent update (`Date.now()`) |
| `fadeAfterMs` | `number` | Label fade delay in ms |
| `dimAfterMs` | `number` | Caret dim delay in ms |
| `hideAfterMs` | `number` | Caret hide delay in ms |


## API reference

### `bind(peritextRef, editor)`

Convenience function. Creates a `SlateFacade`, binds it to the CRDT, and returns an `unbind`
cleanup function.

```ts
const unbind = bind(peritextRef, editor);
```

### `SlateFacade`

Lower-level class that implements `RichtextEditorFacade` from
`@jsonjoy.com/collaborative-peritext`. Use it when you need direct control over binding options
or want to integrate with `PeritextBinding` manually.

```ts
new SlateFacade(editor, peritextRef, opts?)
```

`opts` (`SlateFacadeOpts`):

| Option | Type | Default | Description |
|---|---|---|---|
| `history` | `boolean \| undefined` | `undefined` | `true` forces `withHistory`; `false` skips it; `undefined` auto-detects |

After constructing the facade, bind it:

```ts
import {PeritextBinding} from '@jsonjoy.com/collaborative-peritext';

const facade = new SlateFacade(editor, peritextRef);
const unbind = PeritextBinding.bind(peritextRef, facade);
```

### `useSlatePresence(opts)`

React hook that subscribes to `PresenceManager` updates and produces Slate decorations.

Returns `{decorate, sendLocalPresence}`.

| Option | Type | Default | Description |
|---|---|---|---|
| `manager` | `PresenceManager` | — | Shared presence store |
| `peritext` | `PeritextRef` | — | CRDT accessor |
| `editor` | `Editor` | — | Slate editor instance |
| `userFromMeta` | `(meta) => PresenceUser` | `undefined` | Extract name/color from meta |
| `fadeAfterMs` | `number` | `3000` | Label fade delay |
| `dimAfterMs` | `number` | `30000` | Caret dim delay |
| `hideAfterMs` | `number` | `60000` | Caret hide delay |
| `gcIntervalMs` | `number` | `5000` | GC interval; `0` to disable |

### `withPresenceLeaf(AppLeaf)`

Higher-order function that wraps an existing `renderLeaf` component to add remote caret and
selection-highlight rendering. The wrapped component is only affected when presence decorations
are present on a leaf; otherwise it delegates to the original component unchanged.

### `PresenceLeaf`

A standalone `renderLeaf` component that renders presence visuals (carets and highlights)
without wrapping another component. Use it when your `renderLeaf` is trivial or when you want
to compose manually.
