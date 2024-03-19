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

test('can walk through null', () => {
  const value = null;
  const nodes: unknown[] = [];
  walk(value, (node) => {
    nodes.push(node);
  });
  expect(nodes).toEqual([null]);
});

test('can walk empty object', () => {
  const value = {};
  const nodes: unknown[] = [];
  walk(value, (node) => {
    nodes.push(node);
  });
  expect(nodes).toEqual([{}]);
});

test('can walk empty array', () => {
  const value: any[] = [];
  const nodes: unknown[] = [];
  walk(value, (node) => {
    nodes.push(node);
  });
  expect(nodes).toEqual([[]]);
});
