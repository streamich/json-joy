import {BSON, Decimal128, MinKey, MaxKey} from 'bson';
import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {BsonEncoder} from '../BsonEncoder';
import {
  BsonBinary,
  BsonDbPointer,
  BsonFloat,
  BsonInt32,
  BsonInt64,
  BsonJavascriptCode,
  BsonJavascriptCodeWithScope,
  BsonMaxKey,
  BsonMinKey,
  BsonObjectId,
  BsonTimestamp,
} from '../values';
import {BsonDecimal128} from '../values';

const writer = new Writer(8);
const encoder = new BsonEncoder(writer);

describe('special value encoding', () => {
  test('BsonObjectId', () => {
    const value = {
      foo: new BsonObjectId(0x01020304, 0x0102030405, 0x010203),
    };
    const encoded = encoder.encode(value);
    const decoded = BSON.deserialize(encoded);
    const objectId = decoded.foo;
    expect(objectId.getTimestamp().getTime()).toBe(0x01020304 * 1000);
  });

  test('Date', () => {
    const date = new Date(1689235374326);
    const value = {date};
    const encoded = encoder.encode(value);
    const decoded = BSON.deserialize(encoded);
    expect(decoded.date.getTime()).toBe(1689235374326);
  });

  test('RegExp', () => {
    const reg = /foo/i;
    const value = {reg};
    const encoded = encoder.encode(value);
    const decoded = BSON.deserialize(encoded);
    expect(decoded.reg.source).toBe('foo');
    expect(decoded.reg.flags).toBe('i');
  });

  test('BsonDbPointer', () => {
    const id = new BsonObjectId(0x01020304, 0x0102030405, 0x010203);
    const pointer = new BsonDbPointer('test', id);
    const value = {pointer};
    const encoded = encoder.encode(value);
    const decoded = BSON.deserialize(encoded);
    expect(decoded.pointer.collection).toBe('test');
    expect(decoded.pointer.oid.getTimestamp().getTime()).toBe(0x01020304 * 1000);
  });

  test('BsonJavascriptCode', () => {
    const code = new BsonJavascriptCode('console.log("hello world")');
    const value = {code};
    const encoded = encoder.encode(value);
    const decoded = BSON.deserialize(encoded);
    expect(decoded.code.code).toBe('console.log("hello world")');
  });

  test('BsonJavascriptCodeWithScope', () => {
    const code = new BsonJavascriptCodeWithScope('console.log("hello world")', {foo: 'bar'});
    const value = {code};
    const encoded = encoder.encode(value);
    const decoded = BSON.deserialize(encoded);
    expect(decoded.code.code).toBe('console.log("hello world")');
    expect(decoded.code.scope).toStrictEqual({foo: 'bar'});
  });

  test('Symbol', () => {
    const symbol = Symbol('foo');
    const value = {symbol};
    const encoded = encoder.encode(value);
    const decoded = BSON.deserialize(encoded);
    expect(decoded.symbol).toBe('foo');
  });

  test('BsonInt32', () => {
    const int = new BsonInt32(123);
    const value = {int};
    const encoded = encoder.encode(value);
    const decoded = BSON.deserialize(encoded);
    expect(decoded.int).toBe(123);
  });

  test('BsonInt64', () => {
    const int = new BsonInt64(123);
    const value = {int};
    const encoded = encoder.encode(value);
    const decoded = BSON.deserialize(encoded);
    expect(decoded.int).toBe(123);
  });

  test('BsonFloat', () => {
    const int = new BsonFloat(123);
    const value = {int};
    const encoded = encoder.encode(value);
    const decoded = BSON.deserialize(encoded);
    expect(decoded.int).toBe(123);
  });

  test('BsonTimestamp', () => {
    const increment = 0x01020304;
    const timestamp = 0x40302010;
    const ts = new BsonTimestamp(increment, timestamp);
    const value = {ts};
    const encoded = encoder.encode(value);
    const decoded = BSON.deserialize(encoded);
    expect(decoded.ts.toExtendedJSON().$timestamp.t).toBe(timestamp);
    expect(decoded.ts.toExtendedJSON().$timestamp.i).toBe(increment);
  });

  test('BsonDecimal128', () => {
    const dec = new BsonDecimal128(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]));
    const value = {dec};
    const encoded = encoder.encode(value);
    const decoded = BSON.deserialize(encoded);
    expect(decoded.dec).toBeInstanceOf(Decimal128);
  });

  test('BsonMinKey and BsonMaxKey', () => {
    const value = {
      min: new BsonMinKey(),
      max: new BsonMaxKey(),
    };
    const encoded = encoder.encode(value);
    const decoded = BSON.deserialize(encoded);
    expect(decoded.min).toBeInstanceOf(MinKey);
    expect(decoded.max).toBeInstanceOf(MaxKey);
  });

  test('BsonBinary', () => {
    const value = {
      bin1: new BsonBinary(0x00, new Uint8Array([1, 2, 3])),
      bin2: new BsonBinary(0x01, new Uint8Array([1, 2, 3])),
      bin3: new BsonBinary(0x80, new Uint8Array([1, 2, 3])),
    };
    const encoded = encoder.encode(value);
    const decoded = BSON.deserialize(encoded);
    expect(decoded.bin1.sub_type).toBe(0);
    expect(decoded.bin2.sub_type).toBe(0x01);
    expect(decoded.bin3.sub_type).toBe(0x80);
    expect(decoded.bin1.buffer).toStrictEqual(Buffer.from([1, 2, 3]));
    expect(decoded.bin2.buffer).toStrictEqual(Buffer.from([1, 2, 3]));
    expect(decoded.bin3.buffer).toStrictEqual(Buffer.from([1, 2, 3]));
  });
});
