import {walk} from '..';

test('can walk through a value', () => {
  const value = {
    a: 1,
    foo: [2, 'a', null, 3, true, false, new Set([1, 2]), new Map([['b', 3]])],
  };
  const nodes: unknown[] = [];
  walk(value, (node) => {
    nodes.push(node);
  });
  expect(nodes).toEqual([
    value,
    1,
    value.foo,
    2,
    'a',
    null,
    3,
    true,
    false,
    new Set([1, 2]),
    1,
    2,
    new Map([['b', 3]]),
    3,
  ]);
});
