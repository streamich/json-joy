import {s} from '../../../../json-crdt-patch';
import {Model} from '../../Model';
import type {ITimestampStruct} from '../../../../json-crdt-patch/clock';

test('can edit a simple string', () => {
  const doc = Model.create();
  const api = doc.api;
  api.set([0, '123', 2]);
  const str = api.str([1]);
  str.ins(0, '0');
  str.ins(4, '-xxxx');
  str.ins(9, '-yyyyyyyy');
  str.del(9, 1);
  expect(str.view()).toEqual('0123-xxxxyyyyyyyy');
  expect(doc.view()).toEqual([0, '0123-xxxxyyyyyyyy', 2]);
});

test('can silently return `undefined` on missing node', () => {
  const doc = Model.create({a: 'b', b: 123});
  const api = doc.api;
  api.str('/a');
  api.str('/a', true);
  expect(() => api.str('/b')).toThrow();
  api.str('/b', true);
  expect(() => api.str('/c')).toThrow();
  api.str('/c', true);
});

test('can delete across two chunks', () => {
  const doc = Model.create();
  const api = doc.api;
  api.set('');
  const str = api.str([]);
  str.ins(0, 'aaa');
  str.ins(0, 'bbb');
  str.ins(0, 'ccc');
  str.del(1, 7);
  expect(str.view()).toEqual('ca');
});

test('.length()', () => {
  const doc = Model.create().setSchema(
    s.obj({
      str: s.str('hello world'),
    }),
  );
  expect(doc.s.str.$.length()).toBe(11);
});

describe('position tracking', () => {
  test('can convert position into global coordinates and back', () => {
    const doc = Model.create().setSchema(
      s.obj({
        str: s.str('hello world'),
      }),
    );
    const str = doc.s.str.$;
    for (let i = -1; i < str.length(); i++) {
      const id = str.findId(i);
      expect(str.findPos(id)).toBe(i);
    }
  });

  test('shifts position when text is inserted in the middle', () => {
    const doc = Model.create().setSchema(
      s.obj({
        str: s.str('123456'),
      }),
    );
    const str = doc.s.str.$;
    const ids: ITimestampStruct[] = [];
    for (let i = -1; i < str.length(); i++) ids.push(str.findId(i));
    str.ins(3, 'abc');
    for (let i = 0; i <= 3; i++) expect(str.findPos(ids[i])).toBe(i - 1);
    for (let i = 4; i < ids.length; i++) expect(str.findPos(ids[i])).toBe(i + 3 - 1);
  });
});

describe('events', () => {
  test('can subscribe to "view" events', async () => {
    const doc = Model.create();
    const api = doc.api;
    api.set('');
    const str = api.str([]);
    let cnt = 0;
    const onView = () => cnt++;
    str.ins(0, 'aaa');
    expect(cnt).toEqual(0);
    const unsub = str.events.onViewChanges.listen(onView);
    str.ins(0, 'bbb');
    await Promise.resolve();
    expect(cnt).toEqual(1);
    str.ins(0, 'ccc');
    await Promise.resolve();
    expect(cnt).toEqual(2);
    unsub();
    str.del(1, 7);
    expect(cnt).toEqual(2);
  });

  test('batches consecutive updates into one "view" event dispatch', async () => {
    const doc = Model.create();
    const api = doc.api;
    api.set('');
    const str = api.str([]);
    let cnt = 0;
    const onChange = () => cnt++;
    str.ins(0, 'aaa');
    expect(cnt).toEqual(0);
    str.events.onViewChanges.listen(onChange);
    str.ins(0, 'bbb');
    str.ins(0, 'ccc');
    str.del(1, 7);
    await Promise.resolve();
    expect(cnt).toEqual(1);
  });

  describe('.changes', () => {
    test('can listen to events', async () => {
      const doc = Model.create();
      const api = doc.api;
      api.set('');
      const str = api.str([]);
      let cnt = 0;
      const onView = () => cnt++;
      str.ins(0, 'aaa');
      expect(cnt).toEqual(0);
      const unsubscribe = str.events.onViewChanges.listen(onView);
      str.ins(0, 'bbb');
      await Promise.resolve();
      expect(cnt).toEqual(1);
      str.ins(0, 'ccc');
      await Promise.resolve();
      expect(cnt).toEqual(2);
      unsubscribe();
      str.del(1, 7);
      expect(cnt).toEqual(2);
    });
  });

  describe('SyncStore', () => {
    test('can listen to events', async () => {
      const doc = Model.create();
      const api = doc.api;
      api.set('');
      const str = api.str([]);
      let cnt = 0;
      const onView = () => cnt++;
      str.ins(0, 'aaa');
      expect(cnt).toEqual(0);
      expect(str.events.getSnapshot()).toEqual('aaa');
      const unsubscribe = str.events.subscribe(onView);
      str.ins(0, 'bbb');
      await Promise.resolve();
      expect(str.events.getSnapshot()).toEqual('bbbaaa');
      expect(cnt).toEqual(1);
      str.ins(0, 'ccc');
      await Promise.resolve();
      expect(str.events.getSnapshot()).toEqual('cccbbbaaa');
      expect(cnt).toEqual(2);
      unsubscribe();
      str.del(1, 7);
      expect(cnt).toEqual(2);
    });
  });
});
