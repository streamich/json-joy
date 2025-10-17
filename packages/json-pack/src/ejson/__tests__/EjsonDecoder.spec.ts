import {EjsonDecoder} from '../EjsonDecoder';
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

describe('EjsonDecoder', () => {
  const decoder = new EjsonDecoder();

  test('decodes primitive values', () => {
    expect(decoder.decodeFromString('null')).toBe(null);
    expect(decoder.decodeFromString('true')).toBe(true);
    expect(decoder.decodeFromString('false')).toBe(false);
    expect(decoder.decodeFromString('"hello"')).toBe('hello');
    expect(decoder.decodeFromString('42')).toBe(42);
    expect(decoder.decodeFromString('3.14')).toBe(3.14);
  });

  test('decodes arrays', () => {
    expect(decoder.decodeFromString('[1, 2, 3]')).toEqual([1, 2, 3]);
    expect(decoder.decodeFromString('["a", "b"]')).toEqual(['a', 'b']);
  });

  test('decodes plain objects', () => {
    const result = decoder.decodeFromString('{"name": "John", "age": 30}');
    expect(result).toEqual({name: 'John', age: 30});
  });

  test('decodes ObjectId', () => {
    const result = decoder.decodeFromString('{"$oid": "507f1f77bcf86cd799439011"}') as BsonObjectId;
    expect(result).toBeInstanceOf(BsonObjectId);
    expect(result.timestamp).toBe(0x507f1f77);
    expect(result.process).toBe(0xbcf86cd799);
    expect(result.counter).toBe(0x439011);
  });

  test('throws on invalid ObjectId', () => {
    expect(() => decoder.decodeFromString('{"$oid": "invalid"}')).toThrow('Invalid ObjectId format');
    expect(() => decoder.decodeFromString('{"$oid": 123}')).toThrow('Invalid ObjectId format');
  });

  test('decodes Int32', () => {
    const result = decoder.decodeFromString('{"$numberInt": "42"}') as BsonInt32;
    expect(result).toBeInstanceOf(BsonInt32);
    expect(result.value).toBe(42);

    const negResult = decoder.decodeFromString('{"$numberInt": "-42"}') as BsonInt32;
    expect(negResult.value).toBe(-42);
  });

  test('throws on invalid Int32', () => {
    expect(() => decoder.decodeFromString('{"$numberInt": 42}')).toThrow('Invalid Int32 format');
    expect(() => decoder.decodeFromString('{"$numberInt": "2147483648"}')).toThrow('Invalid Int32 format');
    expect(() => decoder.decodeFromString('{"$numberInt": "invalid"}')).toThrow('Invalid Int32 format');
  });

  test('decodes Int64', () => {
    const result = decoder.decodeFromString('{"$numberLong": "9223372036854775807"}') as BsonInt64;
    expect(result).toBeInstanceOf(BsonInt64);
    expect(result.value).toBe(
      // biome-ignore lint: precision loss is acceptable in this test
      9223372036854775807,
    );
  });

  test('throws on invalid Int64', () => {
    expect(() => decoder.decodeFromString('{"$numberLong": 123}')).toThrow('Invalid Int64 format');
    expect(() => decoder.decodeFromString('{"$numberLong": "invalid"}')).toThrow('Invalid Int64 format');
  });

  test('decodes Double', () => {
    const result = decoder.decodeFromString('{"$numberDouble": "3.14"}') as BsonFloat;
    expect(result).toBeInstanceOf(BsonFloat);
    expect(result.value).toBe(3.14);

    const infResult = decoder.decodeFromString('{"$numberDouble": "Infinity"}') as BsonFloat;
    expect(infResult.value).toBe(Infinity);

    const negInfResult = decoder.decodeFromString('{"$numberDouble": "-Infinity"}') as BsonFloat;
    expect(negInfResult.value).toBe(-Infinity);

    const nanResult = decoder.decodeFromString('{"$numberDouble": "NaN"}') as BsonFloat;
    expect(Number.isNaN(nanResult.value)).toBe(true);
  });

  test('throws on invalid Double', () => {
    expect(() => decoder.decodeFromString('{"$numberDouble": 3.14}')).toThrow('Invalid Double format');
    expect(() => decoder.decodeFromString('{"$numberDouble": "invalid"}')).toThrow('Invalid Double format');
  });

  test('decodes Decimal128', () => {
    const result = decoder.decodeFromString('{"$numberDecimal": "123.456"}') as BsonDecimal128;
    expect(result).toBeInstanceOf(BsonDecimal128);
    expect(result.data).toBeInstanceOf(Uint8Array);
    expect(result.data.length).toBe(16);
  });

  test('decodes Binary', () => {
    const result = decoder.decodeFromString('{"$binary": {"base64": "AQIDBA==", "subType": "00"}}') as BsonBinary;
    expect(result).toBeInstanceOf(BsonBinary);
    expect(result.subtype).toBe(0);
    expect(Array.from(result.data)).toEqual([1, 2, 3, 4]);
  });

  test('decodes UUID', () => {
    const result = decoder.decodeFromString('{"$uuid": "c8edabc3-f738-4ca3-b68d-ab92a91478a3"}') as BsonBinary;
    expect(result).toBeInstanceOf(BsonBinary);
    expect(result.subtype).toBe(4);
    expect(result.data.length).toBe(16);
  });

  test('throws on invalid UUID', () => {
    expect(() => decoder.decodeFromString('{"$uuid": "invalid-uuid"}')).toThrow('Invalid UUID format');
  });

  test('decodes Code', () => {
    const result = decoder.decodeFromString('{"$code": "function() { return 42; }"}') as BsonJavascriptCode;
    expect(result).toBeInstanceOf(BsonJavascriptCode);
    expect(result.code).toBe('function() { return 42; }');
  });

  test('decodes CodeWScope', () => {
    const result = decoder.decodeFromString(
      '{"$code": "function() { return x; }", "$scope": {"x": 42}}',
    ) as BsonJavascriptCodeWithScope;
    expect(result).toBeInstanceOf(BsonJavascriptCodeWithScope);
    expect(result.code).toBe('function() { return x; }');
    expect(result.scope).toEqual({x: 42});
  });

  test('decodes Symbol', () => {
    const result = decoder.decodeFromString('{"$symbol": "mySymbol"}') as BsonSymbol;
    expect(result).toBeInstanceOf(BsonSymbol);
    expect(result.symbol).toBe('mySymbol');
  });

  test('decodes Timestamp', () => {
    const result = decoder.decodeFromString('{"$timestamp": {"t": 1234567890, "i": 12345}}') as BsonTimestamp;
    expect(result).toBeInstanceOf(BsonTimestamp);
    expect(result.timestamp).toBe(1234567890);
    expect(result.increment).toBe(12345);
  });

  test('throws on invalid Timestamp', () => {
    expect(() => decoder.decodeFromString('{"$timestamp": {"t": -1, "i": 12345}}')).toThrow('Invalid Timestamp format');
    expect(() => decoder.decodeFromString('{"$timestamp": {"t": 123, "i": -1}}')).toThrow('Invalid Timestamp format');
  });

  test('decodes RegularExpression', () => {
    const result = decoder.decodeFromString('{"$regularExpression": {"pattern": "test", "options": "gi"}}') as RegExp;
    expect(result).toBeInstanceOf(RegExp);
    expect(result.source).toBe('test');
    expect(result.flags).toBe('gi');
  });

  test('decodes DBPointer', () => {
    const result = decoder.decodeFromString(
      '{"$dbPointer": {"$ref": "collection", "$id": {"$oid": "507f1f77bcf86cd799439011"}}}',
    ) as BsonDbPointer;
    expect(result).toBeInstanceOf(BsonDbPointer);
    expect(result.name).toBe('collection');
    expect(result.id).toBeInstanceOf(BsonObjectId);
  });

  test('decodes Date (ISO format)', () => {
    const result = decoder.decodeFromString('{"$date": "2023-01-01T00:00:00.000Z"}') as Date;
    expect(result).toBeInstanceOf(Date);
    expect(result.toISOString()).toBe('2023-01-01T00:00:00.000Z');
  });

  test('decodes Date (canonical format)', () => {
    const result = decoder.decodeFromString('{"$date": {"$numberLong": "1672531200000"}}') as Date;
    expect(result).toBeInstanceOf(Date);
    expect(result.getTime()).toBe(1672531200000);
  });

  test('throws on invalid Date', () => {
    expect(() => decoder.decodeFromString('{"$date": "invalid-date"}')).toThrow('Invalid Date format');
    expect(() => decoder.decodeFromString('{"$date": {"$numberLong": "invalid"}}')).toThrow('Invalid Date format');
  });

  test('decodes MinKey', () => {
    const result = decoder.decodeFromString('{"$minKey": 1}');
    expect(result).toBeInstanceOf(BsonMinKey);
  });

  test('decodes MaxKey', () => {
    const result = decoder.decodeFromString('{"$maxKey": 1}');
    expect(result).toBeInstanceOf(BsonMaxKey);
  });

  test('decodes undefined', () => {
    const result = decoder.decodeFromString('{"$undefined": true}');
    expect(result).toBeUndefined();
  });

  test('decodes DBRef', () => {
    const result = decoder.decodeFromString(
      '{"$ref": "collection", "$id": {"$oid": "507f1f77bcf86cd799439011"}, "$db": "database"}',
    ) as Record<string, unknown>;
    expect(result.$ref).toBe('collection');
    expect(result.$id).toBeInstanceOf(BsonObjectId);
    expect(result.$db).toBe('database');
  });

  test('decodes nested objects with Extended JSON types', () => {
    const json = '{"name": "test", "count": {"$numberInt": "42"}, "timestamp": {"$date": "2023-01-01T00:00:00.000Z"}}';
    const result = decoder.decodeFromString(json) as Record<string, unknown>;

    expect(result.name).toBe('test');
    expect(result.count).toBeInstanceOf(BsonInt32);
    expect((result.count as BsonInt32).value).toBe(42);
    expect(result.timestamp).toBeInstanceOf(Date);
  });

  test('handles objects with $ keys that are not type wrappers', () => {
    const result = decoder.decodeFromString('{"$unknown": "value", "$test": 123}') as Record<string, unknown>;
    expect(result.$unknown).toBe('value');
    expect(result.$test).toBe(123);
  });

  test('throws on malformed type wrappers', () => {
    expect(() => decoder.decodeFromString('{"$numberInt": "42", "extra": "field"}')).toThrow();
    expect(() => decoder.decodeFromString('{"$binary": "invalid"}')).toThrow();
    expect(() => decoder.decodeFromString('{"$timestamp": {"t": "invalid"}}')).toThrow();
  });
});
