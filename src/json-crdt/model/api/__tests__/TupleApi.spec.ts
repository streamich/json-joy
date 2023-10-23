import {onlyOnNode20} from '../../../../__tests__/util';
import {tup} from '../../../../json-crdt-patch';
import {Model} from '../../Model';

test('can edit a tuple', () => {
  const doc = Model.withLogicalClock();
  const api = doc.api;
  api.root(api.builder.vec());
  api.tup([]).set([[1, 'a']]);
  expect(api.tup([]).view()).toEqual([undefined, 'a']);
});

onlyOnNode20('events', () => {
  test('can subscribe and un-subscribe to "view" events', async () => {
    const doc = Model.withLogicalClock();
    const api = doc.api;
    api.root(tup(1, 2));
    let cnt = 0;
    const onView = () => cnt++;
    const tuple = api.tup([]);
    tuple.events.on('view', onView);
    expect(cnt).toBe(0);
    tuple.set([
      [0, 1.5],
    ]);
    await Promise.resolve();
    expect(cnt).toBe(1);
    tuple.set([
      [0, 2.5],
    ]);
    await Promise.resolve();
    expect(cnt).toBe(2);
    tuple.set([
      [0, 2.5],
    ]);
    await Promise.resolve();
    expect(cnt).toBe(2);
  });

  test('does not fire event when view does not change', async () => {
    const doc = Model.withLogicalClock();
    const api = doc.api;
    api.root(tup(1, 2));
    let cnt = 0;
    const onView = () => cnt++;
    const tuple = api.tup([]);
    tuple.events.on('view', onView);
    expect(cnt).toBe(0);
    tuple.set([
      [0, 1.5],
    ]);
    await Promise.resolve();
    expect(cnt).toBe(1);
    tuple.set([
      [0, 2.5],
    ]);
    await Promise.resolve();
    expect(cnt).toBe(2);
    tuple.set([
      [0, 2.5],
    ]);
    await Promise.resolve();
    expect(cnt).toBe(2);
    tuple.set([
      [0, 2.5],
    ]);
    await Promise.resolve();
    expect(cnt).toBe(2);
  });

  test('can un-subscribe to "view" events', async () => {
    const doc = Model.withLogicalClock();
    const api = doc.api;
    api.root(tup(1, 2));
    let cnt = 0;
    const onView = () => cnt++;
    const tuple = api.tup([]);
    tuple.events.on('view', onView);
    expect(cnt).toBe(0);
    tuple.set([
      [0, 1.5],
    ]);
    await Promise.resolve();
    expect(cnt).toBe(1);
    tuple.set([
      [0, 2.5],
    ]);
    await Promise.resolve();
    expect(cnt).toBe(2);
    tuple.events.off('view', onView);
    tuple.set([
      [0, 3.5],
    ]);
    await Promise.resolve();
    expect(cnt).toBe(2);
  });

  test('can subscribe and un-subscribe to "view" events', async () => {
    const doc = Model.withLogicalClock();
    const api = doc.api;
    api.root(tup(1, 2));
    let cnt = 0;
    const onView = () => cnt++;
    const tuple = api.tup([]);
    tuple.events.on('view', onView);
    expect(cnt).toBe(0);
    tuple.set([
      [0, 1.5],
    ]);
    tuple.set([
      [1, 44],
    ]);
    await Promise.resolve();
    expect(cnt).toBe(1);
  });
});
