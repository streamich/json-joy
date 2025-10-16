import {s} from '../../../../json-crdt-patch';
import {Model} from '../../Model';

test('can edit a tuple', () => {
  const doc = Model.create();
  const api = doc.api;
  api.set(api.builder.vec());
  api.vec([]).set([[1, 'a']]);
  expect(api.vec([]).view()).toEqual([undefined, 'a']);
});

test('.length()', () => {
  const doc = Model.create().setSchema(
    s.obj({
      vec: s.vec(s.con(1), s.con(2)),
    }),
  );
  expect(doc.s.vec.$.length()).toBe(2);
});

test('.push()', () => {
  const doc = Model.create().setSchema(
    s.obj({
      vec: s.vec(s.con(1), s.con(2)),
    }),
  );
  expect(doc.view().vec).toEqual([1, 2]);
  doc.s.vec.$.push(3);
  expect(doc.view().vec).toEqual([1, 2, 3]);
  doc.s.vec.$.push(4, 5, '6');
  expect(doc.view().vec).toEqual([1, 2, 3, 4, 5, '6']);
});

test('.view() is not readonly', () => {
  const doc = Model.create().setSchema(
    s.obj({
      vec: s.vec(s.con(1), s.con(2)),
    }),
  );
  const view = doc.s.vec.$.view();
  view[1] = 12;
});

describe('events', () => {
  test('can subscribe and un-subscribe to "view" events', async () => {
    const doc = Model.create();
    const api = doc.api;
    api.set(s.vec(s.con(1), s.con(2)));
    let cnt = 0;
    const onView = () => cnt++;
    const tuple = api.vec([]);
    tuple.events.onViewChanges.listen(onView);
    expect(cnt).toBe(0);
    tuple.set([[0, 1.5]]);
    await Promise.resolve();
    expect(cnt).toBe(1);
    tuple.set([[0, 2.5]]);
    await Promise.resolve();
    expect(cnt).toBe(2);
    tuple.set([[0, 2.5]]);
    await Promise.resolve();
    expect(cnt).toBe(2);
  });

  test('does not fire event when view does not change', async () => {
    const doc = Model.create();
    const api = doc.api;
    api.set(s.vec(s.con(1), s.con(2)));
    let cnt = 0;
    const onView = () => cnt++;
    const tuple = api.vec([]);
    tuple.events.onViewChanges.listen(onView);
    expect(cnt).toBe(0);
    tuple.set([[0, 1.5]]);
    await Promise.resolve();
    expect(cnt).toBe(1);
    tuple.set([[0, 2.5]]);
    await Promise.resolve();
    expect(cnt).toBe(2);
    tuple.set([[0, 2.5]]);
    await Promise.resolve();
    expect(cnt).toBe(2);
    tuple.set([[0, 2.5]]);
    await Promise.resolve();
    expect(cnt).toBe(2);
  });

  test('can un-subscribe to "view" events', async () => {
    const doc = Model.create();
    const api = doc.api;
    api.set(s.vec(s.con(1), s.con(2)));
    let cnt = 0;
    const onView = () => cnt++;
    const tuple = api.vec([]);
    const unsub = tuple.events.onViewChanges.listen(onView);
    expect(cnt).toBe(0);
    tuple.set([[0, 1.5]]);
    await Promise.resolve();
    expect(cnt).toBe(1);
    tuple.set([[0, 2.5]]);
    await Promise.resolve();
    expect(cnt).toBe(2);
    unsub();
    tuple.set([[0, 3.5]]);
    await Promise.resolve();
    expect(cnt).toBe(2);
  });

  test('can subscribe and un-subscribe to "view" events', async () => {
    const doc = Model.create();
    const api = doc.api;
    api.set(s.vec(s.con(1), s.con(2)));
    let cnt = 0;
    const onView = () => cnt++;
    const tuple = api.vec([]);
    tuple.events.onViewChanges.listen(onView);
    expect(cnt).toBe(0);
    tuple.set([[0, 1.5]]);
    tuple.set([[1, 44]]);
    await Promise.resolve();
    expect(cnt).toBe(1);
  });
});
