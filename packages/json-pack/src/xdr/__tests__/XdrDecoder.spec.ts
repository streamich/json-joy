import {Reader} from '@jsonjoy.com/buffers/lib/Reader';
import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {XdrEncoder} from '../XdrEncoder';
import {XdrDecoder} from '../XdrDecoder';

describe('XdrDecoder', () => {
  let reader: Reader;
  let writer: Writer;
  let encoder: XdrEncoder;
  let decoder: XdrDecoder;

  beforeEach(() => {
    reader = new Reader();
    writer = new Writer();
    encoder = new XdrEncoder(writer);
    decoder = new XdrDecoder(reader);
  });

  describe('primitive types', () => {
    test('decodes void', () => {
      encoder.writeVoid();
      const encoded = writer.flush();

      reader.reset(encoded);
      const result = decoder.readVoid();
      expect(result).toBeUndefined();
    });

    test('decodes boolean true', () => {
      encoder.writeBoolean(true);
      const encoded = writer.flush();

      reader.reset(encoded);
      const result = decoder.readBoolean();
      expect(result).toBe(true);
    });

    test('decodes boolean false', () => {
      encoder.writeBoolean(false);
      const encoded = writer.flush();

      reader.reset(encoded);
      const result = decoder.readBoolean();
      expect(result).toBe(false);
    });

    test('decodes positive int', () => {
      const value = 42;
      encoder.writeInt(value);
      const encoded = writer.flush();

      reader.reset(encoded);
      const result = decoder.readInt();
      expect(result).toBe(value);
    });

    test('decodes negative int', () => {
      const value = -1;
      encoder.writeInt(value);
      const encoded = writer.flush();

      reader.reset(encoded);
      const result = decoder.readInt();
      expect(result).toBe(value);
    });

    test('decodes large positive int', () => {
      const value = 0x12345678;
      encoder.writeInt(value);
      const encoded = writer.flush();

      reader.reset(encoded);
      const result = decoder.readInt();
      expect(result).toBe(value);
    });

    test('decodes unsigned int', () => {
      const value = 0xffffffff;
      encoder.writeUnsignedInt(value);
      const encoded = writer.flush();

      reader.reset(encoded);
      const result = decoder.readUnsignedInt();
      expect(result).toBe(value);
    });

    test('decodes hyper from bigint', () => {
      const value = BigInt('0x123456789abcdef0');
      encoder.writeHyper(value);
      const encoded = writer.flush();

      reader.reset(encoded);
      const result = decoder.readHyper();
      expect(result).toBe(value);
    });

    test('decodes negative hyper from bigint', () => {
      const value = -BigInt('0x123456789abcdef0');
      encoder.writeHyper(value);
      const encoded = writer.flush();

      reader.reset(encoded);
      const result = decoder.readHyper();
      expect(result).toBe(value);
    });

    test('decodes unsigned hyper from bigint', () => {
      const value = BigInt('0xffffffffffffffff');
      encoder.writeUnsignedHyper(value);
      const encoded = writer.flush();

      reader.reset(encoded);
      const result = decoder.readUnsignedHyper();
      expect(result).toBe(value);
    });

    test('decodes float', () => {
      const value = 3.14;
      encoder.writeFloat(value);
      const encoded = writer.flush();

      reader.reset(encoded);
      const result = decoder.readFloat();
      expect(result).toBeCloseTo(value, 6);
    });

    test('decodes double', () => {
      const value = Math.PI;
      encoder.writeDouble(value);
      const encoded = writer.flush();

      reader.reset(encoded);
      const result = decoder.readDouble();
      expect(result).toBeCloseTo(value, 15);
    });

    test('throws on quadruple', () => {
      expect(() => decoder.readQuadruple()).toThrow('not implemented');
    });
  });

  describe('opaque data', () => {
    test('decodes fixed opaque data', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      encoder.writeOpaque(data);
      const encoded = writer.flush();

      reader.reset(encoded);
      const result = decoder.readOpaque(data.length);
      expect(result).toEqual(data);
    });

    test('decodes fixed opaque data with padding', () => {
      const data = new Uint8Array([1, 2, 3]); // 3 bytes -> 4 bytes with padding
      encoder.writeOpaque(data);
      const encoded = writer.flush();

      reader.reset(encoded);
      const result = decoder.readOpaque(data.length);
      expect(result).toEqual(data);
    });

    test('decodes variable-length opaque data', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      encoder.writeVarlenOpaque(data);
      const encoded = writer.flush();

      reader.reset(encoded);
      const result = decoder.readVarlenOpaque();
      expect(result).toEqual(data);
    });

    test('decodes empty variable-length opaque data', () => {
      const data = new Uint8Array([]);
      encoder.writeVarlenOpaque(data);
      const encoded = writer.flush();

      reader.reset(encoded);
      const result = decoder.readVarlenOpaque();
      expect(result).toEqual(data);
    });
  });

  describe('strings', () => {
    test('decodes simple string', () => {
      const value = 'hello';
      encoder.writeStr(value);
      const encoded = writer.flush();

      reader.reset(encoded);
      const result = decoder.readString();
      expect(result).toBe(value);
    });

    test('decodes empty string', () => {
      const value = '';
      encoder.writeStr(value);
      const encoded = writer.flush();

      reader.reset(encoded);
      const result = decoder.readString();
      expect(result).toBe(value);
    });

    test('decodes UTF-8 string', () => {
      const value = '🚀 Hello, 世界!';
      encoder.writeStr(value);
      const encoded = writer.flush();

      reader.reset(encoded);
      const result = decoder.readString();
      expect(result).toBe(value);
    });

    test('decodes string that fits exactly in 4-byte boundary', () => {
      const value = 'test'; // 4 bytes
      encoder.writeStr(value);
      const encoded = writer.flush();

      reader.reset(encoded);
      const result = decoder.readString();
      expect(result).toBe(value);
    });
  });

  describe('enum', () => {
    test('decodes enum value', () => {
      const value = 42;
      encoder.writeInt(value);
      const encoded = writer.flush();

      reader.reset(encoded);
      const result = decoder.readEnum();
      expect(result).toBe(value);
    });
  });

  describe('arrays', () => {
    test('decodes fixed-size array', () => {
      const values = [1, 2, 3];
      values.forEach((v) => encoder.writeInt(v));
      const encoded = writer.flush();

      reader.reset(encoded);
      const result = decoder.readArray(values.length, () => decoder.readInt());
      expect(result).toEqual(values);
    });

    test('decodes empty fixed-size array', () => {
      const encoded = writer.flush();

      reader.reset(encoded);
      const result = decoder.readArray(0, () => decoder.readInt());
      expect(result).toEqual([]);
    });

    test('decodes variable-length array', () => {
      const values = [1, 2, 3, 4];
      encoder.writeUnsignedInt(values.length);
      values.forEach((v) => encoder.writeInt(v));
      const encoded = writer.flush();

      reader.reset(encoded);
      const result = decoder.readVarlenArray(() => decoder.readInt());
      expect(result).toEqual(values);
    });

    test('decodes empty variable-length array', () => {
      encoder.writeUnsignedInt(0);
      const encoded = writer.flush();

      reader.reset(encoded);
      const result = decoder.readVarlenArray(() => decoder.readInt());
      expect(result).toEqual([]);
    });
  });

  describe('decode method', () => {
    test('decode method calls readAny which throws', () => {
      const encoded = new Uint8Array([0, 0, 0, 42]);
      expect(() => decoder.decode(encoded)).toThrow('not implemented');
    });

    test('read method calls readAny which throws', () => {
      const encoded = new Uint8Array([0, 0, 0, 42]);
      expect(() => decoder.read(encoded)).toThrow('not implemented');
    });
  });

  describe('edge cases', () => {
    test('handles 32-bit integer boundaries', () => {
      const values = [-2147483648, 2147483647, 0];

      for (const value of values) {
        writer.reset();
        encoder.writeInt(value);
        const encoded = writer.flush();

        reader.reset(encoded);
        const result = decoder.readInt();
        expect(result).toBe(value);
      }
    });

    test('handles 32-bit unsigned integer boundaries', () => {
      const values = [0, 4294967295];

      for (const value of values) {
        writer.reset();
        encoder.writeUnsignedInt(value);
        const encoded = writer.flush();

        reader.reset(encoded);
        const result = decoder.readUnsignedInt();
        expect(result).toBe(value);
      }
    });

    test('handles special float values', () => {
      const values = [0, -0, Infinity, -Infinity];

      for (const value of values) {
        writer.reset();
        encoder.writeFloat(value);
        const encoded = writer.flush();

        reader.reset(encoded);
        const result = decoder.readFloat();
        expect(result).toBe(value);
      }
    });

    test('handles NaN float value', () => {
      writer.reset();
      encoder.writeFloat(NaN);
      const encoded = writer.flush();

      reader.reset(encoded);
      const result = decoder.readFloat();
      expect(result).toBeNaN();
    });

    test('handles special double values', () => {
      const values = [0, -0, Infinity, -Infinity];

      for (const value of values) {
        writer.reset();
        encoder.writeDouble(value);
        const encoded = writer.flush();

        reader.reset(encoded);
        const result = decoder.readDouble();
        expect(result).toBe(value);
      }
    });

    test('handles NaN double value', () => {
      writer.reset();
      encoder.writeDouble(NaN);
      const encoded = writer.flush();

      reader.reset(encoded);
      const result = decoder.readDouble();
      expect(result).toBeNaN();
    });
  });
});
