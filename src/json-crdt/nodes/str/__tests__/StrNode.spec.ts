/* tslint:disable no-console */

import {StrNode, StrChunk} from '../StrNode';
import {equal, type ITimespanStruct, type ITimestampStruct, tick, ts, tss} from '../../../../json-crdt-patch/clock';
import {prev} from 'sonic-forest/lib/util';

/** Validates that .find() method returns correct timestamp for every position. */
const assertFind = (type: StrNode) => {
  const view = type.view();
  const ids: ITimestampStruct[] = [];
  let curr = type.first();
  while (curr) {
    const str = curr.data;
    if (str) {
      for (let i = 0; i < str.length; i++) {
        ids.push(tick(curr.id, i));
      }
    }
    curr = type.next(curr);
  }
  let i = 0;
  try {
    for (; i < view.length; i++) {
      expect(type.find(i)).toStrictEqual(ids[i]);
    }
  } catch (error) {
    console.log('assertFind() failed expected:', ids[i], ', got:', type.find(i), ', at position:', i);
    throw error;
  }
  expect(type.find(view.length)).toBe(undefined);
  expect(type.find(view.length + 1)).toBe(undefined);
};

const chunks = function* (rga: StrNode): IterableIterator<StrChunk> {
  for (let chunk = rga.first(); chunk; chunk = rga.next(chunk)) yield chunk as StrChunk;
};

/** Verifies that all chunk parents are connected and chunk IDs are in B+Tree. */
const assetTreeIsValid = (tree: StrNode, chunk: StrChunk | undefined = tree.root as StrChunk | undefined) => {
  if (!chunk) return;
  if (chunk.l && chunk.l.p !== chunk) {
    console.log('Chunk', chunk, 'has invalid left parent', chunk.l);
    throw new Error('Invalid parent of left child.');
  }
  if (chunk.r && chunk.r.p !== chunk) {
    console.log('Chunk', chunk, 'has invalid right parent', chunk.r);
    throw new Error('Invalid parent of right child.');
  }
  // if (!tree.ids.has(chunk.id)) {
  //   console.log('Chunk', chunk, 'is not present in B+Tree');
  //   throw new Error('Chunk ID is not in B+Tree.');
  // }
  if (tree.root === chunk) {
    let str = '';
    let size = 0;
    let prev: StrChunk | undefined = undefined;
    for (const chunk of chunks(tree)) {
      size++;
      str += chunk.data ? chunk.data : '';
      // Only deleted chunks can be zero length.
      if (!chunk.del && !chunk.data) {
        console.log(tree.toString());
        throw new Error('Only deleted chunks can be zero length.');
      }
      // Check there are no two adjacent deleted chunks which can be merged.
      if (chunk.del) {
        if (prev && prev.del) {
          if (prev.id.sid === chunk.id.sid) {
            if (prev.id.time + prev.span === chunk.id.time) {
              console.log('Adjacent deleted chunks can be merged', tree.toString());
              throw new Error('Adjacent deleted chunks can be merged.');
            }
          }
        }
      } else {
        // Check there are no two adjacent visible chunks which can be merged.
        if (prev && !prev.del) {
          if (prev.id.sid === chunk.id.sid) {
            if (prev.id.time + prev.span === chunk.id.time) {
              console.log('Adjacent visible chunks can be merged', tree.toString());
              throw new Error('Adjacent visible chunks can be merged.');
            }
          }
        }
      }
      prev = chunk as StrChunk;
    }
    // Check RGA size is correct.
    if (tree.size() !== size) {
      console.log(tree.toString());
      console.log('RGA size is not correct. Expected:', size, 'chunks, but got:', tree.size(), 'chunks');
      throw new Error('RGA size is not correct.');
    }
    // Check RGA content length is correct.
    if (str.length !== tree.length()) {
      console.log(tree.toString());
      throw new Error(`RGA length is not correct. Expected ${str.length}, got ${tree.length()}.`);
    }
    // Check view is correct.
    if (str !== tree.view()) {
      console.log(tree.toString());
      throw new Error(`RGA view is not correct. Expected ${str}, got ${tree.view()}.`);
    }
  }
  assertFind(tree);
  if (chunk.l) assetTreeIsValid(tree, chunk.l);
  if (chunk.r) assetTreeIsValid(tree, chunk.r);
};

