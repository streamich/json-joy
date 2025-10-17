import {toTree} from '../toTree';

test('can format primitive values', () => {
  expect(toTree(null)).toBe('!n');
  expect(toTree(true)).toBe('!t');
  expect(toTree(false)).toBe('!f');
  expect(toTree(123)).toBe('123');
  expect(toTree(-3.14)).toBe('-3.14');
  expect(toTree('')).toBe('""');
  expect(toTree('abc')).toBe('"abc"');
});

test('can format simple array', () => {
  expect(toTree([1, 2, 3])).toMatchInlineSnapshot(`
    "├─ [0]: 1
    ├─ [1]: 2
    └─ [2]: 3"
  `);
});

test('can format empty array', () => {
  expect(toTree([])).toMatchInlineSnapshot(`"[]"`);
});

test('can format simple object', () => {
  expect(toTree({foo: 'bar'})).toMatchInlineSnapshot(`"└─ foo = "bar""`);
});

test('can format empty object', () => {
  expect(toTree({foo: {}})).toMatchInlineSnapshot(`"└─ foo = {}"`);
});

test('can format empty array', () => {
  expect(toTree({foo: []})).toMatchInlineSnapshot(`"└─ foo = []"`);
});

test('object in array', () => {
  expect(toTree({foo: [{}]})).toMatchInlineSnapshot(`
    "└─ foo
       └─ [0]: {}"
  `);
});

test('can format complex object', () => {
  expect(toTree([{foo: 'bar'}, {key: [1, 2, null, true, false]}])).toMatchInlineSnapshot(`
    "├─ [0]
    │   └─ foo = "bar"
    └─ [1]
        └─ key
           ├─ [0]: 1
           ├─ [1]: 2
           ├─ [2]: !n
           ├─ [3]: !t
           └─ [4]: !f"
  `);
});
