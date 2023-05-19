import {RadixTree} from '../RadixTree';
import {TrieNode} from '../../trie/TrieNode';

describe('.set()', () => {
  test('starts empty', () => {
    const tree = new RadixTree();
    expect(tree.toRecord()).toStrictEqual({});
  });

  test('can insert a single entry', () => {
    const tree = new RadixTree();
    tree.set('foo', 'bar');
    expect(tree.toRecord()).toStrictEqual({foo: 'bar'});
  });

  test('can rewrite a single key', () => {
    const tree = new RadixTree();
    tree.set('foo', 'bar');
    tree.set('foo', 'baz');
    expect(tree.toRecord()).toStrictEqual({foo: 'baz'});
  });

  test('can insert two keys', () => {
    const tree = new RadixTree();
    tree.set('foo', 'bar');
    tree.set('baz', 'qux');
    expect(tree.toRecord()).toStrictEqual({foo: 'bar', baz: 'qux'});
  });

  test('can set prefixes of the first key', () => {
    const tree = new RadixTree();
    tree.set('foo', 1);
    tree.set('fo', 2);
    tree.set('f', 3);
    expect(tree.toRecord()).toStrictEqual({foo: 1, fo: 2, f: 3});
  });

  test('can insert an empty key', () => {
    const tree = new RadixTree();
    tree.set('', 1);
    expect(tree.toRecord()).toStrictEqual({'': 1});
  });

  test('can insert keys that contain the previous ones', () => {
    const tree = new RadixTree();
    tree.set('', 1);
    tree.set('f', 2);
    tree.set('fo', 3);
    tree.set('foo', 4);
    expect(tree.toRecord()).toStrictEqual({'': 1, f: 2, fo: 3, foo: 4});
  });

  test('can insert adjacent keys', () => {
    const tree = new RadixTree();
    tree.set('a', 1);
    tree.set('b', 2);
    tree.set('c', 3);
    tree.set('b1', 4);
    tree.set('b3', 5);
    tree.set('b2', 6);
    expect(tree.toRecord()).toStrictEqual({
      a: 1,
      b: 2,
      c: 3,
      b1: 4,
      b3: 5,
      b2: 6,
    });
  });
});

describe('.get()', () => {
  test('return "undefined" from empty tree', () => {
    const tree = new RadixTree();
    expect(tree.get('foo')).toBe(undefined);
  });

  test('return "undefined" if key is not found', () => {
    const tree = new RadixTree();
    tree.set('foo', 1);
    expect(tree.get('bar')).toBe(undefined);
  });

  test('can retrieve a single set key', () => {
    const tree = new RadixTree();
    tree.set('foo', 1);
    expect(tree.get('foo')).toBe(1);
  });

  test('can retrieve a single set key', () => {
    const tree = new RadixTree();
    tree.set('foo', 1);
    expect(tree.get('foo')).toBe(1);
  });

  test('can retrieve from multiple set keys', () => {
    const tree = new RadixTree();
    tree.set('fo', 1);
    tree.set('foo', 2);
    tree.set('f', 3);
    tree.set('bar', 4);
    tree.set('b', 5);
    tree.set('barr', 6);
    expect(tree.get('fo')).toBe(1);
    expect(tree.get('foo')).toBe(2);
    expect(tree.get('f')).toBe(3);
    expect(tree.get('bar')).toBe(4);
    expect(tree.get('b')).toBe(5);
    expect(tree.get('barr')).toBe(6);
  });
});

describe('.delete()', () => {
  test('can delete an existing key', () => {
    const tree = new RadixTree();
    tree.set('foo', 'bar');
    expect(tree.size).toBe(1);
    expect(tree.get('foo')).toBe('bar');
    tree.delete('foo');
    expect(tree.size).toBe(0);
    expect(tree.get('foo')).toBe(undefined);
  });

  test('can delete deeply nested trees', () => {
    const tree = new RadixTree();
    tree.set('bbb', 1);
    tree.set('bbbb', 2);
    tree.set('bb', 3);
    tree.set('bba', 4);
    tree.set('bbc', 5);
    tree.set('bbba', 6);
    tree.set('bbbc', 7);
    tree.set('aaa', 8);
    tree.set('abb', 9);
    tree.set('aab', 10);
    tree.set('ba', 11);
    tree.set('baa', 12);
    tree.set('bcc', 13);
    expect(tree.size).toBe(13);
    expect(tree.get('bbbb')).toBe(2);
    tree.delete('bbbb');
    expect(tree.size).toBe(12);
    expect(tree.get('bbbb')).toBe(undefined);
    expect(tree.get('bb')).toBe(3);
    tree.delete('bb');
    tree.delete('bb');
    expect(tree.size).toBe(11);
    expect(tree.get('bb')).toBe(undefined);
    expect(tree.get('bba')).toBe(4);
    tree.delete('bba');
    expect(tree.size).toBe(10);
    tree.delete('bbb');
    expect(tree.size).toBe(9);
    tree.delete('bbba');
    expect(tree.size).toBe(8);
    tree.delete('bbbc');
    tree.delete('bbbc');
    expect(tree.size).toBe(7);
    tree.delete('bbc');
    tree.delete('bbc');
    expect(tree.size).toBe(6);
    // console.log(tree + '');
  });
});

describe('.size', () => {
  test('increments when new keys are inserted', () => {
    const tree = new RadixTree();
    expect(tree.size).toBe(0);
    tree.set('foo', 1);
    expect(tree.size).toBe(1);
    tree.set('bar', 1);
    expect(tree.size).toBe(2);
  });

  test('does not increment the size when value is overwritten', () => {
    const tree = new RadixTree();
    tree.set('foo', 1);
    expect(tree.size).toBe(1);
    tree.set('foo', 1);
    expect(tree.size).toBe(1);
  });
});

describe('.forChildren()', () => {
  test('can iterate through root level nodes', () => {
    const tree = new RadixTree();
    tree.set('foo', 1);
    tree.set('fo', 2);
    tree.set('bar', 3);
    const res: TrieNode[] = [];
    tree.forChildren((child) => res.push(child));
    expect(res.length).toBe(2);
    expect(res[0].k).toBe('bar');
    expect(res[1].k).toBe('fo');
  });
});

describe('router', () => {
  test('can add HTTP routes', () => {
    const tree = new RadixTree();
    tree.set('GET /users', 1);
    tree.set('GET /files', 2);
    tree.set('PUT /files', 3);
    expect(tree.get('GET /users')).toBe(1);
    expect(tree.get('GET /files')).toBe(2);
    expect(tree.get('PUT /files')).toBe(3);
    tree.set('POST /files', 4);
    expect(tree.size).toBe(4);
    expect(tree.get('GET /users')).toBe(1);
    expect(tree.get('GET /files')).toBe(2);
    expect(tree.get('PUT /files')).toBe(3);
    expect(tree.get('POST /files')).toBe(4);
    tree.set('POST /posts', 5);
    expect(tree.get('GET /users')).toBe(1);
    expect(tree.get('GET /files')).toBe(2);
    expect(tree.get('PUT /files')).toBe(3);
    expect(tree.get('POST /files')).toBe(4);
    expect(tree.get('POST /posts')).toBe(5);
  });
});
