import {effectScope, watchEffect} from 'vue';
import {Model, s} from 'json-joy/lib/json-crdt';
import {useModelTick, useModelView, useNodeView, usePath, useStr} from '..';

// The model-level SyncStore (`model.api.subscribe`) buffers on a microtask, so
// flush it before asserting. Node events fire synchronously and need no flush.
const flush = () => new Promise((resolve) => setTimeout(resolve));

const newModel = () =>
  Model.create(
    s.obj({
      title: s.str('Untitled'),
      notes: s.arr<any>([]),
    }),
  ) as unknown as Model<any>;

describe('model composables', () => {
  test('useModelView mirrors the view and reacts to changes', async () => {
    const model = newModel();
    const scope = effectScope();
    let runs = 0;
    let view!: ReturnType<typeof useModelView>;
    scope.run(() => {
      view = useModelView(model);
      watchEffect(
        () => {
          void view.value;
          runs++;
        },
        {flush: 'sync'},
      );
    });
    expect((view.value as any).title).toBe('Untitled');
    expect(runs).toBe(1);

    model.api.obj([]).set({title: 'Hello'});
    await flush();
    expect((view.value as any).title).toBe('Hello');
    expect(runs).toBe(2);
    scope.stop();
  });

  test('useModelTick increments on every change', async () => {
    const model = newModel();
    const scope = effectScope();
    let tick!: ReturnType<typeof useModelTick>;
    scope.run(() => {
      tick = useModelTick(model);
    });
    const before = tick.value;
    model.api.obj([]).set({title: 'x'});
    await flush();
    expect(tick.value).toBeGreaterThan(before);
    scope.stop();
  });

  test('scope.stop() tears down subscriptions', () => {
    const model = newModel();
    const scope = effectScope();
    let runs = 0;
    scope.run(() => {
      const view = useModelView(model);
      watchEffect(
        () => {
          void view.value;
          runs++;
        },
        {flush: 'sync'},
      );
    });
    expect(runs).toBe(1);
    scope.stop();
    model.api.obj([]).set({title: 'after dispose'});
    expect(runs).toBe(1);
  });
});

describe('node & path composables', () => {
  test('useStr resolves a string node, reads, and edits it', () => {
    const model = newModel();
    const scope = effectScope();
    let runs = 0;
    let str!: ReturnType<typeof useStr>;
    scope.run(() => {
      str = useStr(['title'], model.api as any);
      watchEffect(
        () => {
          void str.value;
          runs++;
        },
        {flush: 'sync'},
      );
    });
    expect(str.value?.view()).toBe('Untitled');
    expect(runs).toBe(1);

    // Character-level in-place edit through the node verb (what the proxy can't do).
    str.value!.ins(str.value!.view().length, '!');
    expect(str.value?.view()).toBe('Untitled!');
    expect(runs).toBe(2);
    scope.stop();
  });

  test('usePath holds undefined for a missing path and resolves when it appears', () => {
    const model = newModel();
    const scope = effectScope();
    let node!: ReturnType<typeof usePath>;
    scope.run(() => {
      node = usePath(['missing'], model.api as any);
    });
    expect(node.value).toBeUndefined();

    model.api.obj([]).set({missing: s.str('here')});
    expect(node.value).toBeDefined();
    expect(node.value!.view()).toBe('here');
    scope.stop();
  });

  test('useNodeView reflects the node view and reacts', () => {
    const model = newModel();
    const scope = effectScope();
    let runs = 0;
    let view!: ReturnType<typeof useNodeView>;
    scope.run(() => {
      view = useNodeView(model.api as any);
      watchEffect(
        () => {
          void view.value;
          runs++;
        },
        {flush: 'sync'},
      );
    });
    expect((view.value as any).title).toBe('Untitled');
    expect(runs).toBe(1);

    model.api.obj([]).set({title: 'changed'});
    expect((view.value as any).title).toBe('changed');
    expect(runs).toBe(2);
    scope.stop();
  });
});
