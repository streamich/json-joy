import {BSON} from 'bson';
import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {BsonEncoder} from '../BsonEncoder';

const writer = new Writer(8);
const encoder = new BsonEncoder(writer);

const assertEncoder = (value: unknown, expected: unknown = value) => {
  if (!value || typeof value !== 'object' || value.constructor !== Object) expected = value = {value};
  const encoded = encoder.encode(value);
  const decoded = BSON.deserialize(encoded);
  expect(decoded).toEqual(expected);
};

describe('undefined', () => {
  test('undefined', () => {
    assertEncoder(undefined as any);
  });
});

describe('null', () => {
  test('null', () => {
    assertEncoder(null);
  });
});

describe('boolean', () => {
  test('true', () => {
    assertEncoder(true);
  });

  test('false', () => {
    assertEncoder(false);
  });
});

describe('number', () => {
  const ints = [
    0, 1, -1, 123, -123, 1234, 3333, -3467, -4444, 55555, -55565, 234234, -322324, 2147483647, -1147483647, 12321321123,
    -12321321123, +2321321123,
  ];
  for (const int of ints) {
    test('integer ' + int, () => {
      assertEncoder(int);
    });
  }

  test('floats', () => {
    assertEncoder(0.0);
    assertEncoder(1.1);
    assertEncoder(-1.45);
    assertEncoder(123.34);
    assertEncoder(-123.234);
    assertEncoder(-12321.321123);
    assertEncoder(+2321321.123);
  });
});

describe('string', () => {
  test('empty string', () => {
    assertEncoder('');
  });

  test('one char strings', () => {
    assertEncoder('a');
    assertEncoder('b');
    assertEncoder('z');
    assertEncoder('~');
    assertEncoder('"');
    assertEncoder('\\');
    assertEncoder('*');
    assertEncoder('@');
    assertEncoder('9');
    assertEncoder('✅');
    assertEncoder('👍');
  });

  test('short strings', () => {
    assertEncoder('abc');
    assertEncoder('abc123');
  });

  test('long strings', () => {
    assertEncoder(
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris. Maecenas congue ligula ac quam viverra nec consectetur ante hendrerit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris. Maecenas congue ligula ac quam viverra nec consectetur ante hendrerit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris. Maecenas congue ligula ac quam viverra nec consectetur ante hendrerit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris. Maecenas congue ligula ac quam viverra nec consectetur ante hendrerit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris. Maecenas congue ligula ac quam viverra nec consectetur ante hendrerit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris. Maecenas congue ligula ac quam viverra nec consectetur ante hendrerit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris. Maecenas congue ligula ac quam viverra nec consectetur ante hendrerit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris. Maecenas congue ligula ac quam viverra nec consectetur ante hendrerit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris. Maecenas congue ligula ac quam viverra nec consectetur ante hendrerit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris. Maecenas congue ligula ac quam viverra nec consectetur ante hendrerit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris. Maecenas congue ligula ac quam viverra nec consectetur ante hendrerit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris. Maecenas congue ligula ac quam viverra nec consectetur ante hendrerit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris. Maecenas congue ligula ac quam viverra nec consectetur ante hendrerit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris. Maecenas congue ligula ac quam viverra nec consectetur ante hendrerit.',
    );
  });

  test('unsafe character in the middle of a string', () => {
    assertEncoder('...................".....................');
  });

  test('unsafe character in the middle of a string - 2', () => {
    assertEncoder('...................🎉.....................');
  });
});

describe('array', () => {
  test('empty array', () => {
    assertEncoder([]);
  });

  test('array with one element', () => {
    assertEncoder([1]);
  });

  test('array with two elements', () => {
    assertEncoder([1, 2]);
  });

  test('array of array', () => {
    assertEncoder([[123]]);
  });

  test('array of various types', () => {
    assertEncoder([0, 1.32, 'str', true, false, null, [1, 2, 3]]);
  });
});

describe('object', () => {
  test('empty object', () => {
    assertEncoder({});
  });

  test('object with float key', () => {
    assertEncoder({
      float: 123.456,
    });
  });

  test('object with int32 key', () => {
    assertEncoder({
      int: 0x01020304,
    });
  });

  test('object with int64 key', () => {
    assertEncoder({
      int64: 0x010203040506,
    });
  });

  test('object with one string key', () => {
    assertEncoder({foo: 'bar'});
  });

  test('object with two keys', () => {
    assertEncoder({foo: 'bar', baz: 123});
  });

  test('empty nested array', () => {
    assertEncoder({
      foo: [],
    });
  });

  test('simple nested array', () => {
    assertEncoder({
      foo: [1, 2, 3],
    });
  });

  test('one nested object', () => {
    assertEncoder({
      foo: {},
    });
  });

  test('nested objects', () => {
    assertEncoder({
      foo: {
        bar: {
          baz: 123,
        },
      },
    });
  });

  test('binary Uint8Array', () => {
    const value = {
      foo: new Uint8Array([1, 2, 3]),
    };
    const encoded = encoder.encode(value);
    const decoded = BSON.deserialize(encoded);
    const buf = decoded.foo.buffer;
    const uint8 = new Uint8Array(buf, buf.byteOffset, buf.byteLength);
    expect(uint8).toEqual(value.foo);
  });

  test('undefined key', () => {
    assertEncoder({
      foo: undefined,
    });
  });

  test('boolean keys', () => {
    assertEncoder({
      true: true,
      false: false,
    });
  });

  test('null keys', () => {
    assertEncoder({
      null: null,
    });
  });

  test('symbol keys', () => {
    const value = {
      foo: Symbol('foo'),
    };
    const encoded = encoder.encode(value);
    const decoded = BSON.deserialize(encoded);
    expect(decoded).toStrictEqual({foo: 'foo'});
  });

  test('object with various nested types', () => {
    assertEncoder({
      '': null,
      null: false,
      true: true,
      str: 'asdfasdf ,asdf asdf asdf asdf asdf, asdflkasjdflakjsdflajskdlfkasdf',
      num: 123,
      arr: [1, 2, 3],
      obj: {foo: 'bar'},
      obj2: {1: 2, 3: 4},
    });
  });
});

describe('nested object', () => {
  test('large array/object', () => {
    assertEncoder({
      foo: [
        1,
        2,
        3,
        {
          looongLoooonnnngggg: 'bar',
          looongLoooonnnngggg2: 'bar',
          looongLoooonnnngggg3: 'bar',
          looongLoooonnnngggg4: 'bar',
          looongLoooonnnngggg5: 'bar',
          looongLoooonnnngggg6: 'bar',
          looongLoooonnnngggg7: 'bar',
          someVeryVeryLongKeyNameSuperDuperLongKeyName: 'very very long value, I said, very very long value',
          someVeryVeryLongKeyNameSuperDuperLongKeyName1: 'very very long value, I said, very very long value',
          someVeryVeryLongKeyNameSuperDuperLongKeyName2: 'very very long value, I said, very very long value',
          someVeryVeryLongKeyNameSuperDuperLongKeyName3: 'very very long value, I said, very very long value',
          someVeryVeryLongKeyNameSuperDuperLongKeyName4: 'very very long value, I said, very very long value',
          someVeryVeryLongKeyNameSuperDuperLongKeyName5: 'very very long value, I said, very very long value',
          someVeryVeryLongKeyNameSuperDuperLongKeyName6: 'very very long value, I said, very very long value',
        },
      ],
    });
  });
});
