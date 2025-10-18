import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {BsonEncoder} from '../BsonEncoder';
import {BsonDecoder} from '../BsonDecoder';
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
  BsonTimestamp,
} from '../values';

const writer = new Writer(32);
const encoder = new BsonEncoder(writer);
const decoder = new BsonDecoder();

const roundTrip = (value: unknown, expected: unknown = value) => {
  if (!value || typeof value !== 'object' || value.constructor !== Object) {
    expected = value = {value};
  }
  const encoded = encoder.encode(value);
  const decoded = decoder.decode(encoded) as Record<string, any>;
  expect(decoded).toEqual(expected);
  return {encoded, decoded};
};

describe('BsonDecoder', () => {
  describe('basic types', () => {
    test('null', () => {
      roundTrip(null);
    });

    test('boolean true', () => {
      roundTrip(true);
    });

    test('boolean false', () => {
      roundTrip(false);
    });

    test('undefined', () => {
      roundTrip(undefined as any);
    });

    test('numbers', () => {
      roundTrip(0);
      roundTrip(1);
      roundTrip(-1);
      roundTrip(123);
      roundTrip(-123);
      roundTrip(2147483647); // max int32
      roundTrip(-2147483648); // min int32
      roundTrip(9007199254740991); // max safe integer (int64)
      roundTrip(-9007199254740991); // min safe integer (int64)
    });

    test('floats', () => {
      roundTrip(0.0);
      roundTrip(1.5);
      roundTrip(-1.5);
      roundTrip(123.456);
      roundTrip(-123.456);
      roundTrip(Math.PI);
      roundTrip(Math.E);
    });

    test('strings', () => {
      roundTrip('');
      roundTrip('hello');
      roundTrip('hello world');
      roundTrip('unicode: 👍🎉💯');
      roundTrip('multi\nline\nstring');
      roundTrip('with "quotes" and \'apostrophes\'');
    });
  });

  describe('collections', () => {
    test('empty array', () => {
      roundTrip([]);
    });

    test('simple array', () => {
      roundTrip([1, 2, 3]);
    });

    test('mixed array', () => {
      roundTrip([1, 'hello', true, null]);
    });

    test('nested array', () => {
      roundTrip([
        [1, 2],
        [3, 4],
      ]);
    });

    test('empty object', () => {
      roundTrip({});
    });

    test('simple object', () => {
      roundTrip({foo: 'bar', baz: 42});
    });

    test('nested object', () => {
      roundTrip({
        user: {
          name: 'John',
          age: 30,
          preferences: {
            theme: 'dark',
            notifications: true,
          },
        },
      });
    });
  });

  describe('BSON specific types', () => {
    test('ObjectId', () => {
      const objectId = new BsonObjectId(0x12345678, 0x123456789a, 0x123456);
      const result = roundTrip({id: objectId});
      expect(result.decoded.id).toBeInstanceOf(BsonObjectId);
      expect((result.decoded.id as BsonObjectId).timestamp).toBe(0x12345678);
    });

    test('Date', () => {
      const date = new Date('2023-07-13T10:30:00.000Z');
      roundTrip({date});
    });

    test('RegExp', () => {
      const regex = /test/gi;
      roundTrip({regex});
    });

    test('Binary data - Uint8Array', () => {
      const binary = new Uint8Array([1, 2, 3, 4, 5]);
      const result = roundTrip({binary});
      expect(result.decoded.binary).toBeInstanceOf(Uint8Array);
      expect(Array.from(result.decoded.binary as Uint8Array)).toEqual([1, 2, 3, 4, 5]);
    });

    test('BsonBinary with custom subtype', () => {
      const binary = new BsonBinary(0x80, new Uint8Array([1, 2, 3]));
      const result = roundTrip({binary});
      expect(result.decoded.binary).toBeInstanceOf(BsonBinary);
      expect((result.decoded.binary as BsonBinary).subtype).toBe(0x80);
      expect(Array.from((result.decoded.binary as BsonBinary).data)).toEqual([1, 2, 3]);
    });

    test('BsonDbPointer', () => {
      const id = new BsonObjectId(0x12345678, 0x123456789a, 0x123456);
      const pointer = new BsonDbPointer('users', id);
      const result = roundTrip({pointer});
      expect(result.decoded.pointer).toBeInstanceOf(BsonDbPointer);
      expect((result.decoded.pointer as BsonDbPointer).name).toBe('users');
    });

    test('BsonJavascriptCode', () => {
      const code = new BsonJavascriptCode('function() { return 42; }');
      const result = roundTrip({code});
      expect(result.decoded.code).toBeInstanceOf(BsonJavascriptCode);
      expect((result.decoded.code as BsonJavascriptCode).code).toBe('function() { return 42; }');
    });

    test('BsonJavascriptCodeWithScope', () => {
      const code = new BsonJavascriptCodeWithScope('function() { return x; }', {x: 42});
      const result = roundTrip({code});
      expect(result.decoded.code).toBeInstanceOf(BsonJavascriptCodeWithScope);
      expect((result.decoded.code as BsonJavascriptCodeWithScope).code).toBe('function() { return x; }');
      expect((result.decoded.code as BsonJavascriptCodeWithScope).scope).toEqual({x: 42});
    });

    test('Symbol', () => {
      const symbol = Symbol('test');
      const value = {symbol};
      const encoded = encoder.encode(value);
      const decoded = decoder.decode(encoded) as Record<string, any>;
      expect(typeof decoded.symbol).toBe('symbol');
      expect(decoded.symbol.description).toBe('test');
    });

    test('BsonInt32', () => {
      const int32 = new BsonInt32(42);
      roundTrip({int32}, {int32: 42});
    });

    test('BsonInt64', () => {
      const int64 = new BsonInt64(1234567890);
      roundTrip({int64}, {int64: 1234567890});
    });

    test('BsonFloat', () => {
      const float = new BsonFloat(Math.PI);
      roundTrip({float}, {float: Math.PI});
    });

    test('BsonTimestamp', () => {
      const timestamp = new BsonTimestamp(1, 1689235200);
      const result = roundTrip({timestamp});
      expect(result.decoded.timestamp).toBeInstanceOf(BsonTimestamp);
      expect((result.decoded.timestamp as BsonTimestamp).increment).toBe(1);
      expect((result.decoded.timestamp as BsonTimestamp).timestamp).toBe(1689235200);
    });

    test('BsonDecimal128', () => {
      const decimal = new BsonDecimal128(new Uint8Array(16).fill(1));
      const result = roundTrip({decimal});
      expect(result.decoded.decimal).toBeInstanceOf(BsonDecimal128);
      expect((result.decoded.decimal as BsonDecimal128).data).toEqual(new Uint8Array(16).fill(1));
    });

    test('BsonMinKey and BsonMaxKey', () => {
      const data = {
        min: new BsonMinKey(),
        max: new BsonMaxKey(),
      };
      const result = roundTrip(data);
      expect(result.decoded.min).toBeInstanceOf(BsonMinKey);
      expect(result.decoded.max).toBeInstanceOf(BsonMaxKey);
    });
  });

  describe('complex documents', () => {
    test('blog post example', () => {
      const blogPost = {
        title: 'My First Blog Post',
        author: {
          name: 'John Doe',
          email: 'john@example.com',
          id: new BsonObjectId(0x507f1f77, 0xbcf86cd799, 0x439011),
        },
        content: 'This is the content of my blog post...',
        tags: ['javascript', 'mongodb', 'bson'],
        publishedAt: new Date('2023-07-13T10:30:00.000Z'),
        metadata: {
          views: 0,
          likes: 0,
          comments: [],
        },
        isPublished: true,
        categories: null,
      };

      const result = roundTrip(blogPost);
      expect(result.decoded.title).toBe('My First Blog Post');
      expect(result.decoded.author.name).toBe('John Doe');
      expect(result.decoded.author.id).toBeInstanceOf(BsonObjectId);
      expect(result.decoded.tags).toEqual(['javascript', 'mongodb', 'bson']);
      expect(result.decoded.publishedAt).toBeInstanceOf(Date);
      expect(result.decoded.isPublished).toBe(true);
      expect(result.decoded.categories).toBe(null);
    });

    test('array indices are correctly handled', () => {
      const data = {
        numbers: [10, 20, 30],
        mixed: ['a', 1, true, null, {nested: 'value'}],
      };

      const result = roundTrip(data);
      expect(result.decoded.numbers).toEqual([10, 20, 30]);
      expect(result.decoded.mixed).toEqual(['a', 1, true, null, {nested: 'value'}]);
    });
  });

  describe('edge cases', () => {
    test('empty strings and arrays', () => {
      const data = {
        emptyString: '',
        emptyArray: [],
        emptyObject: {},
      };
      roundTrip(data);
    });

    test('deeply nested structures', () => {
      const data = {
        level1: {
          level2: {
            level3: {
              level4: {
                value: 'deep',
              },
            },
          },
        },
      };
      roundTrip(data);
    });

    test('unicode handling', () => {
      const data = {
        emoji: '😀🎉👍💯',
        chinese: '你好世界',
        arabic: 'مرحبا بالعالم',
        russian: 'Привет мир',
      };
      roundTrip(data);
    });
  });
});
