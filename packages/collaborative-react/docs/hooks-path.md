Path hooks resolve a JSON Pointer style path against a parent node and
subscribe to changes underneath that parent. They are the fastest way to wire
a deep field of a CRDT document to a React component.

Every path hook accepts:

- `path` --- a JSON CRDT [`ApiPath`][api-path] (a string like `/user/email`
  or an array of segments).
- `node` --- the parent node to resolve against. Defaults to the node in
  [context][context-page].
- `event` --- the change event scope. Defaults to `'subtree'`.

If the path cannot be resolved (or, for typed variants, the resolved node is
of the wrong type), the hook returns `undefined` instead of throwing.

[api-path]: /libs/json-joy-js/json-crdt
[context-page]: /libs/collaborative-react/context


## `usePath(path, node?, event?)`

Resolves a nested node by path and subscribes to changes on the parent.

```ts
const usePath: <N extends CrdtNodeApi>(
  path: ApiPath,
  node?: N,
  event?: 'self' | 'child' | 'subtree',
) => CrdtNodeApi | undefined;
```

```ts
import {usePath} from '@jsonjoy.com/collaborative-react';

const Field: React.FC<{path: string}> = ({path}) => {
  const node = usePath(path);
  if (!node) return null;
  return <pre>{JSON.stringify(node.view())}</pre>;
};
```

Returns the underlying `NodeApi` so you can call any of its methods---typed
or not. For most cases the typed variants below are more convenient.


## `usePathView(path, node?, event?)`

Same as `usePath()` but returns the resolved node's *view* directly.

```ts
const usePathView: (path: ApiPath, node?, event?) => unknown;
```

```ts
const Email: React.FC = () => {
  const email = usePathView('/user/email') as string | undefined;
  return <span>{email ?? '(none)'}</span>;
};
```


## Typed accessors

When you know the type of node at the path, the typed accessors save a cast
and a runtime check.

### `useStr(path?, node?, event?)`

```ts
const useStr: (path?: ApiPath, node?, event?) => StrApi | undefined;
```

```ts
import {useStr} from '@jsonjoy.com/collaborative-react';

const TitleInput: React.FC = () => {
  const title = useStr('/title');
  if (!title) return null;
  return (
    <input
      value={title.view()}
      onChange={(e) => {
        title.del(0, title.view().length);
        title.ins(0, e.target.value);
      }}
    />
  );
};
```

Returns a `StrApi` you can mutate with `.ins()`, `.del()`, and friends.
Returns `undefined` if the path doesn't exist or the node is not a `str`.

~~~jj.note
For real `<input>` / `<textarea>` collaboration prefer
[`@jsonjoy.com/collaborative-input`][collab-input], which preserves caret
position under remote edits. `useStr()` is the right primitive for
custom UI on top of `str` nodes (e.g. tag editors, command palettes).

[collab-input]: /libs/collaborative-input
~~~


### `useObj(path?, node?, event?)`

```ts
const useObj: (path?: ApiPath, node?, event?) => ObjApi | undefined;
```

```ts
import {useObj} from '@jsonjoy.com/collaborative-react';

const Profile: React.FC = () => {
  const profile = useObj('/profile');
  if (!profile) return null;
  return (
    <button onClick={() => profile.set({lastSeen: Date.now()})}>
      Touch
    </button>
  );
};
```

### `useArr(path?, node?, event?)`

```ts
const useArr: (path?: ApiPath, node?, event?) => ArrApi | undefined;
```

```ts
import {useArr} from '@jsonjoy.com/collaborative-react';

const Tags: React.FC = () => {
  const tags = useArr('/tags');
  if (!tags) return null;
  const view = tags.view() as string[];
  return (
    <ul>
      {view.map((t, i) => (
        <li key={i}>
          {t}
          <button onClick={() => tags.del(i, 1)}>x</button>
        </li>
      ))}
      <button onClick={() => tags.ins(view.length, ['new'])}>Add</button>
    </ul>
  );
};
```


## Default path

The typed accessors (`useObj`, `useArr`, `useStr`) default `path` to `[]`,
which resolves to the context node itself. This is convenient when you have
already scoped the context with a `<NodeCtx>`:

```ts
<NodeCtx node={someObjNode}>
  <Editor />
</NodeCtx>

const Editor: React.FC = () => {
  const obj = useObj();   // the context node
  // ...
};
```


## What path hooks do *not* do

- They do not create the node if the path is missing. Path hooks read; they
  return `undefined` when there is nothing to read. Create the structure first
  via `model.api.set(...)` (or apply a remote patch that establishes it).
- They subscribe to the *parent* node's events, not to the resolved node's
  events. This is intentional: if the resolved node is replaced by a new node
  (a fresh `str` at the same path), the parent's `'child'` event fires and the
  hook re-resolves to the new node.
