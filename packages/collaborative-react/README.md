# JSON CRDT integrations with React.js

React hooks, context helpers, and lightweight render-prop components for binding
React UI to `json-joy` CRDT models and nodes.

## Installation

```bash
npm install json-joy @jsonjoy.com/collaborative-react react
```

## What this package provides

- **Context providers** for `Model` and `NodeApi`
- **Reactive hooks** for model ticks, model views, node views, and path access
- **Typed path hooks** for object/array/string nodes
- **Render-prop components** (`UseModel`, `UseNode`) for declarative subscriptions

## Quick start

```tsx
import * as React from 'react';
import {ModelCtx, useModelView, useStr} from '@jsonjoy.com/collaborative-react';
import {Model} from 'json-joy/lib/json-crdt';

const model = Model.create({title: 'Hello'});

function TitleEditor() {
	const root = useModelView();
	const title = useStr('/title');

	return (
		<div>
			<p>{root.title}</p>
			<button onClick={() => title?.ins(title.view().length, '!')}>Append !</button>
		</div>
	);
}

export const App = () => (
	<ModelCtx model={model}>
		<TitleEditor />
	</ModelCtx>
);
```

## Context API

### Providers

- `ModelCtx`: provides a `Model` via context
- `NodeCtx`: provides a `NodeApi` via context

When using `ModelCtx`, both the model and `model.api` are available to hooks.

### Context hooks

- `useCtxModel()` / `useCtxNode()`: optional context access (can return `undefined`)
- `useCtxModelStrict()` / `useCtxNodeStrict()`: strict access (throws if missing)

### Custom isolated context

Use `createNodeCtx()` when you need a separate, isolated node/model context in the
same component tree.

## Hooks

### Model hooks

- `useModelTick(model?)`: subscribe to every model tick
- `useModelView(model?)`: subscribe to model view snapshot
- `useModel(selector, model?)`: derive reactive values from model
- `useModelTry(selector, model?)`: safe variant returning `undefined` on selector error

### Node hooks

- `useNodeEvents(event, listener, node?)`: subscribe to node events (`self`, `child`, `subtree`)
- `useNodeEffect(event, listener, node?)`: effect wrapper with auto-unsubscribe
- `useNodeChange(event, node?)`: re-render on node change, returns last `ChangeEvent`
- `useNode(node?, event?)`: subscribe and return node
- `useNodeView(node?, event?)`: subscribe and return node view

### Path hooks

- `usePath(path, node?, event?)`: read nested node by path
- `usePathView(path, node?, event?)`: read nested node view by path
- `useObj(path?, node?, event?)`: typed object node hook
- `useArr(path?, node?, event?)`: typed array node hook
- `useStr(path?, node?, event?)`: typed string node hook

## Components

### `UseModel`

Render-prop component that re-renders when model changes.

```tsx
import {UseModel} from '@jsonjoy.com/collaborative-react';

<UseModel
	model={model}
	render={(m) => <pre>{JSON.stringify(m.api.view(), null, 2)}</pre>}
/>
```

### `UseNode`

Render-prop component that re-renders on node events.

```tsx
import {UseNode} from '@jsonjoy.com/collaborative-react';

<UseNode
	node={model.s.$}
	event="subtree"
	render={(node) => <pre>{JSON.stringify(node.view(), null, 2)}</pre>}
/>
```

## Notes

- Most hooks can infer the target model/node from context when used under
	`ModelCtx` or `NodeCtx`.
- Use strict hooks only when you know a provider is present.
- `useModelView` only re-renders when the view identity changes, while
	`useModelTick` re-renders on every model change.

