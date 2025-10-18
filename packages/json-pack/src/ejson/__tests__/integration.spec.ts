import {EjsonEncoder, EjsonDecoder} from '../index';
import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {
  BsonBinary,
  BsonInt32,
  BsonInt64,
  BsonFloat,
  BsonObjectId,
  BsonJavascriptCode,
  BsonTimestamp,
} from '../../bson/values';

describe('EJSON v2 Codec Integration', () => {
  describe('Round-trip encoding and decoding', () => {
    const canonicalWriter = new Writer();
    const relaxedWriter = new Writer();
    const canonicalEncoder = new EjsonEncoder(canonicalWriter, {canonical: true});
    const relaxedEncoder = new EjsonEncoder(relaxedWriter, {canonical: false});
    const decoder = new EjsonDecoder();

    test('round-trip with primitive values', () => {
      const values = [null, true, false, 'hello', undefined];

      for (const value of values) {
        const canonicalJson = canonicalEncoder.encodeToString(value);
        const relaxedJson = relaxedEncoder.encodeToString(value);

        expect(decoder.decodeFromString(canonicalJson)).toEqual(value);
        expect(decoder.decodeFromString(relaxedJson)).toEqual(value);
      }

      // Numbers are handled specially
      const numberValue = 42;
      const canonicalJson = canonicalEncoder.encodeToString(numberValue);
      const relaxedJson = relaxedEncoder.encodeToString(numberValue);

      // Canonical format creates BsonInt32
      const canonicalResult = decoder.decodeFromString(canonicalJson) as BsonInt32;
      expect(canonicalResult).toBeInstanceOf(BsonInt32);
      expect(canonicalResult.value).toBe(42);

      // Relaxed format stays as number
      expect(decoder.decodeFromString(relaxedJson)).toBe(42);
    });

    test('round-trip with arrays', () => {
      const array = [1, 'hello', true, null, {nested: 42}];

      const canonicalJson = canonicalEncoder.encodeToString(array);
      const relaxedJson = relaxedEncoder.encodeToString(array);

      // For canonical, numbers become BsonInt32
      const canonicalResult = decoder.decodeFromString(canonicalJson) as unknown[];
      expect(canonicalResult[0]).toBeInstanceOf(BsonInt32);
      expect((canonicalResult[0] as BsonInt32).value).toBe(1);
      expect(canonicalResult[1]).toBe('hello');
      expect(canonicalResult[2]).toBe(true);
      expect(canonicalResult[3]).toBe(null);

      const nestedObj = canonicalResult[4] as Record<string, unknown>;
      expect(nestedObj.nested).toBeInstanceOf(BsonInt32);
      expect((nestedObj.nested as BsonInt32).value).toBe(42);

      // For relaxed, numbers stay as native JSON numbers
      const relaxedResult = decoder.decodeFromString(relaxedJson);
      expect(relaxedResult).toEqual(array);
    });

    test('round-trip with BSON types', () => {
      const objectId = new BsonObjectId(0x507f1f77, 0xbcf86cd799, 0x439011);
      const int32 = new BsonInt32(42);
      const int64 = new BsonInt64(1234567890123);
      const float = new BsonFloat(Math.PI);
      const binary = new BsonBinary(0, new Uint8Array([1, 2, 3, 4]));
      const code = new BsonJavascriptCode('function() { return 42; }');
      const timestamp = new BsonTimestamp(12345, 1234567890);

      const values = [objectId, int32, int64, float, binary, code, timestamp];

      for (const value of values) {
        const canonicalJson = canonicalEncoder.encodeToString(value);
        const relaxedJson = relaxedEncoder.encodeToString(value);

        const canonicalResult = decoder.decodeFromString(canonicalJson);

        // Both should decode to equivalent objects for BSON types
        expect(canonicalResult).toEqual(value);

        // For relaxed mode, numbers may decode differently
        if (value instanceof BsonInt32 || value instanceof BsonInt64 || value instanceof BsonFloat) {
          // These are encoded as native JSON numbers in relaxed mode
          // When decoded from native JSON, they stay as native numbers
          const relaxedResult = decoder.decodeFromString(relaxedJson);
          expect(typeof relaxedResult === 'number').toBe(true);
          expect(relaxedResult).toBe(value.value);
        } else {
          const relaxedResult = decoder.decodeFromString(relaxedJson);
          expect(relaxedResult).toEqual(value);
        }
      }
    });

    test('round-trip with complex nested objects', () => {
      const complexObj = {
        metadata: {
          id: new BsonObjectId(0x507f1f77, 0xbcf86cd799, 0x439011),
          created: new Date('2023-01-01T00:00:00.000Z'),
          version: 1,
        },
        data: {
          values: [1, 2, 3],
          settings: {
            enabled: true,
            threshold: 3.14,
          },
        },
        binary: new BsonBinary(0, new Uint8Array([0xff, 0xee, 0xdd])),
        code: new BsonJavascriptCode('function validate() { return true; }'),
      };

      const canonicalJson = canonicalEncoder.encodeToString(complexObj);
      const relaxedJson = relaxedEncoder.encodeToString(complexObj);

      const canonicalResult = decoder.decodeFromString(canonicalJson) as Record<string, unknown>;
      const relaxedResult = decoder.decodeFromString(relaxedJson) as Record<string, unknown>;

      // Check ObjectId
      expect((canonicalResult.metadata as any).id).toBeInstanceOf(BsonObjectId);
      expect((relaxedResult.metadata as any).id).toBeInstanceOf(BsonObjectId);

      // Check Date
      expect((canonicalResult.metadata as any).created).toBeInstanceOf(Date);
      expect((relaxedResult.metadata as any).created).toBeInstanceOf(Date);

      // Check numbers (canonical vs relaxed difference)
      expect((canonicalResult.metadata as any).version).toBeInstanceOf(BsonInt32);
      expect(typeof (relaxedResult.metadata as any).version).toBe('number');

      // Check Binary
      expect(canonicalResult.binary).toBeInstanceOf(BsonBinary);
      expect(relaxedResult.binary).toBeInstanceOf(BsonBinary);

      // Check Code
      expect(canonicalResult.code).toBeInstanceOf(BsonJavascriptCode);
      expect(relaxedResult.code).toBeInstanceOf(BsonJavascriptCode);
    });

    test('handles special numeric values', () => {
      const values = [Infinity, -Infinity, NaN];

      for (const value of values) {
        const canonicalJson = canonicalEncoder.encodeToString(value);
        const relaxedJson = relaxedEncoder.encodeToString(value);

        const canonicalResult = decoder.decodeFromString(canonicalJson) as BsonFloat;
        const relaxedResult = decoder.decodeFromString(relaxedJson) as BsonFloat;

        expect(canonicalResult).toBeInstanceOf(BsonFloat);
        expect(relaxedResult).toBeInstanceOf(BsonFloat);

        if (Number.isNaN(value)) {
          expect(Number.isNaN(canonicalResult.value)).toBe(true);
          expect(Number.isNaN(relaxedResult.value)).toBe(true);
        } else {
          expect(canonicalResult.value).toBe(value);
          expect(relaxedResult.value).toBe(value);
        }
      }
    });

    test('handles regular expressions', () => {
      const regex = /test.*pattern/gim;

      const canonicalJson = canonicalEncoder.encodeToString(regex);
      const relaxedJson = relaxedEncoder.encodeToString(regex);

      const canonicalResult = decoder.decodeFromString(canonicalJson) as RegExp;
      const relaxedResult = decoder.decodeFromString(relaxedJson) as RegExp;

      expect(canonicalResult).toBeInstanceOf(RegExp);
      expect(relaxedResult).toBeInstanceOf(RegExp);
      expect(canonicalResult.source).toBe(regex.source);
      expect(relaxedResult.source).toBe(regex.source);
      expect(canonicalResult.flags).toBe(regex.flags);
      expect(relaxedResult.flags).toBe(regex.flags);
    });

    test('handles dates with different year ranges', () => {
      const dates = [
        new Date('1969-12-31T23:59:59.999Z'), // Before 1970
        new Date('1970-01-01T00:00:00.000Z'), // Start of range
        new Date('2023-06-15T12:30:45.123Z'), // Normal date
        new Date('9999-12-31T23:59:59.999Z'), // End of range
        new Date('3000-01-01T00:00:00.000Z'), // Future date (valid in JS)
      ];

      for (const date of dates) {
        // Skip invalid dates
        if (Number.isNaN(date.getTime())) continue;

        const canonicalJson = canonicalEncoder.encodeToString(date);
        const relaxedJson = relaxedEncoder.encodeToString(date);

        const canonicalResult = decoder.decodeFromString(canonicalJson) as Date;
        const relaxedResult = decoder.decodeFromString(relaxedJson) as Date;

        expect(canonicalResult).toBeInstanceOf(Date);
        expect(relaxedResult).toBeInstanceOf(Date);
        expect(canonicalResult.getTime()).toBe(date.getTime());
        expect(relaxedResult.getTime()).toBe(date.getTime());
      }
    });
  });

  describe('Error handling', () => {
    const decoder = new EjsonDecoder();

    test('throws on malformed JSON', () => {
      expect(() => decoder.decodeFromString('{')).toThrow();
      expect(() => decoder.decodeFromString('invalid json')).toThrow();
    });

    test('throws on invalid type wrapper formats', () => {
      expect(() => decoder.decodeFromString('{"$oid": 123}')).toThrow();
      expect(() => decoder.decodeFromString('{"$numberInt": "invalid"}')).toThrow();
      expect(() => decoder.decodeFromString('{"$binary": "not an object"}')).toThrow();
    });

    test('throws on incomplete type wrappers', () => {
      expect(() => decoder.decodeFromString('{"$binary": {"base64": "data"}}')).toThrow(); // missing subType
      expect(() => decoder.decodeFromString('{"$timestamp": {"t": 123}}')).toThrow(); // missing i
    });

    test('throws on type wrappers with extra fields', () => {
      expect(() => decoder.decodeFromString('{"$oid": "507f1f77bcf86cd799439011", "extra": "field"}')).toThrow();
      expect(() => decoder.decodeFromString('{"$numberInt": "42", "invalid": true}')).toThrow();
    });
  });
});
