import {Tree} from '../Tree';
import {TreeNode} from '../TreeNode';
import {ITreeNode} from '../types';
import {find, findOrNextLower, insert, insertLeft, insertRight, remove, size} from '../util';
import {splay} from '../splay/util';

type TNode = ITreeNode<number, string>;
const comparator = (a: number, b: number): number => a - b;

describe('insert()', () => {
  test('can set root', () => {
    let root: TNode | undefined = undefined;
    const node = new TreeNode(1, 'a');
    root = insert(root, node, comparator);
    expect(root).toBe(node);
  });

  test('can insert after root', () => {
    let root: TNode | undefined = undefined;
    const node1 = new TreeNode(1, 'a');
    const node2 = new TreeNode(2, 'b');
    root = insert(root, node1, comparator);
    root = insert(root, node2, comparator);
    expect(root.r).toBe(node2);
  });

  test('can insert before root', () => {
    let root: TNode | undefined = undefined;
    const node1 = new TreeNode(1, 'a');
    const node2 = new TreeNode(2, 'b');
    const node3 = new TreeNode(-1, 'b');
    root = insert(root, node1, comparator);
    root = insert(root, node2, comparator);
    root = insert(root, node3, comparator);
    expect(root.l).toBe(node3);
  });

  test('can insert twice before', () => {
    let root: TNode | undefined = undefined;
    const node1 = new TreeNode(1, 'a');
    const node2 = new TreeNode(0, 'b');
    const node3 = new TreeNode(-1, 'c');
    root = insert(root, node1, comparator);
    root = insert(root, node2, comparator);
    root = insert(root, node3, comparator);
    expect(root).toBe(node1);
    expect(root.l).toBe(node2);
    expect(root.l!.l).toBe(node3);
  });

  test('can insert twice after', () => {
    let root: TNode | undefined = undefined;
    const node1 = new TreeNode(1, 'a');
    const node2 = new TreeNode(2, 'b');
    const node3 = new TreeNode(3, 'c');
    root = insert(root, node1, comparator);
    root = insert(root, node2, comparator);
    root = insert(root, node3, comparator);
    expect(root).toBe(node1);
    expect(root.r).toBe(node2);
    expect(root.r!.r).toBe(node3);
  });

  test('can insert zig-zag', () => {
    let root: TNode | undefined = undefined;
    const node1 = new TreeNode(1, 'a');
    const node2 = new TreeNode(3, 'b');
    const node3 = new TreeNode(2, 'c');
    root = insert(root, node1, comparator);
    root = insert(root, node2, comparator);
    root = insert(root, node3, comparator);
    expect(root).toBe(node1);
    expect(root.r).toBe(node2);
    expect(root.r!.l).toBe(node3);
  });

  test('can insert zig-zag-zig', () => {
    let root: TNode | undefined = undefined;
    const node1 = new TreeNode(1, 'a');
    const node2 = new TreeNode(5, 'b');
    const node3 = new TreeNode(2, 'c');
    const node4 = new TreeNode(3, 'c');
    root = insert(root, node1, comparator);
    root = insert(root, node2, comparator);
    root = insert(root, node3, comparator);
    root = insert(root, node4, comparator);
    expect(root).toBe(node1);
    expect(root.r).toBe(node2);
    expect(root.r!.l).toBe(node3);
    expect(root.r!.l!.r).toBe(node4);
  });
});

describe('find()', () => {
  test('can find element', () => {
    let root: TNode | undefined = undefined;
    const node1 = new TreeNode(1, 'a');
    const node2 = new TreeNode(5, 'b');
    const node3 = new TreeNode(2, 'c');
    const node4 = new TreeNode(3, 'c');
    root = insert(root, node1, comparator);
    root = insert(root, node2, comparator);
    root = insert(root, node3, comparator);
    root = insert(root, node4, comparator);
    expect(find(root, 3, comparator)?.v).toBe('c');
    expect(find(root, 5, comparator)?.v).toBe('b');
    expect(find(root, 1, comparator)?.v).toBe('a');
  });
});

describe('findOrNextLower()', () => {
  test('can find element', () => {
    let root: TNode | undefined = undefined;
    const node1 = new TreeNode(1, 'a');
    const node2 = new TreeNode(5, 'b');
    const node3 = new TreeNode(2, 'c');
    const node4 = new TreeNode(3, 'c');
    root = insert(root, node1, comparator);
    root = insert(root, node2, comparator);
    root = insert(root, node3, comparator);
    root = insert(root, node4, comparator);
    expect(findOrNextLower(root, 3, comparator)?.v).toBe('c');
    expect(findOrNextLower(root, 5, comparator)?.v).toBe('b');
    expect(findOrNextLower(root, 1, comparator)?.v).toBe('a');
  });

  test('returns next lower element', () => {
    let root: TNode | undefined = undefined;
    const node1 = new TreeNode(1, 'a');
    const node2 = new TreeNode(5, 'b');
    const node3 = new TreeNode(2, 'c');
    const node4 = new TreeNode(3, 'c');
    root = insert(root, node1, comparator);
    root = insert(root, node2, comparator);
    root = insert(root, node3, comparator);
    root = insert(root, node4, comparator);
    expect(findOrNextLower(root, 4, comparator)?.v).toBe('c');
    expect(findOrNextLower(root, 6, comparator)?.v).toBe('b');
    expect(findOrNextLower(root, 7, comparator)?.v).toBe('b');
    expect(findOrNextLower(root, 1, comparator)?.v).toBe('a');
    expect(findOrNextLower(root, 2, comparator)?.v).toBe('c');
    expect(findOrNextLower(root, 0, comparator)?.v).toBe(undefined);
    expect(findOrNextLower(root, -123, comparator)?.v).toBe(undefined);
  });
});

describe('remove()', () => {
  test('can find element', () => {
    let root: TNode | undefined = undefined;
    const node1 = new TreeNode(1, 'a');
    const node2 = new TreeNode(5, 'b');
    const node3 = new TreeNode(2, 'c');
    const node4 = new TreeNode(3, 'c');
    root = insert(root, node1, comparator);
    root = insert(root, node2, comparator);
    root = insert(root, node3, comparator);
    root = insert(root, node4, comparator);
    root = remove(root, node3);
    expect(find(root, 2, comparator)?.v).toBe(undefined);
    expect(find(root, 1, comparator)?.v).toBe('a');
    expect(find(root, 5, comparator)?.v).toBe('b');
    expect(find(root, 3, comparator)?.v).toBe('c');
  });
});

describe('splay()', () => {
  test('keeps all 4 elements in the tree', () => {
    const tree = new Tree();
    const node0 = new TreeNode(0, '0');
    tree.root = node0;
    const node3 = new TreeNode(3, '3');
    insertRight(node3, node0);
    const node2 = new TreeNode(2, '2');
    insertLeft(node2, node3);
    const node4 = new TreeNode(4, '4');
    insertRight(node4, node3);
    // console.log(tree + '');
    tree.root = splay(tree.root, node4, 5);
    // console.log(tree + '');
    expect(size(tree.root)).toBe(4);
  });
});
