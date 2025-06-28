import {konst} from '../../../../json-crdt-patch';
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

test('.length()', () => {
  const doc = Model.create();
  doc.api.set({
    arr: [1, 2, 3],
  });
  const arr = doc.api.arr(['arr']);
  expect(arr.length()).toBe(3);
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
    doc.api.arr(['myArr']).ins(1, [konst(2)]);
    await new Promise((r) => setTimeout(r, 1));
    expect(events.length).toBe(0);
    doc.api.arr(['myArr']).del(1, 1);
    doc.api.arr(['myArr']).ins(1, [2]);
    await new Promise((r) => setTimeout(r, 1));
    expect(events.length).toBe(0);
  });
});
