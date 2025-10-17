import {JsonPackExtension, JsonPackValue} from '@jsonjoy.com/json-pack/lib/msgpack';
import {msgpackSizeFast} from '../msgpackSizeFast';

test('computes size of single values', () => {
  expect(msgpackSizeFast(null)).toBe(1);
  expect(msgpackSizeFast(true)).toBe(1);
  expect(msgpackSizeFast(false)).toBe(1);
  expect(msgpackSizeFast(1)).toBe(9);
  expect(msgpackSizeFast(1.1)).toBe(9);
  expect(msgpackSizeFast('123')).toBe(7);
  expect(msgpackSizeFast('')).toBe(4);
  expect(msgpackSizeFast('A')).toBe(5);
  expect(msgpackSizeFast([])).toBe(2);
  expect(msgpackSizeFast({})).toBe(2);
  expect(msgpackSizeFast(new Uint8Array([1, 2, 3]))).toBe(5 + 3);
  expect(msgpackSizeFast(Buffer.from([1, 2, 3]))).toBe(5 + 3);
  expect(msgpackSizeFast(new JsonPackValue(Buffer.from([1, 2])))).toBe(2);
  expect(msgpackSizeFast(new JsonPackExtension(445, new Uint8Array([1, 2, 3, 4, 5])))).toBe(6 + 5);
});

test('computes size complex object', () => {
  const embedded = new JsonPackValue(Buffer.from([1, 2]));
  const extension = new JsonPackExtension(445, new Uint8Array([1, 2, 3]));

  // biome-ignore format: keep indentation
  const json = {                            // 2
    a: 1,                                   // 2 + 1 + 9
    b: true,                                // 2 + 1 + 1
    c: false,                               // 2 + 1 + 1
    d: null,                                // 2 + 1 + 1
    'e.e': 2.2,                             // 2 + 3 + 9
    f: '',                                  // 2 + 1 + 4 + 0
    g: 'asdf',                              // 2 + 1 + 4 + 4
    h: {                                    // 2 + 1 + 2
      foo: new Uint8Array([123]),           // 2 + 3 + 5 + 1
      s: embedded,                          // 2 + 1 + 2
      ext: extension,                       // 2 + 3 + 6 + 3
    },
    i: [                                    // 2 + 1 + 2
      1,                                    // 9
      true,                                 // 1
      false,                                // 1
      null,                                 // 1
      2.2,                                  // 9
      '',                                   // 4 + 0
      'asdf',                               // 4 + 4
      {},                                   // 2
      new Uint8Array([123]),                // 5 + 1
      extension,                            // 6 + 3
      embedded,                             // 2
    ],
    j: new Uint8Array([1, 2, 3]),           // 2 + 1 + 5 + 3
  };
  const size = msgpackSizeFast(json);

  // biome-ignore format: keep groups of additions
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
    2 + 3 + 5 + 1 +
    2 + 1 + 2 +
    2 + 3 + 6 + 3 +
    9 +
    1 +
    1 +
    1 +
    9 +
    4 + 0 +
    4 + 4 +
    2 +
    5 + 1 +
    6 + 3 +
    2 +
    2 + 1 + 5 + 3
  );
});
