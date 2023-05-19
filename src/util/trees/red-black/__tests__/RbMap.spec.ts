import {RbMap} from '../RbMap';

test('smoke test', () => {
  const tree = new RbMap<number, number>();
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
