import {AvlMap} from '../AvlMap';

test('smoke test', () => {
  const tree = new AvlMap<number, number>();
  tree.set(1, 1);
  tree.set(3, 5);
  tree.set(4, 5);
  tree.set(3, 15);
  tree.set(4.1, 0);
  tree.set(44, 123);
  // console.log(tree + '');
  expect(tree.get(44)).toBe(123);
  const keys: number[] = [];
  tree.forEach((node) => keys.push(node.k));
  expect(keys).toEqual([1, 3, 4, 4.1, 44]);
});

describe('.first()/next() iteration', () => {
  test('for empty map, returns finished iterator', () => {
    const tree = new AvlMap<string, number>();
    const entry = tree.first();
    expect(entry).toEqual(undefined);
  });

  test('can iterate through map entries', () => {
    const tree = new AvlMap<string, number>();
    tree.set('a', 1);
    tree.set('b', 2);
    tree.set('c', 3);
    const list: [string, number][] = [];
    for (let entry = tree.first(); entry; entry = tree.next(entry)) {
      list.push([entry.k, entry.v]);
    }
    expect(list).toEqual([
      ['a', 1],
      ['b', 2],
      ['c', 3],
    ]);
  });
});

describe('.iterator0()', () => {
  test('for empty map, returns finished iterator', () => {
    const tree = new AvlMap<string, number>();
    const iterator = tree.iterator0();
    const entry = iterator();
    expect(entry).toEqual(undefined);
  });

  test('can iterate through map entries', () => {
    const tree = new AvlMap<string, number>();
    tree.set('a', 1);
    tree.set('b', 2);
    tree.set('c', 3);
    const list: [string, number][] = [];
    const iterator = tree.iterator0();
    for (let entry = iterator(); entry; entry = iterator()) {
      list.push([entry.k, entry.v]);
    }
    expect(list).toEqual([
      ['a', 1],
      ['b', 2],
      ['c', 3],
    ]);
  });
});

describe('.iterator()', () => {
  test('for empty map, returns finished iterator', () => {
    const tree = new AvlMap<string, number>();
    const iterator = tree.iterator();
    const entry = iterator.next();
    expect(entry).toEqual({done: true, value: undefined});
  });

  test('can iterate through map entries', () => {
    const tree = new AvlMap<string, number>();
    tree.set('a', 1);
    tree.set('b', 2);
    tree.set('c', 3);
    const iterator = tree.iterator();
    const list: [string, number][] = [];
    for (let entry = iterator.next(); !entry.done; entry = iterator.next()) {
      list.push([entry.value!.k, entry.value!.v]);
    }
    expect(list).toEqual([
      ['a', 1],
      ['b', 2],
      ['c', 3],
    ]);
  });
});

describe('for...of iteration', () => {
  test('can iterate through map entries', () => {
    const tree = new AvlMap<string, number>();
    tree.set('a', 1);
    tree.set('b', 2);
    tree.set('c', 3);
    const list: [string, number][] = [];
    for (const entry of tree.entries()) {
      list.push([entry.k, entry.v]);
    }
    expect(list).toEqual([
      ['a', 1],
      ['b', 2],
      ['c', 3],
    ]);
  });
});
