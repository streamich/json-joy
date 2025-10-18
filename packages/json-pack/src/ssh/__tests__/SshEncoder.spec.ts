import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {SshEncoder} from '../SshEncoder';
import {JsonPackMpint} from '../../JsonPackMpint';

describe('SshEncoder', () => {
  let writer: Writer;
  let encoder: SshEncoder;

  beforeEach(() => {
    writer = new Writer();
    encoder = new SshEncoder(writer);
  });

  describe('primitive types', () => {
    test('encodes boolean true', () => {
      encoder.writeBoolean(true);
      const result = writer.flush();
      expect(result).toEqual(new Uint8Array([1]));
    });

    test('encodes boolean false', () => {
      encoder.writeBoolean(false);
      const result = writer.flush();
      expect(result).toEqual(new Uint8Array([0]));
    });

    test('encodes byte value', () => {
      encoder.writeByte(0x42);
      const result = writer.flush();
      expect(result).toEqual(new Uint8Array([0x42]));
    });

    test('encodes uint32', () => {
      encoder.writeUint32(0x12345678);
      const result = writer.flush();
      expect(result).toEqual(new Uint8Array([0x12, 0x34, 0x56, 0x78]));
    });

    test('encodes uint32 zero', () => {
      encoder.writeUint32(0);
      const result = writer.flush();
      expect(result).toEqual(new Uint8Array([0, 0, 0, 0]));
    });

    test('encodes uint32 max value', () => {
      encoder.writeUint32(0xffffffff);
      const result = writer.flush();
      expect(result).toEqual(new Uint8Array([0xff, 0xff, 0xff, 0xff]));
    });

    test('encodes uint64 from bigint', () => {
      encoder.writeUint64(BigInt('0x123456789ABCDEF0'));
      const result = writer.flush();
      expect(result).toEqual(new Uint8Array([0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0]));
    });

    test('encodes uint64 from number', () => {
      encoder.writeUint64(0x12345678);
      const result = writer.flush();
      expect(result).toEqual(new Uint8Array([0, 0, 0, 0, 0x12, 0x34, 0x56, 0x78]));
    });

    test('encodes uint64 zero', () => {
      encoder.writeUint64(BigInt(0));
      const result = writer.flush();
      expect(result).toEqual(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0]));
    });
  });

  describe('string types', () => {
    test('encodes empty string (UTF-8)', () => {
      encoder.writeStr('');
      const result = writer.flush();
      expect(result).toEqual(new Uint8Array([0, 0, 0, 0]));
    });

    test('encodes ASCII string "testing" (UTF-8)', () => {
      encoder.writeStr('testing');
      const result = writer.flush();
      const expected = new Uint8Array([
        0,
        0,
        0,
        7, // length
        0x74,
        0x65,
        0x73,
        0x74,
        0x69,
        0x6e,
        0x67, // "testing"
      ]);
      expect(result).toEqual(expected);
    });

    test('encodes UTF-8 string', () => {
      encoder.writeStr('hello');
      const result = writer.flush();
      expect(result[0]).toBe(0);
      expect(result[1]).toBe(0);
      expect(result[2]).toBe(0);
      expect(result[3]).toBe(5); // length
      expect(result.slice(4)).toEqual(new Uint8Array([0x68, 0x65, 0x6c, 0x6c, 0x6f]));
    });

    test('encodes ASCII string', () => {
      encoder.writeAsciiStr('test');
      const result = writer.flush();
      expect(result).toEqual(
        new Uint8Array([
          0,
          0,
          0,
          4, // length
          0x74,
          0x65,
          0x73,
          0x74, // "test"
        ]),
      );
    });

    test('encodes binary string', () => {
      const data = new Uint8Array([0x01, 0x02, 0x03]);
      encoder.writeBinStr(data);
      const result = writer.flush();
      expect(result).toEqual(
        new Uint8Array([
          0,
          0,
          0,
          3, // length
          0x01,
          0x02,
          0x03,
        ]),
      );
    });

    test('encodes empty binary string', () => {
      encoder.writeBinStr(new Uint8Array(0));
      const result = writer.flush();
      expect(result).toEqual(new Uint8Array([0, 0, 0, 0]));
    });
  });

  describe('mpint', () => {
    test('encodes mpint zero', () => {
      const mpint = JsonPackMpint.fromBigInt(BigInt(0));
      encoder.writeMpint(mpint);
      const result = writer.flush();
      expect(result).toEqual(new Uint8Array([0, 0, 0, 0]));
    });

    test('encodes mpint 0x9a378f9b2e332a7', () => {
      const mpint = JsonPackMpint.fromBigInt(BigInt('0x9a378f9b2e332a7'));
      encoder.writeMpint(mpint);
      const result = writer.flush();
      expect(result).toEqual(
        new Uint8Array([
          0,
          0,
          0,
          8, // length
          0x09,
          0xa3,
          0x78,
          0xf9,
          0xb2,
          0xe3,
          0x32,
          0xa7,
        ]),
      );
    });

    test('encodes mpint 0x80', () => {
      const mpint = JsonPackMpint.fromBigInt(BigInt(0x80));
      encoder.writeMpint(mpint);
      const result = writer.flush();
      expect(result).toEqual(
        new Uint8Array([
          0,
          0,
          0,
          2, // length
          0x00,
          0x80,
        ]),
      );
    });

    test('encodes mpint -1234', () => {
      const mpint = JsonPackMpint.fromBigInt(BigInt(-1234));
      encoder.writeMpint(mpint);
      const result = writer.flush();
      expect(result).toEqual(
        new Uint8Array([
          0,
          0,
          0,
          2, // length
          0xfb,
          0x2e,
        ]),
      );
    });

    test('encodes mpint -0xdeadbeef', () => {
      const mpint = JsonPackMpint.fromBigInt(-BigInt('0xdeadbeef'));
      encoder.writeMpint(mpint);
      const result = writer.flush();
      expect(result).toEqual(
        new Uint8Array([
          0,
          0,
          0,
          5, // length
          0xff,
          0x21,
          0x52,
          0x41,
          0x11,
        ]),
      );
    });
  });

  describe('name-list', () => {
    test('encodes empty name-list', () => {
      encoder.writeNameList([]);
      const result = writer.flush();
      expect(result).toEqual(new Uint8Array([0, 0, 0, 0]));
    });

    test('encodes single name "zlib"', () => {
      encoder.writeNameList(['zlib']);
      const result = writer.flush();
      expect(result).toEqual(
        new Uint8Array([
          0,
          0,
          0,
          4, // length
          0x7a,
          0x6c,
          0x69,
          0x62, // "zlib"
        ]),
      );
    });

    test('encodes name-list "zlib,none"', () => {
      encoder.writeNameList(['zlib', 'none']);
      const result = writer.flush();
      expect(result).toEqual(
        new Uint8Array([
          0,
          0,
          0,
          9, // length
          0x7a,
          0x6c,
          0x69,
          0x62,
          0x2c,
          0x6e,
          0x6f,
          0x6e,
          0x65, // "zlib,none"
        ]),
      );
    });

    test('encodes name-list with three items', () => {
      encoder.writeNameList(['one', 'two', 'three']);
      const result = writer.flush();
      const str = new TextDecoder().decode(result.slice(4));
      expect(str).toBe('one,two,three');
    });
  });

  describe('BinaryJsonEncoder interface', () => {
    test('encodes integer', () => {
      encoder.writeInteger(42);
      const result = writer.flush();
      expect(result).toEqual(new Uint8Array([0, 0, 0, 42]));
    });

    test('encodes unsigned integer', () => {
      encoder.writeUInteger(42);
      const result = writer.flush();
      expect(result).toEqual(new Uint8Array([0, 0, 0, 42]));
    });

    test('encodes binary data', () => {
      const data = new Uint8Array([1, 2, 3]);
      encoder.writeBin(data);
      const result = writer.flush();
      expect(result).toEqual(new Uint8Array([0, 0, 0, 3, 1, 2, 3]));
    });

    test('throws on float', () => {
      expect(() => encoder.writeFloat(3.14)).toThrow('SSH protocol does not support floating point numbers');
    });

    test('throws on null', () => {
      expect(() => encoder.writeNull()).toThrow('SSH protocol does not have a null type');
    });

    test('throws on array', () => {
      expect(() => encoder.writeArr([1, 2, 3])).toThrow('SSH protocol does not have a generic array type');
    });

    test('throws on object', () => {
      expect(() => encoder.writeObj({key: 'value'})).toThrow('SSH protocol does not have an object type');
    });
  });
});
