Model hooks subscribe to a whole `Model` rather than a specific node. They are
the right choice when a component cares about the *document as a whole*---for
example, rendering a JSON preview, computing a checksum, or pulling a value
from anywhere in the tree by path.

All model hooks accept an optional `model` parameter. When omitted, the model
is resolved from the [context][context-page] via `useCtxModelStrict()`.

[context-page]: /libs/collaborative-react/context


## `useModelView()`

Subscribes to the model's view and re-renders only when the view's *identity*
changes.

```ts
const useModelView: <M extends Model<any>>(model?: M) => JsonNodeView<M['root']>;
```

```ts
import {useModelView} from '@jsonjoy.com/collaborative-react';

const JsonPreview: React.FC = () => {
  const view = useModelView();
  return <pre>{JSON.stringify(view, null, 2)}</pre>;
};
```

~~~jj.aside
If you need to re-render on every CRDT mutation regardless of whether the view
changed, use [`useModelTick()`](#usemodeltick) instead.
~~~

~~~jj.note
JSON CRDT preserves view-object identity when a write does not actually change
the resulting JSON. For example, replacing `{foo: 'bar'}` with `{foo: 'bar'}`
does not trigger a re-render. This makes `useModelView()` cheap to use even on
components that sit high in the tree.
~~~


## `useModel(selector, model?)`

Re-renders the component on every model change and returns a value derived
from the model.

```ts
const useModel: <M extends Model<any>, R>(
  selector: (model: M) => R,
  model?: M,
) => R;
```

```ts
import {useModel} from '@jsonjoy.com/collaborative-react';

const Counter: React.FC = () => {
  const count = useModel((m) => m.s.count.$.view());
  return <span>{count}</span>;
};
```

The selector runs after every change. It can read anywhere in the model and
can return anything: a primitive, a derived object, a tuple. The return value
is memoized against the model tick---identical selectors over an unchanged
model return the same reference without re-running.

The selector is expected to throw if the data it reads is not yet present. If
that's a real possibility (e.g. during a first render before a snapshot has
been applied), use [`useModelTry()`](#usemodeltry).


## `useModelTry(selector, model?)`

Same as `useModel()`, but swallows errors thrown by the selector and returns
`undefined` instead.

```ts
const useModelTry: <M extends Model<any>, R>(
  selector: (model: M) => R,
  model?: M,
) => R | undefined;
```

```ts
import {useModelTry} from '@jsonjoy.com/collaborative-react';

const OptionalField: React.FC = () => {
  const email = useModelTry((m) => m.api.str('/user/email').view());
  if (email === undefined) return <em>no email set</em>;
  return <span>{email}</span>;
};
```

Use this when the path may not exist---typically during the first render of
a document that is still being initialized over the network.


## `useModelTick(model?)`

Subscribes to the model's tick counter and re-renders on *every* change, even
ones that do not affect the view.

```ts
const useModelTick: <M extends Model<any>>(model?: M) => number;
```

```ts
import {useModelTick} from '@jsonjoy.com/collaborative-react';

const ChangeMeter: React.FC = () => {
  const tick = useModelTick();
  return <small>{tick} changes</small>;
};
```

The tick increases monotonically with every operation applied to the model.
This includes operations that produce the same JSON view as before (for
example, overwriting a register with its current value). For most UI you do *not* want
this---reach for `useModelView()` or `useModel()` first. `useModelTick()`
is mostly useful for debug overlays, change counters, and `useEffect` triggers
that need to re-run on every patch.


## Choosing between them

| If you want to... | Use |
|---|---|
| Render the whole JSON view | `useModelView()` |
| Read one value or compute something derived | `useModel(selector)` |
| Same, but the path may not exist yet | `useModelTry(selector)` |
| Re-render on every CRDT operation | `useModelTick()` |
| Subscribe to one specific node and its descendants | [`useNode*`](/libs/collaborative-react/node-hooks) |
| Resolve a path and get back a typed node API | [`usePath`, `useObj`, `useArr`, `useStr`](/libs/collaborative-react/path-hooks) |
