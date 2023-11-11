import {Model} from '../../Model';

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
});
