import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import type {JsonValue} from '../../types';
import {JsonEncoder} from '../JsonEncoder';

const writer = new Writer(16);
const encoder = new JsonEncoder(writer);

const assertEncoder = (value: JsonValue) => {
  const encoded = encoder.encode(value);
  const json = Buffer.from(encoded).toString('utf-8');
  // console.log('json', json);
  const decoded = JSON.parse(json);
  expect(decoded).toEqual(value);
};

describe('null', () => {
  test('null', () => {
    assertEncoder(null);
  });
});

describe('undefined', () => {
  test('undefined', () => {
    const encoded = encoder.encode(undefined);
    const txt = Buffer.from(encoded).toString('utf-8');
    expect(txt).toBe('"data:application/cbor,base64;9w=="');
  });

  test('undefined in object', () => {
    const encoded = encoder.encode({foo: undefined});
    const txt = Buffer.from(encoded).toString('utf-8');
    expect(txt).toBe('{"foo":"data:application/cbor,base64;9w=="}');
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
  test('integers', () => {
    assertEncoder(0);
    assertEncoder(1);
    assertEncoder(-1);
    assertEncoder(123);
    assertEncoder(-123);
    assertEncoder(-12321321123);
    assertEncoder(+2321321123);
  });

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

  test('object with one key', () => {
    assertEncoder({foo: 'bar'});
  });

  test('object with two keys', () => {
    assertEncoder({foo: 'bar', baz: 123});
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

describe('buffer reallocation stress tests', () => {
  test('strings with non-ASCII triggering fallback (reproduces writer.x bug)', () => {
    // This specifically tests the bug where writer.x is not reset before fallback
    // When a short string (<256) contains non-ASCII, it triggers writer.utf8()
    // but writer.x has already been incremented by writing the opening quote
    for (let round = 0; round < 50; round++) {
      const smallWriter = new Writer(64);
      const smallEncoder = new JsonEncoder(smallWriter);

      for (let i = 0; i < 500; i++) {
        // Create strings < 256 chars with non-ASCII character to trigger fallback
        const asciiPart = 'a'.repeat(Math.floor(Math.random() * 200));
        const value = {foo: asciiPart + '\u0001' + asciiPart}; // control char triggers fallback
        const encoded = smallEncoder.encode(value);
        const json = Buffer.from(encoded).toString('utf-8');
        const decoded = JSON.parse(json);
        expect(decoded).toEqual(value);
      }
    }
  });

  test('many iterations with long strings (reproduces writer.utf8 bug)', () => {
    // Run multiple test rounds to increase chance of hitting the bug
    for (let round = 0; round < 10; round++) {
      const smallWriter = new Writer(64);
      const smallEncoder = new JsonEncoder(smallWriter);

      for (let i = 0; i < 1000; i++) {
        const value = {
          foo: 'a'.repeat(Math.round(32000 * Math.random()) + 10),
        };
        const encoded = smallEncoder.encode(value);
        const json = Buffer.from(encoded).toString('utf-8');
        const decoded = JSON.parse(json);
        expect(decoded).toEqual(value);
      }
    }
  });

  test('repeated long strings >= 256 chars (reproduces writer.utf8 bug)', () => {
    // Run multiple test rounds to increase chance of hitting the bug
    for (let round = 0; round < 20; round++) {
      const smallWriter = new Writer(64);
      const smallEncoder = new JsonEncoder(smallWriter);

      for (let i = 0; i < 100; i++) {
        const length = 256 + Math.floor(Math.random() * 10000);
        const value = {foo: 'a'.repeat(length)};
        const encoded = smallEncoder.encode(value);
        const json = Buffer.from(encoded).toString('utf-8');
        const decoded = JSON.parse(json);
        expect(decoded).toEqual(value);
      }
    }
  });

  test('many short strings with buffer growth (reproduces writer.utf8 bug)', () => {
    // Run multiple test rounds to increase chance of hitting the bug
    for (let round = 0; round < 10; round++) {
      const smallWriter = new Writer(64);
      const smallEncoder = new JsonEncoder(smallWriter);

      for (let i = 0; i < 1000; i++) {
        const value = {foo: 'test' + i};
        const encoded = smallEncoder.encode(value);
        const json = Buffer.from(encoded).toString('utf-8');
        const decoded = JSON.parse(json);
        expect(decoded).toEqual(value);
      }
    }
  });
});
