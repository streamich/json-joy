import {IonEncoderFast} from '../IonEncoderFast';
import {makeBinaryWriter, dom} from 'ion-js';

const encode = (value: unknown): Uint8Array => {
  const writer = makeBinaryWriter();
  dom.Value.from(value)?.writeTo(writer);
  writer.close();
  return writer.getBytes();
};

const encoder = new IonEncoderFast();

describe('tokens', () => {
  const tokens: unknown[] = [true, false, null];

  for (const bool of tokens) {
    test(`${bool}`, () => {
      const encoded = encoder.encode(bool);
      expect(encoded).toEqual(encode(bool));
    });
  }
});

describe('integers', () => {
  const ints: number[] = [
    0,
    1,
    2,
    3,
    128,
    254,
    255,
    256,
    257,
    65535,
    2 ** 16 - 2,
    2 ** 16 - 1,
    2 ** 16 - 0,
    2 ** 16 + 1,
    2 ** 16 + 2,
    2 ** 24 - 2,
    2 ** 24 - 1,
    2 ** 24 - 0,
    2 ** 24 + 1,
    2 ** 24 + 2,
    2 ** 32 - 2,
    2 ** 32 - 1,
    2 ** 32 - 0,
    2 ** 32 + 1,
    2 ** 32 + 2,
    2 ** 40 - 2,
    2 ** 40 - 0,
    2 ** 40 + 1,
    2 ** 40 + 2,
    2 ** 48 - 2,
    2 ** 48 - 1,
    2 ** 48 - 0,
    2 ** 48 + 1,
    2 ** 48 + 2,
    2 ** 53 - 1,
  ];

  for (const value of ints) {
    test(`${value}`, () => {
      const encoded = encoder.encode(value);
      expect(encoded).toEqual(encode(value));
    });
  }
  for (const value of ints) {
    test(`${-value}`, () => {
      const encoded = encoder.encode(-value);
      expect(encoded).toEqual(encode(-value));
    });
  }
});

describe('floats', () => {
  const values: number[] = [
    0.1,
    0.2,
    0.3,
    0.4,
    0.5,
    0.6,
    0.7,
    0.8,
    0.9,
    0.123,
    0.1234,
    0.12345,
    1.1,
    123.123,
    3.14,
    Math.PI,
    4.23,
    7.22,
  ];

  for (const value of values) {
    test(`${value}`, () => {
      const encoded = encoder.encode(value);
      expect(encoded).toEqual(encode(value));
    });
  }
  for (const value of values) {
    test(`${-value}`, () => {
      const encoded = encoder.encode(-value);
      expect(encoded).toEqual(encode(-value));
    });
  }
});

describe('strings', () => {
  const values: string[] = [
    '',
    'a',
    'ab',
    'abc',
    'abcd',
    'abcde',
    'abcdef',
    'abcdefg',
    'abcdefgh',
    'abcdefghi',
    'abcdefghij',
    'abcdefghijk',
    'abcdefghijkl',
    'abcdefghijklm',
    'abcdefghijklmn',
    'abcdefghijklmno',
    'abcdefghijklmnop',
    'abcdefghijklmnopq',
    'abcdefghijklmnopqr',
    'abcdefghijklmnopqrs',
    'abcdefghijklmnopqrst',
    'abcdefghijklmnopqrstu',
    'abcdefghijklmnopqrstuv',
    'abcdefghijklmnopqrstuvw',
    'abcdefghijklmnopqrstuvwx',
    'abcdefghijklmnopqrstuvwxy',
    'abcdefghijklmnopqrstuvwxyz',
    '01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567',
    'a'.repeat(20000),
  ];

  for (const value of values) {
    test(`${value.substring(0, 80)}`, () => {
      const encoded = encoder.encode(value);
      const expected = encode(value);
      // console.log(encoded);
      // console.log(expected);
      expect(encoded).toEqual(expected);
    });
  }
});

describe('binary', () => {
  const values: Uint8Array[] = [
    new Uint8Array(),
    new Uint8Array([0]),
    new Uint8Array([1, 2, 3]),
    new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]),
    new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]),
  ];

  for (const value of values) {
    test(`${value}`, () => {
      const encoded = encoder.encode(value);
      const expected = encode(value);
      // console.log(encoded);
      // console.log(expected);
      expect(encoded).toEqual(expected);
    });
  }
});

describe('arrays', () => {
  const values: unknown[][] = [
    [],
    [''],
    ['asdf'],
    [0],
    [0, 0, 0],
    [0, 1],
    [1, 2, 3, 4, 5, 6],
    [1, 2, 3, 4, 5, 6, 7],
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    [[]],
    [[1, 2, 3]],
    [[1, 2, 3, 'x'], 'asdf', null, false, true],
  ];

  for (const value of values) {
    test(`${JSON.stringify(value)}`, () => {
      const encoded = encoder.encode(value);
      expect(encoded).toEqual(encode(value));
    });
  }
});

describe('objects', () => {
  const values: object[] = [
    {},
    {a: 1},
    {a: 'b', foo: 'bar'},
    {a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 10, k: 11, l: 12, m: 13, n: 14, o: 15, p: 16},
    {
      foo: [
        'bar',
        1,
        null,
        {
          a: 'gg',
          d: 123,
        },
      ],
    },
  ];

  for (const value of values) {
    test(`${JSON.stringify(value)}`, () => {
      const encoded = encoder.encode(value);
      const expected = encode(value);
      // console.log(encoded);
      // console.log(expected);
      expect(encoded).toEqual(expected);
    });
  }
});
