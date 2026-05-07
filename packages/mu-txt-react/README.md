# mu-txt-react

`mu-txt-react` is a batteries-included React editor for mu-txt documents backed by
`json-joy` Peritext models. It ships a ready-to-use editing surface with toolbar,
footer, embeds, code blocks, scroll map, and collaborative presence support.

## Installation

```bash
npm install mu-txt-react react react-dom slate slate-react
```

The package bundles its own editor chrome and depends on the `json-joy`
collaboration stack internally.

## What it includes

- Rich-text blocks for paragraphs, headings, lists, checklists, quotes, code blocks, embeds, and two-column layouts.
- Built-in toolbar, footer, outline helpers, context popups, and scroll-map chrome.
- Syntax highlighting via `code-colors`.
- Optional live presence decorations when a `PresenceManager` is provided.

## Quick start

```tsx
import * as React from 'react';
import {MuTxt, type SlateEditorDocument} from 'mu-txt-react';

const initialValue: SlateEditorDocument = [
	{
		type: 'h1',
		children: [{text: 'Write something'}],
	},
	{
		type: 'p',
		children: [{text: 'mu-txt-react can boot from plain Slate-compatible JSON.'}],
	},
];

export function App() {
	return (
		<MuTxt
			initialValue={initialValue}
			autoFocus
			placeholder="Start with a heading, a note, or a quick thought."
			maxHeight={720}
		/>
	);
}
```

If you do not pass a `model`, the component creates an internal Peritext-backed
model from `initialValue`.

## Collaborative usage

Pass a Peritext-backed `json-joy` model through `model` and an optional
`PresenceManager` through `presence`.

```tsx
import * as React from 'react';
import {ModelWithExt, ext} from 'json-joy/lib/json-crdt-extensions';
import {MuTxt} from 'mu-txt-react';

const model = ModelWithExt.create(ext.peritext.new(''));

export function CollaborativeEditor() {
	return <MuTxt model={model as any} />;
}
```

## Public API

The package exports:

- `MuTxt`: the editor component.
- `SlateEditorState`: observable editor state for custom chrome or integrations.
- `SlateEditorContextProvider` and `useSlateEditorState()`.
- `SlateEditorDocument` and related editor element/text types.

## Key props

- `initialValue`: local bootstrapping content for standalone mode.
- `model`: external Peritext model for controlled collaborative usage.
- `presence`: optional presence manager for remote cursors and selections.
- `readOnly`, `autoFocus`, `borderless`.
- `contentWidth`, `minHeight`, `maxHeight`, `height`, `heightFit`.
- `state`: inject your own `SlateEditorState` instance.