describe('binary tree', () => {
  const createTree = () => {
    const type = new StrNode(ts(1, 0));
    let id = 1;
    const createNode = (l?: StrChunk, r?: StrChunk) => {
      const time = id++;
      const chunk = new StrChunk(ts(1, time), ('a' + time).length, 'a' + time);
      return chunk;
    };
    const n1 = createNode();
    const n2 = createNode();
    const n3 = createNode();
    const n4 = createNode();
    const n5 = createNode();
    const n6 = createNode();
    const n7 = createNode();
    const n8 = createNode();
    const n9 = createNode();
    const n10 = createNode();
    const n11 = createNode();
    const n12 = createNode();
    const n13 = createNode();
    const n14 = createNode();
    const n15 = createNode();
    type.setRoot(n8);
    type.insertBefore(n4, n8);
    type.insertAfter(n12, n8);
    type.insertBefore(n10, n12);
    type.insertAfter(n14, n12);
    type.insertBefore(n2, n4);
    type.insertAfter(n6, n4);
    type.insertBefore(n1, n2);
    type.insertAfter(n3, n2);
    type.insertBefore(n5, n6);
    type.insertAfter(n7, n6);
    type.insertAfter(n11, n10);
    type.insertBefore(n9, n10);
    type.insertAfter(n15, n14);
    type.insertBefore(n13, n14);
    assetTreeIsValid(type);
    return type;
  };

  test('can print tree layout', () => {
    const tree = createTree();
    expect(tree.toString()).toMatchInlineSnapshot(`
      "str .0 { "a1a2a3a4a5a6a7a8a9a10a11a12a13a1" … }
      └─ chunk .8:2 .36. { "a8" }
         ← chunk .4:2 .14. { "a4" }
           ← chunk .2:2 .6. { "a2" }
             ← chunk .1:2 .2. { "a1" }
             → chunk .3:2 .2. { "a3" }
           → chunk .6:2 .6. { "a6" }
             ← chunk .5:2 .2. { "a5" }
             → chunk .7:2 .2. { "a7" }
         → chunk .12:3 .20. { "a12" }
           ← chunk .10:3 .8. { "a10" }
             ← chunk .9:2 .2. { "a9" }
             → chunk .11:3 .3. { "a11" }
           → chunk .14:3 .9. { "a14" }
             ← chunk .13:3 .3. { "a13" }
             → chunk .15:3 .3. { "a15" }"
    `);
  });

  test('can iterate through all elements', () => {
    const tree = createTree();
    const list = [];
    for (const chunk of chunks(tree)) list.push(chunk);
    expect(list.map((chunk) => chunk.id.time)).toStrictEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
  });

  test('can select the first chunk', () => {
    const tree = createTree();
    const first = tree.first();
    expect(first?.id.time).toBe(1);
  });

  // test('can select the last chunk', () => {
  //   const tree = createTree();
  //   const last = tree.last();
  //   expect(last?.id.time).toBe(15);
  // });

  test('can iterate forwards', () => {
    const tree = createTree();
    const first = tree.first()!;
    expect(first.id.time).toBe(1);
    let next = tree.next(first)!;
    expect(next.id.time).toBe(2);
    next = tree.next(next)!;
    expect(next.id.time).toBe(3);
    next = tree.next(next)!;
    expect(next.id.time).toBe(4);
    next = tree.next(next)!;
    expect(next.id.time).toBe(5);
    next = tree.next(next)!;
    expect(next.id.time).toBe(6);
    next = tree.next(next)!;
    expect(next.id.time).toBe(7);
    next = tree.next(next)!;
    expect(next.id.time).toBe(8);
    next = tree.next(next)!;
    expect(next.id.time).toBe(9);
    next = tree.next(next)!;
    expect(next.id.time).toBe(10);
    next = tree.next(next)!;
    expect(next.id.time).toBe(11);
    next = tree.next(next)!;
    expect(next.id.time).toBe(12);
    next = tree.next(next)!;
    expect(next.id.time).toBe(13);
    next = tree.next(next)!;
    expect(next.id.time).toBe(14);
    next = tree.next(next)!;
    expect(next.id.time).toBe(15);
    expect(tree.next(next)).toBe(undefined);
  });

  test('can iterate backwards', () => {
    const tree = createTree();
    const first = tree.last()!;
    expect(first.id.time).toBe(15);
    let prevNode = prev(first)!;
    expect(prevNode.id.time).toBe(14);
    prevNode = prev(prevNode)!;
    expect(prevNode.id.time).toBe(13);
    prevNode = prev(prevNode)!;
    expect(prevNode.id.time).toBe(12);
    prevNode = prev(prevNode)!;
    expect(prevNode.id.time).toBe(11);
    prevNode = prev(prevNode)!;
    expect(prevNode.id.time).toBe(10);
    prevNode = prev(prevNode)!;
    expect(prevNode.id.time).toBe(9);
    prevNode = prev(prevNode)!;
    expect(prevNode.id.time).toBe(8);
    prevNode = prev(prevNode)!;
    expect(prevNode.id.time).toBe(7);
    prevNode = prev(prevNode)!;
    expect(prevNode.id.time).toBe(6);
    prevNode = prev(prevNode)!;
    expect(prevNode.id.time).toBe(5);
    prevNode = prev(prevNode)!;
    expect(prevNode.id.time).toBe(4);
    prevNode = prev(prevNode)!;
    expect(prevNode.id.time).toBe(3);
    prevNode = prev(prevNode)!;
    expect(prevNode.id.time).toBe(2);
    prevNode = prev(prevNode)!;
    expect(prevNode.id.time).toBe(1);
    expect(prev(prevNode)).toBe(undefined);
  });

  test('can delete a node with no children', () => {
    const tree = createTree();
    const first = tree.first()!;
    expect(first!.data).toBe('a1');
    tree.deleteChunk(first);
    const newFirst = tree.first();
    expect(newFirst!.data).toBe('a2');
    tree.deleteChunk(tree.last()!);
    expect(tree.last()!.data).toBe('a14');
  });

  describe('splay re-balancing', () => {
    test('can perform rotate right at root', () => {
      const tree = createTree();
      const c1 = tree.createChunk(ts(1, 1), '1');
      const c2 = tree.createChunk(ts(1, 2), '2');
      const a = tree.createChunk(ts(1, 4), 'a');
      const b = tree.createChunk(ts(1, 5), 'b');
      const c = tree.createChunk(ts(1, 6), 'c');
      tree.setRoot(c1);
      tree.insertBefore(c2, c1);
      tree.insertAfter(a, c1);
      tree.insertBefore(b, c2);
      tree.insertAfter(c, c2);
      const str1 = [...chunks(tree)].map((e) => e.data).join('');
      tree.splay(c2);
      const str2 = [...chunks(tree)].map((e) => e.data).join('');
      expect(str2).toBe(str1);
      expect(tree.root).toBe(c2);
      expect(tree.root!.l).toBe(b);
      expect(tree.root!.r).toBe(c1);
      expect(tree.root!.r!.r).toBe(a);
      expect(tree.root!.r!.l).toBe(c);
    });

    test('can perform right zig-zig rotation at root', () => {
      const tree = createTree();
      const c1 = tree.createChunk(ts(1, 1), '1');
      const c2 = tree.createChunk(ts(1, 2), '2');
      const c3 = tree.createChunk(ts(1, 3), '3');
      const a = tree.createChunk(ts(1, 4), 'a');
      const b = tree.createChunk(ts(1, 5), 'b');
      const c = tree.createChunk(ts(1, 6), 'c');
      const d = tree.createChunk(ts(1, 7), 'd');
      tree.setRoot(c1);
      tree.insertBefore(a, c1);
      tree.insertAfter(c2, c1);
      tree.insertBefore(b, c2);
      tree.insertAfter(c3, c2);
      tree.insertBefore(c, c3);
      tree.insertAfter(d, c3);
      const str1 = [...chunks(tree)].map((e) => e.data).join('');
      tree.splay(c3);
      const str2 = [...chunks(tree)].map((e) => e.data).join('');
      expect(str2).toBe(str1);
      expect(tree.root).toBe(c3);
      expect(tree.root!.l).toBe(c2);
      expect(tree.root!.l!.l).toBe(c1);
      expect(tree.root!.l!.l!.l).toBe(a);
      expect(tree.root!.l!.l!.r).toBe(b);
      expect(tree.root!.l!.r).toBe(c);
      expect(tree.root!.r).toBe(d);
    });

    test('.splay() can pick the right zig-zig rotation', () => {
      const tree = createTree();
      const c1 = tree.createChunk(ts(1, 1), '1');
      const c2 = tree.createChunk(ts(1, 2), '2');
      const c3 = tree.createChunk(ts(1, 3), '3');
      const a = tree.createChunk(ts(1, 4), 'a');
      const b = tree.createChunk(ts(1, 5), 'b');
      const c = tree.createChunk(ts(1, 6), 'c');
      const d = tree.createChunk(ts(1, 7), 'd');
      tree.setRoot(c1);
      tree.insertBefore(a, c1);
      tree.insertAfter(c2, c1);
      tree.insertBefore(b, c2);
      tree.insertAfter(c3, c2);
      tree.insertBefore(c, c3);
      tree.insertAfter(d, c3);
      const str1 = [...chunks(tree)].map((e) => e.data).join('');
      tree.splay(c3);
      const str2 = [...chunks(tree)].map((e) => e.data).join('');
      expect(str2).toBe(str1);
      expect(tree.root).toBe(c3);
      expect(tree.root!.l).toBe(c2);
      expect(tree.root!.l!.l).toBe(c1);
      expect(tree.root!.l!.l!.l).toBe(a);
      expect(tree.root!.l!.l!.r).toBe(b);
      expect(tree.root!.l!.r).toBe(c);
      expect(tree.root!.r).toBe(d);
    });

    test('can perform left zig-zig rotation at root', () => {
      const tree = createTree();
      const c1 = tree.createChunk(ts(1, 1), '1');
      const c2 = tree.createChunk(ts(1, 2), '2');
      const c3 = tree.createChunk(ts(1, 3), '3');
      const a = tree.createChunk(ts(1, 4), 'a');
      const b = tree.createChunk(ts(1, 5), 'b');
      const c = tree.createChunk(ts(1, 6), 'c');
      const d = tree.createChunk(ts(1, 7), 'd');
      tree.setRoot(c1);
      tree.insertAfter(a, c1);
      tree.insertBefore(c2, c1);
      tree.insertAfter(b, c2);
      tree.insertBefore(c3, c2);
      tree.insertAfter(c, c3);
      tree.insertBefore(d, c3);
      const str1 = [...chunks(tree)].map((e) => e.data).join('');
      tree.splay(c3);
      const str2 = [...chunks(tree)].map((e) => e.data).join('');
      expect(str2).toBe(str1);
      expect(tree.root).toBe(c3);
      expect(tree.root!.r).toBe(c2);
      expect(tree.root!.r!.r).toBe(c1);
      expect(tree.root!.r!.r!.r).toBe(a);
      expect(tree.root!.r!.r!.l).toBe(b);
      expect(tree.root!.r!.l).toBe(c);
      expect(tree.root!.l).toBe(d);
    });

    test('.splay() can pick the left zig-zig rotation', () => {
      const tree = createTree();
      const c1 = tree.createChunk(ts(1, 1), '1');
      const c2 = tree.createChunk(ts(1, 2), '2');
      const c3 = tree.createChunk(ts(1, 3), '3');
      const a = tree.createChunk(ts(1, 4), 'a');
      const b = tree.createChunk(ts(1, 5), 'b');
      const c = tree.createChunk(ts(1, 6), 'c');
      const d = tree.createChunk(ts(1, 7), 'd');
      tree.setRoot(c1);
      tree.insertAfter(a, c1);
      tree.insertBefore(c2, c1);
      tree.insertAfter(b, c2);
      tree.insertBefore(c3, c2);
      tree.insertAfter(c, c3);
      tree.insertBefore(d, c3);
      const str1 = [...chunks(tree)].map((e) => e.data).join('');
      tree.splay(c3);
      const str2 = [...chunks(tree)].map((e) => e.data).join('');
      expect(str2).toBe(str1);
      expect(tree.root).toBe(c3);
      expect(tree.root!.r).toBe(c2);
      expect(tree.root!.r!.r).toBe(c1);
      expect(tree.root!.r!.r!.r).toBe(a);
      expect(tree.root!.r!.r!.l).toBe(b);
      expect(tree.root!.r!.l).toBe(c);
      expect(tree.root!.l).toBe(d);
    });

    test('can perform left zig-zag rotation at root', () => {
      const tree = createTree();
      const c1 = tree.createChunk(ts(1, 1), '1');
      const c2 = tree.createChunk(ts(1, 2), '2');
      const c3 = tree.createChunk(ts(1, 3), '3');
      const a = tree.createChunk(ts(1, 4), 'a');
      const b = tree.createChunk(ts(1, 5), 'b');
      const c = tree.createChunk(ts(1, 6), 'c');
      const d = tree.createChunk(ts(1, 7), 'd');
      tree.setRoot(c1);
      tree.insertAfter(a, c1);
      tree.insertBefore(c2, c1);
      tree.insertBefore(b, c2);
      tree.insertAfter(c3, c2);
      tree.insertBefore(c, c3);
      tree.insertAfter(d, c3);
      const str1 = [...chunks(tree)].map((e) => e.data).join('');
      tree.splay(c3);
      const str2 = [...chunks(tree)].map((e) => e.data).join('');
      expect(str2).toBe(str1);
      expect(tree.root).toBe(c3);
      expect(tree.root!.l).toBe(c2);
      expect(tree.root!.l!.l).toBe(b);
      expect(tree.root!.l!.r).toBe(c);
      expect(tree.root!.r).toBe(c1);
      expect(tree.root!.r!.l).toBe(d);
      expect(tree.root!.r!.r).toBe(a);
    });

    test('.splay() can pick the left zig-zag rotation', () => {
      const tree = createTree();
      const c1 = tree.createChunk(ts(1, 1), '1');
      const c2 = tree.createChunk(ts(1, 2), '2');
      const c3 = tree.createChunk(ts(1, 3), '3');
      const a = tree.createChunk(ts(1, 4), 'a');
      const b = tree.createChunk(ts(1, 5), 'b');
      const c = tree.createChunk(ts(1, 6), 'c');
      const d = tree.createChunk(ts(1, 7), 'd');
      tree.setRoot(c1);
      tree.insertAfter(a, c1);
      tree.insertBefore(c2, c1);
      tree.insertBefore(b, c2);
      tree.insertAfter(c3, c2);
      tree.insertBefore(c, c3);
      tree.insertAfter(d, c3);
      const str1 = [...chunks(tree)].map((e) => e.data).join('');
      tree.splay(c3);
      const str2 = [...chunks(tree)].map((e) => e.data).join('');
      expect(str2).toBe(str1);
      expect(tree.root).toBe(c3);
      expect(tree.root!.l).toBe(c2);
      expect(tree.root!.l!.l).toBe(b);
      expect(tree.root!.l!.r).toBe(c);
      expect(tree.root!.r).toBe(c1);
      expect(tree.root!.r!.l).toBe(d);
      expect(tree.root!.r!.r).toBe(a);
    });

    test('can perform right zig-zag rotation at root', () => {
      const tree = createTree();
      const c1 = tree.createChunk(ts(1, 1), '1');
      const c2 = tree.createChunk(ts(1, 2), '2');
      const c3 = tree.createChunk(ts(1, 3), '3');
      const a = tree.createChunk(ts(1, 4), 'a');
      const b = tree.createChunk(ts(1, 5), 'b');
      const c = tree.createChunk(ts(1, 6), 'c');
      const d = tree.createChunk(ts(1, 7), 'd');
      tree.setRoot(c1);
      tree.insertBefore(a, c1);
      tree.insertAfter(c2, c1);
      tree.insertAfter(b, c2);
      tree.insertBefore(c3, c2);
      tree.insertAfter(c, c3);
      tree.insertBefore(d, c3);
      const str1 = [...chunks(tree)].map((e) => e.data).join('');
      tree.splay(c3);
      const str2 = [...chunks(tree)].map((e) => e.data).join('');
      expect(str2).toBe(str1);
      expect(tree.root).toBe(c3);
      expect(tree.root!.r).toBe(c2);
      expect(tree.root!.r!.r).toBe(b);
      expect(tree.root!.r!.l).toBe(c);
      expect(tree.root!.l).toBe(c1);
      expect(tree.root!.l!.r).toBe(d);
      expect(tree.root!.l!.l).toBe(a);
    });
  });
});

