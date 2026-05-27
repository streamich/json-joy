Node hooks subscribe to a specific JSON CRDT node---an object, an array, a
string, or any other `NodeApi`---rather than to the whole `Model`. They are
the workhorse of `collaborative-react`: most components in a real application
bind to a sub-tree of the document, not to the root.

Every node hook accepts an optional `node` argument. When omitted, the node is
resolved from the [context][context-page] via `useCtxNodeStrict()`.

[context-page]: /libs/collaborative-react/context


## Change event types

The CRDT layer distinguishes three scopes of change for any node:

| Event | Triggered when |
|---|---|
| `'self'` | The node itself is replaced (e.g. an `obj` register overwritten by `.set(...)`) |
| `'child'` | A descendant child of the node is updated |
| `'subtree'` | The node or any descendant changes (the default) |

Picking `'self'` is the most efficient, `'subtree'` is the most expensive;
but they all are efficient enough for most use cases.


## `useNodeView(node?, event?)`

Subscribes to a node and returns its current view. The default event is
`'subtree'`, so the view stays accurate for any change anywhere in the node's subtree.

```ts
const useNodeView: <N extends CrdtNodeApi>(
  node?: N,
  event?: 'self' | 'child' | 'subtree',
) => ReturnType<N['view']>;
```

```ts
import {useNodeView} from '@jsonjoy.com/collaborative-react';

const UserCard: React.FC<{user: NodeApi}> = ({user}) => {
  const view = useNodeView(user);
  return (
    <div>
      <h3>{view.name}</h3>
      <p>{view.bio}</p>
    </div>
  );
};
```

The view object identity is preserved when a write produces the same JSON, so
unchanged sub-trees do not cause re-renders.


## `useNode(node?, event?)`

Same subscription behavior as `useNodeView()`, but returns the node itself
instead of its view. Useful when the component needs to *call* mutation
methods on the node (e.g. `.ins()`, `.set()`, `.del()`) as well as read it.

```ts
const useNode: <N extends CrdtNodeApi>(
  node?: N,
  event?: 'self' | 'child' | 'subtree',
) => N;
```

```ts
import {useNode} from '@jsonjoy.com/collaborative-react';

const Tags: React.FC<{tags: ArrApi<StrApi>}> = ({tags}) => {
  const arr = useNode(tags);
  return (
    <ul>
      {arr.view().map((t, i) => <li key={i}>{t}</li>)}
      <button onClick={() => arr.ins(arr.view().length, ['new'])}>Add</button>
    </ul>
  );
};
```


## `useNodeChange(event, node?)`

Re-renders on a change event and returns the latest `ChangeEvent` object (or
`undefined` before the first change).

```ts
const useNodeChange: <N extends CrdtNodeApi>(
  event: 'self' | 'child' | 'subtree',
  node?: N,
) => ChangeEvent | undefined;
```

This is a lower-level building block---most code should reach for
`useNodeView()` or `useNode()` first. Use `useNodeChange()` when you want to
react to the *event* itself (its shape, its origin), not just to the fact that
something changed.


## `useNodeEffect(event, listener, node?)`

Subscribes a listener to change events, with automatic unsubscription on
unmount. Does **not** trigger a re-render of the component---it's a
`useEffect`-style side effect for the CRDT layer.

```ts
const useNodeEffect: <N extends CrdtNodeApi>(
  event: 'self' | 'child' | 'subtree',
  listener: (event: ChangeEvent) => void,
  node?: N,
) => void;
```

```ts
import {useNodeEffect} from '@jsonjoy.com/collaborative-react';

const AutoSave: React.FC = () => {
  useNodeEffect('subtree', () => {
    scheduleSave();
  });
  return null;
};
```

The listener identity does *not* re-bind the subscription---only the `node`
and `event` arguments do. This is intentional: a fresh closure on every render
would tear down and rebuild the subscription each time. If you need the
listener to capture fresh values, read them from a ref instead.


## `useNodeEvents(event, listener, node?)`

The lowest-level subscription primitive. Same as `useNodeEffect()`, but
returns the unsubscribe function and leaves lifecycle management to the
caller.

```ts
const useNodeEvents: <N extends CrdtNodeApi>(
  event: 'self' | 'child' | 'subtree',
  listener: (event: ChangeEvent) => void,
  node?: N,
) => FanOutUnsubscribe;
```

Reach for `useNodeEvents()` when you need to compose the subscription into a
larger effect---for example, to combine it with another data source or to
explicitly tear it down on some condition other than unmount.


## Picking the right hook

| If you want to... | Use |
|---|---|
| Render a node's view | `useNodeView` |
| Read and mutate a node | `useNode` |
| Run a side effect on changes (no re-render) | `useNodeEffect` |
| Inspect the change event in the render body | `useNodeChange` |
| Manage the subscription lifecycle yourself | `useNodeEvents` |
| Resolve a node by path | [`usePath`, `useObj`, `useArr`, `useStr`](/libs/collaborative-react/path-hooks) |
