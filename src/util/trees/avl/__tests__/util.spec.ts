/* tslint:disable: no-console */

import {find, first, last, next, size} from '../../util';
import {AvlHeadlessNode, IAvlTreeNode} from '../types';
import {insert, print, remove} from '../util';

const node = <K, V>(k: K, v: V): IAvlTreeNode<K, V> => ({k, v, bf: 0, p: undefined, l: undefined, r: undefined});
const comparator = (a: number, b: number) => a - b;

const treeHeight = (node: AvlHeadlessNode): number => {
  const {l, r} = node;
  if (!l && !r) return 1;
  const lh = l ? treeHeight(l) : 0;
  const rh = r ? treeHeight(r) : 0;
  return 1 + Math.max(lh, rh);
};

const assertAvlBalanceFactors = (root: AvlHeadlessNode): void => {
  if (!root) return;
  let curr = first(root);
  while (curr) {
    const {bf, l, r} = curr;
    const lh = l ? treeHeight(l) : 0;
    const rh = r ? treeHeight(r) : 0;
    try {
      expect(bf).toBe(lh - rh);
      expect(bf < 2 && bf > -2).toBe(true);
    } catch (error) {
      // tslint:disable-next-line: no-console
      console.log('at node:\n\n' + print(curr));
      throw error;
    }
    curr = next(curr);
  }
};

const assertHasKey = (root: IAvlTreeNode<any, any>, value: number): void => {
  const res = find(root, value, comparator);
  expect(res!.v).toBe('' + value);
};

