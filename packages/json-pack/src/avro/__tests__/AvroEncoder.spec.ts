import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {AvroEncoder} from '../AvroEncoder';

describe('AvroEncoder', () => {
  let writer: Writer;
  let encoder: AvroEncoder;

  beforeEach(() => {
    writer = new Writer();
    encoder = new AvroEncoder(writer);
  });

  describe('primitive types', () => {
    test('encodes null', () => {
      encoder.writeNull();
      const result = writer.flush();
      expect(result.length).toBe(0);
    });

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

    test('encodes positive int', () => {
      encoder.writeInt(42);
      const result = writer.flush();
      // 42 in zigzag is 84, which is 0x54, encoded as single byte
      expect(result).toEqual(new Uint8Array([84]));
    });

    test('encodes negative int', () => {
      encoder.writeInt(-1);
      const result = writer.flush();
      // -1 in zigzag is 1, encoded as single byte
      expect(result).toEqual(new Uint8Array([1]));
    });

    test('encodes int with multiple bytes', () => {
      encoder.writeInt(300);
      const result = writer.flush();
      // 300 zigzag encoded should use multiple bytes
      expect(result.length).toBeGreaterThan(1);
    });

    test('encodes long from number', () => {
      encoder.writeLong(123456789);
      const result = writer.flush();
      expect(result.length).toBeGreaterThan(0);
    });

    test('encodes long from bigint', () => {
      encoder.writeLong(BigInt('123456789012345'));
      const result = writer.flush();
      expect(result.length).toBeGreaterThan(0);
    });

    test('encodes float', () => {
      encoder.writeFloatAvro(3.14);
      const result = writer.flush();
      expect(result.length).toBe(4); // IEEE 754 single precision
    });

    test('encodes double', () => {
      encoder.writeDouble(Math.PI);
      const result = writer.flush();
      expect(result.length).toBe(8); // IEEE 754 double precision
    });

    test('encodes bytes', () => {
      const bytes = new Uint8Array([1, 2, 3, 4]);
      encoder.writeBin(bytes);
      const result = writer.flush();
      // Length-prefixed: length + data
      expect(result[0]).toBe(4); // length 4 (not zigzag for lengths)
      expect(result.slice(1)).toEqual(bytes);
    });

    test('encodes string', () => {
      encoder.writeStr('hello');
      const result = writer.flush();
      // Length-prefixed UTF-8
      expect(result[0]).toBe(5); // length 5 (not zigzag for lengths)
      expect(result.slice(1)).toEqual(new TextEncoder().encode('hello'));
    });

    test('encodes empty string', () => {
      encoder.writeStr('');
      const result = writer.flush();
      expect(result).toEqual(new Uint8Array([0])); // length 0
    });

    test('encodes UTF-8 string', () => {
      encoder.writeStr('héllo');
      const result = writer.flush();
      const utf8Bytes = new TextEncoder().encode('héllo');
      expect(result[0]).toBe(utf8Bytes.length); // length (not zigzag)
      expect(result.slice(1)).toEqual(utf8Bytes);
    });
  });

  describe('arrays', () => {
    test('encodes empty array', () => {
      encoder.writeArr([]);
      const result = writer.flush();
      expect(result).toEqual(new Uint8Array([0, 0])); // length 0, end marker 0
    });

    test('encodes array of integers', () => {
      encoder.writeArr([1, 2, 3]);
      const result = writer.flush();
      expect(result[0]).toBe(3); // length 3 (not zigzag)
      // Followed by encoded integers and end marker
      expect(result[result.length - 1]).toBe(0); // end marker
    });

    test('encodes array of mixed types', () => {
      encoder.writeArr([1, 'hello', true]);
      const result = writer.flush();
      expect(result[0]).toBe(3); // length 3 (not zigzag)
      expect(result[result.length - 1]).toBe(0); // end marker
    });
  });

  describe('objects/maps', () => {
    test('encodes empty object', () => {
      encoder.writeObj({});
      const result = writer.flush();
      expect(result).toEqual(new Uint8Array([0, 0])); // length 0, end marker 0
    });

    test('encodes simple object', () => {
      encoder.writeObj({key: 'value'});
      const result = writer.flush();
      expect(result[0]).toBe(1); // length 1 (not zigzag)
      expect(result[result.length - 1]).toBe(0); // end marker
    });

    test('encodes object with multiple keys', () => {
      encoder.writeObj({a: 1, b: 'test'});
      const result = writer.flush();
      expect(result[0]).toBe(2); // length 2 (not zigzag)
      expect(result[result.length - 1]).toBe(0); // end marker
    });
  });

  describe('encode method', () => {
    test('encodes various types through encode method', () => {
      const data = {
        nullValue: null,
        boolValue: true,
        intValue: 42,
        stringValue: 'test',
        arrayValue: [1, 2, 3],
      };

      const result = encoder.encode(data);
      expect(result.length).toBeGreaterThan(0);
    });

    test('handles unknown types', () => {
      const result = encoder.encode(new Date());
      expect(result.length).toBe(0); // writeUnknown calls writeNull
    });

    test('handles undefined', () => {
      const result = encoder.encode(undefined);
      expect(result.length).toBe(0); // writeNull
    });

    test('handles bigint', () => {
      const result = encoder.encode(BigInt(123));
      expect(result.length).toBeGreaterThan(0);
    });

    test('handles Uint8Array', () => {
      const bytes = new Uint8Array([1, 2, 3]);
      const result = encoder.encode(bytes);
      expect(result[0]).toBe(3); // length 3 (not zigzag)
      expect(result.slice(1, 4)).toEqual(bytes);
    });
  });

  describe('BinaryJsonEncoder interface methods', () => {
    test('writeNumber chooses appropriate type', () => {
      // Integer in int range
      encoder.writeNumber(42);
      let result = writer.flush();
      expect(result).toEqual(new Uint8Array([84])); // 42 zigzag encoded

      writer.reset();

      // Integer outside int range
      encoder.writeNumber(3000000000);
      result = writer.flush();
      expect(result.length).toBeGreaterThan(1);

      writer.reset();

      // Float
      encoder.writeNumber(3.14);
      result = writer.flush();
      expect(result.length).toBe(8); // double precision
    });

    test('writeInteger', () => {
      encoder.writeInteger(63); // 63 zigzag = 126, which fits in one byte
      const result = writer.flush();
      expect(result).toEqual(new Uint8Array([126])); // 63 zigzag encoded is 126
    });

    test('writeUInteger', () => {
      encoder.writeUInteger(63); // same as writeInteger in our implementation
      const result = writer.flush();
      expect(result).toEqual(new Uint8Array([126])); // same as writeInteger
    });

    test('writeFloat interface method', () => {
      encoder.writeFloat(3.14);
      const result = writer.flush();
      expect(result.length).toBe(4); // float precision through interface
    });

    test('writeAsciiStr', () => {
      encoder.writeAsciiStr('test');
      const result = writer.flush();
      expect(result[0]).toBe(4); // length 4 (not zigzag)
      expect(result.slice(1)).toEqual(new TextEncoder().encode('test'));
    });
  });

  describe('edge cases', () => {
    test('encodes very large numbers', () => {
      const largeInt = 2147483647; // max int32
      encoder.writeInt(largeInt);
      const result = writer.flush();
      expect(result.length).toBeGreaterThan(0);
    });

    test('encodes negative numbers correctly', () => {
      encoder.writeInt(-2147483648); // min int32
      const result = writer.flush();
      expect(result.length).toBeGreaterThan(0);
    });

    test('encodes special float values', () => {
      writer.reset();
      encoder.writeFloatAvro(Infinity);
      let result = writer.flush();
      expect(result.length).toBe(4);

      writer.reset();
      encoder.writeFloatAvro(-Infinity);
      result = writer.flush();
      expect(result.length).toBe(4);

      writer.reset();
      encoder.writeFloatAvro(NaN);
      result = writer.flush();
      expect(result.length).toBe(4);
    });

    test('encodes special double values', () => {
      writer.reset();
      encoder.writeDouble(Infinity);
      let result = writer.flush();
      expect(result.length).toBe(8);

      writer.reset();
      encoder.writeDouble(-Infinity);
      result = writer.flush();
      expect(result.length).toBe(8);

      writer.reset();
      encoder.writeDouble(NaN);
      result = writer.flush();
      expect(result.length).toBe(8);
    });
  });
});
