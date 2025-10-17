import {JsonPackMpint} from '../JsonPackMpint';

describe('JsonPackMpint', () => {
  describe('fromBigInt / toBigInt', () => {
    test('encodes zero', () => {
      const mpint = JsonPackMpint.fromBigInt(BigInt(0));
      expect(mpint.data.length).toBe(0);
      expect(mpint.toBigInt()).toBe(BigInt(0));
    });

    test('encodes positive number 0x9a378f9b2e332a7', () => {
      const mpint = JsonPackMpint.fromBigInt(BigInt('0x9a378f9b2e332a7'));
      expect(mpint.data).toEqual(new Uint8Array([0x09, 0xa3, 0x78, 0xf9, 0xb2, 0xe3, 0x32, 0xa7]));
      expect(mpint.toBigInt()).toBe(BigInt('0x9a378f9b2e332a7'));
    });

    test('encodes 0x80 with leading zero', () => {
      const mpint = JsonPackMpint.fromBigInt(BigInt(0x80));
      expect(mpint.data).toEqual(new Uint8Array([0x00, 0x80]));
      expect(mpint.toBigInt()).toBe(BigInt(0x80));
    });

    test('encodes -1234', () => {
      const mpint = JsonPackMpint.fromBigInt(BigInt(-1234));
      expect(mpint.data).toEqual(new Uint8Array([0xfb, 0x2e]));
      expect(mpint.toBigInt()).toBe(BigInt(-1234));
    });

    test('encodes -0xdeadbeef', () => {
      const mpint = JsonPackMpint.fromBigInt(-BigInt('0xdeadbeef'));
      expect(mpint.data).toEqual(new Uint8Array([0xff, 0x21, 0x52, 0x41, 0x11]));
      expect(mpint.toBigInt()).toBe(-BigInt('0xdeadbeef'));
    });

    test('encodes small positive number', () => {
      const mpint = JsonPackMpint.fromBigInt(BigInt(1));
      expect(mpint.data).toEqual(new Uint8Array([0x01]));
      expect(mpint.toBigInt()).toBe(BigInt(1));
    });

    test('encodes small negative number', () => {
      const mpint = JsonPackMpint.fromBigInt(BigInt(-1));
      expect(mpint.data).toEqual(new Uint8Array([0xff]));
      expect(mpint.toBigInt()).toBe(BigInt(-1));
    });

    test('encodes 127 (no leading zero needed)', () => {
      const mpint = JsonPackMpint.fromBigInt(BigInt(127));
      expect(mpint.data).toEqual(new Uint8Array([0x7f]));
      expect(mpint.toBigInt()).toBe(BigInt(127));
    });

    test('encodes 128 (leading zero needed)', () => {
      const mpint = JsonPackMpint.fromBigInt(BigInt(128));
      expect(mpint.data).toEqual(new Uint8Array([0x00, 0x80]));
      expect(mpint.toBigInt()).toBe(BigInt(128));
    });

    test('encodes -128', () => {
      const mpint = JsonPackMpint.fromBigInt(BigInt(-128));
      expect(mpint.data).toEqual(new Uint8Array([0x80]));
      expect(mpint.toBigInt()).toBe(BigInt(-128));
    });

    test('encodes -129', () => {
      const mpint = JsonPackMpint.fromBigInt(BigInt(-129));
      expect(mpint.data).toEqual(new Uint8Array([0xff, 0x7f]));
      expect(mpint.toBigInt()).toBe(BigInt(-129));
    });
  });

  describe('fromNumber / toNumber', () => {
    test('converts positive number', () => {
      const mpint = JsonPackMpint.fromNumber(42);
      expect(mpint.toNumber()).toBe(42);
    });

    test('converts negative number', () => {
      const mpint = JsonPackMpint.fromNumber(-42);
      expect(mpint.toNumber()).toBe(-42);
    });

    test('converts zero', () => {
      const mpint = JsonPackMpint.fromNumber(0);
      expect(mpint.toNumber()).toBe(0);
    });

    test('throws on non-integer', () => {
      expect(() => JsonPackMpint.fromNumber(3.14)).toThrow('Value must be an integer');
    });

    test('throws when out of safe integer range', () => {
      const mpint = JsonPackMpint.fromBigInt(BigInt(Number.MAX_SAFE_INTEGER) + BigInt(1));
      expect(() => mpint.toNumber()).toThrow('Value is outside safe integer range');
    });
  });
});
