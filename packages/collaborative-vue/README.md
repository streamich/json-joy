# JSON CRDT integrations with Vue.js

Vue 3 composables, provide/inject context helpers, and render-prop components for
binding Vue UI to [`json-joy`](https://github.com/streamich/json-joy) CRDT models
and nodes. The Vue counterpart of
[`@jsonjoy.com/collaborative-react`](https://github.com/streamich/json-joy/tree/master/packages/collaborative-react)
— same surface, same names, Vue reactivity instead of React state.

## Installation

```bash
npm install json-joy @jsonjoy.com/collaborative-vue vue
```

## What this package provides

- **Context helpers** for `Model` and `NodeApi` (Vue `provide`/`inject`)
- **Reactive composables** for model ticks, model views, node views, and path access
- **Typed path composables** for object/array/string nodes
- **Render-prop components** (`UseModel`, `UseNode`) for declarative subscriptions

Reads are reactive; **writes are plain json-joy verbs** (`obj.set`, `str.ins`,
`arr.push`, …) — the binding adds no write abstraction, so you keep the full,
precise CRDT API (`set` vs `merge`, character-level text ops, etc.).

## Quick start

```vue
<script setup lang="ts">
import {Model} from 'json-joy/lib/json-crdt';
import {provideModel, useModelView, useStr} from '@jsonjoy.com/collaborative-vue';

const model = Model.create({title: 'Hello'});
provideModel(model); // share via context (optional)

const root = useModelView(model);     // ShallowRef<view> — reactive snapshot
const title = useStr(['title'], model.api); // ShallowRef<StrApi | undefined>

const appendBang = () => title.value?.ins(title.value.view().length, '!');
</script>

<template>
  <p>{{ root.title }}</p>
  <button @click="appendBang">Append !</button>
</template>
```

## Context API

A single context carries a `CrdtNodeApi`; the `Model` is derived from
`node.api.model` (so providing a model just provides its root `api`).

### Provide

- `provideModel(model)` / `provideNode(node)` — call inside `setup()`
- `<ModelProvider :model="model">…</ModelProvider>` / `<NodeProvider :node="node">…</NodeProvider>`

### Read

- `useCtxModel()` / `useCtxNode()` — optional access (`undefined` if none provided)
- `useCtxModelStrict()` / `useCtxNodeStrict()` — strict access (throws `NO_NODE`)

### Isolated context

`createNodeCtx()` returns a fresh injection key plus its own `provide*` / `useCtx*`
bindings, when you need a second independent context in the same tree.

## Composables

Every composable returns a Vue ref (read `.value`, or use directly in templates).
All accept an explicit `model`/`node`, or fall back to the context node. Node and
path composables take an `event` granularity: `'self'`, `'child'`, or `'subtree'`
(default). Subscriptions are torn down automatically on scope dispose.

### Model

- `useModelTick(model?)` → `Ref<number>` — re-renders on every model change
- `useModelView(model?)` → `Ref<view>` — re-renders only when the view identity changes
- `useModel(selector, model?)` → `ComputedRef<R>` — derive a value, recomputed per tick
- `useModelTry(selector, model?)` → `ComputedRef<R | undefined>` — safe variant

### Node

- `useNodeEvents(event, listener, node?)` → unsubscribe fn (manual lifecycle)
- `useNodeEffect(event, listener, node?)` → `void` — auto-unsubscribes on dispose
- `useNodeChange(event, node?)` → `Ref<ChangeEvent | undefined>`
- `useNode(node?, event?)` → `Ref<node>` — re-triggers on every matching change
- `useNodeView(node?, event?)` → `Ref<view>`

### Path

- `usePath(path, node?, event?)` → `Ref<CrdtNodeApi | undefined>`
- `usePathView(path, node?, event?)` → `Ref<unknown>`
- `useObj(path?, node?, event?)` → `Ref<ObjApi | undefined>`
- `useArr(path?, node?, event?)` → `Ref<ArrApi | undefined>`
- `useStr(path?, node?, event?)` → `Ref<StrApi | undefined>`

## Components

### `UseModel`

Re-renders its default slot on model change; the slot receives the model.

```vue
<UseModel :model="model" v-slot="{ model }">
  <pre>{{ JSON.stringify(model.api.view(), null, 2) }}</pre>
</UseModel>
```

### `UseNode`

Re-renders its default slot on the given node event; the slot receives the node.

```vue
<UseNode :node="model.s.$" event="subtree" v-slot="{ node }">
  <pre>{{ JSON.stringify(node.view(), null, 2) }}</pre>
</UseNode>
```

## Notes

- Reactivity granularity follows json-joy's node events. `'subtree'` re-renders on
  any descendant change; narrow it to `'self'`/`'child'` to re-render less.
- `useModelView` only re-renders when the view *identity* changes (json-joy
  preserves the view object across structurally-identical updates); node
  composables re-render on every matching change event.
- Model-level subscriptions (`useModelTick`/`useModelView`) buffer on a microtask;
  node-level subscriptions fire synchronously.
- Transport is your choice: publish local ops via `model.api.onLocalChange` /
  `model.api.flush()` and feed remote patches to `model.applyPatch(...)`.

## License

Apache-2.0
