import {CborDecoder} from '../CborDecoder';
import {CborEncoder} from '../CborEncoder';
import {CborEncoderStable} from '../CborEncoderStable';
import {hexToUint8Array, uint8ArrayToHex, vectors} from './rfc8949-vectors';

const decoder = new CborDecoder();
const encoder = new CborEncoder();
const stable = new CborEncoderStable();

/** `-0` re-encodes to the integer `0`, like `JSON.stringify` and `cborg` do. */
const normalizeZero = (value: unknown): unknown => (Object.is(value, -0) ? 0 : value);

describe('RFC 8949 Appendix A vectors', () => {
  describe('decoding', () => {
    for (const vector of vectors) {
      test(vector.diagnostic, () => {
        expect(decoder.decode(hexToUint8Array(vector.hex))).toStrictEqual(vector.value);
      });
    }
  });

  describe('re-encoding', () => {
    for (const vector of vectors) {
      test(`${vector.diagnostic}${vector.canonical ? '' : ' (not byte identical)'}`, () => {
        const value = decoder.decode(hexToUint8Array(vector.hex));
        const hex = uint8ArrayToHex(encoder.encode(value));
        if (vector.canonical) expect(hex).toBe(vector.hex);
        else expect(hex).not.toBe(vector.hex);
        // Whether or not the bytes match, the value must survive the round-trip.
        expect(decoder.decode(hexToUint8Array(hex))).toStrictEqual(normalizeZero(value));
      });
    }
  });

  describe('validation', () => {
    for (const vector of vectors) {
      test(vector.diagnostic, () => {
        const uint8 = hexToUint8Array(vector.hex);
        expect(() => decoder.validate(uint8)).not.toThrow();
      });
    }
  });

  describe('skipping', () => {
    for (const vector of vectors) {
      test(vector.diagnostic, () => {
        const uint8 = hexToUint8Array(vector.hex);
        decoder.reader.reset(uint8);
        decoder.skipAny();
        expect(decoder.reader.x).toBe(uint8.length);
      });
    }
  });

  test('the vector table covers every major type', () => {
    const majors = new Set<number>();
    for (const vector of vectors) majors.add(hexToUint8Array(vector.hex)[0] >> 5);
    expect(majors.size).toBe(8);
  });
});

describe('deterministic encoding, RFC 8949 §4.2.1', () => {
  test('integers use the shortest form', () => {
    const cases: [number | bigint, string][] = [
      [0, '00'],
      [23, '17'],
      [24, '1818'],
      [255, '18ff'],
      [256, '190100'],
      [65535, '19ffff'],
      [65536, '1a00010000'],
      [4294967295, '1affffffff'],
      [4294967296, '1b0000000100000000'],
      [-1, '20'],
      [-24, '37'],
      [-25, '3818'],
      [-256, '38ff'],
      [-257, '390100'],
      [-65536, '39ffff'],
      [-65537, '3a00010000'],
      [-4294967296, '3affffffff'],
      [-4294967297, '3b0000000100000000'],
    ];
    for (const [value, hex] of cases) expect(uint8ArrayToHex(stable.encode(value))).toBe(hex);
  });

  test('strings, arrays and maps use the shortest length header', () => {
    expect(uint8ArrayToHex(stable.encode('a'.repeat(23)))).toBe(`77${'61'.repeat(23)}`);
    expect(uint8ArrayToHex(stable.encode('a'.repeat(24))).slice(0, 4)).toBe('7818');
    expect(uint8ArrayToHex(stable.encode(new Array(23).fill(0))).slice(0, 2)).toBe('97');
    expect(uint8ArrayToHex(stable.encode(new Array(24).fill(0))).slice(0, 4)).toBe('9818');
  });

  test('floats that are safe integers are encoded as integers', () => {
    expect(uint8ArrayToHex(stable.encode(1.0))).toBe('01');
    expect(uint8ArrayToHex(stable.encode(-1.0))).toBe('20');
  });

  test('-0 is normalized to the integer 0', () => {
    expect(uint8ArrayToHex(stable.encode(-0))).toBe('00');
    expect(uint8ArrayToHex(encoder.encode(-0))).toBe('00');
    expect(Object.is(decoder.decode(stable.encode(-0)), 0)).toBe(true);
  });
});
