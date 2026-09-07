import {CborDecoder} from '../CborDecoder';
import {hexToUint8Array} from './rfc8949-vectors';

const decoder = new CborDecoder();

/**
 * Inputs that are not well-formed CBOR per RFC 8949 §3.3, plus inputs that are
 * well-formed but truncated. Decoding any of them must throw rather than return
 * a value invented from bytes that are not there.
 */
// biome-ignore format: table
const illFormed: [string, string][] = [
  // ------------------------------------------------ reserved additional info
  ['reserved minor 28, unsigned', '1c'],
  ['reserved minor 29, unsigned', '1d'],
  ['reserved minor 30, unsigned', '1e'],
  ['indefinite minor 31, unsigned', '1f'],
  ['reserved minor 28, negative', '3c'],
  ['reserved minor 29, negative', '3d'],
  ['reserved minor 30, negative', '3e'],
  ['indefinite minor 31, negative', '3f'],
  ['reserved minor 28, byte string', '5c'],
  ['reserved minor 29, byte string', '5d'],
  ['reserved minor 30, byte string', '5e'],
  ['reserved minor 28, text string', '7c'],
  ['reserved minor 29, text string', '7d'],
  ['reserved minor 30, text string', '7e'],
  ['reserved minor 28, array', '9c'],
  ['reserved minor 29, array', '9d'],
  ['reserved minor 30, array', '9e'],
  ['reserved minor 28, map', 'bc'],
  ['reserved minor 29, map', 'bd'],
  ['reserved minor 30, map', 'be'],
  ['reserved minor 28, tag', 'dc'],
  ['reserved minor 29, tag', 'dd'],
  ['reserved minor 30, tag', 'de'],
  ['indefinite minor 31, tag', 'df'],
  ['reserved minor 28, simple', 'fc'],
  ['reserved minor 29, simple', 'fd'],
  ['reserved minor 30, simple', 'fe'],

  // The reserved values above stay ill-formed when the bytes an 8 byte header
  // would need are actually present, they must not decode as minor 27.
  ['reserved minor 28 with 8 payload bytes', '1c0000000000000005'],
  ['reserved minor 29 with 8 payload bytes', '1d0000000000000005'],
  ['reserved minor 30 with 8 payload bytes', '1e0000000000000005'],
  ['indefinite minor 31 with 8 payload bytes', '1f0000000000000005'],
  ['reserved negative minor 28 with payload', '3c0000000000000005'],

  // --------------------------------------------------------------- truncated
  ['empty input', ''],
  ['truncated uint8 header', '18'],
  ['truncated uint16 header', '1900'],
  ['truncated uint32 header', '1a000000'],
  ['truncated uint64 header', '1b00000000000000'],
  ['truncated negative header', '3900'],
  ['truncated f16', 'f900'],
  ['truncated f32', 'fa000000'],
  ['truncated f64', 'fb00000000000000'],
  ['truncated simple value', 'f8'],
  ['byte string shorter than its length', '4401'],
  ['text string shorter than its length', '6461'],
  ['byte string with a 4GB length', '5affffffff'],
  ['text string with a 4GB length', '7affffffff'],
  ['byte string with an 8 byte length', '5bffffffffffffffff'],
  ['array shorter than its length', '8301'],
  ['array with a huge length', '9affffffff01'],
  ['map shorter than its length', 'a26161'],
  ['map missing the last value', 'a26161016162'],
  ['map with a huge length', 'baffffffff616101'],
  ['tag without content', 'c1'],
  ['nested array truncated', '81818181'],
  ['indefinite array without break', '9f010203'],
  ['indefinite map without break', 'bf61610102'],
  ['indefinite text string without break', '7f6161'],
  ['indefinite byte string without break', '5f4101'],
  ['indefinite map with a key but no value', 'bf6161ff'],

  // ------------------------------------------------------------ misused break
  ['bare break', 'ff'],
  ['break as an array element of a definite array', '81ff'],
  ['break as a map key', 'a1ff01'],
  ['break as a map value', 'a16161ff'],
  ['break as tag content', 'c1ff'],

  // ---------------------------------------------------------- bad chunk types
  ['text chunk inside an indefinite byte string', '5f616100ff'],
  ['byte chunk inside an indefinite text string', '7f4161ff'],
  ['array inside an indefinite byte string', '5f8101ff'],
  ['nested indefinite text string', '7f7f6161ffff'],
  ['nested indefinite byte string', '5f5f4101ffff'],
];

describe('ill-formed input', () => {
  for (const [name, hex] of illFormed) {
    describe(name, () => {
      test('decode() throws', () => {
        expect(() => decoder.decode(hexToUint8Array(hex))).toThrow();
      });

      test('validate() throws', () => {
        expect(() => decoder.validate(hexToUint8Array(hex))).toThrow();
      });

      test('decodeLevel() throws', () => {
        expect(() => decoder.decodeLevel(hexToUint8Array(hex))).toThrow();
      });

      test('does not allocate a buffer larger than the input', () => {
        let decoded: unknown;
        try {
          decoded = decoder.decode(hexToUint8Array(hex));
        } catch {
          return;
        }
        if (decoded instanceof Uint8Array) expect(decoded.length).toBeLessThanOrEqual(hex.length >> 1);
      });
    });
  }
});

