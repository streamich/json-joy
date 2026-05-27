## Render-prop components

`UseModel` and `UseNode` are render-prop wrappers around `useModel()` and
`useNode()`. They exist for one reason: they let you scope a CRDT subscription
to a *slice* of JSX without splitting the surrounding component into two.

When the slice grows past a few lines, extract a real component and use the
hooks directly---they are always the more idiomatic option.


## `UseModel`

```ts
interface UseModelProps<M extends Model<any>> {
  model?: M;
  render: (model: M) => React.ReactNode;
}
```

Re-renders the rendered subtree whenever the model changes. The `model` prop
is optional---when omitted, the model is taken from
[context][context-page] via `useCtxModelStrict()`.

[context-page]: /libs/collaborative-react/context

```ts
import {UseModel} from '@jsonjoy.com/collaborative-react';

const DebugPanel: React.FC = () => (
  <aside>
    <h4>Debug</h4>
    <UseModel render={(m) => <pre>{JSON.stringify(m.api.view(), null, 2)}</pre>} />
  </aside>
);
```

The render prop receives the live `Model`, so it can read any path, compute
derived values, or call mutation APIs.


## `UseNode`

```ts
interface UseNodeProps {
  node?: CrdtNodeApi;
  event?: 'self' | 'child' | 'subtree';
  render: (node: CrdtNodeApi) => React.ReactNode;
}
```

Re-renders the rendered subtree whenever the given node fires the requested
change event. Defaults to `'subtree'` (self or any descendant change). Defaults the
`node` to the [context][context-page] node when omitted.

```ts
import {UseNode} from '@jsonjoy.com/collaborative-react';

const Row: React.FC<{node: NodeApi}> = ({node}) => (
  <tr>
    <td>
      <UseNode node={node} event="child" render={(n) => (n.view() as any).name} />
    </td>
    <td>
      <UseNode
        node={node.in('count') as NodeApi}
        render={(n) => n.view() as number}
      />
    </td>
  </tr>
);
```

Two independent `UseNode` blocks let each cell subscribe with its own scope.
The outer `Row` component does not need to call any hook itself.
