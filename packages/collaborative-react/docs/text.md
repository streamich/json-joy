## JSON CRDT bindings for React

`@jsonjoy.com/collaborative-react` is a thin layer that lets React components
read from---and re-render in response to---a [json-joy](https://jsonjoy.com)
[JSON CRDT](/libs/json-joy-js/json-crdt) document.

~~~jj.note
It provides three things:

- **Hooks** that subscribe to a `Model` or any `NodeApi` and trigger re-renders
  when the underlying CRDT changes.
- **Context providers** so the entire React tree can share a single document.
- **Render-prop components** for declarative subscriptions inside JSX.
~~~


The library is intentionally small. It does not own the model, the transport,
or the schema---it only mirrors CRDT changes into React's render cycle.


## Installation

```
npm install json-joy @jsonjoy.com/collaborative-react react
```

The package declares `react@^19` as a peer dependency. `json-joy` is a runtime
dependency and supplies the `Model` and `NodeApi` types the hooks subscribe to.


## Quick start

Wrap your tree in `ModelCtx`, then read from any descendant with a hook:

```ts
import {Model} from 'json-joy/lib/json-crdt';
import {ModelCtx, useStr} from '@jsonjoy.com/collaborative-react';

const model = Model.create({title: 'Hello'});

const Title = () => {
  const title = useStr('/title')!;

  return (
    <button onClick={() => title.ins(title.length(), '!')}>
      {title.view()}
    </button>
  );
};

export const App = () =>
  <ModelCtx model={model}><Title /></ModelCtx>;
```

`useStr('/title')` resolves the `str` node at the path, subscribes the
component to its changes, and returns a typed `StrApi`. Mutations on the API
flow back through the CRDT and trigger the next render---no manual
subscriptions, no selectors over an external store.


## What's in the package

| Area | Surface |
|---|---|
| Context | [`ModelCtx`, `NodeCtx`, `createNodeCtx`](/libs/collaborative-react/context), `useCtxModel`, `useCtxNode`, strict variants |
| Model hooks | [`useModelView`, `useModel`, `useModelTry`, `useModelTick`](/libs/collaborative-react/model-hooks) |
| Node hooks | [`useNode`, `useNodeView`, `useNodeChange`, `useNodeEffect`, `useNodeEvents`](/libs/collaborative-react/node-hooks) |
| Path hooks | [`usePath`, `usePathView`, `useObj`, `useArr`, `useStr`](/libs/collaborative-react/path-hooks) |
| Components | [`UseModel`, `UseNode`](/libs/collaborative-react/components) |


## How this fits with the rest of json-joy

A `Model` is a CRDT document. Its `model.api` is the root `NodeApi`, and every
sub-node (object, array, string, vector, etc.) is reachable via paths or via
the typed [`model.s` proxy][model-proxy].

`collaborative-react` does not introduce a separate state machine. It hooks
React into the same change-event stream that other bindings (DOM `<input>`,
ProseMirror, Slate, Quill, CodeMirror, Monaco) use. If your application keeps
its entire UI state in one CRDT document, every binding---React tree, rich-text
editor, canvas tool---reads from and writes to the same source of truth.

[model-proxy]: /libs/json-joy-js/json-crdt
