import {Model, ModelChangeType} from '../../Model';

describe('DOM Level 2 events, .et.addEventListener()', () => {
  test('dispatches "change" events on document change', async () => {
    const doc = Model.withLogicalClock();
    const api = doc.api;
    let cnt = 0;
    api.root({a: {}});
    expect(cnt).toBe(0);
    api.events.on('change', () => {
      cnt++;
    });
    api.obj([]).set({gg: true});
    await Promise.resolve();
    expect(cnt).toBe(1);
    api.obj(['a']).set({1: 1, 2: 2});
    await Promise.resolve();
    expect(cnt).toBe(2);
  });

  test('fires change event once for all batched updates', async () => {
    const doc = Model.withLogicalClock();
    const api = doc.api;
    let cnt = 0;
    api.root({a: {}});
    expect(cnt).toBe(0);
    api.events.on('change', () => {
      cnt++;
    });
    api.obj([]).set({gg: true});
    api.obj([]).set({gg: false});
    await Promise.resolve();
    expect(cnt).toBe(1);
  });

  test('can have multiple subscribers', async () => {
    const doc = Model.withLogicalClock();
    const api = doc.api;
    let cnt = 0;
    api.root({a: {}});
    expect(cnt).toBe(0);
    api.events.on('change', () => {
      cnt++;
    });
    api.events.on('change', () => {
      cnt++;
    });
    expect(cnt).toBe(0);
    api.obj([]).set({gg: true});
    api.obj([]).set({gg: false});
    await Promise.resolve();
    expect(cnt).toBe(2);
  });

  it('fires "change" event when a value is set to the same value', async () => {
    const model = Model.withLogicalClock();
    let cnt = 0;
    model.api.events.on('change', () => {
      cnt++;
    });
    await Promise.resolve();
    expect(cnt).toBe(0);
    model.api.root({foo: 123});
    await Promise.resolve();
    expect(cnt).toBe(1);
    model.api.obj([]).set({foo: 123});
    await Promise.resolve();
    expect(cnt).toBe(2);
  });

  it('fires "change" event when a value is deleted', async () => {
    const model = Model.withLogicalClock();
    let cnt = 0;
    model.api.events.on('change', () => {
      cnt++;
    });
    await Promise.resolve();
    expect(cnt).toBe(0);
    model.api.root({foo: 123});
    await Promise.resolve();
    expect(cnt).toBe(1);
    model.api.obj([]).set({foo: undefined});
    await Promise.resolve();
    expect(cnt).toBe(2);
    expect(model.view()).toStrictEqual({});
  });

  test('reports LOCAL change type when a value is set locally', async () => {
    const model = Model.withLogicalClock();
    let cnt = 0;
    let set: Set<ModelChangeType> | undefined;
    model.api.events.on('change', (event) => {
      cnt++;
      set = event.detail;
    });
    await Promise.resolve();
    expect(cnt).toBe(0);
    model.api.root(123);
    await Promise.resolve();
    expect(cnt).toBe(1);
    expect(set!.has(ModelChangeType.LOCAL)).toBe(true);
    expect(set!.has(ModelChangeType.REMOTE)).toBe(false);
    expect(set!.has(ModelChangeType.RESET)).toBe(false);
  });

  test('reports REMOTE change type when a value is set remotely', async () => {
    const model = Model.withLogicalClock();
    let cnt = 0;
    let set: Set<ModelChangeType> | undefined;
    model.api.events.on('change', (event) => {
      cnt++;
      set = event.detail;
    });
    await Promise.resolve();
    expect(cnt).toBe(0);
    const builder = model.api.builder;
    builder.root(builder.json(123));
    const patch = builder.flush();
    model.applyPatch(patch);
    await Promise.resolve();
    expect(cnt).toBe(1);
    expect(set!.has(ModelChangeType.LOCAL)).toBe(false);
    expect(set!.has(ModelChangeType.REMOTE)).toBe(true);
    expect(set!.has(ModelChangeType.RESET)).toBe(false);
  });

  test('reports REMOTE and LOCAL changes when both types are present', async () => {
    const model = Model.withLogicalClock();
    let cnt = 0;
    let set: Set<ModelChangeType> | undefined;
    model.api.events.on('change', (event) => {
      cnt++;
      set = event.detail;
    });
    await Promise.resolve();
    expect(cnt).toBe(0);
    const builder = model.api.builder;
    builder.root(builder.json(123));
    const patch = builder.flush();
    model.applyPatch(patch);
    model.api.root(321);
    await Promise.resolve();
    expect(cnt).toBe(1);
    expect(set!.has(ModelChangeType.LOCAL)).toBe(true);
    expect(set!.has(ModelChangeType.REMOTE)).toBe(true);
    expect(set!.has(ModelChangeType.RESET)).toBe(false);
  });

  test('reports RESET change when model is reset', async () => {
    const model = Model.withLogicalClock();
    let cnt = 0;
    let set: Set<ModelChangeType> | undefined;
    model.api.events.on('change', (event) => {
      cnt++;
      set = event.detail;
    });
    const model2 = Model.withLogicalClock();
    model2.api.root(123);
    await Promise.resolve();
    expect(cnt).toBe(0);
    model.reset(model2);
    await Promise.resolve();
    expect(cnt).toBe(1);
    expect(set!.has(ModelChangeType.LOCAL)).toBe(false);
    expect(set!.has(ModelChangeType.REMOTE)).toBe(false);
    expect(set!.has(ModelChangeType.RESET)).toBe(true);
  });

  test('on reset builder is flushed', async () => {
    const model = Model.withLogicalClock();
    const model2 = Model.withLogicalClock();
    model2.api.root(123);
    model.api.root('asdf');
    expect(model.api.builder.patch.ops.length > 0).toBe(true);
    model.reset(model2);
    await Promise.resolve();
    expect(model.api.builder.patch.ops.length > 0).toBe(false);
  });

  test('on reset other change events are removed for the type set', async () => {
    const model = Model.withLogicalClock();
    const model2 = Model.withLogicalClock();
    let cnt = 0;
    let set: Set<ModelChangeType> | undefined;
    model.api.events.on('change', (event) => {
      cnt++;
      set = event.detail;
    });
    model2.api.root(123);
    model.api.root('asdf');
    model.reset(model2);
    await Promise.resolve();
    expect(cnt).toBe(1);
    expect(set!.has(ModelChangeType.LOCAL)).toBe(false);
    expect(set!.has(ModelChangeType.REMOTE)).toBe(false);
    expect(set!.has(ModelChangeType.RESET)).toBe(true);
  });
});

describe('fanout', () => {
  describe('changes', () => {
    test('emits events on document change', async () => {
      const doc = Model.withLogicalClock();
      const api = doc.api;
      let cnt = 0;
      api.root({a: {}});
      expect(cnt).toBe(0);
      api.changes.listen(() => {
        cnt++;
      });
      api.obj([]).set({gg: true});
      await Promise.resolve();
      expect(cnt).toBe(1);
      api.obj(['a']).set({1: 1, 2: 2});
      await Promise.resolve();
      expect(cnt).toBe(2);
    });

    test('can have multiple subscribers', async () => {
      const doc = Model.withLogicalClock();
      const api = doc.api;
      let cnt = 0;
      api.root({a: {}});
      expect(cnt).toBe(0);
      api.changes.listen(() => {
        cnt++;
      });
      api.changes.listen(() => {
        cnt++;
      });
      expect(cnt).toBe(0);
      api.obj([]).set({gg: true});
      await Promise.resolve();
      expect(cnt).toBe(2);
    });
  });
});
