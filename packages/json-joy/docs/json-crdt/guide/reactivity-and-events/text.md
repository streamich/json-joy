`json-joy` JSON CRDT implementation provides a number of ways how to react to
document changes. Regardless which way you choose, there are a few things to
keep in mind:

- When document view is computed it is cached where possible. For example, the
  materialized view of all string `str` nodes is cached, so next time the view is
  requested it is returned immediately, if the node hasn't changed.
- Object identity is preserved where possible. For example, the view of
  container nodes, such as `obj` or `arr`, will return the same object
  if the node hasn't changed. This allows for efficient change detection
  in React and other frameworks. You can use the triple equality operator `===` to
  compare views and memoize your UI render functions.
- All changes to a JSON CRDT document always happen through the `model.applyPatch()`
  method which applies a JSON CRDT Patch to the document.


## Direct approach

All updates to the document happen through the `model.applyPatch()` method. If
you control all the code that updates the document, you can simply call your
update function and then react to the change.

```js
function updateDocument(model, patch) {
  model.applyPatch(patch);
  console.log('Document changed');
}
```

Document view is cached and it preserves object identities where possible. This
allows you to use the triple equality operator `===` to compare views and
memoize your UI render functions.


## Level 0: Raw model events

~~~jj.note
This is a low level API and is not recommended for general use. Most likely you
want to use the Level 1 or Level 2 events.
~~~

Each `Model` instance has various `.on*` function properties, which provide a
way to attach event listeners. The listeners are:

- `.onbeforepatch` --- dispatched every time on `model.applyPatch()` call before
  any changes are made to the document.
- `.onpatch` --- dispatched every time on `model.applyPatch()` call after the
  patch is applied to the document.
- `.onbeforereset` --- dispatched on `model.reset()` call before any changes are
  made to the document.
- `.onreset` --- dispatched on `model.reset()` call after the document is reset.

Below is an example how you can use the `.onpatch` event to react to changes in
the document.

```js
model.onpatch = () => {
  console.log('Document changed');
};
```

This works only if you never access `model.api` property. If you do, the
`model.on*` are replaced the ones from `model.api`. In that
case you can use DOM Level 1 or Level 2 listeners, instead.

~~~jj.note
See a [code example][demo] of using Level 0 events.

[demo]: https://github.com/streamich/json-joy/blob/master/src/json-crdt/__demos__/events-level0.ts
~~~


## Level 1: Model API events

The model API `model.api` exposes a host of event dispatchers, which
you can use to react to different document events.

- `.onChange` --- emitted when the model changes. Combines `onReset`, `onPatch`
  and `onLocalChange`.
- `.onChanges` --- emitted when the model changes. Same as `.onChange`, but this
  event is emitted once per microtask.
- `.onBeforeReset` --- emitted before the model is reset, using
  the `model.reset()` method.
- `.onReset` --- emitted after the model is reset, using
  the `model.reset()` method.
- `.onBeforePatch` --- emitted before a patch is applied
  using `model.applyPatch()`.
- `.onPatch` --- emitted after a patch is applied using `model.applyPatch()`.
- `.onBeforeLocalChange` --- emitted before local changes through `model.api`
  are applied.
- `.onLocalChange` --- emitted after local changes through `model.api` are
  applied.
- `.onLocalChanges` --- emitted after local changes through `model.api` are
  applied. Same as `.onLocalChange`, but this event buffered for a duration of a
  microtask.
- `.onBeforeTransaction` --- emitted before a transaction is started using
  the `model.api.transaction()` method.
- `.onTransaction` --- emitted after a transaction completes.
- `.onFlush` --- emitted when the model.api builder change buffer is flushed.

Below example shows how to use the `.onChange` event to react to changes in the

```ts
model.api.onChanges.listen(() => {
  console.log(`Called: "onChanges"`);
});
```

~~~jj.note
See a [code example][demo] of using Level 1 events.

