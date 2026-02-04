import {Patch} from '../../../../json-crdt-patch';
import {Model} from '../../Model';

describe('FanOut event API', () => {
  test('dispatches "change" events on document change', async () => {
    const doc = Model.create();
    const api = doc.api;
    let cnt = 0;
    api.set({a: {}});
    expect(cnt).toBe(0);
    api.onChanges.listen(() => {
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
    const doc = Model.create();
    const api = doc.api;
    let cnt = 0;
    api.set({a: {}});
    expect(cnt).toBe(0);
    api.onChanges.listen(() => {
      cnt++;
    });
    api.obj([]).set({gg: true});
    api.obj([]).set({gg: false});
    await Promise.resolve();
    expect(cnt).toBe(1);
  });

  test('can have multiple subscribers', async () => {
    const doc = Model.create();
    const api = doc.api;
    let cnt = 0;
    api.set({a: {}});
    expect(cnt).toBe(0);
    api.onChanges.listen(() => {
      cnt++;
    });
    api.onChanges.listen(() => {
      cnt++;
    });
    expect(cnt).toBe(0);
    api.obj([]).set({gg: true});
    api.obj([]).set({gg: false});
    await Promise.resolve();
    expect(cnt).toBe(2);
  });

  it('fires "change" event when a value is set to the same value', async () => {
    const model = Model.create();
    let cnt = 0;
    model.api.onChanges.listen(() => {
      cnt++;
    });
    await Promise.resolve();
    expect(cnt).toBe(0);
    model.api.set({foo: 123});
    await Promise.resolve();
    expect(cnt).toBe(1);
    model.api.obj([]).set({foo: 123});
    await Promise.resolve();
    expect(cnt).toBe(2);
  });

  it('fires change event when a value is deleted', async () => {
    const model = Model.create();
    let cnt = 0;
    model.api.onChanges.listen(() => {
      cnt++;
    });
    await Promise.resolve();
    expect(cnt).toBe(0);
    model.api.set({foo: 123});
    await Promise.resolve();
    expect(cnt).toBe(1);
    model.api.obj([]).set({foo: undefined});
    await Promise.resolve();
    expect(cnt).toBe(2);
    expect(model.view()).toStrictEqual({});
  });

  test('reports local change type when a value is set locally', async () => {
    const model = Model.create();
    let cnt = 0;
    let bufferPoint: number | undefined;
    model.api.onLocalChange.listen((pointer) => {
      cnt++;
      bufferPoint = pointer;
    });
    await Promise.resolve();
    expect(cnt).toBe(0);
    model.api.set(123);
    await Promise.resolve();
    expect(cnt).toBe(1);
    expect(typeof bufferPoint).toBe('number');
  });

  test('reports remote change type when a value is set remotely', async () => {
    const model = Model.create();
    let cnt = 0;
    let patchFromEvent: Patch | undefined;
    model.api.onPatch.listen((p) => {
      cnt++;
      patchFromEvent = p;
    });
    await Promise.resolve();
    expect(cnt).toBe(0);
    const builder = model.api.builder;
    builder.root(builder.json(123));
    const patch = builder.flush();
    model.applyPatch(patch);
    await Promise.resolve();
    expect(cnt).toBe(1);
    expect(patchFromEvent).toBeInstanceOf(Patch);
  });

  test('reports remote and local changes when both types are present', async () => {
    const model = Model.create();
    let cnt = 0;
    let set: any[] | undefined;
    model.api.onChanges.listen((changes) => {
      cnt++;
      set = changes.map((e) => e.raw);
    });
    await Promise.resolve();
    expect(cnt).toBe(0);
    const builder = model.api.builder;
    builder.root(builder.json(123));
    const patch = builder.flush();
    model.applyPatch(patch);
    model.api.set(321);
    await Promise.resolve();
    expect(cnt).toBe(1);
    expect((set as any[]).length).toBe(2);
    expect((set as any[])[0]).toBeInstanceOf(Patch);
    expect(typeof (set as any[])[1]).toBe('number');
  });

  test('reports reset change when model is reset', async () => {
    const model = Model.create();
    let cnt = 0;
    model.api.onReset.listen(() => {
      cnt++;
    });
    const model2 = Model.create();
    model2.api.set(123);
    await Promise.resolve();
    expect(cnt).toBe(0);
    model.reset(model2);
    await Promise.resolve();
    expect(cnt).toBe(1);
  });

  test('on reset builder is flushed', async () => {
    const model = Model.create();
    const model2 = Model.create();
    model2.api.set(123);
    model.api.set('asdf');
    expect(model.api.builder.patch.ops.length > 0).toBe(true);
    model.reset(model2);
    await Promise.resolve();
    expect(model.api.builder.patch.ops.length > 0).toBe(false);
  });

  test('on reset other events are not emitted', async () => {
    const model = Model.create();
    const model2 = Model.create();
    model2.api.set(123);
    model.api.set('asdf');
    let cntReset = 0;
    let cntPatch = 0;
    let cntLocal = 0;
    model.api.onReset.listen(() => {
      cntReset++;
    });
    model.api.onPatch.listen(() => {
      cntPatch++;
    });
    model.api.onLocalChange.listen(() => {
      cntLocal++;
    });
    model.reset(model2);
    await Promise.resolve();
    expect(cntReset).toBe(1);
    expect(cntPatch).toBe(0);
    expect(cntLocal).toBe(0);
  });
});

describe('fanout', () => {
  describe('changes', () => {
    test('emits events on document change', async () => {
      const doc = Model.create();
      const api = doc.api;
      let cnt = 0;
      api.set({a: {}});
      expect(cnt).toBe(0);
      api.onChanges.listen(() => {
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
      const doc = Model.create();
      const api = doc.api;
      let cnt = 0;
      api.set({a: {}});
      expect(cnt).toBe(0);
      api.onChanges.listen(() => {
        cnt++;
      });
      api.onChanges.listen(() => {
        cnt++;
      });
      expect(cnt).toBe(0);
      api.obj([]).set({gg: true});
      await Promise.resolve();
      expect(cnt).toBe(2);
    });
  });
});
