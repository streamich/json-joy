import {type nodes, s} from '../../../../json-crdt-patch';
import {Model} from '../../Model';

test('can insert a value and delete all previous ones', () => {
  const doc = Model.create();
  doc.api.set({
    arr: [1, 2, 3],
  });
  const arr = doc.api.arr(['arr']);
  const length = arr.length();
  arr.ins(length, [42]);
  arr.del(0, length);
  arr.ins(1, [69]);
  expect(arr.view()).toEqual([42, 69]);
});

describe('.length()', () => {
  test('returns "arr" length', () => {
    const doc = Model.create();
    doc.api.set({
      arr: [1, 2, 3],
    });
    const arr = doc.api.arr(['arr']);
    expect(arr.length()).toBe(3);
  });
});

describe('.push()', () => {
  test('can append elements to the end of array', () => {
    const doc = Model.create(s.arr<nodes.con<number>>([]));
    const arr = doc.$.$!;
    expect(arr.view()).toEqual([]);
    arr.push(1);
    expect(arr.view()).toEqual([1]);
    arr.push(2, 3);
    expect(arr.view()).toEqual([1, 2, 3]);
    arr.push(4);
    expect(arr.view()).toEqual([1, 2, 3, 4]);
    arr.push(5, 6, 7);
    expect(arr.view()).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
});

describe('.upd()', () => {
  test('can update array element', () => {
    const doc = Model.create([1, 2, 3]);
    const arr = doc.$.$!;
    expect(arr.view()).toEqual([1, 2, 3]);
    arr.upd(1, 42);
    expect(arr.view()).toEqual([1, 42, 3]);
    arr.upd(2, 69);
    arr.upd(1, 24);
    expect(arr.view()).toEqual([1, 24, 69]);
  });
});

describe('events', () => {
  test('fires onViewChanges event on change', async () => {
    const doc = Model.create();
    doc.api.set({
      myArr: [1, 2, 3],
    });
    const events: any[] = [];
    doc.api.arr(['myArr']).events.onViewChanges.listen((data) => {
      events.push(data);
    });
    expect(events.length).toBe(0);
    doc.api.arr(['myArr']).del(1, 1);
    await new Promise((r) => setTimeout(r, 1));
    expect(events.length).toBe(1);
  });

  test('does not fire onViewChanges event when resulting view is the same', async () => {
    const doc = Model.create();
    doc.api.set({
      myArr: [1, 2, 3],
    });
    const events: any[] = [];
    doc.api.arr(['myArr']).events.onViewChanges.listen((data) => {
      events.push(data);
    });
    await new Promise((r) => setTimeout(r, 1));
    expect(events.length).toBe(0);
    doc.api.arr(['myArr']).del(1, 1);
    doc.api.arr(['myArr']).ins(1, [s.con(2)]);
    await new Promise((r) => setTimeout(r, 1));
    expect(events.length).toBe(0);
    doc.api.arr(['myArr']).del(1, 1);
    doc.api.arr(['myArr']).ins(1, [2]);
    await new Promise((r) => setTimeout(r, 1));
    expect(events.length).toBe(0);
  });
});
