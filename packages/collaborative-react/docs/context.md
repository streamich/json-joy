~~~jj.note
`collaborative-react` uses one React context to carry the *current CRDT node*
through the tree. Every hook accepts an explicit `node` (or `model`) argument,
but falls back to the value in context when called without one. This is the
mechanism that lets a whole application---a canvas tool, a rich-text editor,
and a sidebar form, for example---share a single JSON CRDT document without
threading it through props.
~~~


## The two providers

There is only one underlying React context, exposed through two convenience
providers:

- **`<ModelCtx model={...}>`** publishes a `Model`. Internally it forwards
  `model.api` (the root `NodeApi`) as the context node, and every model-aware
  hook reads it back via `node.api.model`.
- **`<NodeCtx node={...}>`** publishes any `NodeApi`---typically a sub-tree of
  a larger document.

If your json-joy `Model` represents a single document, prefer `ModelCtx` at the
top of the app or document edit area. Use `NodeCtx` to scope a sub-tree (e.g. one
row of a list, one document inside a workspace).

```ts
import {Model} from 'json-joy/lib/json-crdt';
import {ModelCtx} from '@jsonjoy.com/collaborative-react';

const model = Model.create({/* ... */});

export const App: React.FC = () => (
  <ModelCtx model={model}>
    <Toolbar />
    <Canvas />
    <RichTextEditor />
    <Sidebar />
  </ModelCtx>
);
```

Every component under `<ModelCtx>`---no matter how deep---can read from the
model without receiving it as a prop.


## Reading the context

Four accessor hooks are exported. Each comes in an optional and a strict
variant:

| Hook | Returns | If no provider |
|---|---|---|
| `useCtxModel()` | `Model \| undefined` | `undefined` |
| `useCtxModelStrict()` | `Model` | throws `NO_NODE` |
| `useCtxNode()` | `NodeApi \| undefined` | `undefined` |
| `useCtxNodeStrict()` | `NodeApi` | throws `NO_NODE` |

Use the optional variants in reusable components that may be rendered outside
a provider; use the strict variants when a provider is guaranteed (typically
inside a feature you own).

```ts
import {useCtxModelStrict} from '@jsonjoy.com/collaborative-react';

const SaveButton: React.FC = () => {
  const model = useCtxModelStrict();
  return <button onClick={() => persist(model.toBinary())}>Save</button>;
};
```


## Nesting and scoping

Contexts nest like any other React context. A child `<NodeCtx>` shadows the
parent, which lets you reuse the same generic component against different
sub-trees:

```ts
import {NodeCtx} from '@jsonjoy.com/collaborative-react';

const Row: React.FC<{node: NodeApi}> = ({node}) => (
  <NodeCtx node={node}>
    <RowFields />
  </NodeCtx>
);

const List: React.FC = () => {
  const items = useArr('/items');
  return (
    <>
      {items?.view().map((_, i) => (
        <Row key={i} node={items.in(i)!} />
      ))}
    </>
  );
};
```

Inside `<RowFields>`, calling `useCtxNode()` returns the per-row sub-node.
Hooks called without explicit arguments---`useStr('/name')`,
`useObj('/address')`---resolve their paths *relative to that sub-node*. The
outer model context is unchanged for siblings of `<Row>`.


## An isolated context

The exported `ModelCtx` / `NodeCtx` share one React context internally. When a
library or a sub-system needs its own non-conflicting context (e.g. a
presence/awareness document that should never collide with the main document),
create one with `createNodeCtx()`:

```ts
import {createNodeCtx} from '@jsonjoy.com/collaborative-react';
import type {NodeApi} from 'json-joy/lib/json-crdt';

export const {
  NodeCtx: PresenceCtx,
  ModelCtx: PresenceModelCtx,
  useCtxNode: usePresenceNode,
  useCtxNodeStrict: usePresenceNodeStrict,
  useCtxModel: usePresenceModel,
  useCtxModelStrict: usePresenceModelStrict,
} = createNodeCtx<NodeApi>();
```

The two contexts then coexist:

```ts
<ModelCtx model={appModel}>
  <PresenceModelCtx model={presenceModel}>
    {/* useCtxModel() => appModel, usePresenceModel() => presenceModel */}
    <Editor />
  </PresenceModelCtx>
</ModelCtx>
```