describe('insert', () => {
  test('can insert and re-balance strict left (LL-rotation)', () => {
    const n = (val: number) => node(val, '' + val);
    let root: IAvlTreeNode<number, string> | undefined;
    const values: number[] = [];
    for (let i = 30; i >= 0; i--) values.push(i);
    for (const value of values) {
      root = insert(root, n(value), comparator);
      assertAvlBalanceFactors(root);
    }
    for (const value of values) {
      const res = find(root, value, comparator);
      expect(res!.v).toBe('' + value);
    }
    let curr = first(root!);
    const keys = [];
    while (curr) {
      keys.push(curr.k);
      curr = next(curr);
    }
    expect(keys.reverse()).toEqual(values);
  });

  test('can insert and re-balance strict right (RR-rotation)', () => {
    const n = (val: number) => node(val, '' + val);
    let root: IAvlTreeNode<number, string> | undefined;
    const values: number[] = [];
    for (let i = 0; i < 44; i++) values.push(i);
    for (const value of values) {
      root = insert(root, n(value), comparator);
      assertAvlBalanceFactors(root);
    }
    for (const value of values) {
      const res = find(root, value, comparator);
      expect(res!.v).toBe('' + value);
    }
    let curr = first(root!);
    const keys = [];
    while (curr) {
      keys.push(curr.k);
      curr = next(curr);
    }
    expect(keys).toEqual(values);
    // console.log(print(root!));
  });

  test('can insert and re-balance strict left and strict right inserts (LL- and RR-rotations)', () => {
    const n = (val: number) => node(val, '' + val);
    let root: IAvlTreeNode<number, string> | undefined;
    const values: number[] = [
      50, 51, 49, 52, 48, 53, 47, 54, 46, 55, 45, 56, 44, 57, 43, 58, 42, 59, 41, 60, 40, 61, 39, 62, 38, 63, 37, 64,
      36, 65, 35, 66, 34, 67, 33, 68, 32, 69, 31, 70, 30, 71, 29, 72, 28, 73, 27, 74, 26, 75, 25, 76, 24, 77, 23, 78,
      22, 79, 21, 80, 20, 81, 19, 82, 18,
    ];
    for (const value of values) {
      root = insert(root, n(value), comparator);
      assertAvlBalanceFactors(root);
    }
    for (const value of values) {
      const res = find(root, value, comparator);
      expect(res!.v).toBe('' + value);
    }
    let curr = first(root!);
    const keys = [];
    while (curr) {
      keys.push(curr.k);
      curr = next(curr);
    }
    expect(keys).toEqual(values.sort());
    // console.log(print(root!));
  });

  test('can insert and re-balance zig-zag LR-rotation', () => {
    let root: IAvlTreeNode<number, string> | undefined;
    const n = (val: number) => node(val, '' + val);
    const ins = (val: number) => (root = insert(root, n(val), comparator));
    ins(50);
    ins(40);
    ins(45);
    assertAvlBalanceFactors(root!);
    // console.log(print(root!));
  });

  test('can insert and re-balance zig-zag RL-rotation', () => {
    let root: IAvlTreeNode<number, string> | undefined;
    const n = (val: number) => node(val, '' + val);
    const ins = (val: number) => (root = insert(root, n(val), comparator));
    ins(50);
    ins(60);
    ins(55);
    assertAvlBalanceFactors(root!);
    // console.log(print(root!));
  });

  test('can execute LR-rotation while traversing up on imbalance', () => {
    let root: IAvlTreeNode<number, string> | undefined;
    const n = (val: number) => node(val, '' + val);
    const ins = (val: number) => (root = insert(root, n(val), comparator));
    // const values: number[] = [10, 20, 30, 50,  70, 80, 4, 8];
    const values: number[] = [10, 20, 30, 50, 70, 80, 4, 8, 9];
    for (const value of values) {
      ins(value);
      assertAvlBalanceFactors(root!);
      assertHasKey(root!, value);
    }
    for (const value of values) assertHasKey(root!, value);
    // console.log(print(root!));
  });

  test('can execute RL-rotation while traversing up on imbalance', () => {
    let root: IAvlTreeNode<number, string> | undefined;
    const n = (val: number) => node(val, '' + val);
    const ins = (val: number) => (root = insert(root, n(val), comparator));
    const values: number[] = [10, 20, 30, 50, 70, 80, 4, 8, 9].map((v) => -v);
    for (const value of values) {
      ins(value);
      assertAvlBalanceFactors(root!);
      assertHasKey(root!, value);
    }
    for (const value of values) assertHasKey(root!, value);
  });

  test('can execute many rotation cases', () => {
    let root: IAvlTreeNode<number, string> | undefined;
    const n = (val: number) => node(val, '' + val);
    const ins = (val: number) => (root = insert(root, n(val), comparator));
    const values: number[] = [
      10, 20, 30, 50, 40, 60, 70, 80, 4, 8, 77, 78, 79, 76, 71, 9, 5, 6, 7, 1, 3, 2, 43, 44, 48, 43, 42, 41, 39,
    ];
    for (const value of values) {
      ins(value);
      assertAvlBalanceFactors(root!);
      assertHasKey(root!, value);
    }
    for (const value of values) assertHasKey(root!, value);
    // console.log(print(root!));
  });

  test('can insert in random order', () => {
    let root: IAvlTreeNode<number, string> | undefined;
    const valueSet = new Set<number>();
    for (let i = 0; i < 700; i++) valueSet.add((Math.random() * 1000) | 0);
    const values: number[] = Array.from(valueSet);
    const n = (val: number) => node(val, '' + val);
    const ins = (val: number) => (root = insert(root, n(val), comparator));
    for (const value of values) {
      ins(value);
      assertHasKey(root!, value);
    }
    assertAvlBalanceFactors(root!);
    for (const value of values) assertHasKey(root!, value);
    // console.log(print(root!));
  });
});

