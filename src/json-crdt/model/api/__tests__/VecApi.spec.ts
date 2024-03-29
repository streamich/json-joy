import {s, vec} from '../../../../json-crdt-patch';
import {Model} from '../../Model';

test('can edit a tuple', () => {
  const doc = Model.withLogicalClock();
  const api = doc.api;
  api.root(api.builder.vec());
  api.vec([]).set([[1, 'a']]);
  expect(api.vec([]).view()).toEqual([undefined, 'a']);
});

test('.length()', () => {
  const doc = Model.withLogicalClock().setSchema(
    s.obj({
      vec: s.vec(s.con(1), s.con(2)),
    }),
  );
  expect(doc.find.val.vec.toApi().length()).toBe(2);
});

test('.push()', () => {
  const doc = Model.withLogicalClock().setSchema(
    s.obj({
      vec: s.vec(s.con(1), s.con(2)),
    }),
  );
  expect(doc.view().vec).toEqual([1, 2]);
  doc.find.val.vec.toApi().push(3);
  expect(doc.view().vec).toEqual([1, 2, 3]);
  doc.find.val.vec.toApi().push(4, 5, '6');
  expect(doc.view().vec).toEqual([1, 2, 3, 4, 5, '6']);
});

test('.view() is not readonly', () => {
  const doc = Model.withLogicalClock().setSchema(
    s.obj({
      vec: s.vec(s.con(1), s.con(2)),
    }),
  );
  const view = doc.find.val.vec.toApi().view();
  view[1] = 12;
});

describe('events', () => {
  test('can subscribe and un-subscribe to "view" events', async () => {
    const doc = Model.withLogicalClock();
    const api = doc.api;
    api.root(vec(1, 2));
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
    const doc = Model.withLogicalClock();
    const api = doc.api;
    api.root(vec(1, 2));
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
    const doc = Model.withLogicalClock();
    const api = doc.api;
    api.root(vec(1, 2));
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
    const doc = Model.withLogicalClock();
    const api = doc.api;
    api.root(vec(1, 2));
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