describe('well-formed but unusual input', () => {
  test('accepts a byte string of the maximum inline length', () => {
    const hex = `57${'ff'.repeat(23)}`;
    expect(decoder.decode(hexToUint8Array(hex))).toStrictEqual(new Uint8Array(23).fill(0xff));
  });

  test('accepts non-canonical length headers', () => {
    expect(decoder.decode(hexToUint8Array('1800'))).toBe(0);
    expect(decoder.decode(hexToUint8Array('190000'))).toBe(0);
    expect(decoder.decode(hexToUint8Array('1a00000000'))).toBe(0);
    expect(decoder.decode(hexToUint8Array('1b0000000000000000'))).toBe(0);
    expect(decoder.decode(hexToUint8Array('780161'))).toBe('a');
    expect(decoder.decode(hexToUint8Array('79000161'))).toBe('a');
  });

  test('accepts trailing bytes after a complete value', () => {
    expect(decoder.decode(hexToUint8Array('01ffffff'))).toBe(1);
  });

  test('validate() rejects trailing bytes after a complete value', () => {
    expect(() => decoder.validate(hexToUint8Array('01ffffff'))).toThrow();
  });

  test('accepts an empty indefinite byte string and text string', () => {
    expect(decoder.decode(hexToUint8Array('5fff'))).toStrictEqual(new Uint8Array(0));
    expect(decoder.decode(hexToUint8Array('7fff'))).toBe('');
  });

  test('accepts an empty indefinite map', () => {
    expect(decoder.decode(hexToUint8Array('bfff'))).toStrictEqual({});
  });

  test('duplicate map keys resolve to the last one', () => {
    expect(decoder.decode(hexToUint8Array('a2616101616102'))).toStrictEqual({a: 2});
    expect(decoder.decode(hexToUint8Array('bf616101616102ff'))).toStrictEqual({a: 2});
  });

  test('decodes 64 bit integers at the safe integer boundary', () => {
    expect(decoder.decode(hexToUint8Array('1b001fffffffffffff'))).toBe(Number.MAX_SAFE_INTEGER);
    expect(decoder.decode(hexToUint8Array('1b0020000000000000'))).toBe(BigInt('9007199254740992'));
    expect(decoder.decode(hexToUint8Array('3b001ffffffffffffe'))).toBe(Number.MIN_SAFE_INTEGER);
    expect(decoder.decode(hexToUint8Array('3b001fffffffffffff'))).toBe(BigInt('-9007199254740992'));
    expect(decoder.decode(hexToUint8Array('1bffffffffffffffff'))).toBe(BigInt('18446744073709551615'));
    expect(decoder.decode(hexToUint8Array('3bffffffffffffffff'))).toBe(BigInt('-18446744073709551616'));
  });

  test('decodes half precision floats, including subnormals and specials', () => {
    expect(decoder.decode(hexToUint8Array('f90000'))).toBe(0);
    expect(Object.is(decoder.decode(hexToUint8Array('f98000')), -0)).toBe(true);
    // The smallest f16 subnormal is 2^-24, the largest is 1023 * 2^-24.
    expect(decoder.decode(hexToUint8Array('f90001'))).toBe(2 ** -24);
    expect(decoder.decode(hexToUint8Array('f903ff'))).toBe(1023 * 2 ** -24);
    expect(decoder.decode(hexToUint8Array('f97bff'))).toBe(65504);
    expect(decoder.decode(hexToUint8Array('f97c00'))).toBe(Infinity);
    expect(decoder.decode(hexToUint8Array('f9fc00'))).toBe(-Infinity);
    expect(decoder.decode(hexToUint8Array('f97e00'))).toBe(NaN);
  });
});

describe('deeply nested input', () => {
  const nest = (depth: number, header: number, leaf: number[] = [0x01]): Uint8Array => {
    const uint8 = new Uint8Array(depth + leaf.length);
    uint8.fill(header, 0, depth);
    uint8.set(leaf, depth);
    return uint8;
  };

  test('decodes nesting the JS stack can hold', () => {
    const decoded = decoder.decode(nest(300, 0x81)) as unknown[];
    let level = decoded;
    for (let i = 0; i < 300; i++) level = level[0] as unknown[];
    expect(level as unknown).toBe(1);
  });

  /**
   * Asserts a stack overflow without `toThrow(RangeError)`, which compares by
   * `instanceof` and is unreliable here: the error is raised inside the module's
   * realm, and how much stack is left when it lands varies between a focused run
   * and a full suite run.
   */
  const expectStackOverflow = (fn: () => void) => {
    let error: unknown;
    try {
      fn();
    } catch (err) {
      error = err;
    }
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).name).toBe('RangeError');
    expect((error as Error).message).toContain('call stack');
  };

  test('throws instead of hanging on nesting deeper than the JS stack', () => {
    expectStackOverflow(() => decoder.decode(nest(1e6, 0x81)));
  });

  test('skipAny() throws instead of hanging on deep nesting', () => {
    expectStackOverflow(() => decoder.validate(nest(1e6, 0x81)));
  });

  test('throws instead of hanging on deeply nested tags', () => {
    expectStackOverflow(() => decoder.decode(nest(1e6, 0xc1)));
  });
});