[demo]: https://github.com/streamich/json-joy/blob/master/src/json-crdt/__demos__/events-level1.ts
~~~

Each event dispatchers returns a function, which unsubscribes from all
subsequent events when called.

```ts
const unsubscribe = model.api.onChanges.listen(() => {
  // ...  
});


// To unsubscribe call:
unsubscribe();
```


## Level 2: Node API events

Each node in a document has an `.events` property, which exposes event
dispatchers specific to that node. You can use it to subscribe to only changes
to a specific part of the document.

Just like in the model `.onChanges` event, multiple changes to a node within a
microtask are combined into one event.

- `node.events.onChanges` --- emitted when the node changes. The event is
  emitted at most once per microtask.
- `node.events.onViewChanges` --- emitted when the *view* of the node changes.
  The event is emitted at most once per microtask.

Below is an example how to subscribe to a deeply nested object changes only
when the view of the object changes.

```ts
model.api.obj(['my', 'deep', 'obj']).events.onViewChanges.listen(() => {
  console.log(`Called: "onViewChanges"`);
});
```

~~~jj.note
Below you can see code examples of using Level 2 events:

- Using an [object `obj` node][demo-obj]
- Using an [array `arr` node][demo-arr]

[demo-obj]: https://github.com/streamich/json-joy/blob/master/src/json-crdt/__demos__/events-level2-obj.ts
[demo-arr]: https://github.com/streamich/json-joy/blob/master/src/json-crdt/__demos__/events-level2-arr.ts
~~~


## Using with React.js

With React v18 or later you can use the `React.useSyncExternalStore()` hook to
reactively connect to the document model.

To subscribe to the whole document changes, use the `model.api.subscribe()` and
`model.api.getSnapshot()` helper methods.

```tsx
const MyComponent = () => {
  const view = React.useSyncExternalStore(
    model.api.subscribe,
    model.api.getSnapshot, [model]);
  
  return <h1>{view.title}</h1>;
};
```

Note, you can achieve good React re-rendering performance even if you subscribe
to the whole document like above. This is because `json-joy` tries to preserve
object identity and in the `view` the same deeply nested objects are returned,
if the value of those objects has not changed. You can use that property to
memoize React re-renders down the rendering tree:

```tsx
const MyComponent = () => {
  const view = React.useSyncExternalStore(
    model.api.subscribe,
    model.api.getSnapshot, [model]);
  
  return <MyTitle post={view.post} />
};

const MyTitle = React.memo(({post}) => {
  return <h1>{post.title}</h1>;
});
```

In the example above, if the `view.post` object has not changed, only the
`<MyComponent>` component will re-render, the `<MyTitle>` component will skip
re-rendering due to the `React.memo()` memoization, because the `view.post`
object will be the exact same JavaScript object instance between the re-renders.

Similarly, it is possible to connect to React a specific deeply nested JSON CRDT
node. Every document node exposes an `events` object with `.subscribe()` and
`.getSnapshot()` helper methods, which you can use to conveniently connect to
React using the `React.useSyncExternalStore` hook.

```tsx
const MyTitle = () => {
  const node = React.useMemo(
    () => model.api.str(['post', 'title']),
    [model]);
  const title = React.useSyncExternalStore(
    node.events.subscribe,
    node.events.getSnapshot,
    [node]);
  
  return <h1>{title}</h1>;
};
```


## Using with RxJS

Using RxJS you can easily construct an `Observable`, which emits the document
state. The easiest such example could look like this:

```ts
const view$ = new BehaviorSubject(model.view());
const unsubscribe = model.api.onChanges.listen(() => {
  view$.next(model.view());
});
```

A warm RxJS observable, which subscribes to JSON CRDT events only when there are
subscribers and emits only when a new value JSON CRDT value is emitted, can be
constructed like this:

```ts
const view$ = new Observable((subscriber) => {
  const unsubscribe = model.api.onChanges.listen(() => {
    subscriber.next(model.view());
  });
  return () => {
    unsubscribe();
  };
});
```