describe('remove', () => {
  describe('leaf node', () => {
    test('single node tree', () => {
      let root: IAvlTreeNode<number, string> | undefined;
      const n = (val: number) => node(val, '' + val);
      const ins = (...vals: number[]) => vals.forEach((val) => (root = insert(root, n(val), comparator)));
      ins(50);
      assertAvlBalanceFactors(root!);
      expect(size(root)).toBe(1);
      root = remove(root, root!);
      expect(root).toBe(undefined);
    });

    test('can delete the first level leaf node (from right)', () => {
      let root: IAvlTreeNode<number, string> | undefined;
      const n = (val: number) => node(val, '' + val);
      const ins = (...vals: number[]) => vals.forEach((val) => (root = insert(root, n(val), comparator)));
      ins(50, 30, 40);
      assertAvlBalanceFactors(root!);
      // console.log(print(root!));
      const target1 = find(root!, 50, comparator) as IAvlTreeNode<number, string>;
      expect(size(root)).toBe(3);
      expect(!!target1).toBe(true);
      remove(root, target1);
      assertAvlBalanceFactors(root!);
      const target2 = find(root!, 50, comparator) as IAvlTreeNode<number, string>;
      expect(size(root)).toBe(2);
      expect(!!target2).toBe(false);
    });

    test('can delete the first level leaf node (from left)', () => {
      let root: IAvlTreeNode<number, string> | undefined;
      const n = (val: number) => node(val, '' + val);
      const ins = (...vals: number[]) => vals.forEach((val) => (root = insert(root, n(val), comparator)));
      ins(50, 30, 40);
      assertAvlBalanceFactors(root!);
      const target1 = find(root!, 30, comparator) as IAvlTreeNode<number, string>;
      expect(size(root)).toBe(3);
      expect(!!target1).toBe(true);
      remove(root, target1);
      assertAvlBalanceFactors(root!);
      const target2 = find(root!, 30, comparator) as IAvlTreeNode<number, string>;
      expect(size(root)).toBe(2);
      expect(!!target2).toBe(false);
    });

    test('can delete and adjust balance factors towards the root (from right)', () => {
      let root: IAvlTreeNode<number, string> | undefined;
      const n = (val: number) => node(val, '' + val);
      const ins = (...vals: number[]) => vals.forEach((val) => (root = insert(root, n(val), comparator)));
      ins(50, 30, 40, 20, 70, 60, 80);
      assertAvlBalanceFactors(root!);
      // console.log(print(root!));
      const target1 = find(root!, 80, comparator) as IAvlTreeNode<number, string>;
      expect(size(root)).toBe(7);
      expect(!!target1).toBe(true);
      remove(root, target1);
      assertAvlBalanceFactors(root!);
      const target2 = find(root!, 80, comparator) as IAvlTreeNode<number, string>;
      expect(size(root)).toBe(6);
      expect(!!target2).toBe(false);
      // console.log(print(root!));
    });

    test('can delete and adjust balance factors towards the root (from left)', () => {
      let root: IAvlTreeNode<number, string> | undefined;
      const n = (val: number) => node(val, '' + val);
      const ins = (...vals: number[]) => vals.forEach((val) => (root = insert(root, n(val), comparator)));
      ins(50, 30, 40, 20, 70, 60, 49);
      assertAvlBalanceFactors(root!);
      // console.log(print(root!));
      const target1 = find(root!, 49, comparator) as IAvlTreeNode<number, string>;
      expect(size(root)).toBe(7);
      expect(!!target1).toBe(true);
      remove(root, target1);
      assertAvlBalanceFactors(root!);
      const target2 = find(root!, 49, comparator) as IAvlTreeNode<number, string>;
      expect(size(root)).toBe(6);
      expect(!!target2).toBe(false);
      // console.log(print(root!));
    });

    test('removes a leaf node', () => {
      let root: IAvlTreeNode<number, string> | undefined;
      const n = (val: number) => node(val, '' + val);
      const ins = (...vals: number[]) => vals.forEach((val) => (root = insert(root, n(val), comparator)));
      ins(50, 30, 60, 20, 40, 1, 2, 3, 4, 5, 6, 7, 8, 9);
      assertAvlBalanceFactors(root!);
      // console.log(print(root!));
      const target1 = find(root!, 60, comparator) as IAvlTreeNode<number, string>;
      expect(size(root)).toBe(14);
      expect(!!target1).toBe(true);
      remove(root, target1);
      // console.log(print(root!));
      assertAvlBalanceFactors(root!);
      const target2 = find(root!, 60, comparator) as IAvlTreeNode<number, string>;
      expect(size(root)).toBe(13);
      expect(!!target2).toBe(false);
    });

    test('can delete whole tree by leaf nodes', () => {
      let root: IAvlTreeNode<number, string> | undefined;
      const n = (val: number) => node(val, '' + val);
      const ins = (...vals: number[]) => vals.forEach((val) => (root = insert(root, n(val), comparator)));
      const del = (val: number) => {
        const target1 = find(root!, val, comparator) as IAvlTreeNode<number, string>;
        root = remove(root, target1);
      };
      ins(1, 2, 3, 4, 5, 6, 7);
      assertAvlBalanceFactors(root!);
      del(1);
      assertAvlBalanceFactors(root!);
      del(3);
      assertAvlBalanceFactors(root!);
      del(5);
      assertAvlBalanceFactors(root!);
      del(7);
      assertAvlBalanceFactors(root!);
      del(6);
      assertAvlBalanceFactors(root!);
      del(2);
      assertAvlBalanceFactors(root!);
      del(4);
      assertAvlBalanceFactors(root!);
    });

    test('can delete whole tree by leaf nodes - 2', () => {
      let root: IAvlTreeNode<number, string> | undefined;
      const n = (val: number) => node(val, '' + val);
      const ins = (...vals: number[]) => vals.forEach((val) => (root = insert(root, n(val), comparator)));
      const del = (val: number) => {
        const target1 = find(root!, val, comparator) as IAvlTreeNode<number, string>;
        root = remove(root, target1);
        assertAvlBalanceFactors(root!);
      };
      ins(50, 30, 60, 20, 40, 1, 2, 3, 4, 5, 6, 7, 8, 9);
      del(40);
      del(60);
      del(50);
      del(30);
      del(9);
      del(1);
      del(7);
      del(20);
      del(3);
      del(8);
      del(5);
      del(6);
      del(2);
      expect(root).not.toBe(undefined);
      del(4);
      expect(root).toBe(undefined);
    });

    test('when right-hand side has four bf = -1', () => {
      let root: IAvlTreeNode<number, string> | undefined;
      const n = (val: number) => node(val, '' + val);
      const ins = (...vals: number[]) => vals.forEach((val) => (root = insert(root, n(val), comparator)));
      const del = (val: number) => {
        const target1 = find(root!, val, comparator) as IAvlTreeNode<number, string>;
        root = remove(root, target1);
        assertAvlBalanceFactors(root!);
      };
      ins(7, 3, 11, 1, 5, 9, 13, 0, 2, 4, 6, 8, 10, 12, 14, 16);
      del(12);
      expect(find(root!, 12, comparator)).toBe(undefined);
    });

    test('when left-hand side has four bf = +1', () => {
      let root: IAvlTreeNode<number, string> | undefined;
      const n = (val: number) => node(val, '' + val);
      const ins = (...vals: number[]) => vals.forEach((val) => (root = insert(root, n(val), comparator)));
      const del = (val: number) => {
        const target1 = find(root!, val, comparator) as IAvlTreeNode<number, string>;
        root = remove(root, target1);
        assertAvlBalanceFactors(root!);
      };
      ins(7, 3, 11, 1, 5, 9, 13, 0, 2, 4, 6, 8, 10, 12, 14, -1);
      expect(!!find(root!, -1, comparator)).toBe(true);
      del(-1);
      expect(!!find(root!, -1, comparator)).toBe(false);
    });

    test('last element when parent is imbalanced bf = +1', () => {
      let root: IAvlTreeNode<number, string> | undefined;
      const n = (val: number) => node(val, '' + val);
      const ins = (...vals: number[]) => vals.forEach((val) => (root = insert(root, n(val), comparator)));
      const del = (val: number) => {
        const target1 = find(root!, val, comparator) as IAvlTreeNode<number, string>;
        root = remove(root, target1);
        assertAvlBalanceFactors(root!);
      };
      ins(3, 1, 6, 0, 5, 12, 4);
      del(12);
      expect(find(root!, 12, comparator)).toBe(undefined);
    });
  });

  describe('one child', () => {
    test('simple case', () => {
      let root: IAvlTreeNode<number, string> | undefined;
      const n = (val: number) => node(val, '' + val);
      const ins = (...vals: number[]) => vals.forEach((val) => (root = insert(root, n(val), comparator)));
      const del = (val: number) => {
        const target1 = find(root!, val, comparator) as IAvlTreeNode<number, string>;
        root = remove(root, target1);
        assertAvlBalanceFactors(root!);
      };
      ins(50, 30, 60, 20);
      del(30);
      expect(size(root)).toBe(3);
      expect(find(root!, 30, comparator)).toBe(undefined);
    });

    test('can delete root node', () => {
      let root: IAvlTreeNode<number, string> | undefined;
      const n = (val: number) => node(val, '' + val);
      const ins = (...vals: number[]) => vals.forEach((val) => (root = insert(root, n(val), comparator)));
      const del = (val: number) => {
        const target1 = find(root!, val, comparator) as IAvlTreeNode<number, string>;
        root = remove(root, target1);
        assertAvlBalanceFactors(root!);
      };
      ins(50, 30);
      del(50);
      expect(size(root)).toBe(1);
      expect(find(root!, 50, comparator)).toBe(undefined);
    });

    test('can delete from larger tree', () => {
      let root: IAvlTreeNode<number, string> | undefined;
      const n = (val: number) => node(val, '' + val);
      const ins = (...vals: number[]) => vals.forEach((val) => (root = insert(root, n(val), comparator)));
      const del = (val: number) => {
        const target1 = find(root!, val, comparator) as IAvlTreeNode<number, string>;
        root = remove(root, target1);
        assertAvlBalanceFactors(root!);
      };
      ins(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15);
      del(13);
      del(14);
      del(9);
      del(10);
      del(11);
      del(5);
      del(1);
      del(3);
      del(6);
      del(12);
      del(2);
      del(4);
      del(7);
      expect(size(root)).toBe(2);
      del(8);
      expect(size(root)).toBe(1);
      del(15);
      expect(size(root)).toBe(0);
    });
  });

  describe('two children', () => {
    test('deleting root', () => {
      let root: IAvlTreeNode<number, string> | undefined;
      const n = (val: number) => node(val, '' + val);
      const ins = (...vals: number[]) => vals.forEach((val) => (root = insert(root, n(val), comparator)));
      const del = (val: number) => {
        const target1 = find(root!, val, comparator) as IAvlTreeNode<number, string>;
        root = remove(root, target1);
        assertAvlBalanceFactors(root!);
      };
      ins(1, 0, 3, 2);
      del(1);
      expect(size(root)).toBe(3);
    });

    test('deleting root with (bf = -1) with children (bf = +1)', () => {
      let root: IAvlTreeNode<number, string> | undefined;
      const n = (val: number) => node(val, '' + val);
      const ins = (...vals: number[]) => vals.forEach((val) => (root = insert(root, n(val), comparator)));
      const del = (val: number) => {
        const target1 = find(root!, val, comparator) as IAvlTreeNode<number, string>;
        root = remove(root, target1);
        assertAvlBalanceFactors(root!);
      };
      ins(11, 7, 24, 6, 17, 30, 16);
      del(11);
      expect(size(root)).toBe(6);
    });

    test('left child has no right sub-child', () => {
      let root: IAvlTreeNode<number, string> | undefined;
      const n = (val: number) => node(val, '' + val);
      const ins = (...vals: number[]) => vals.forEach((val) => (root = insert(root, n(val), comparator)));
      const del = (val: number) => {
        const target1 = find(root!, val, comparator) as IAvlTreeNode<number, string>;
        root = remove(root, target1);
        assertAvlBalanceFactors(root!);
      };
      ins(10, 20, 30, 40, 50);
      // console.log(print(root!));
      del(40);
      // console.log(print(root!));
      expect(size(root)).toBe(4);
      expect(find(root!, 40, comparator)).toBe(undefined);
    });

    test('in-order predecessor has no left child', () => {
      let root: IAvlTreeNode<number, string> | undefined;
      const n = (val: number) => node(val, '' + val);
      const ins = (...vals: number[]) => vals.forEach((val) => (root = insert(root, n(val), comparator)));
      const del = (val: number) => {
        const target1 = find(root!, val, comparator) as IAvlTreeNode<number, string>;
        root = remove(root, target1);
        assertAvlBalanceFactors(root!);
      };
      ins(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
      del(8);
      expect(size(root)).toBe(9);
      expect(find(root!, 8, comparator)).toBe(undefined);
    });

    test('in-order predecessor has left child', () => {
      let root: IAvlTreeNode<number, string> | undefined;
      const n = (val: number) => node(val, '' + val);
      const ins = (...vals: number[]) => vals.forEach((val) => (root = insert(root, n(val), comparator)));
      const del = (val: number) => {
        const target1 = find(root!, val, comparator) as IAvlTreeNode<number, string>;
        root = remove(root, target1);
        assertAvlBalanceFactors(root!);
      };
      ins(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 10.9);
      del(12);
      expect(size(root)).toBe(16);
      expect(find(root!, 12, comparator)).toBe(undefined);
    });

    test('node bf = -1 and left child has no sub-children', () => {
      let root: IAvlTreeNode<number, string> | undefined;
      const n = (val: number) => node(val, '' + val);
      const ins = (...vals: number[]) => vals.forEach((val) => (root = insert(root, n(val), comparator)));
      const del = (val: number) => {
        const target1 = find(root!, val, comparator) as IAvlTreeNode<number, string>;
        root = remove(root, target1);
        assertAvlBalanceFactors(root!);
      };
      ins(15, 6, 17, 3, 10, 16, 19, 0, 5, 9, 13, 18, 12);
      del(10);
      expect(find(root!, 10, comparator)).toBe(undefined);
    });

    test('deletion results in bf = -2 from left side', () => {
      let root: IAvlTreeNode<number, string> | undefined;
      const n = (val: number) => node(val, '' + val);
      const ins = (...vals: number[]) => vals.forEach((val) => (root = insert(root, n(val), comparator)));
      const del = (val: number) => {
        const target1 = find(root!, val, comparator) as IAvlTreeNode<number, string>;
        root = remove(root, target1);
      };
      ins(15, 6, 22, 4, 11, 20, 27, 5, 9, 13, 19, 21, 12);
      // console.log(print(root!));
      del(6);
      // console.log(print(root!));
      assertAvlBalanceFactors(root!);
      expect(find(root!, 6, comparator)).toBe(undefined);
    });
  });

  describe('automated', () => {
    test('delete all elements from root', () => {
      let root: IAvlTreeNode<number, string> | undefined;
      const count = 3 + Math.round(Math.random() * 30);
      const n = (val: number) => node(val, '' + val);
      const ins = (...vals: number[]) => vals.forEach((val) => (root = insert(root, n(val), comparator)));
      for (let i = 0; i < count; i++) ins(i);
      for (let i = count - 1; i >= 0; i--) {
        root = remove(root, root!);
        assertAvlBalanceFactors(root!);
        expect(size(root)).toBe(i);
      }
      expect(root).toBe(undefined);
    });

    test('delete all elements from start', () => {
      let root: IAvlTreeNode<number, string> | undefined;
      const count = 3 + Math.round(Math.random() * 30);
      const n = (val: number) => node(val, '' + val);
      const ins = (...vals: number[]) => vals.forEach((val) => (root = insert(root, n(val), comparator)));
      for (let i = 0; i < count; i++) ins(i);
      for (let i = count - 1; i >= 0; i--) {
        const node = first(root!);
        root = remove(node, root!);
        assertAvlBalanceFactors(root!);
        expect(size(root)).toBe(i);
      }
      expect(root).toBe(undefined);
    });

    test('delete all elements from end', () => {
      let root: IAvlTreeNode<number, string> | undefined;
      const count = 3 + Math.round(Math.random() * 30);
      // const count = 20;
      const n = (val: number) => node(val, '' + val);
      const ins = (...vals: number[]) => vals.forEach((val) => (root = insert(root, n(val), comparator)));
      for (let i = 0; i < count; i++) ins(i);
      for (let i = count - 1; i >= 0; i--) {
        const node = last(root!);
        root = remove(root, node!);
        assertAvlBalanceFactors(root!);
        expect(size(root)).toBe(i);
      }
      expect(root).toBe(undefined);
    });

    for (let i = 0; i < 10; i++) {
      const count = 3 + Math.round(Math.random() * 100);
      test(`random deletion order { count = ${count} }`, () => {
        let root: IAvlTreeNode<number, string> | undefined;
        const n = (val: number) => node(val, '' + val);
        const values = Array.from({length: count}, (_, i) => i);
        const ins = (...vals: number[]) => vals.forEach((val) => (root = insert(root, n(val), comparator)));
        const del = (val: number) => {
          const target1 = find(root!, val, comparator) as IAvlTreeNode<number, string>;
          root = remove(root, target1);
        };
        ins(...values);
        for (let i = 0; i < count; i++) {
          const randomIndex = Math.floor(Math.random() * values.length);
          const poppedRandomValue = values.splice(randomIndex, 1)[0];
          const treeBefore = print(root!);
          try {
            del(poppedRandomValue);
            assertAvlBalanceFactors(root!);
          } catch (error) {
            console.log('before:\n\n' + treeBefore);
            console.log('deleting', poppedRandomValue);
            console.log('after:\n\n' + print(root!));
            throw error;
          }
        }
      });
    }
  });
});
