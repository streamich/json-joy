import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {XdrEncoder} from '../XdrEncoder';

describe('XdrEncoder', () => {
  let writer: Writer;
  let encoder: XdrEncoder;

  beforeEach(() => {
    writer = new Writer();
    encoder = new XdrEncoder(writer);
  });

  describe('primitive types', () => {
    test('encodes void', () => {
      encoder.writeVoid();
      const result = writer.flush();
      expect(result.length).toBe(0);
    });

    test('encodes boolean true', () => {
      encoder.writeBoolean(true);
      const result = writer.flush();
      expect(result).toEqual(new Uint8Array([0, 0, 0, 1])); // big-endian 32-bit 1
    });

    test('encodes boolean false', () => {
      encoder.writeBoolean(false);
      const result = writer.flush();
      expect(result).toEqual(new Uint8Array([0, 0, 0, 0])); // big-endian 32-bit 0
    });

    test('encodes positive int', () => {
      encoder.writeInt(42);
      const result = writer.flush();
      expect(result).toEqual(new Uint8Array([0, 0, 0, 42])); // big-endian 32-bit 42
    });

    test('encodes negative int', () => {
      encoder.writeInt(-1);
      const result = writer.flush();
      expect(result).toEqual(new Uint8Array([255, 255, 255, 255])); // big-endian 32-bit -1
    });

    test('encodes large positive int', () => {
      encoder.writeInt(0x12345678);
      const result = writer.flush();
      expect(result).toEqual(new Uint8Array([0x12, 0x34, 0x56, 0x78]));
    });

    test('encodes unsigned int', () => {
      encoder.writeUnsignedInt(0xffffffff);
      const result = writer.flush();
      expect(result).toEqual(new Uint8Array([255, 255, 255, 255])); // big-endian 32-bit max uint
    });

    test('encodes hyper from number', () => {
      // biome-ignore lint: number max safe integer
      encoder.writeHyper(0x123456789abcdef0);
      const result = writer.flush();
      // JavaScript loses precision for large numbers, but we test what we can
      expect(result.length).toBe(8);
    });

    test('encodes hyper from bigint', () => {
      encoder.writeHyper(BigInt('0x123456789ABCDEF0'));
      const result = writer.flush();
      expect(result).toEqual(new Uint8Array([0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0]));
    });

    test('encodes negative hyper from bigint', () => {
      encoder.writeHyper(BigInt(-1));
      const result = writer.flush();
      expect(result).toEqual(new Uint8Array([255, 255, 255, 255, 255, 255, 255, 255]));
    });

    test('encodes unsigned hyper from bigint', () => {
      encoder.writeUnsignedHyper(BigInt('0x123456789ABCDEF0'));
      const result = writer.flush();
      expect(result).toEqual(new Uint8Array([0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0]));
    });

    test('encodes float', () => {
      encoder.writeFloat(
        // biome-ignore lint: number precision is intended
        3.14159,
      );
      const result = writer.flush();
      expect(result.length).toBe(4);
      // Verify it's a valid IEEE 754 float in big-endian
      const view = new DataView(result.buffer);
      expect(view.getFloat32(0, false)).toBeCloseTo(
        // biome-ignore lint: number precision is intended
        3.14159,
        5,
      );
    });

    test('encodes double', () => {
      encoder.writeDouble(
        // biome-ignore lint: number precision is intended
        3.141592653589793,
      );
      const result = writer.flush();
      expect(result.length).toBe(8);
      // Verify it's a valid IEEE 754 double in big-endian
      const view = new DataView(result.buffer);
      expect(view.getFloat64(0, false)).toBeCloseTo(
        // biome-ignore lint: number precision is intended
        3.141592653589793,
        15,
      );
    });

    test('encodes quadruple', () => {
      expect(() =>
        encoder.writeQuadruple(
          // biome-ignore lint: number precision is intended
          3.14159,
        ),
      ).toThrow('not implemented');
    });
  });

  describe('opaque data', () => {
    test('encodes fixed opaque data', () => {
      const data = new Uint8Array([1, 2, 3]);
      encoder.writeOpaque(data);
      const result = writer.flush();
      expect(result).toEqual(new Uint8Array([1, 2, 3, 0])); // padded to 4 bytes
    });

    test('encodes fixed opaque data with exact 4-byte boundary', () => {
      const data = new Uint8Array([1, 2, 3, 4]);
      encoder.writeOpaque(data);
      const result = writer.flush();
      expect(result).toEqual(new Uint8Array([1, 2, 3, 4])); // no padding needed
    });

    test('encodes variable-length opaque data', () => {
      const data = new Uint8Array([1, 2, 3]);
      encoder.writeVarlenOpaque(data);
      const result = writer.flush();
      expect(result).toEqual(
        new Uint8Array([
          0,
          0,
          0,
          3, // length
          1,
          2,
          3,
          0, // data + padding
        ]),
      );
    });

    test('encodes empty variable-length opaque data', () => {
      const data = new Uint8Array([]);
      encoder.writeVarlenOpaque(data);
      const result = writer.flush();
      expect(result).toEqual(new Uint8Array([0, 0, 0, 0])); // just length
    });
  });

  describe('strings', () => {
    test('encodes simple string', () => {
      encoder.writeStr('hello');
      const result = writer.flush();
      expect(result).toEqual(
        new Uint8Array([
          0,
          0,
          0,
          5, // length
          104,
          101,
          108,
          108,
          111,
          0,
          0,
          0, // 'hello' + padding
        ]),
      );
    });

    test('encodes empty string', () => {
      encoder.writeStr('');
      const result = writer.flush();
      expect(result).toEqual(new Uint8Array([0, 0, 0, 0])); // just length
    });

    test('encodes UTF-8 string', () => {
      encoder.writeStr('café');
      const result = writer.flush();
      // 'café' in UTF-8 is [99, 97, 102, 195, 169] (5 bytes)
      expect(result).toEqual(
        new Uint8Array([
          0,
          0,
          0,
          5, // length
          99,
          97,
          102,
          195,
          169,
          0,
          0,
          0, // UTF-8 bytes + padding
        ]),
      );
    });

    test('encodes string that fits exactly in 4-byte boundary', () => {
      encoder.writeStr('test'); // 4 bytes
      const result = writer.flush();
      expect(result).toEqual(
        new Uint8Array([
          0,
          0,
          0,
          4, // length
          116,
          101,
          115,
          116, // 'test' (no padding needed)
        ]),
      );
    });
  });

  describe('encode method', () => {
    test('encodes various types through encode method', () => {
      const result = encoder.encode(42);
      expect(result).toEqual(new Uint8Array([0, 0, 0, 42]));
    });

    test('handles null', () => {
      const result = encoder.encode(null);
      expect(result.length).toBe(0); // void
    });

    test('handles undefined', () => {
      const result = encoder.encode(undefined);
      expect(result.length).toBe(0); // void
    });

    test('handles boolean', () => {
      const result = encoder.encode(true);
      expect(result).toEqual(new Uint8Array([0, 0, 0, 1]));
    });

    test('handles string', () => {
      const result = encoder.encode('hi');
      expect(result).toEqual(
        new Uint8Array([
          0,
          0,
          0,
          2, // length
          104,
          105,
          0,
          0, // 'hi' + padding
        ]),
      );
    });

    test('handles bigint', () => {
      const result = encoder.encode(BigInt(123));
      expect(result.length).toBe(8); // hyper
    });

    test('handles Uint8Array', () => {
      const result = encoder.encode(new Uint8Array([1, 2]));
      expect(result).toEqual(
        new Uint8Array([
          0,
          0,
          0,
          2, // length
          1,
          2,
          0,
          0, // data + padding
        ]),
      );
    });

    test('handles unknown types', () => {
      const result = encoder.encode(Symbol('test'));
      expect(result.length).toBe(0); // void for unknown
    });
  });

  describe('BinaryJsonEncoder interface methods', () => {
    test('writeNumber chooses appropriate type', () => {
      // Integer within 32-bit range
      encoder.writeNumber(42);
      let result = writer.flush();
      expect(result).toEqual(new Uint8Array([0, 0, 0, 42]));

      writer.reset();

      // Large integer (uses hyper)
      encoder.writeNumber(0x100000000);
      result = writer.flush();
      expect(result.length).toBe(8);

      writer.reset();

      // Float
      encoder.writeNumber(3.14);
      result = writer.flush();
      expect(result.length).toBe(8); // double
    });

    test('writeInteger', () => {
      encoder.writeInteger(42);
      const result = writer.flush();
      expect(result).toEqual(new Uint8Array([0, 0, 0, 42]));
    });

    test('writeUInteger', () => {
      encoder.writeUInteger(42);
      const result = writer.flush();
      expect(result).toEqual(new Uint8Array([0, 0, 0, 42]));
    });

    test('writeBin', () => {
      encoder.writeBin(new Uint8Array([1, 2, 3]));
      const result = writer.flush();
      expect(result).toEqual(
        new Uint8Array([
          0,
          0,
          0,
          3, // length
          1,
          2,
          3,
          0, // data + padding
        ]),
      );
    });

    test('writeAsciiStr', () => {
      encoder.writeAsciiStr('test');
      const result = writer.flush();
      expect(result).toEqual(
        new Uint8Array([
          0,
          0,
          0,
          4, // length
          116,
          101,
          115,
          116, // 'test'
        ]),
      );
    });
  });

  describe('edge cases', () => {
    test('encodes 32-bit integer boundaries', () => {
      encoder.writeInt(-2147483648); // INT32_MIN
      let result = writer.flush();
      expect(result).toEqual(new Uint8Array([128, 0, 0, 0]));

      writer.reset();
      encoder.writeInt(2147483647); // INT32_MAX
      result = writer.flush();
      expect(result).toEqual(new Uint8Array([127, 255, 255, 255]));
    });

    test('encodes 32-bit unsigned integer boundaries', () => {
      encoder.writeUnsignedInt(0);
      let result = writer.flush();
      expect(result).toEqual(new Uint8Array([0, 0, 0, 0]));

      writer.reset();
      encoder.writeUnsignedInt(4294967295); // UINT32_MAX
      result = writer.flush();
      expect(result).toEqual(new Uint8Array([255, 255, 255, 255]));
    });

    test('encodes special float values', () => {
      encoder.writeFloat(Infinity);
      let result = writer.flush();
      let view = new DataView(result.buffer, result.byteOffset, result.byteLength);
      expect(view.getFloat32(0, false)).toBe(Infinity);

      writer.reset();
      encoder.writeFloat(-Infinity);
      result = writer.flush();
      view = new DataView(result.buffer, result.byteOffset, result.byteLength);
      const negInf = view.getFloat32(0, false);
      expect(negInf).toBe(-Infinity);

      writer.reset();
      encoder.writeFloat(NaN);
      result = writer.flush();
      view = new DataView(result.buffer, result.byteOffset, result.byteLength);
      expect(view.getFloat32(0, false)).toBeNaN();
    });

    test('encodes special double values', () => {
      encoder.writeDouble(Infinity);
      let result = writer.flush();
      let view = new DataView(result.buffer, result.byteOffset, result.byteLength);
      expect(view.getFloat64(0, false)).toBe(Infinity);

      writer.reset();
      encoder.writeDouble(-Infinity);
      result = writer.flush();
      view = new DataView(result.buffer, result.byteOffset, result.byteLength);
      const negInf = view.getFloat64(0, false);
      expect(negInf).toBe(-Infinity);

      writer.reset();
      encoder.writeDouble(NaN);
      result = writer.flush();
      view = new DataView(result.buffer, result.byteOffset, result.byteLength);
      expect(view.getFloat64(0, false)).toBeNaN();
    });

    test('handles very long strings', () => {
      const longString = 'a'.repeat(1000);
      encoder.writeStr(longString);
      const result = writer.flush();

      // Check length prefix
      const view = new DataView(result.buffer);
      expect(view.getUint32(0, false)).toBe(1000);

      // Check total length (1000 + padding to 4-byte boundary + 4-byte length prefix)
      const expectedPaddedLength = Math.ceil(1000 / 4) * 4;
      expect(result.length).toBe(4 + expectedPaddedLength);
    });
  });
});
