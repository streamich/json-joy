import {Tree} from '../Tree';

test('works', () => {
  const tree = new Tree<number, string>();
  expect(tree.size).toBe(0);
  tree.set(1, 'a');
  expect(tree.size).toBe(1);
  expect(tree.get(1)).toBe('a');
  expect(tree.getOrNextLower(1)).toBe('a');
  expect(tree.getOrNextLower(2)).toBe('a');
  tree.set(5, 'b');
  expect(tree.get(1)).toBe('a');
  expect(tree.get(5)).toBe('b');
  expect(tree.getOrNextLower(2)).toBe('a');
  expect(tree.getOrNextLower(5)).toBe('b');
  expect(tree.getOrNextLower(6)).toBe('b');
  tree.set(6, 'c');
  expect(tree.getOrNextLower(6)).toBe('c');
  expect(tree.getOrNextLower(6.1)).toBe('c');
  tree.set(5.5, 'd');
  expect(tree.getOrNextLower(5.5)).toBe('d');
  expect(tree.getOrNextLower(5.6)).toBe('d');
  tree.set(5.4, 'e');
  expect(tree.getOrNextLower(5.45)).toBe('e');
  tree.set(5.45, 'f');
  expect(tree.getOrNextLower(5.45)).toBe('f');
});
