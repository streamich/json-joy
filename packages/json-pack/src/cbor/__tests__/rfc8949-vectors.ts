import {JsonPackExtension} from '../../JsonPackExtension';
import {JsonPackValue} from '../../JsonPackValue';

/**
 * Test vectors from RFC 8949 Appendix A, "Examples of Encoded CBOR Data Items".
 *
 * https://www.rfc-editor.org/rfc/rfc8949.html#name-examples-of-encoded-cbor-da
 */
export interface CborVector {
  /** RFC diagnostic notation. */
  readonly diagnostic: string;
  /** Hex encoding of the CBOR item. */
  readonly hex: string;
  /** Value this codec decodes the item to. */
  readonly value: unknown;
  /** Whether `CborEncoder` re-encodes `value` to exactly `hex`. */
  readonly canonical: boolean;
}

const bignum = new Uint8Array([1, 0, 0, 0, 0, 0, 0, 0, 0]);

// biome-ignore format: table
export const vectors: CborVector[] = [
  // ------------------------------------------------------------------ integers
  {diagnostic: '0', hex: '00', value: 0, canonical: true},
  {diagnostic: '1', hex: '01', value: 1, canonical: true},
  {diagnostic: '10', hex: '0a', value: 10, canonical: true},
  {diagnostic: '23', hex: '17', value: 23, canonical: true},
  {diagnostic: '24', hex: '1818', value: 24, canonical: true},
  {diagnostic: '25', hex: '1819', value: 25, canonical: true},
  {diagnostic: '100', hex: '1864', value: 100, canonical: true},
  {diagnostic: '1000', hex: '1903e8', value: 1000, canonical: true},
  {diagnostic: '1000000', hex: '1a000f4240', value: 1000000, canonical: true},
  {diagnostic: '1000000000000', hex: '1b000000e8d4a51000', value: 1000000000000, canonical: true},
  {diagnostic: '18446744073709551615', hex: '1bffffffffffffffff', value: BigInt('18446744073709551615'), canonical: true},
  {diagnostic: '18446744073709551616', hex: 'c249010000000000000000', value: new JsonPackExtension(2, bignum), canonical: true},
  {diagnostic: '-18446744073709551616', hex: '3bffffffffffffffff', value: BigInt('-18446744073709551616'), canonical: true},
  {diagnostic: '-18446744073709551617', hex: 'c349010000000000000000', value: new JsonPackExtension(3, bignum), canonical: true},
  {diagnostic: '-1', hex: '20', value: -1, canonical: true},
  {diagnostic: '-10', hex: '29', value: -10, canonical: true},
  {diagnostic: '-100', hex: '3863', value: -100, canonical: true},
  {diagnostic: '-1000', hex: '3903e7', value: -1000, canonical: true},

  // -------------------------------------------------------------------- floats
  {diagnostic: '0.0', hex: 'f90000', value: 0, canonical: false},
  {diagnostic: '-0.0', hex: 'f98000', value: -0, canonical: false},
  {diagnostic: '1.0', hex: 'f93c00', value: 1, canonical: false},
  {diagnostic: '1.1', hex: 'fb3ff199999999999a', value: 1.1, canonical: true},
  {diagnostic: '1.5', hex: 'f93e00', value: 1.5, canonical: false},
  {diagnostic: '65504.0', hex: 'f97bff', value: 65504, canonical: false},
  {diagnostic: '100000.0', hex: 'fa47c35000', value: 100000, canonical: false},
  {diagnostic: '3.4028234663852886e+38', hex: 'fa7f7fffff', value: 3.4028234663852886e38, canonical: true},
  {diagnostic: '1.0e+300', hex: 'fb7e37e43c8800759c', value: 1.0e300, canonical: true},
  {diagnostic: '5.960464477539063e-8', hex: 'f90001', value: 2 ** -24, canonical: false},
  {diagnostic: '0.00006103515625', hex: 'f90400', value: 0.00006103515625, canonical: false},
  {diagnostic: '-4.0', hex: 'f9c400', value: -4, canonical: false},
  {diagnostic: '-4.1', hex: 'fbc010666666666666', value: -4.1, canonical: true},
  {diagnostic: 'Infinity (f16)', hex: 'f97c00', value: Infinity, canonical: false},
  {diagnostic: 'NaN (f16)', hex: 'f97e00', value: NaN, canonical: false},
  {diagnostic: '-Infinity (f16)', hex: 'f9fc00', value: -Infinity, canonical: false},
  {diagnostic: 'Infinity (f32)', hex: 'fa7f800000', value: Infinity, canonical: true},
  {diagnostic: 'NaN (f32)', hex: 'fa7fc00000', value: NaN, canonical: false},
  {diagnostic: '-Infinity (f32)', hex: 'faff800000', value: -Infinity, canonical: true},
  {diagnostic: 'Infinity (f64)', hex: 'fb7ff0000000000000', value: Infinity, canonical: false},
  {diagnostic: 'NaN (f64)', hex: 'fb7ff8000000000000', value: NaN, canonical: true},
  {diagnostic: '-Infinity (f64)', hex: 'fbfff0000000000000', value: -Infinity, canonical: false},

  // ------------------------------------------------------------- simple values
  {diagnostic: 'false', hex: 'f4', value: false, canonical: true},
  {diagnostic: 'true', hex: 'f5', value: true, canonical: true},
  {diagnostic: 'null', hex: 'f6', value: null, canonical: true},
  {diagnostic: 'undefined', hex: 'f7', value: undefined, canonical: true},
  {diagnostic: 'simple(16)', hex: 'f0', value: new JsonPackValue(16), canonical: true},
  {diagnostic: 'simple(255)', hex: 'f8ff', value: new JsonPackValue(255), canonical: true},

  // ----------------------------------------------------------------------- tags
  {diagnostic: '0("2013-03-21T20:04:00Z")', hex: 'c074323031332d30332d32315432303a30343a30305a', value: new JsonPackExtension(0, '2013-03-21T20:04:00Z'), canonical: false},
  {diagnostic: '1(1363896240)', hex: 'c11a514b67b0', value: new JsonPackExtension(1, 1363896240), canonical: true},
  {diagnostic: '1(1363896240.5)', hex: 'c1fb41d452d9ec200000', value: new JsonPackExtension(1, 1363896240.5), canonical: true},
  {diagnostic: "23(h'01020304')", hex: 'd74401020304', value: new JsonPackExtension(23, new Uint8Array([1, 2, 3, 4])), canonical: true},
  {diagnostic: "24(h'6449455446')", hex: 'd818456449455446', value: new JsonPackExtension(24, new Uint8Array([100, 73, 69, 84, 70])), canonical: true},
  {diagnostic: '32("http://www.example.com")', hex: 'd82076687474703a2f2f7777772e6578616d706c652e636f6d', value: new JsonPackExtension(32, 'http://www.example.com'), canonical: false},

  // -------------------------------------------------------------- byte strings
  {diagnostic: "h''", hex: '40', value: new Uint8Array([]), canonical: true},
  {diagnostic: "h'01020304'", hex: '4401020304', value: new Uint8Array([1, 2, 3, 4]), canonical: true},

  // -------------------------------------------------------------- text strings
  {diagnostic: '""', hex: '60', value: '', canonical: true},
  {diagnostic: '"a"', hex: '6161', value: 'a', canonical: true},
  {diagnostic: '"IETF"', hex: '6449455446', value: 'IETF', canonical: true},
  {diagnostic: '"\\"\\\\"', hex: '62225c', value: '"\\', canonical: true},
  {diagnostic: '"ü"', hex: '62c3bc', value: 'ü', canonical: true},
  {diagnostic: '"水"', hex: '63e6b0b4', value: '水', canonical: true},
  {diagnostic: '"𐅑"', hex: '64f0908591', value: '𐅑', canonical: true},

  // -------------------------------------------------------------------- arrays
  {diagnostic: '[]', hex: '80', value: [], canonical: true},
  {diagnostic: '[1, 2, 3]', hex: '83010203', value: [1, 2, 3], canonical: true},
  {diagnostic: '[1, [2, 3], [4, 5]]', hex: '8301820203820405', value: [1, [2, 3], [4, 5]], canonical: true},
  {diagnostic: '[1, 2, ... 25]', hex: '98190102030405060708090a0b0c0d0e0f101112131415161718181819', value: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25], canonical: true},

  // ---------------------------------------------------------------------- maps
  {diagnostic: '{}', hex: 'a0', value: {}, canonical: true},
  {diagnostic: '{1: 2, 3: 4}', hex: 'a201020304', value: {'1': 2, '3': 4}, canonical: false},
  {diagnostic: '{"a": 1, "b": [2, 3]}', hex: 'a26161016162820203', value: {a: 1, b: [2, 3]}, canonical: true},
  {diagnostic: '["a", {"b": "c"}]', hex: '826161a161626163', value: ['a', {b: 'c'}], canonical: true},
  {diagnostic: '{"a": "A", "b": "B", "c": "C", "d": "D", "e": "E"}', hex: 'a56161614161626142616361436164614461656145', value: {a: 'A', b: 'B', c: 'C', d: 'D', e: 'E'}, canonical: true},

  // ------------------------------------------------------- indefinite lengths
  {diagnostic: "(_ h'0102', h'030405')", hex: '5f42010243030405ff', value: new Uint8Array([1, 2, 3, 4, 5]), canonical: false},
  {diagnostic: '(_ "strea", "ming")', hex: '7f657374726561646d696e67ff', value: 'streaming', canonical: false},
  {diagnostic: '[_ ]', hex: '9fff', value: [], canonical: false},
  {diagnostic: '[_ 1, [2, 3], [_ 4, 5]]', hex: '9f018202039f0405ffff', value: [1, [2, 3], [4, 5]], canonical: false},
  {diagnostic: '[_ 1, [2, 3], [4, 5]]', hex: '9f01820203820405ff', value: [1, [2, 3], [4, 5]], canonical: false},
  {diagnostic: '[1, [2, 3], [_ 4, 5]]', hex: '83018202039f0405ff', value: [1, [2, 3], [4, 5]], canonical: false},
  {diagnostic: '[1, [_ 2, 3], [4, 5]]', hex: '83019f0203ff820405', value: [1, [2, 3], [4, 5]], canonical: false},
  {diagnostic: '[_ 1, 2, ... 25]', hex: '9f0102030405060708090a0b0c0d0e0f101112131415161718181819ff', value: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25], canonical: false},
  {diagnostic: '{_ "a": 1, "b": [_ 2, 3]}', hex: 'bf61610161629f0203ffff', value: {a: 1, b: [2, 3]}, canonical: false},
  {diagnostic: '["a", {_ "b": "c"}]', hex: '826161bf61626163ff', value: ['a', {b: 'c'}], canonical: false},
  {diagnostic: '{_ "Fun": true, "Amt": -2}', hex: 'bf6346756ef563416d7421ff', value: {Fun: true, Amt: -2}, canonical: false},
];

export const hexToUint8Array = (hex: string): Uint8Array => {
  const length = hex.length >> 1;
  const uint8 = new Uint8Array(length);
  for (let i = 0; i < length; i++) uint8[i] = Number.parseInt(hex.substr(i << 1, 2), 16);
  return uint8;
};

export const uint8ArrayToHex = (uint8: Uint8Array): string => {
  let hex = '';
  for (let i = 0; i < uint8.length; i++) hex += uint8[i].toString(16).padStart(2, '0');
  return hex;
};
