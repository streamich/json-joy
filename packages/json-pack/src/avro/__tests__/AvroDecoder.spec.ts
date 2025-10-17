import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {AvroEncoder} from '../AvroEncoder';
import {AvroDecoder} from '../AvroDecoder';

describe('AvroDecoder', () => {
  const setup = () => {
    const writer = new Writer();
    const encoder = new AvroEncoder(writer);
    const decoder = new AvroDecoder();
    return {writer, encoder, decoder};
  };

  describe('primitive types', () => {
    test('decodes null', () => {
      const {writer, encoder, decoder} = setup();
      encoder.writeNull();
      const encoded = writer.flush();
      // Lower-level decoder needs explicit method calls since it doesn't have schema info
      decoder.reader.reset(encoded);
      const result = decoder.readNull();
      expect(result).toBe(null);
    });

    test('decodes boolean true', () => {
      const {writer, encoder, decoder} = setup();
      encoder.writeBoolean(true);
      const encoded = writer.flush();
      decoder.reader.reset(encoded);
      const result = decoder.readBoolean();
      expect(result).toBe(true);
    });

    test('decodes boolean false', () => {
      const {writer, encoder, decoder} = setup();
      encoder.writeBoolean(false);
      const encoded = writer.flush();
      decoder.reader.reset(encoded);
      const result = decoder.readBoolean();
      expect(result).toBe(false);
    });

    test('decodes positive int', () => {
      const {writer, encoder, decoder} = setup();
      encoder.writeInt(42);
      const encoded = writer.flush();
      decoder.reader.reset(encoded);
      const result = decoder.readInt();
      expect(result).toBe(42);
    });

    test('decodes negative int', () => {
      const {writer, encoder, decoder} = setup();
      encoder.writeInt(-1);
      const encoded = writer.flush();
      decoder.reader.reset(encoded);
      const result = decoder.readInt();
      expect(result).toBe(-1);
    });

    test('decodes int with multiple bytes', () => {
      const {writer, encoder, decoder} = setup();
      encoder.writeInt(300);
      const encoded = writer.flush();
      decoder.reader.reset(encoded);
      const result = decoder.readInt();
      expect(result).toBe(300);
    });

    test('decodes int32 boundary values', () => {
      const {writer, encoder, decoder} = setup();
      const testValues = [0, 1, -1, 127, -128, 32767, -32768, 2147483647, -2147483648];

      for (const value of testValues) {
        writer.reset();
        encoder.writeInt(value);
        const encoded = writer.flush();
        decoder.reader.reset(encoded);
        const result = decoder.readInt();
        expect(result).toBe(value);
      }
    });

    test('decodes long values', () => {
      const {writer, encoder, decoder} = setup();
      const testValues = [BigInt(0), BigInt(1), BigInt(-1), BigInt(1000000), BigInt(-1000000)];

      for (const value of testValues) {
        writer.reset();
        encoder.writeLong(value);
        const encoded = writer.flush();
        decoder.reader.reset(encoded);
        const result = decoder.readLong();
        expect(result).toBe(Number(value));
      }
    });

    test('decodes large long as bigint', () => {
      const {writer, encoder, decoder} = setup();
      const value = BigInt(Number.MAX_SAFE_INTEGER) + BigInt(1);
      encoder.writeLong(value);
      const encoded = writer.flush();
      decoder.reader.reset(encoded);
      const result = decoder.readLong();
      expect(result).toBe(value);
    });

    test('decodes float values', () => {
      const {writer, encoder, decoder} = setup();
      const testValues = [0.0, 1.5, -2.75, Math.PI, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];

      for (const value of testValues) {
        writer.reset();
        encoder.writeFloat(value);
        const encoded = writer.flush();
        decoder.reader.reset(encoded);
        const result = decoder.readFloat();
        expect(result).toBeCloseTo(value, 6);
      }
    });

    test('decodes float NaN', () => {
      const {writer, encoder, decoder} = setup();
      encoder.writeFloat(Number.NaN);
      const encoded = writer.flush();
      decoder.reader.reset(encoded);
      const result = decoder.readFloat();
      expect(Number.isNaN(result)).toBe(true);
    });

    test('decodes double values', () => {
      const {writer, encoder, decoder} = setup();
      const testValues = [0.0, 1.5, -2.75, Math.PI, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];

      for (const value of testValues) {
        writer.reset();
        encoder.writeDouble(value);
        const encoded = writer.flush();
        decoder.reader.reset(encoded);
        const result = decoder.readDouble();
        expect(result).toBe(value);
      }
    });

    test('decodes double NaN', () => {
      const {writer, encoder, decoder} = setup();
      encoder.writeDouble(Number.NaN);
      const encoded = writer.flush();
      decoder.reader.reset(encoded);
      const result = decoder.readDouble();
      expect(Number.isNaN(result)).toBe(true);
    });

    test('decodes bytes', () => {
      const {writer, encoder, decoder} = setup();
      const testData = new Uint8Array([1, 2, 3, 4, 5]);
      encoder.writeBin(testData);
      const encoded = writer.flush();
      decoder.reader.reset(encoded);
      const result = decoder.readBytes();
      expect(result).toEqual(testData);
    });

    test('decodes empty bytes', () => {
      const {writer, encoder, decoder} = setup();
      const testData = new Uint8Array([]);
      encoder.writeBin(testData);
      const encoded = writer.flush();
      decoder.reader.reset(encoded);
      const result = decoder.readBytes();
      expect(result).toEqual(testData);
    });

    test('decodes string', () => {
      const {writer, encoder, decoder} = setup();
      const testString = 'Hello, Avro!';
      encoder.writeStr(testString);
      const encoded = writer.flush();
      decoder.reader.reset(encoded);
      const result = decoder.readString();
      expect(result).toBe(testString);
    });

    test('decodes empty string', () => {
      const {writer, encoder, decoder} = setup();
      const testString = '';
      encoder.writeStr(testString);
      const encoded = writer.flush();
      decoder.reader.reset(encoded);
      const result = decoder.readString();
      expect(result).toBe(testString);
    });

    test('decodes unicode string', () => {
      const {writer, encoder, decoder} = setup();
      const testString = 'Hello 🌍! 你好世界!';
      encoder.writeStr(testString);
      const encoded = writer.flush();
      decoder.reader.reset(encoded);
      const result = decoder.readString();
      expect(result).toBe(testString);
    });
  });

  describe('complex types', () => {
    test('decodes array of ints', () => {
      const {writer, encoder, decoder} = setup();
      const testArray = [1, 2, 3, 4, 5];
      encoder.writeArr(testArray);
      const encoded = writer.flush();
      decoder.reader.reset(encoded);
      const result = decoder.readArray(() => decoder.readInt());
      expect(result).toEqual(testArray);
    });

    test('decodes empty array', () => {
      const {writer, encoder, decoder} = setup();
      const testArray: number[] = [];
      encoder.writeArr(testArray);
      const encoded = writer.flush();
      decoder.reader.reset(encoded);
      const result = decoder.readArray(() => decoder.readInt());
      expect(result).toEqual(testArray);
    });

    test('decodes map of strings', () => {
      const {writer, encoder, decoder} = setup();
      const testMap = {key1: 'value1', key2: 'value2', key3: 'value3'};
      encoder.writeObj(testMap);
      const encoded = writer.flush();
      decoder.reader.reset(encoded);
      const result = decoder.readMap(() => decoder.readString());
      expect(result).toEqual(testMap);
    });

    test('decodes empty map', () => {
      const {writer, encoder, decoder} = setup();
      const testMap = {};
      encoder.writeObj(testMap);
      const encoded = writer.flush();
      decoder.reader.reset(encoded);
      const result = decoder.readMap(() => decoder.readString());
      expect(result).toEqual(testMap);
    });

    test('decodes enum value', () => {
      const {writer, decoder} = setup();
      // Enum index 2 (encoded with zigzag)
      writer.reset();
      const enumIndex = 2;
      const zigzag = (enumIndex << 1) ^ (enumIndex >> 31); // zigzag encode
      let n = zigzag >>> 0;
      while (n >= 0x80) {
        writer.u8((n & 0x7f) | 0x80);
        n >>>= 7;
      }
      writer.u8(n & 0x7f);

      const encoded = writer.flush();
      decoder.reader.reset(encoded);
      const result = decoder.readEnum();
      expect(result).toBe(enumIndex);
    });

    test('decodes fixed bytes', () => {
      const {writer, decoder} = setup();
      const fixedSize = 8;
      const testData = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
      writer.reset();
      writer.buf(testData, testData.length);
      const encoded = writer.flush();
      decoder.reader.reset(encoded);
      const result = decoder.readFixed(fixedSize);
      expect(result).toEqual(testData);
    });

    test('decodes union value', () => {
      const {writer, decoder} = setup();
      // Union with index 1 selecting string type
      writer.reset();
      const unionIndex = 1;
      const zigzag = (unionIndex << 1) ^ (unionIndex >> 31); // zigzag encode
      let n = zigzag >>> 0;
      while (n >= 0x80) {
        writer.u8((n & 0x7f) | 0x80);
        n >>>= 7;
      }
      writer.u8(n & 0x7f);

      // Then encode a string value
      const testString = 'union string';
      const strBytes = new TextEncoder().encode(testString);
      let length = strBytes.length;
      while (length >= 0x80) {
        writer.u8((length & 0x7f) | 0x80);
        length >>>= 7;
      }
      writer.u8(length & 0x7f);
      writer.buf(strBytes, strBytes.length);

      const encoded = writer.flush();
      decoder.reader.reset(encoded);
      const schemaReaders = [() => decoder.readInt(), () => decoder.readString(), () => decoder.readBoolean()] as Array<
        () => any
      >;
      const result = decoder.readUnion(schemaReaders);
      expect(result.index).toBe(1);
      expect(result.value).toBe(testString);
    });
  });

  describe('error handling', () => {
    test('throws error for readAny without schema', () => {
      const {decoder} = setup();
      decoder.reader.reset(new Uint8Array([1]));
      expect(() => decoder.readAny()).toThrow('readAny() requires schema information');
    });

    test('throws error for invalid union index', () => {
      const {writer, decoder} = setup();
      writer.reset();
      // Encode union index 5 (out of bounds)
      const unionIndex = 5;
      const zigzag = (unionIndex << 1) ^ (unionIndex >> 31);
      let n = zigzag >>> 0;
      while (n >= 0x80) {
        writer.u8((n & 0x7f) | 0x80);
        n >>>= 7;
      }
      writer.u8(n & 0x7f);

      const encoded = writer.flush();
      decoder.reader.reset(encoded);
      const schemaReaders = [() => decoder.readInt(), () => decoder.readString()] as Array<() => any>;
      expect(() => decoder.readUnion(schemaReaders)).toThrow('Invalid union index: 5');
    });

    test('throws error for variable-length integer too long', () => {
      const {writer, decoder} = setup();
      writer.reset();
      // Write 5 bytes with continuation bit set (too long for 32-bit)
      for (let i = 0; i < 5; i++) {
        writer.u8(0x80);
      }

      const encoded = writer.flush();
      decoder.reader.reset(encoded);
      expect(() => decoder.readInt()).toThrow('Variable-length integer is too long');
    });

    test('throws error for variable-length long too long', () => {
      const {writer, decoder} = setup();
      writer.reset();
      // Write 10 bytes with continuation bit set (too long for 64-bit)
      for (let i = 0; i < 10; i++) {
        writer.u8(0x80);
      }

      const encoded = writer.flush();
      decoder.reader.reset(encoded);
      expect(() => decoder.readLong()).toThrow('Variable-length long is too long');
    });

    test('throws error for invalid key in map', () => {
      const {writer, decoder} = setup();
      writer.reset();
      // Map count: 1
      writer.u8(1);
      // Key: "__proto__"
      const keyBytes = new TextEncoder().encode('__proto__');
      writer.u8(keyBytes.length);
      writer.buf(keyBytes, keyBytes.length);

      const encoded = writer.flush();
      decoder.reader.reset(encoded);
      expect(() => decoder.readMap(() => decoder.readString())).toThrow('INVALID_KEY');
    });
  });
});
