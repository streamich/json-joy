import {TrieNode} from '../../trie/TrieNode';
import {insert} from '../radix';
import {first, last} from '../../util';

test('can insert a node with no common prefix', () => {
  const root = new TrieNode('', undefined);
  let cnt_ = 0;
  const cnt = () => cnt_++;
  insert(root, 'abc', cnt());
  insert(root, 'abcd', cnt());
  insert(root, 'abcde', cnt());
  insert(root, 'abcdx', cnt());
  insert(root, 'g', cnt());
  insert(root, 'gg', cnt());
  insert(root, 'ga', cnt());
  insert(root, 'gb', cnt());
  insert(root, 'gc', cnt());
  insert(root, 'gd', cnt());
  insert(root, 'ge', cnt());
  insert(root, 'gf', cnt());
  insert(root, 'gg', cnt());
  insert(root, 'gh', cnt());
  insert(root, 'gh', cnt());
  insert(root, 'aa', cnt());
  insert(root, 'aa', cnt());
  insert(root, 'aaa', cnt());
  insert(root, 'aaa', cnt());
  expect(root.toRecord()).toMatchObject({
    abc: 0,
    abcd: 1,
    abcde: 2,
    abcdx: 3,
    aa: 16,
    aaa: 18,
    g: 4,
    ga: 6,
    gb: 7,
    gc: 8,
    gd: 9,
    ge: 10,
    gf: 11,
    gg: 12,
    gh: 14,
  });
});

test('constructs common prefix', () => {
  const root = new TrieNode('', undefined);
  insert(root, 'GET /users/{user}', 1);
  insert(root, 'GET /posts/{post}', 2);
  expect(first(root.children)).toBe(last(root.children));
  const child = first(root.children);
  expect(child?.k).toBe('GET /');
  expect(child?.v).toBe(undefined);
  expect(child?.p).toBe(undefined);
  expect(child?.l).toBe(undefined);
  expect(child?.r).toBe(undefined);
  expect(child?.children).not.toBe(undefined);
  expect(first(child?.children!)!.k).toBe('posts/{post}');
  expect(last(child?.children!)!.k).toBe('users/{user}');
});

test('constructs common prefix from HTTP routes', () => {
  const root = new TrieNode('', undefined);
  insert(root, 'GET /users', 1);
  insert(root, 'POST /users', 2);
  insert(root, 'PUT /users', 3);
  expect(root.toRecord()).toMatchObject({
    'GET /users': 1,
    'POST /users': 2,
    'PUT /users': 3,
  });
});
