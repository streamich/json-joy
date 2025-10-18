import {Reader} from '@jsonjoy.com/buffers/lib/Reader';
import {SshDecoder} from '../SshDecoder';

describe('SshDecoder', () => {
  let reader: Reader;
  let decoder: SshDecoder;

  beforeEach(() => {
    reader = new Reader();
    decoder = new SshDecoder(reader);
  });

  describe('primitive types', () => {
    test('decodes boolean true', () => {
      reader.reset(new Uint8Array([1]));
      expect(decoder.readBoolean()).toBe(true);
    });

    test('decodes boolean false', () => {
      reader.reset(new Uint8Array([0]));
      expect(decoder.readBoolean()).toBe(false);
    });

    test('decodes non-zero as true', () => {
      reader.reset(new Uint8Array([42]));
      expect(decoder.readBoolean()).toBe(true);
    });

    test('decodes byte value', () => {
      reader.reset(new Uint8Array([0x42]));
      expect(decoder.readByte()).toBe(0x42);
    });

    test('decodes uint32', () => {
      reader.reset(new Uint8Array([0x12, 0x34, 0x56, 0x78]));
      expect(decoder.readUint32()).toBe(0x12345678);
    });

    test('decodes uint32 zero', () => {
      reader.reset(new Uint8Array([0, 0, 0, 0]));
      expect(decoder.readUint32()).toBe(0);
    });

    test('decodes uint32 max value', () => {
      reader.reset(new Uint8Array([0xff, 0xff, 0xff, 0xff]));
      expect(decoder.readUint32()).toBe(0xffffffff);
    });

    test('decodes uint64', () => {
      reader.reset(new Uint8Array([0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0]));
      expect(decoder.readUint64()).toBe(BigInt('0x123456789ABCDEF0'));
    });

    test('decodes uint64 zero', () => {
      reader.reset(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0]));
      expect(decoder.readUint64()).toBe(BigInt(0));
    });
  });

  describe('string types', () => {
    test('decodes empty string (UTF-8)', () => {
      reader.reset(new Uint8Array([0, 0, 0, 0]));
      expect(decoder.readStr()).toBe('');
    });

    test('decodes ASCII string "testing" (UTF-8)', () => {
      const data = new Uint8Array([
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
      reader.reset(data);
      expect(decoder.readStr()).toBe('testing');
    });

    test('decodes ASCII string', () => {
      const data = new Uint8Array([
        0,
        0,
        0,
        4, // length
        0x74,
        0x65,
        0x73,
        0x74, // "test"
      ]);
      reader.reset(data);
      expect(decoder.readAsciiStr()).toBe('test');
    });

    test('decodes binary string', () => {
      const data = new Uint8Array([
        0,
        0,
        0,
        3, // length
        0x01,
        0x02,
        0x03,
      ]);
      reader.reset(data);
      const result = decoder.readBinStr();
      expect(result).toEqual(new Uint8Array([0x01, 0x02, 0x03]));
    });

    test('decodes empty binary string', () => {
      reader.reset(new Uint8Array([0, 0, 0, 0]));
      const result = decoder.readBinStr();
      expect(result).toEqual(new Uint8Array(0));
    });

    test('readBin is alias for readBinStr', () => {
      const data = new Uint8Array([
        0,
        0,
        0,
        3, // length
        0x01,
        0x02,
        0x03,
      ]);
      reader.reset(data);
      const result = decoder.readBin();
      expect(result).toEqual(new Uint8Array([0x01, 0x02, 0x03]));
    });
  });

  describe('mpint', () => {
    test('decodes mpint zero', () => {
      reader.reset(new Uint8Array([0, 0, 0, 0]));
      const mpint = decoder.readMpint();
      expect(mpint.data.length).toBe(0);
      expect(mpint.toBigInt()).toBe(BigInt(0));
    });

    test('decodes mpint 0x9a378f9b2e332a7', () => {
      const data = new Uint8Array([
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
      ]);
      reader.reset(data);
      const mpint = decoder.readMpint();
      expect(mpint.toBigInt()).toBe(BigInt('0x9a378f9b2e332a7'));
    });

    test('decodes mpint 0x80', () => {
      const data = new Uint8Array([
        0,
        0,
        0,
        2, // length
        0x00,
        0x80,
      ]);
      reader.reset(data);
      const mpint = decoder.readMpint();
      expect(mpint.toBigInt()).toBe(BigInt(0x80));
    });

    test('decodes mpint -1234', () => {
      const data = new Uint8Array([
        0,
        0,
        0,
        2, // length
        0xfb,
        0x2e,
      ]);
      reader.reset(data);
      const mpint = decoder.readMpint();
      expect(mpint.toBigInt()).toBe(BigInt(-1234));
    });

    test('decodes mpint -0xdeadbeef', () => {
      const data = new Uint8Array([
        0,
        0,
        0,
        5, // length
        0xff,
        0x21,
        0x52,
        0x41,
        0x11,
      ]);
      reader.reset(data);
      const mpint = decoder.readMpint();
      expect(mpint.toBigInt()).toBe(-BigInt('0xdeadbeef'));
    });
  });

  describe('name-list', () => {
    test('decodes empty name-list', () => {
      reader.reset(new Uint8Array([0, 0, 0, 0]));
      expect(decoder.readNameList()).toEqual([]);
    });

    test('decodes single name "zlib"', () => {
      const data = new Uint8Array([
        0,
        0,
        0,
        4, // length
        0x7a,
        0x6c,
        0x69,
        0x62, // "zlib"
      ]);
      reader.reset(data);
      expect(decoder.readNameList()).toEqual(['zlib']);
    });

    test('decodes name-list "zlib,none"', () => {
      const data = new Uint8Array([
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
      ]);
      reader.reset(data);
      expect(decoder.readNameList()).toEqual(['zlib', 'none']);
    });

    test('decodes name-list with three items', () => {
      const nameList = 'one,two,three';
      const bytes = new TextEncoder().encode(nameList);
      const data = new Uint8Array(4 + bytes.length);
      data[0] = 0;
      data[1] = 0;
      data[2] = 0;
      data[3] = bytes.length;
      data.set(bytes, 4);

      reader.reset(data);
      expect(decoder.readNameList()).toEqual(['one', 'two', 'three']);
    });
  });
});
