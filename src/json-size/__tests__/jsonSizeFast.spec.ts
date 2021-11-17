import {jsonSizeFast} from '../jsonSizeFast';

test('computes size of single values', () => {
  expect(jsonSizeFast(null)).toBe(1);
  expect(jsonSizeFast(true)).toBe(1);
  expect(jsonSizeFast(false)).toBe(1);
  expect(jsonSizeFast(1)).toBe(9);
  expect(jsonSizeFast(1.1)).toBe(9);
  expect(jsonSizeFast('123')).toBe(7);
  expect(jsonSizeFast('')).toBe(4);
  expect(jsonSizeFast('A')).toBe(5);
  expect(jsonSizeFast([])).toBe(2);
  expect(jsonSizeFast({})).toBe(2);
});

test('computes size complex object', () => {
  // prettier-ignore
  const json = {        // 2
    a: 1,               // 2 + 1 + 9
    b: true,            // 2 + 1 + 1
    c: false,           // 2 + 1 + 1
    d: null,            // 2 + 1 + 1
    'e.e': 2.2,         // 2 + 3 + 9
    f: '',              // 2 + 1 + 4 + 0
    g: 'asdf',          // 2 + 1 + 4 + 4
    h: {},              // 2 + 1 + 2
    i: [                // 2 + 1 + 2
      1,                // 9
      true,             // 1
      false,            // 1
      null,             // 1
      2.2,              // 9
      '',               // 4 + 0
      'asdf',           // 4 + 4
      {},               // 2
    ],
  };
  const size = jsonSizeFast(json);

  // prettier-ignore
  expect(size).toBe(
    2 +
    2 + 1 + 9 +
    2 + 1 + 1 +
    2 + 1 + 1 +
    2 + 1 + 1 +
    2 + 3 + 9 +
    2 + 1 + 4 + 0 +
    2 + 1 + 4 + 4 +
    2 + 1 + 2 +
    2 + 1 + 2 +
    9 +
    1 +
    1 +
    1 +
    9 +
    4 + 0 +
    4 + 4 +
    2
  );
});
