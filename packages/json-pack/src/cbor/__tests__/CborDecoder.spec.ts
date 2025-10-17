import {CborEncoder} from '../CborEncoder';
import {CborDecoder} from '../CborDecoder';
import type {JsonPackExtension} from '../../JsonPackExtension';
import type {JsonPackValue} from '../../JsonPackValue';

const encoder = new CborEncoder();
const decoder = new CborDecoder();

describe('unsigned integer', () => {
  const uints: (number | bigint)[] = [
    0,
    6,
    23,
    24,
    25,
    55,
    111,
    166,
    200,
    222,
    255,
    256,
    444,
    1111,
    22222,
    55555,
    0xffff,
    0x10000,
    0xffffff,
    0xffffff,
    0xfffffff,
    0xffffffff,
    0x100000000,
    0xfffffffffffff,
    0x1fffffffffffff,
    BigInt('0x1ffffffffffffff'),
    BigInt('0x1ffffffffffffffA'),
  ];

  for (const num of uints) {
    test(`${num}`, () => {
      const encoded = encoder.encode(num);
      const decoded = decoder.decode(encoded);
      expect(decoded).toBe(num);
    });
  }
});

describe('signed integer', () => {
  const ints: (number | bigint)[] = [
    -1,
    -2,
    -4,
    -16,
    -23,
    -24,
    -26,
    -123,
    -4444,
    -44444,
    -66666,
    -33333333,
    -0xffff,
    -0x10000,
    -0xffffff,
    -0xffffff,
    -0xfffffff,
    -0xffffffff,
    -0x100000000,
    -0xfffffffffffff,
    -0x1fffffffffffff,
    BigInt('-12312312312312312232'),
  ];

  for (const num of ints) {
    test(`${num}`, () => {
      const encoded = encoder.encode(num);
      const decoded = decoder.decode(encoded);
      expect(decoded).toBe(num);
    });
  }
});

describe('binary', () => {
  const toUint8Array = (buf: Buffer): Uint8Array => {
    const uint8 = new Uint8Array(buf.length);
    buf.copy(uint8);
    return uint8;
  };

  const buffers: Uint8Array[] = [
    new Uint8Array([]),
    new Uint8Array([0]),
    new Uint8Array([1, 2, 3]),
    new Uint8Array([1, 2, 3, 4, 5]),
    toUint8Array(Buffer.alloc(1)),
    toUint8Array(Buffer.alloc(15)),
    toUint8Array(Buffer.alloc(23)),
    toUint8Array(Buffer.alloc(24)),
    toUint8Array(Buffer.alloc(25)),
    toUint8Array(Buffer.alloc(123)),
    toUint8Array(Buffer.alloc(255)),
    toUint8Array(Buffer.alloc(256, 2)),
    toUint8Array(Buffer.alloc(1024, 3)),
    toUint8Array(Buffer.alloc(66666, 5)),
  ];

  for (const val of buffers) {
    test(`${String(val).substring(0, 80)}`, () => {
      const encoded = encoder.encode(val);
      const decoded = decoder.decode(encoded);
      expect(decoded).toStrictEqual(val);
    });
  }

  test('indefinite length binary', () => {
    encoder.writer.reset();
    encoder.writeStartBin();
    encoder.writeBin(new Uint8Array([1, 2, 3]));
    encoder.writeBin(new Uint8Array([4, 5, 6]));
    encoder.writeBin(new Uint8Array([7, 8, 9]));
    encoder.writeEnd();
    const encoded = encoder.writer.flush();
    const decoded = decoder.decode(encoded);
    expect(decoded).toStrictEqual(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9]));
  });
});

describe('strings', () => {
  const strings: string[] = [
    '',
    'a',
    'b',
    '👍',
    'asdf',
    'asdfa adsf asdf a',
    'as 👍 df',
    'asdf asfd asdf asdf as',
    'asdf asfd 😱 asdf asdf 👀 as',
    'asdf asfasdfasdf asdf asdf d 😱 asdf asdfasdf asdf asdf asdf asdf asdfasdf asdf asdfasdfasdf asdf asdf asdfasdf asdf asdf asdf asdf asdfasdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asfd asdf asdf asdf sdf asdf asdf  👀 as',
  ];

  for (const num of strings) {
    test(`${num}`, () => {
      const encoded = encoder.encode(num);
      const decoded = decoder.decode(encoded);
      expect(decoded).toBe(num);
    });
  }

  test('indefinite length string', () => {
    encoder.writer.reset();
    encoder.writeStartStr();
    encoder.writeStr('abc');
    encoder.writeStr('def');
    encoder.writeStr('ghi');
    encoder.writeEnd();
    const encoded = encoder.writer.flush();
    const decoded = decoder.decode(encoded);
    expect(decoded).toStrictEqual('abcdefghi');
  });
});

describe('arrays', () => {
  const arrays: unknown[][] = [
    [],
    [0],
    [1, 2, 3],
    ['qwerty'],
    [1, 'a', -2],
    [1, 'a', -2, 'qwerty'],
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
    [[]],
    [[1, 2, 3]],
    [[[[[[[[]]]]]]]],
    JSON.parse('['.repeat(20) + ']'.repeat(20)),
    JSON.parse('['.repeat(50) + ']'.repeat(50)),
    JSON.parse('[' + '1,'.repeat(50) + '2]'),
    JSON.parse('[' + '1,'.repeat(150) + '2]'),
    JSON.parse('[' + '1,'.repeat(250) + '2]'),
    JSON.parse('[' + '1,'.repeat(350) + '2]'),
    JSON.parse('[' + '1,'.repeat(1250) + '2]'),
    JSON.parse('[' + '1,'.repeat(55250) + '2]'),
    JSON.parse('[' + '1,'.repeat(77250) + '2]'),
  ];

  for (const val of arrays) {
    test(`${JSON.stringify(val).substring(0, 80)} (${val.length})`, () => {
      const encoded = encoder.encode(val);
      const decoded = decoder.decode(encoded);
      expect(decoded).toStrictEqual(val);
    });
  }

  test('indefinite length array', () => {
    encoder.writer.reset();
    encoder.writeStartArr();
    encoder.writeArr([1, 2, 3]);
    encoder.writeArr([4, 5, 6]);
    encoder.writeArr([7, 8, 9]);
    encoder.writeEnd();
    const encoded = encoder.writer.flush();
    const decoded = decoder.decode(encoded);
    expect(decoded).toStrictEqual([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ]);
  });
});