describe('StrNode', () => {
  describe('.ins()', () => {
    test('is empty string by default', () => {
      const id1 = ts(1, 1);
      const type = new StrNode(id1);
      expect(type.view()).toBe('');
      assetTreeIsValid(type);
    });

    test('simple insertion produces two chunks', () => {
      const type = new StrNode(ts(1, 1));
      type.ins(ts(1, 1), ts(1, 2), '1234');
      type.ins(ts(1, 5), ts(1, 33), '5678');
      let cnt = 1;
      let first = type.first();
      while ((first = type.next(first!))) cnt++;
      expect(cnt).toBe(2);
    });

    test('ignores operations where "after" ID is not found', () => {
      const id1 = ts(1, 1);
      const type = new StrNode(id1);
      const after = ts(1, 123);
      const id2 = ts(1, 2);
      type.ins(after, id2, 'a');
      expect(type.view()).toBe('');
      assetTreeIsValid(type);
    });

    test('can insert at root', () => {
      const id1 = ts(1, 1);
      const type = new StrNode(id1);
      const id2 = ts(1, 2);
      type.ins(id1, id2, 'a');
      expect(type.view()).toBe('a');
      assetTreeIsValid(type);
    });

    test('can merge subsequent ID chunks', () => {
      const id1 = ts(1, 1);
      const type = new StrNode(id1);
      const id2 = ts(1, 2);
      type.ins(id1, id2, 'a');
      const id3 = ts(1, 3);
      type.ins(id2, id3, 'b');
      expect(type.view()).toBe('ab');
      expect(type.size()).toBe(1);
      assetTreeIsValid(type);
      const id4 = ts(1, 4);
      type.ins(id3, id4, 'c');
      expect(type.view()).toBe('abc');
      expect(type.size()).toBe(1);
      assetTreeIsValid(type);
    });

    test('can merge subsequent ID twice', () => {
      const type = new StrNode(ts(1, 1));
      type.ins(ts(1, 1), ts(1, 2), 'a');
      type.ins(ts(1, 2), ts(1, 3), 'bc');
      type.ins(ts(1, 4), ts(1, 5), 'def');
      expect(type.view()).toBe('abcdef');
      assetTreeIsValid(type);
    });

    test('insert chunk into root with higher ID', () => {
      const id1 = ts(1, 1);
      const type = new StrNode(id1);
      const id2 = ts(1, 2);
      type.ins(id1, id2, 'a');
      expect(type.view()).toBe('a');
      const id3 = ts(1, 3);
      type.ins(id1, id3, 'b');
      expect(type.view()).toBe('ba');
      assetTreeIsValid(type);
    });

    test('insert chunk into root with higher ID twice', () => {
      const type = new StrNode(ts(1, 1));
      type.ins(ts(1, 1), ts(1, 2), 'a');
      expect(type.view()).toBe('a');
      type.ins(ts(1, 1), ts(1, 3), 'bb');
      type.ins(ts(1, 1), ts(1, 5), 'ccc');
      expect(type.view()).toBe('cccbba');
      assetTreeIsValid(type);
    });

    test('insert chunk into root with higher ID twice', () => {
      const type = new StrNode(ts(1, 1));
      type.ins(ts(1, 1), ts(1, 2), 'a');
      expect(type.view()).toBe('a');
      type.ins(ts(1, 1), ts(1, 3), 'bb');
      type.ins(ts(1, 1), ts(1, 5), 'ccc');
      expect(type.view()).toBe('cccbba');
      assetTreeIsValid(type);
    });

    test('insert chunk to right of root chunk', () => {
      const type = new StrNode(ts(1, 1));
      type.ins(ts(1, 1), ts(1, 2), 'a');
      expect(type.view()).toBe('a');
      type.ins(ts(1, 2), ts(1, 22), 'bb');
      expect(type.view()).toBe('abb');
      assetTreeIsValid(type);
    });

    test('insert in between two chunks', () => {
      const id1 = ts(1, 1);
      const type = new StrNode(id1);
      const id2 = ts(1, 2);
      type.ins(id1, id2, 'a');
      expect(type.view()).toBe('a');
      const id3 = ts(1, 22);
      type.ins(id2, id3, 'bb');
      const id4 = ts(1, 55);
      type.ins(id2, id4, 'ccc');
      expect(type.view()).toBe('acccbb');
      assetTreeIsValid(type);
    });

    test('insert in between two chunks twice', () => {
      const id1 = ts(1, 1);
      const type = new StrNode(id1);
      const id2 = ts(1, 2);
      type.ins(id1, id2, 'a');
      expect(type.view()).toBe('a');
      const id3 = ts(1, 22);
      type.ins(id2, id3, 'bb');
      const id4 = ts(1, 55);
      type.ins(id2, id4, 'ccc');
      const id5 = ts(1, 111);
      type.ins(id2, id5, 'dddd');
      expect(type.view()).toBe('addddcccbb');
      assetTreeIsValid(type);
    });

    test('can split a chunk', () => {
      const type = new StrNode(ts(1, 1));
      type.ins(ts(1, 1), ts(1, 2), 'aaa');
      type.ins(ts(1, 2), ts(1, 666), '!');
      expect(type.view()).toBe('a!aa');
      assetTreeIsValid(type);
    });

    test('can split a chunk trice', () => {
      const type = new StrNode(ts(1, 1));
      type.ins(ts(1, 1), ts(1, 2), '123456');
      type.ins(ts(1, 4), ts(1, 222), '!');
      expect(type.view()).toBe('123!456');
      type.ins(ts(1, 5), ts(1, 444), '.');
      expect(type.view()).toBe('123!4.56');
      type.ins(ts(1, 3), ts(1, 555), '__');
      expect(type.view()).toBe('12__3!4.56');
      assetTreeIsValid(type);
    });

    test('can insert at root many times', () => {
      const type = new StrNode(ts(1, 1));
      type.ins(ts(1, 1), ts(1, 2), '123456');
      type.ins(ts(1, 1), ts(1, 111), 'aaa');
      expect(type.view()).toBe('aaa123456');
      assetTreeIsValid(type);
      type.ins(ts(1, 1), ts(1, 222), 'bbb');
      expect(type.view()).toBe('bbbaaa123456');
      assetTreeIsValid(type);
      type.ins(ts(1, 1), ts(1, 155), 'ccc');
      expect(type.view()).toBe('bbbcccaaa123456');
      assetTreeIsValid(type);
      type.ins(ts(1, 1), ts(1, 333), 'ddd');
      expect(type.view()).toBe('dddbbbcccaaa123456');
      assetTreeIsValid(type);
    });

    test('insert after same chunk many times', () => {
      const type = new StrNode(ts(1, 1));
      type.ins(ts(1, 1), ts(1, 2), '123456');
      type.ins(ts(1, 4), ts(1, 111), '...');
      expect(type.view()).toBe('123...456');
      assetTreeIsValid(type);
      type.ins(ts(1, 4), ts(1, 222), '||||');
      expect(type.view()).toBe('123||||...456');
      assetTreeIsValid(type);
      type.ins(ts(1, 4), ts(1, 333), '$$$$$');
      expect(type.view()).toBe('123$$$$$||||...456');
      assetTreeIsValid(type);
      type.ins(ts(1, 4), ts(1, 444), '______');
      expect(type.view()).toBe('123______$$$$$||||...456');
      assetTreeIsValid(type);
    });

    test('append to end of string many times', () => {
      const type = new StrNode(ts(123, 10));
      type.ins(ts(123, 10), ts(222, 20), 'a');
      expect(type.view()).toBe('a');
      assetTreeIsValid(type);
      type.ins(ts(222, 20), ts(222, 21), 'b');
      expect(type.view()).toBe('ab');
      assetTreeIsValid(type);
      type.ins(ts(222, 21), ts(222, 22), 'c');
      expect(type.view()).toBe('abc');
      assetTreeIsValid(type);
      type.ins(ts(222, 22), ts(222, 33), 'd');
      expect(type.view()).toBe('abcd');
      assetTreeIsValid(type);
      type.ins(ts(222, 33), ts(222, 34), 'e');
      expect(type.view()).toBe('abcde');
      assetTreeIsValid(type);
      type.ins(ts(222, 34), ts(66, 66), 'f');
      expect(type.view()).toBe('abcdef');
      assetTreeIsValid(type);
      type.ins(ts(66, 66), ts(66, 77), 'g');
      expect(type.view()).toBe('abcdefg');
      assetTreeIsValid(type);
    });

    test('can do various inserts', () => {
      const type = new StrNode(ts(1, 1));
      type.ins(ts(1, 1), ts(1, 2), '123456');
      type.ins(ts(1, 4), ts(1, 222), '!');
      expect(type.view()).toBe('123!456');
      assetTreeIsValid(type);
      type.ins(ts(1, 5), ts(1, 444), '.');
      expect(type.view()).toBe('123!4.56');
      assetTreeIsValid(type);
      type.ins(ts(1, 3), ts(1, 555), '__');
      expect(type.view()).toBe('12__3!4.56');
      assetTreeIsValid(type);
      type.ins(ts(1, 555), ts(1, 666), '||||');
      expect(type.view()).toBe('12_||||_3!4.56');
      assetTreeIsValid(type);
      type.ins(ts(1, 7), ts(1, 688), '+++');
      expect(type.view()).toBe('12_||||_3!4.56+++');
      assetTreeIsValid(type);
      type.ins(ts(1, 1), ts(1, 999), '--->');
      expect(type.view()).toBe('--->12_||||_3!4.56+++');
      assetTreeIsValid(type);
      type.ins(ts(1, 1), ts(2, 333), '!!!');
      expect(type.view()).toBe('--->!!!12_||||_3!4.56+++');
      assetTreeIsValid(type);
    });

    test('inserting same operation twice is idempotent', () => {
      const type = new StrNode(ts(1, 1));
      type.ins(ts(1, 1), ts(1, 2), '123456');
      type.ins(ts(1, 4), ts(1, 111), '...');
      type.ins(ts(1, 4), ts(1, 111), '...');
      type.ins(ts(1, 4), ts(1, 111), '...');
      type.ins(ts(1, 4), ts(1, 111), '...');
      type.ins(ts(1, 4), ts(1, 111), '...');
      expect(type.view()).toBe('123...456');
      assetTreeIsValid(type);
    });

    test('inserting at root is idempotent', () => {
      const type = new StrNode(ts(1, 1));
      type.ins(ts(1, 1), ts(1, 2), '123456');
      type.ins(ts(1, 1), ts(1, 2), '123456');
      type.ins(ts(1, 1), ts(1, 2), '123456');
      expect(type.view()).toBe('123456');
      assetTreeIsValid(type);
    });

    test('inserting same operation twice is idempotent, when original chunk was merged', () => {
      const type = new StrNode(ts(1, 1));
      type.ins(ts(1, 1), ts(1, 2), '123456');
      type.ins(ts(1, 4), ts(1, 111), '...');
      type.ins(ts(1, 113), ts(1, 114), '...');
      type.ins(ts(1, 113), ts(1, 114), '...');
      type.ins(ts(1, 113), ts(1, 114), '...');
      type.ins(ts(1, 113), ts(1, 114), '...');
      type.ins(ts(1, 113), ts(1, 114), '...');
      expect(type.view()).toBe('123......456');
      assetTreeIsValid(type);
    });

    test('ignores insert at non-existing position', () => {
      const type = new StrNode(ts(1, 1));
      type.ins(ts(1, 1), ts(1, 10), '012345');
      type.ins(ts(1, 20), ts(1, 333), '|');
      expect(type.view()).toBe('012345');
    });

    test('can insert at the end of the same string twice', () => {
      const str = new StrNode(ts(1, 1));
      str.ins(ts(1, 1), ts(1, 2), '12');
      assetTreeIsValid(str);
      expect(str.view()).toBe('12');
      str.ins(ts(1, 3), ts(1, 4), '34');
      assetTreeIsValid(str);
      expect(str.view()).toBe('1234');
      str.ins(ts(1, 3), ts(1, 6), '5');
      assetTreeIsValid(str);
      expect(str.view()).toBe('12534');
    });

    test('keeps track of split links', () => {
      const type = new StrNode(ts(1, 4));
      type.ins(ts(1, 4), ts(1, 10), '012345');
      type.ins(ts(1, 10), ts(1, 22), '|');
      type.ins(ts(1, 13), ts(1, 33), '|');
      expect(type.view()).toBe('0|123|45');
      // const chunk1 = type.ids.get(toUint64(ts(1, 10)));
      // const chunk2 = type.ids.get(toUint64(ts(1, 11)));
      // const chunk3 = type.ids.get(toUint64(ts(1, 14)));
      // expect(chunk1!.s).toBe(chunk2);
      // expect(chunk2!.s).toBe(chunk3);
    });

    test('can insert twice at root and once in the middle of another chunk', () => {
      const rga = new StrNode(ts(1, 1));
      rga.ins(ts(1, 1), ts(5, 2), 'ccccc');
      assetTreeIsValid(rga);
      rga.ins(ts(1, 1), ts(4, 2), 'aaaaaaa');
      assetTreeIsValid(rga);
      rga.ins(ts(4, 4), ts(4, 9), 'bbbbbbbbbb');
      assetTreeIsValid(rga);
      expect(rga.view()).toBe('cccccaaabbbbbbbbbbaaaa');
    });

    test('can insert and read back a chunk by ID', () => {
      const type = new StrNode(ts(1, 1));
      type.insertId(new StrChunk(ts(4, 2), 'aaaa'.length, 'aaaa'));
      type.insertId(new StrChunk(ts(5, 2), 'aaaa'.length, 'aaaa'));
      const pair1 = type.findById(ts(4, 2))!;
      const pair2 = type.findById(ts(4, 4))!;
      expect(pair1.id).toStrictEqual(ts(4, 2));
      expect(pair2.id).toStrictEqual(ts(4, 2));
    });

    test('inserting concurrently at the root', () => {
      const rga1 = new StrNode(ts(1, 0));
      rga1.ins(ts(1, 0), ts(3, 2), '1');
      rga1.ins(ts(3, 2), ts(3, 3), '2');
      rga1.ins(ts(3, 2), ts(3, 4), '3');
      rga1.ins(ts(1, 0), ts(2, 2), '4');
      const rga2 = new StrNode(ts(1, 0));
      rga2.ins(ts(1, 0), ts(2, 2), '4');
      rga2.ins(ts(1, 0), ts(3, 2), '1');
      rga2.ins(ts(3, 2), ts(3, 3), '2');
      rga2.ins(ts(3, 2), ts(3, 4), '3');
      expect(rga1.view()).toBe(rga2.view());
      expect(rga1.view()).toBe('1324');
    });
  });

  describe('.insAt()', () => {
    test('can insert into empty string', () => {
      const type = new StrNode(ts(1, 1));
      type.insAt(0, ts(1, 2), 'abc');
      assetTreeIsValid(type);
      expect(type.view()).toBe('abc');
    });

    test('can insert at the beginning of string', () => {
      const type = new StrNode(ts(1, 1));
      type.insAt(0, ts(1, 2), 'abc');
      assetTreeIsValid(type);
      type.insAt(0, ts(1, 66), '.');
      assetTreeIsValid(type);
      expect(type.view()).toBe('.abc');
      type.insAt(0, ts(1, 67), ';');
      assetTreeIsValid(type);
      expect(type.view()).toBe(';.abc');
    });

    test('can insert at the end of string with sequential ID', () => {
      const type = new StrNode(ts(1, 1));
      type.insAt(0, ts(1, 2), 'a');
      assetTreeIsValid(type);
      expect(type.view()).toBe('a');
      type.insAt(1, ts(1, 3), 'b');
      assetTreeIsValid(type);
      expect(type.view()).toBe('ab');
    });

    test('can insert at the end of string with ID jump', () => {
      const type = new StrNode(ts(1, 1));
      type.insAt(0, ts(1, 2), 'a');
      assetTreeIsValid(type);
      expect(type.view()).toBe('a');
      type.insAt(1, ts(1, 33), 'b');
      assetTreeIsValid(type);
      expect(type.view()).toBe('ab');
    });

    test('can insert in the middle of string', () => {
      const type = new StrNode(ts(1, 1));
      type.insAt(0, ts(1, 2), 'abc');
      assetTreeIsValid(type);
      expect(type.view()).toBe('abc');
      type.insAt(1, ts(1, 5), '.');
      assetTreeIsValid(type);
      expect(type.view()).toBe('a.bc');
    });

    test('can insert in the middle of string twice', () => {
      const type = new StrNode(ts(1, 1));
      type.insAt(0, ts(1, 2), 'abc');
      assetTreeIsValid(type);
      expect(type.view()).toBe('abc');
      type.insAt(1, ts(1, 5), '...');
      assetTreeIsValid(type);
      expect(type.view()).toBe('a...bc');
      type.insAt(4, ts(1, 8), '|||');
      assetTreeIsValid(type);
      expect(type.view()).toBe('a...|||bc');
      type.insAt(2, ts(1, 33), '____');
      assetTreeIsValid(type);
      expect(type.view()).toBe('a.____..|||bc');
    });

    test('insert many times at the end', () => {
      const type = new StrNode(ts(1, 1));
      type.insAt(0, ts(1, 2), '1');
      assetTreeIsValid(type);
      expect(type.view()).toBe('1');
      type.insAt(1, ts(1, 5), '2');
      assetTreeIsValid(type);
      expect(type.view()).toBe('12');
      type.insAt(2, ts(1, 8), '3');
      assetTreeIsValid(type);
      expect(type.view()).toBe('123');
      type.insAt(3, ts(1, 11), '4');
      assetTreeIsValid(type);
      expect(type.view()).toBe('1234');
      type.insAt(4, ts(1, 15), '5');
      assetTreeIsValid(type);
      expect(type.view()).toBe('12345');
      type.insAt(5, ts(1, 22), '6');
      assetTreeIsValid(type);
      expect(type.view()).toBe('123456');
      type.insAt(6, ts(1, 33), '7');
      assetTreeIsValid(type);
      expect(type.view()).toBe('1234567');
    });

    test('inserting at the same position', () => {
      const type = new StrNode(ts(1, 1));
      type.insAt(0, ts(1, 2), 'abcd');
      assetTreeIsValid(type);
      expect(type.view()).toBe('abcd');
      type.insAt(2, ts(1, 11), '!');
      assetTreeIsValid(type);
      expect(type.view()).toBe('ab!cd');
      type.insAt(2, ts(1, 22), '@');
      assetTreeIsValid(type);
      expect(type.view()).toBe('ab@!cd');
      type.insAt(2, ts(1, 33), '#');
      assetTreeIsValid(type);
      expect(type.view()).toBe('ab#@!cd');
      type.insAt(2, ts(1, 44), '$');
      assetTreeIsValid(type);
      expect(type.view()).toBe('ab$#@!cd');
    });
  });

  describe('.delete()', () => {
    test('can delete a character at beginning', () => {
      const type = new StrNode(ts(1, 1));
      type.ins(ts(1, 1), ts(1, 2), '123456');
      assetTreeIsValid(type);
      type.delete([tss(1, 2, 1)]);
      assetTreeIsValid(type);
      type.delete([tss(1, 2, 1)]);
      assetTreeIsValid(type);
      expect(type.view()).toBe('23456');
    });

    test('can delete a character in the middle', () => {
      const type = new StrNode(ts(1, 1));
      type.ins(ts(1, 1), ts(1, 2), '123456');
      assetTreeIsValid(type);
      type.delete([tss(1, 3, 1)]);
      assetTreeIsValid(type);
      expect(type.view()).toBe('13456');
      type.delete([tss(1, 5, 1)]);
      assetTreeIsValid(type);
      type.delete([tss(1, 5, 1)]);
      assetTreeIsValid(type);
      expect(type.view()).toBe('1356');
      type.delete([tss(1, 4, 1)]);
      assetTreeIsValid(type);
      expect(type.view()).toBe('156');
      // Can insert at end of merged tombstones.
      type.ins(ts(1, 5), ts(1, 55), '|');
      assetTreeIsValid(type);
      expect(type.view()).toBe('1|56');
    });

    test('insert in the middle of a tombstone, and then after each part of split tombstone', () => {
      const type = new StrNode(ts(1, 1));
      type.ins(ts(1, 1), ts(1, 2), '1234');
      assetTreeIsValid(type);
      expect(type.view()).toBe('1234');
      type.delete([tss(1, 3, 2)]);
      assetTreeIsValid(type);
      expect(type.view()).toBe('14');
      type.ins(ts(1, 3), ts(1, 33), '|');
      assetTreeIsValid(type);
      expect(type.view()).toBe('1|4');
      type.ins(ts(1, 4), ts(1, 44), '>');
      assetTreeIsValid(type);
      expect(type.view()).toBe('1|>4');
      type.ins(ts(1, 2), ts(1, 55), '<');
      assetTreeIsValid(type);
      expect(type.view()).toBe('1<|>4');
    });

    test('can delete 3 chars', () => {
      const type = new StrNode(ts(1, 1));
      type.ins(ts(1, 1), ts(1, 2), '12345');
      assetTreeIsValid(type);
      expect(type.view()).toBe('12345');
      type.delete([tss(1, 3, 3)]);
      assetTreeIsValid(type);
      expect(type.view()).toBe('15');
    });

    test('can delete right across a split-in-the-middle delete', () => {
      const type = new StrNode(ts(123456789, 1));
      type.ins(ts(123456789, 1), ts(1, 2), '12345');
      assetTreeIsValid(type);
      expect(type.view()).toBe('12345');
      type.delete([tss(1, 4, 1)]);
      assetTreeIsValid(type);
      expect(type.view()).toBe('1245');
      type.delete([tss(1, 3, 3)]);
      assetTreeIsValid(type);
      expect(type.view()).toBe('15');
    });

    test('can delete right after split-in-the-middle delete, in cloned RGA', () => {
      const type = new StrNode(ts(1, 1));
      type.ins(ts(1, 1), ts(1, 2), '12345');
      assetTreeIsValid(type);
      expect(type.view()).toBe('12345');
      type.delete([tss(1, 4, 1)]);
      assetTreeIsValid(type);
      expect(type.view()).toBe('1245');
      const type2 = new StrNode(ts(1, 1));
      let curr = type.first();
      type2.ingest(type.size(), () => {
        const res = curr!.clone();
        curr = type.next(curr!);
        return res;
      });
      assetTreeIsValid(type2);
      expect(type2.view()).toBe('1245');
      type.delete([tss(1, 3, 3)]);
      assetTreeIsValid(type);
      expect(type.view()).toBe('15');
      expect(type2.view()).toBe('1245');
      type2.delete([tss(1, 3, 3)]);
      assetTreeIsValid(type2);
      expect(type2.view()).toBe('15');
    });

    test('can delete right after split-in-the-middle insert', () => {
      const type = new StrNode(ts(1, 1));
      type.ins(ts(1, 1), ts(1, 2), '12345');
      assetTreeIsValid(type);
      expect(type.view()).toBe('12345');
      type.ins(ts(1, 4), ts(1, 44), '>');
      assetTreeIsValid(type);
      expect(type.view()).toBe('123>45');
      type.delete([tss(1, 5, 1)]);
      assetTreeIsValid(type);
      expect(type.view()).toBe('123>5');
    });

    test('can delete after split insert and split delete', () => {
      const type = new StrNode(ts(1, 1));
      type.ins(ts(1, 1), ts(1, 2), '123456');
      assetTreeIsValid(type);
      expect(type.view()).toBe('123456');
      type.ins(ts(1, 2), ts(1, 44), '>');
      assetTreeIsValid(type);
      expect(type.view()).toBe('1>23456');
      type.delete([tss(1, 4, 1)]);
      assetTreeIsValid(type);
      expect(type.view()).toBe('1>2456');
      type.delete([tss(1, 2, 4)]);
      assetTreeIsValid(type);
      expect(type.view()).toBe('>56');
    });
  });

  describe('.find()', () => {
    test('can find content in a single chunk RGA', () => {
      const type = new StrNode(ts(1, 1));
      type.ins(ts(1, 1), ts(1, 2), '123456');
      assetTreeIsValid(type);
    });
  });

  describe('.findInterval()', () => {
    test('can find interval in a single chunk', () => {
      const type = new StrNode(ts(1, 1));
      type.ins(ts(1, 1), ts(1, 2), '123456');
      assetTreeIsValid(type);
      expect(type.findInterval(0, 1)).toStrictEqual([tss(1, 2, 1)]);
      expect(type.findInterval(0, 2)).toStrictEqual([tss(1, 2, 2)]);
      expect(type.findInterval(0, 3)).toStrictEqual([tss(1, 2, 3)]);
      expect(type.findInterval(0, 4)).toStrictEqual([tss(1, 2, 4)]);
      expect(type.findInterval(0, 5)).toStrictEqual([tss(1, 2, 5)]);
      expect(type.findInterval(0, 6)).toStrictEqual([tss(1, 2, 6)]);
      expect(type.findInterval(0, 7)).toStrictEqual([tss(1, 2, 6)]);
      expect(type.findInterval(1, 6)).toStrictEqual([tss(1, 3, 5)]);
      expect(type.findInterval(1, 5)).toStrictEqual([tss(1, 3, 5)]);
      expect(type.findInterval(2, 4)).toStrictEqual([tss(1, 4, 4)]);
      expect(type.findInterval(3, 3)).toStrictEqual([tss(1, 5, 3)]);
      expect(type.findInterval(4, 2)).toStrictEqual([tss(1, 6, 2)]);
      expect(type.findInterval(5, 1)).toStrictEqual([tss(1, 7, 1)]);
      expect(type.findInterval(6, 1)).toStrictEqual([]);
      expect(type.findInterval(6, 0)).toStrictEqual([]);
      expect(type.findInterval(4, 0)).toStrictEqual([]);
      expect(type.findInterval(2, 2)).toStrictEqual([tss(1, 4, 2)]);
    });

    test('can find interval across two chunks', () => {
      const type = new StrNode(ts(1, 1));
      type.ins(ts(1, 1), ts(1, 2), '1234');
      type.ins(ts(1, 5), ts(1, 33), '5678');
      assetTreeIsValid(type);
      expect(type.findInterval(0, 1)).toStrictEqual([tss(1, 2, 1)]);
      expect(type.findInterval(0, 2)).toStrictEqual([tss(1, 2, 2)]);
      expect(type.findInterval(0, 3)).toStrictEqual([tss(1, 2, 3)]);
      expect(type.findInterval(0, 4)).toStrictEqual([tss(1, 2, 4)]);
      expect(type.findInterval(0, 5)).toStrictEqual([tss(1, 2, 4), tss(1, 33, 1)]);
      expect(type.findInterval(0, 6)).toStrictEqual([tss(1, 2, 4), tss(1, 33, 2)]);
      expect(type.findInterval(0, 7)).toStrictEqual([tss(1, 2, 4), tss(1, 33, 3)]);
      expect(type.findInterval(0, 8)).toStrictEqual([tss(1, 2, 4), tss(1, 33, 4)]);
      expect(type.findInterval(0, 9)).toStrictEqual([tss(1, 2, 4), tss(1, 33, 4)]);
      expect(type.findInterval(2, 5)).toStrictEqual([tss(1, 4, 2), tss(1, 33, 3)]);
    });

    test('can select over deletion ranges', () => {
      const type = new StrNode(ts(1, 1));
      type.ins(ts(1, 1), ts(1, 2), '12345678');
      assetTreeIsValid(type);
      const interval = type.findInterval(3, 2);
      type.delete(interval);
      type.delete(interval);
      assetTreeIsValid(type);
      expect(type.view()).toBe('123678');
      const interval2 = type.findInterval(2, 2);
      type.delete(interval2);
      type.delete(interval2);
      type.delete(interval2);
      assetTreeIsValid(type);
      expect(type.view()).toBe('1278');
      const interval3 = type.findInterval(1, 111);
      type.delete(interval3);
      type.delete(interval3);
      assetTreeIsValid(type);
      expect(type.view()).toBe('1');
      const interval4 = type.findInterval(0, 1);
      type.delete(interval4);
      type.delete(interval4);
      assetTreeIsValid(type);
      expect(type.view()).toBe('');
      expect(type.size()).toBe(1); // All tombstones are merged into one chunk.
    });
  });

  describe('.findInterval2()', () => {
    test('can clone an RGA', () => {
      const type1 = new StrNode(ts(1, 1));
      type1.insAt(0, ts(1, 2), '12345');
      type1.insAt(3, ts(3, 2), '1234DF678');
      type1.insAt(7, ts(3, 22), '12aaaadf678');
      type1.insAt(7, ts(4, 22), '123');
      type1.insAt(7, ts(5, 22), 'asdf');
      type1.insAt(7, ts(6, 122), 'qwerty');
      const str = type1.view();
      for (let i = 0; i < str.length - 1; i++) {
        for (let y = i + 1; y < str.length; y++) {
          const interval = type1.findInterval(i, y);
          if (!interval || !interval.length) continue;
          const startId = ts(interval[0].sid, interval[0].time);
          const endId = ts(
            interval[interval.length - 1].sid,
            interval[interval.length - 1].time + interval[interval.length - 1].span - 1,
          );
          const interval2 = type1.findInterval2(startId, endId);
          expect(interval2).toStrictEqual(interval);
        }
      }
    });
  });

  describe('.pos()', () => {
    test('returns correct position of a single chunk', () => {
      const type = new StrNode(ts(1, 1));
      type.ins(ts(1, 1), ts(1, 2), '123456');
      assetTreeIsValid(type);
      const chunk = type.first();
      const pos = type.pos(chunk!);
      expect(pos).toBe(0);
    });

    test('returns correct position for three chunks', () => {
      const type = new StrNode(ts(1, 1));
      type.ins(ts(1, 1), ts(1, 2), '123456');
      assetTreeIsValid(type);
      type.ins(ts(1, 4), ts(1, 11), '789');
      assetTreeIsValid(type);
      const chunk1 = type.first()!;
      const chunk2 = type.next(chunk1)!;
      const chunk3 = type.next(chunk2)!;
      expect(type.pos(chunk1)).toBe(0);
      expect(type.pos(chunk2)).toBe(3);
      expect(type.pos(chunk3)).toBe(6);
    });

    test('returns correct position for edited text', () => {
      const type = new StrNode(ts(1, 1));
      type.ins(ts(1, 1), ts(1, 2), 'wworld');
      assetTreeIsValid(type);
      type.ins(ts(1, 1), ts(1, 11), 'helo ');
      assetTreeIsValid(type);
      type.ins(ts(1, 12), ts(1, 22), 'l');
      assetTreeIsValid(type);
      type.delete([tss(1, 3, 1)]);
      assetTreeIsValid(type);
      const chunk = type.findById(ts(1, 13))!;
      const pos = type.pos(chunk);
      expect(pos).toBe(3);
    });

    test('check all chunk positions', () => {
      const type = new StrNode(ts(1, 1));
      type.ins(ts(1, 1), ts(1, 2), 'wworld');
      type.ins(ts(1, 1), ts(1, 11), 'helo ');
      type.ins(ts(1, 12), ts(1, 22), 'l');
      type.delete([tss(1, 3, 1)]);
      type.ins(ts(1, 22), ts(1, 33), 'qwertyuuu');
      type.delete([tss(1, 33, 3)]);
      type.ins(ts(1, 36), ts(1, 55), '1234567');
      type.ins(ts(1, 12), ts(1, 66), 'aaaaaa');
      type.ins(ts(1, 68), ts(1, 77), 'bbbbbb');
      type.delete([tss(1, 68, 3)]);
      type.ins(ts(1, 68), ts(1, 77), 'cccc');
      let curr = type.first();
      let pos = 0;
      while (curr) {
        const res = type.pos(curr);
        expect(res).toBe(pos);
        pos += curr && !curr.del ? curr.span : 0;
        curr = type.next(curr);
      }
    });

    test('calculates correctly position when tombstones present', () => {
      const type = new StrNode(ts(1, 1));
      type.ins(ts(1, 1), ts(1, 7), 'xxx');
      type.ins(ts(1, 9), ts(1, 10), 'AA');
      type.ins(ts(1, 1), ts(1, 38), 'n');
      type.delete([tss(1, 7, 3)]);
      type.ins(ts(1, 11), ts(1, 46), 'BBBB');
      const c1 = type.first()!;
      const c2 = type.next(c1)!;
      const c3 = type.next(c2)!;
      const c4 = type.next(c3)!;
      expect(type.pos(c1)).toBe(0);
      expect(type.pos(c2)).toBe(1);
      expect(type.pos(c3)).toBe(1);
      expect(type.pos(c4)).toBe(3);
    });
  });

  describe('.spanView()', () => {
    test('can get view from beginning of chunk', () => {
      const type = new StrNode(ts(1, 1));
      type.ins(ts(1, 1), ts(1, 2), '123456');
      const view = type.spanView(tss(1, 2, 3));
      expect(view).toEqual(['123']);
    });

    test('can get empty view', () => {
      const type = new StrNode(ts(1, 1));
      type.ins(ts(1, 1), ts(1, 2), '123456');
      const view = type.spanView(tss(1, 2, 0));
      expect(view.join('')).toBe('');
    });

    test('can get view from beginning to end of single chunk', () => {
      const type = new StrNode(ts(1, 1));
      type.ins(ts(1, 1), ts(1, 2), '123456');
      const view = type.spanView(tss(1, 2, 6));
      expect(view).toEqual(['123456']);
    });

    test('can get view starting from middle', () => {
      const type = new StrNode(ts(1, 1));
      type.ins(ts(1, 1), ts(1, 2), '123456');
      const view = type.spanView(tss(1, 4, 2));
      expect(view).toEqual(['34']);
    });

    test('can get view starting from middle to end', () => {
      const type = new StrNode(ts(1, 1));
      type.ins(ts(1, 1), ts(1, 2), '123456');
      const view = type.spanView(tss(1, 4, 4));
      expect(view).toEqual(['3456']);
    });

    test('can get view across two chunks', () => {
      const type = new StrNode(ts(1, 1));
      type.ins(ts(1, 1), ts(1, 2), '123');
      type.ins(ts(1, 4), ts(1, 5), '456');
      type.ins(ts(1, 4), ts(2, 5), 'xxx');
      const view = type.spanView(tss(1, 2, 4));
      expect(view).toEqual(['123', '4']);
    });

    test('can get view across two chunks starting from middle', () => {
      const type = new StrNode(ts(1, 1));
      type.ins(ts(1, 1), ts(1, 2), '123');
      type.ins(ts(1, 4), ts(1, 5), '456');
      type.ins(ts(1, 4), ts(2, 5), 'xxx');
      const view = type.spanView(tss(1, 3, 4));
      expect(view).toEqual(['23', '45']);
    });

    test('can get view across two chunks starting from middle - 2', () => {
      const type = new StrNode(ts(1, 1));
      type.ins(ts(1, 1), ts(1, 2), '123');
      type.ins(ts(1, 4), ts(1, 5), '456');
      type.ins(ts(1, 4), ts(2, 5), 'xxx');
      const view = type.spanView(tss(1, 4, 4));
      expect(view).toEqual(['3', '456']);
    });

    test('can get view across three chunks', () => {
      const type = new StrNode(ts(1, 1));
      type.ins(ts(1, 1), ts(1, 2), '123456789');
      type.ins(ts(1, 4), ts(2, 5), 'xxx');
      type.ins(ts(1, 7), ts(3, 5), 'yyy');
      const view = type.spanView(tss(1, 3, 7));
      expect(view).toEqual(['23', '456', '78']);
    });

    test('can get view across three chunks and ignore deleted chunks', () => {
      const type = new StrNode(ts(1, 1));
      type.ins(ts(1, 1), ts(1, 2), '123456789');
      type.ins(ts(1, 4), ts(2, 5), 'xxx');
      type.ins(ts(1, 7), ts(3, 5), 'yyy');
      type.delete([tss(1, 4, 4)]);
      const view = type.spanView(tss(1, 3, 7));
      expect(view).toEqual(['2', '78']);
    });
  });

  describe('.prevId()', () => {
    test('can iterate through IDs in reverse', () => {
      const type = new StrNode(ts(1, 1));
      type.ins(ts(1, 1), ts(1, 2), '123456789');
      type.ins(ts(1, 4), ts(2, 5), 'xxx');
      type.ins(ts(1, 7), ts(3, 5), 'yyy');
      let id = ts(1, 10);
      id = type.prevId(id)!;
      expect(id).toStrictEqual(ts(1, 9));
      id = type.prevId(id)!;
      expect(id).toStrictEqual(ts(1, 8));
      id = type.prevId(id)!;
      expect(id).toStrictEqual(ts(3, 7));
      id = type.prevId(id)!;
      expect(id).toStrictEqual(ts(3, 6));
      id = type.prevId(id)!;
      expect(id).toStrictEqual(ts(3, 5));
      id = type.prevId(id)!;
      expect(id).toStrictEqual(ts(1, 7));
      id = type.prevId(id)!;
      expect(id).toStrictEqual(ts(1, 6));
      id = type.prevId(id)!;
      expect(id).toStrictEqual(ts(1, 5));
      id = type.prevId(id)!;
      expect(id).toStrictEqual(ts(2, 7));
      id = type.prevId(id)!;
      expect(id).toStrictEqual(ts(2, 6));
      id = type.prevId(id)!;
      expect(id).toStrictEqual(ts(2, 5));
      id = type.prevId(id)!;
      expect(id).toStrictEqual(ts(1, 4));
      id = type.prevId(id)!;
      expect(id).toStrictEqual(ts(1, 3));
      id = type.prevId(id)!;
      expect(id).toStrictEqual(ts(1, 2));
      id = type.prevId(id)!;
      expect(id).toBe(undefined);
    });
  });

  describe('export / import', () => {
    type Entry = [ITimestampStruct, number, string];
    const exp = (type: StrNode) => {
      const data: Entry[] = [];
      for (const chunk of chunks(type)) {
        data.push([chunk.id, chunk.span, chunk.data || '']);
      }
      return data;
    };

    test('can ingest balanced binary tree from iterator', () => {
      const type1 = new StrNode(ts(1, 1));
      const verifyExportImport = () => {
        const data = exp(type1);
        const type2 = new StrNode(ts(1, 1));
        let i = 0;
        type2.ingest(data.length, () => {
          const [id, span, content] = data[i++];
          return new StrChunk(id, span, content);
        });
        assetTreeIsValid(type1);
        assetTreeIsValid(type2);
        expect(type2.view()).toBe(type1.view());
        const data2 = exp(type1);
        expect(data2).toStrictEqual(exp(type2));
        expect(data2).toStrictEqual(data);
      };
      type1.insAt(0, ts(1, 2), '12345678');
      verifyExportImport();
      type1.insAt(3, ts(3, 2), '12345678');
      verifyExportImport();
      type1.insAt(7, ts(3, 22), '12345678');
      verifyExportImport();
      type1.insAt(7, ts(4, 22), '123');
      verifyExportImport();
      type1.insAt(7, ts(5, 22), 'asdf');
      verifyExportImport();
      type1.insAt(7, ts(6, 122), 'qwerty');
      verifyExportImport();
      type1.delete(type1.findInterval(4, 4));
      verifyExportImport();
      type1.delete(type1.findInterval(0, 3));
      verifyExportImport();
      type1.delete(type1.findInterval(5, 1));
      verifyExportImport();
    });

    test('can clone an RGA', () => {
      const type1 = new StrNode(ts(1, 1));
      type1.insAt(0, ts(1, 2), '12345678');
      type1.insAt(3, ts(3, 2), '12345678');
      type1.insAt(7, ts(3, 22), '12345678');
      type1.insAt(7, ts(4, 22), '123');
      type1.insAt(7, ts(5, 22), 'asdf');
      type1.insAt(7, ts(6, 122), 'qwerty');
      type1.delete(type1.findInterval(4, 4));
      type1.delete(type1.findInterval(0, 3));
      type1.delete(type1.findInterval(5, 1));
      const type2 = new StrNode(ts(1, 1));
      const iterator = chunks(type1);
      type2.ingest(type1.size(), () => {
        const chunk = iterator.next().value;
        return chunk.clone();
      });
      expect(type1.view()).toBe(type2.view());
      expect(type1.toString()).not.toBe(type2.toString());
      expect(exp(type1)).toStrictEqual(exp(type2));
      expect(type1).not.toBe(type2);
      expect(type1.root).not.toBe(type2.root);
      expect(equal(type1.id, type2.id)).toBe(true);
    });
  });

  describe('.range0()', () => {
    test('can clone an RGA', () => {
      const type1 = new StrNode(ts(1, 1));
      type1.insAt(0, ts(1, 2), '12345');
      type1.insAt(3, ts(3, 2), '1234DF678');
      type1.insAt(7, ts(3, 22), '12aaaadf678');
      type1.insAt(7, ts(4, 22), '123');
      type1.insAt(7, ts(5, 22), 'asdf');
      type1.insAt(7, ts(6, 122), 'qwerty');
      const str = type1.view();
      for (let i = 0; i < str.length - 1; i++) {
        for (let y = i + 1; y < str.length; y++) {
          const interval = type1.findInterval(i, y);
          if (!interval || !interval.length) continue;
          const startId = ts(interval[0].sid, interval[0].time);
          const endId = ts(
            interval[interval.length - 1].sid,
            interval[interval.length - 1].time + interval[interval.length - 1].span - 1,
          );
          const interval2: ITimespanStruct[] = [];
          type1.range0(undefined, startId, endId, (chunk, from, length) => {
            interval2.push(tss(chunk.id.sid, chunk.id.time + from, length));
          });
          expect(interval2).toStrictEqual(interval);
        }
      }
    });

    test('can stop iteration at deleted chunk', () => {
      const type = new StrNode(ts(1, 1));
      type.insAt(0, ts(1, 2), '123456');
      type.delete([tss(1, 4, 2)]);
      const from = ts(1, 2);
      const to = ts(1, 4);
      let str = '';
      type.range0(undefined, from, to, (chunk, off, len) => {
        if (chunk.data) str += chunk.data.slice(off, off + len);
      });
      expect(str).toBe('12');
    });

    test('can start iteration at deleted chunk', () => {
      const type = new StrNode(ts(1, 1));
      type.insAt(0, ts(1, 2), '123456');
      type.delete([tss(1, 4, 2)]);
      const from = ts(1, 4);
      const to = ts(1, 7);
      let str = '';
      type.range0(undefined, from, to, (chunk, off, len) => {
        if (chunk.data) str += chunk.data.slice(off, off + len);
      });
      expect(str).toBe('56');
    });

    test('does not iterate when from and to are in deleted chunk', () => {
      const type = new StrNode(ts(1, 1));
      type.insAt(0, ts(1, 2), '123456');
      type.delete([tss(1, 3, 3)]);
      const from = ts(1, 3);
      const to = ts(1, 5);
      let str = '';
      type.range0(undefined, from, to, (chunk, off, len) => {
        if (chunk.data) str += chunk.data.slice(off, off + len);
      });
      expect(str).toBe('');
    });

    test('all possible combinations of range computation across deleted chunks', () => {
      const type = new StrNode(ts(1, 1));
      const subject = '1234abcd5678efgh';
      type.insAt(0, ts(1, 2), '1234abcd5678efgh');
      type.delete([tss(1, 6, 4), tss(1, 14, 4)]);
      const str = (from: number, to: number) => {
        let acc = '';
        const x1 = ts(1, from + 2);
        const x2 = ts(1, to + 2);
        type.range0(undefined, x1, x2, (chunk, off, len) => {
          if (chunk.data) acc += chunk.data.slice(off, off + len);
        });
        return acc;
      };
      const assert = (from: number, to: number) => {
        const computed = str(from, to);
        const expected = subject.slice(from, to + 1).replace(/[^0-9]/g, '');
        expect(computed).toBe(expected);
      };
      const length = subject.length;
      for (let i = 0; i < length; i++) {
        for (let y = i; y < length; y++) {
          assert(i, y);
        }
      }
    });
  });

  describe('scenarios', () => {
    test('couple users editing existing document', () => {
      const rga1 = new StrNode(ts(3, 0));
      rga1.ins(ts(3, 0), ts(1, 2), 'bbbbbbbbbbbbbb');
      rga1.ins(ts(3, 0), ts(1, 30), 'aaaaaaaaa');
      rga1.delete([tss(1, 2, 14)]);

      rga1.ins(ts(1, 35), ts(2, 39), 'zz');
      rga1.ins(ts(1, 32), ts(2, 41), 'cccccc');
      rga1.ins(ts(1, 33), ts(2, 47), 'dddddddd');

      rga1.ins(ts(1, 31), ts(4, 39), 'eeeeeeeeeeeee');
      rga1.delete([tss(1, 30, 22)]);

      const rga2 = new StrNode(ts(3, 0));
      rga2.ins(ts(3, 0), ts(1, 2), 'bbbbbbbbbbbbbb');
      rga2.ins(ts(3, 0), ts(1, 30), 'aaaaaaaaa');
      rga2.delete([tss(1, 2, 14)]);

      rga2.ins(ts(1, 31), ts(4, 39), 'eeeeeeeeeeeee');
      rga2.delete([tss(1, 30, 22)]);

      rga2.ins(ts(1, 35), ts(2, 39), 'zz');
      rga2.ins(ts(1, 32), ts(2, 41), 'cccccc');
      rga2.ins(ts(1, 33), ts(2, 47), 'dddddddd');

      expect(rga1.view()).toBe('eeeeeeeeeeeeeccccccddddddddzz');
      expect(rga2.view()).toBe('eeeeeeeeeeeeeccccccddddddddzz');
    });

    test('combines deleted and newly inserted chunks with split link, if necessary', () => {
      const rga1 = new StrNode(ts(3, 0));
      rga1.ins(ts(3, 0), ts(1, 1), 'aaa');
      rga1.ins(ts(1, 3), ts(1, 4), 'bb');
      rga1.ins(ts(1, 5), ts(1, 6), 'cc');
      rga1.delete([tss(1, 3, 3)]);
      rga1.delete([tss(1, 2, 5)]);
      expect(rga1.view()).toBe('ac');
      const rga2 = new StrNode(ts(3, 0));
      rga2.ins(ts(3, 0), ts(1, 1), 'aaa');
      rga2.ins(ts(1, 3), ts(1, 4), 'bb');
      rga2.delete([tss(1, 3, 3)]);
      rga2.ins(ts(1, 5), ts(1, 6), 'cc');
      rga2.delete([tss(1, 2, 5)]);
      expect(rga2.view()).toBe('ac');
      expect(rga2.view()).toBe(rga1.view());
      rga1.delete([tss(1, 1, 7)]);
      rga2.delete([tss(1, 1, 7)]);
      expect(rga1.view()).toBe('');
      expect(rga2.view()).toBe('');
    });

    test('append inserts by concurrent users', () => {
      const rga1 = new StrNode(ts(1, 0));
      rga1.ins(ts(1, 0), ts(1, 1), 'a');
      rga1.ins(ts(1, 1), ts(1, 2), 'a');
      rga1.ins(ts(1, 2), ts(1, 3), '1');
      rga1.ins(ts(1, 2), ts(2, 3), '2');
      expect(rga1.view()).toBe('aa21');
      const rga2 = new StrNode(ts(1, 0));
      rga2.ins(ts(1, 0), ts(1, 1), 'a');
      rga2.ins(ts(1, 1), ts(1, 2), 'a');
      rga2.ins(ts(1, 2), ts(2, 3), '2');
      rga2.ins(ts(1, 2), ts(1, 3), '1');
      expect(rga2.view()).toBe('aa21');
    });

    test('one user merging chunk, while another synchronously inserting at the same position', () => {
      const rga1 = new StrNode(ts(1, 0));
      rga1.ins(ts(1, 0), ts(1, 1), 'a');
      rga1.ins(ts(1, 1), ts(1, 2), '1');
      rga1.ins(ts(1, 1), ts(2, 2), '2');
      expect(rga1.view()).toBe('a21');
      const rga2 = new StrNode(ts(1, 0));
      rga2.ins(ts(1, 0), ts(1, 1), 'a');
      rga2.ins(ts(1, 1), ts(2, 2), '2');
      rga2.ins(ts(1, 1), ts(1, 2), '1');
      expect(rga2.view()).toBe('a21');
    });

    test('one user merging chunk, while another synchronously inserting at the same position - 2', () => {
      const rga1 = new StrNode(ts(1, 0));
      rga1.ins(ts(1, 0), ts(2, 1), 'a');
      rga1.ins(ts(2, 1), ts(2, 2), '12345');
      rga1.ins(ts(2, 1), ts(1, 2), 'x');
      expect(rga1.view()).toBe('a12345x');
      const rga2 = new StrNode(ts(1, 0));
      rga2.ins(ts(1, 0), ts(2, 1), 'a');
      rga2.ins(ts(2, 1), ts(1, 2), 'x');
      rga2.ins(ts(2, 1), ts(2, 2), '12345');
      expect(rga2.view()).toBe('a12345x');
    });

    test('one user merging chunk, while another synchronously inserting at the same position - 2', () => {
      const rga1 = new StrNode(ts(5, 0));
      rga1.ins(ts(5, 0), ts(4, 5), 'YYYYYYYYYYY');
      rga1.ins(ts(5, 0), ts(4, 16), 'BBBBBBBBB');
      rga1.delete([tss(4, 6, 4)]);
      rga1.ins(ts(4, 11), ts(7, 81), 'AAAAAAAAAAAA');
      rga1.delete([tss(4, 10, 6)]);
      rga1.delete([tss(4, 5, 3)]);
      const rga2 = new StrNode(ts(5, 0));
      rga2.ins(ts(5, 0), ts(4, 5), 'YYYYYYYYYYY');
      rga2.ins(ts(5, 0), ts(4, 16), 'BBBBBBBBB');
      rga2.delete([tss(4, 10, 6)]);
      rga2.delete([tss(4, 5, 3)]);
      rga2.delete([tss(4, 6, 4)]);
      rga2.ins(ts(4, 11), ts(7, 81), 'AAAAAAAAAAAA');
      expect(rga2.view()).toBe(rga1.view());
    });

    test('fuzzer bug - do not set split link on a throway chunk', () => {
      const rga1 = new StrNode(ts(1, 0));
      const rga2 = new StrNode(ts(1, 0));
      rga1.ins(ts(1, 0), ts(100, 1), '\\[');
      rga2.ins(ts(1, 0), ts(100, 1), '\\[');
      rga1.ins(ts(1, 0), ts(200, 1), '____');
      rga2.ins(ts(1, 0), ts(200, 1), '____');
      rga1.ins(ts(200, 4), ts(200, 5), 'AAA');
      rga2.ins(ts(200, 4), ts(200, 5), 'AAA');
      rga1.ins(ts(1, 0), ts(100, 1), '\\[');
      rga2.ins(ts(1, 0), ts(100, 1), '\\[');
      rga1.ins(ts(1, 0), ts(200, 1), '"r3+');
      rga2.ins(ts(1, 0), ts(200, 1), '"r3+');
      rga1.ins(ts(200, 4), ts(100, 8), 'BBBBBBBB');
      rga2.ins(ts(200, 4), ts(100, 8), 'BBBBBBBB');
      rga1.ins(ts(200, 4), ts(200, 5), 'AAA');
      rga2.ins(ts(200, 4), ts(200, 5), 'AAA');
      rga1.ins(ts(200, 1), ts(100, 16), 'CCCCCCCCCC');
      rga2.ins(ts(200, 1), ts(100, 16), 'CCCCCCCCCC');
      rga1.ins(ts(200, 4), ts(100, 8), 'OO[zxfiC');
      rga2.ins(ts(200, 4), ts(100, 8), 'OO[zxfiC');
      rga1.delete([tss(200, 2, 4)]);
      rga2.delete([tss(200, 2, 4)]);
      rga1.ins(ts(100, 16), ts(100, 26), ')');
      rga1.ins(ts(200, 7), ts(200, 26), 'X');
      rga2.ins(ts(200, 7), ts(200, 26), 'X');
      rga2.ins(ts(100, 16), ts(100, 26), ')');
      expect(rga1.view()).toStrictEqual(rga2.view());
    });
  });

  //   describe('events', () => {
  //     test('calls .onchange on inserts and deletes', () => {
  //       const rga1 = new StrNode(ts(3, 0));
  //       let cnt = 0;
  //       rga1.onchange = () => cnt++;
  //       rga1.ins(ts(3, 0), ts(1, 2), 'bbbbbbbbbbbbbb');
  //       expect(cnt).toBe(1);
  //       rga1.ins(ts(3, 0), ts(1, 30), 'aaaaaaaaa');
  //       expect(cnt).toBe(2);
  //       rga1.delete([tss(1, 2, 14)]);
  //       expect(cnt).toBe(3);
  //     });
  //   });
});
