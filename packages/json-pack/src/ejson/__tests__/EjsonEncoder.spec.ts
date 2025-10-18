import {EjsonEncoder} from '../index';
import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {
  BsonBinary,
  BsonDbPointer,
  BsonDecimal128,
  BsonFloat,
  BsonInt32,
  BsonInt64,
  BsonJavascriptCode,
  BsonJavascriptCodeWithScope,
  BsonMaxKey,
  BsonMinKey,
  BsonObjectId,
  BsonSymbol,
  BsonTimestamp,
} from '../../bson/values';

describe('EjsonEncoder', () => {
  describe('Canonical mode', () => {
    const writer = new Writer();
    const encoder = new EjsonEncoder(writer, {canonical: true});

    test('encodes primitive values', () => {
      expect(encoder.encodeToString(null)).toBe('null');
      expect(encoder.encodeToString(true)).toBe('true');
      expect(encoder.encodeToString(false)).toBe('false');
      expect(encoder.encodeToString('hello')).toBe('"hello"');
      expect(encoder.encodeToString(undefined)).toBe('{"$undefined":true}');
    });

    test('encodes numbers as type wrappers', () => {
      expect(encoder.encodeToString(42)).toBe('{"$numberInt":"42"}');
      expect(encoder.encodeToString(-42)).toBe('{"$numberInt":"-42"}');
      expect(encoder.encodeToString(2147483647)).toBe('{"$numberInt":"2147483647"}');
      expect(encoder.encodeToString(2147483648)).toBe('{"$numberLong":"2147483648"}');
      expect(encoder.encodeToString(3.14)).toBe('{"$numberDouble":"3.14"}');
      expect(encoder.encodeToString(Infinity)).toBe('{"$numberDouble":"Infinity"}');
      expect(encoder.encodeToString(-Infinity)).toBe('{"$numberDouble":"-Infinity"}');
      expect(encoder.encodeToString(NaN)).toBe('{"$numberDouble":"NaN"}');
    });

    test('encodes arrays', () => {
      expect(encoder.encodeToString([1, 2, 3])).toBe('[{"$numberInt":"1"},{"$numberInt":"2"},{"$numberInt":"3"}]');
      expect(encoder.encodeToString(['a', 'b'])).toBe('["a","b"]');
    });

    test('encodes dates', () => {
      const date = new Date('2023-01-01T00:00:00.000Z');
      expect(encoder.encodeToString(date)).toBe('{"$date":{"$numberLong":"1672531200000"}}');
    });

    test('encodes regular expressions', () => {
      const regex = /pattern/gi;
      expect(encoder.encodeToString(regex)).toBe('{"$regularExpression":{"pattern":"pattern","options":"gi"}}');
    });

    test('encodes BSON value classes', () => {
      const objectId = new BsonObjectId(0x507f1f77, 0xbcf86cd799, 0x439011);
      expect(encoder.encodeToString(objectId)).toBe('{"$oid":"507f1f77bcf86cd799439011"}');

      const int32 = new BsonInt32(42);
      expect(encoder.encodeToString(int32)).toBe('{"$numberInt":"42"}');

      const int64 = new BsonInt64(1234567890123);
      expect(encoder.encodeToString(int64)).toBe('{"$numberLong":"1234567890123"}');

      const float = new BsonFloat(3.14);
      expect(encoder.encodeToString(float)).toBe('{"$numberDouble":"3.14"}');

      const decimal128 = new BsonDecimal128(new Uint8Array(16));
      expect(encoder.encodeToString(decimal128)).toBe('{"$numberDecimal":"0"}');

      const binary = new BsonBinary(0, new Uint8Array([1, 2, 3, 4]));
      expect(encoder.encodeToString(binary)).toBe('{"$binary":{"base64":"AQIDBA==","subType":"00"}}');

      const code = new BsonJavascriptCode('function() { return 42; }');
      expect(encoder.encodeToString(code)).toBe('{"$code":"function() { return 42; }"}');

      const codeWithScope = new BsonJavascriptCodeWithScope('function() { return x; }', {x: 42});
      expect(encoder.encodeToString(codeWithScope)).toBe(
        '{"$code":"function() { return x; }","$scope":{"x":{"$numberInt":"42"}}}',
      );

      const symbol = new BsonSymbol('mySymbol');
      expect(encoder.encodeToString(symbol)).toBe('{"$symbol":"mySymbol"}');

      const timestamp = new BsonTimestamp(12345, 1234567890);
      expect(encoder.encodeToString(timestamp)).toBe('{"$timestamp":{"t":1234567890,"i":12345}}');

      const dbPointer = new BsonDbPointer('collection', objectId);
      expect(encoder.encodeToString(dbPointer)).toBe(
        '{"$dbPointer":{"$ref":"collection","$id":{"$oid":"507f1f77bcf86cd799439011"}}}',
      );

      const minKey = new BsonMinKey();
      expect(encoder.encodeToString(minKey)).toBe('{"$minKey":1}');

      const maxKey = new BsonMaxKey();
      expect(encoder.encodeToString(maxKey)).toBe('{"$maxKey":1}');
    });

    test('encodes nested objects', () => {
      const obj = {
        str: 'hello',
        num: 42,
        nested: {
          bool: true,
          arr: [1, 2, 3],
        },
      };
      const expected =
        '{"str":"hello","num":{"$numberInt":"42"},"nested":{"bool":true,"arr":[{"$numberInt":"1"},{"$numberInt":"2"},{"$numberInt":"3"}]}}';
      expect(encoder.encodeToString(obj)).toBe(expected);
    });
  });

  describe('Relaxed mode', () => {
    const writer2 = new Writer();
    const encoder = new EjsonEncoder(writer2, {canonical: false});

    test('encodes numbers as native JSON types when possible', () => {
      expect(encoder.encodeToString(42)).toBe('42');
      expect(encoder.encodeToString(-42)).toBe('-42');
      expect(encoder.encodeToString(3.14)).toBe('3.14');
      expect(encoder.encodeToString(Infinity)).toBe('{"$numberDouble":"Infinity"}');
      expect(encoder.encodeToString(-Infinity)).toBe('{"$numberDouble":"-Infinity"}');
      expect(encoder.encodeToString(NaN)).toBe('{"$numberDouble":"NaN"}');
    });

    test('encodes dates in ISO format for years 1970-9999', () => {
      const date = new Date('2023-01-01T00:00:00.000Z');
      expect(encoder.encodeToString(date)).toBe('{"$date":"2023-01-01T00:00:00.000Z"}');

      // Test edge cases
      const oldDate = new Date('1900-01-01T00:00:00.000Z');
      expect(encoder.encodeToString(oldDate)).toBe('{"$date":{"$numberLong":"-2208988800000"}}');

      const futureDate = new Date('3000-01-01T00:00:00.000Z');
      expect(encoder.encodeToString(futureDate)).toBe('{"$date":"3000-01-01T00:00:00.000Z"}');
    });

    test('encodes BSON Int32/Int64/Float as native numbers', () => {
      const int32 = new BsonInt32(42);
      expect(encoder.encodeToString(int32)).toBe('42');

      const int64 = new BsonInt64(123);
      expect(encoder.encodeToString(int64)).toBe('123');

      const float = new BsonFloat(3.14);
      expect(encoder.encodeToString(float)).toBe('3.14');
    });

    test('encodes arrays with native numbers', () => {
      expect(encoder.encodeToString([1, 2, 3])).toBe('[1,2,3]');
      expect(encoder.encodeToString([1.5, 2.5])).toBe('[1.5,2.5]');
    });
  });
});