describe('objects', () => {
  const objects: Record<string, unknown>[] = [
    {},
    {a: 'b'},
    {foo: 'bar'},
    {foo: 123},
    {foo: {}},
    {foo: {bar: {}}},
    {foo: {bar: {baz: {}}}},
    {foo: {bar: {baz: {quz: 'qux'}}}},
    {
      1: 1,
      2: 2,
      3: 3,
      4: 4,
      5: 5,
      6: 6,
      7: 7,
      8: 8,
      9: 9,
      10: 10,
      11: 11,
      12: 12,
      13: 13,
      14: 14,
      15: 15,
      16: 16,
      17: 17,
      18: 18,
      19: 19,
      20: 20,
      21: 21,
      22: 22,
    },
    {
      1: 1,
      2: 2,
      3: 3,
      4: 4,
      5: 5,
      6: 6,
      7: 7,
      8: 8,
      9: 9,
      10: 10,
      11: 11,
      12: 12,
      13: 13,
      14: 14,
      15: 15,
      16: 16,
      17: 17,
      18: 18,
      19: 19,
      20: 20,
      21: 21,
      22: 22,
      23: 23,
    },
    {
      1: 1,
      2: 2,
      3: 3,
      4: 4,
      5: 5,
      6: 6,
      7: 7,
      8: 8,
      9: 9,
      10: 10,
      11: 11,
      12: 12,
      13: 13,
      14: 14,
      15: 15,
      16: 16,
      17: 17,
      18: 18,
      19: 19,
      20: 20,
      21: 21,
      22: 22,
      23: 23,
      24: 24,
    },
  ];

  for (const val of objects) {
    test(`${JSON.stringify(val).substring(0, 80)} (${Object.keys(val).length})`, () => {
      const encoded = encoder.encode(val);
      const decoded = decoder.decode(encoded);
      expect(decoded).toStrictEqual(val);
    });
  }

  test('indefinite length object', () => {
    encoder.writer.reset();
    encoder.writeStartMap();
    encoder.writeAny('foo');
    encoder.writeAny(123);
    encoder.writeAny('bar');
    encoder.writeAny(4);
    encoder.writeEnd();
    const encoded = encoder.writer.flush();
    const decoded = decoder.decode(encoded);
    expect(decoded).toStrictEqual({foo: 123, bar: 4});
  });
});

describe('tags', () => {
  const testTag = (tag: number, value: unknown) => {
    test(`can encode a tag = ${tag}, value = ${value}`, () => {
      encoder.writer.reset();
      encoder.writeTag(9, 123);
      const encoded = encoder.writer.flush();
      const decoded = decoder.decode(encoded) as JsonPackExtension;
      expect(decoded.tag).toBe(9);
      expect(decoded.val).toBe(123);
    });
  };

  testTag(1, 1);
  testTag(5, []);
  testTag(23, 'adsf');
  testTag(24, 'adsf asdf');
  testTag(125, {});
  testTag(1256, {foo: 'bar'});
  testTag(0xfffff, {foo: 'bar'});
  testTag(0xffffff, {foo: 'bar'});
  testTag(0xfffffffff, {foo: 'bar'});
});

describe('tokens (simple values)', () => {
  const testToken = (token: number) => {
    test(`can encode a token = ${token}`, () => {
      encoder.writer.reset();
      encoder.writeTkn(token);
      const encoded = encoder.writer.flush();
      const decoded = decoder.decode(encoded) as JsonPackValue;
      expect(decoded.val).toBe(token);
    });
  };

  for (let i = 0; i <= 19; i++) testToken(i);

  const testNativeToken = (token: number, expected: unknown) => {
    test(`can encode a token = ${token}`, () => {
      encoder.writer.reset();
      encoder.writeTkn(token);
      const encoded = encoder.writer.flush();
      const decoded = decoder.decode(encoded) as JsonPackValue;
      expect(decoded).toBe(expected);
    });
  };

  testNativeToken(20, false);
  testNativeToken(21, true);
  testNativeToken(22, null);
  testNativeToken(23, undefined);

  const testJsTokens = (token: unknown) => {
    test(`can encode a token = ${token}`, () => {
      const encoded = encoder.encode(token);
      const decoded = decoder.decode(encoded);
      expect(decoded).toBe(token);
    });
  };

  testJsTokens(false);
  testJsTokens(true);
  testJsTokens(null);
  testJsTokens(undefined);
});

describe('maps', () => {
  const maps: Map<any, any>[] = [
    new Map(),
    new Map([['foo', 'bar']]),
    new Map<any, any>([
      ['foo', 'bar'],
      [1, 2],
      [true, false],
      [null, null],
    ]),
  ];

  for (const map of maps) {
    test(`{${[...map.entries()]}}`, () => {
      const encoded = encoder.encode(map);
      decoder.reader.reset(encoded);
      const decoded = decoder.readAsMap();
      expect(decoded).toStrictEqual(map);
    });
  }
});
