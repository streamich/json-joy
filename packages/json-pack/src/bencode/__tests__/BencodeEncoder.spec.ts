import {utf8} from '@jsonjoy.com/buffers/lib/strings';
import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {BencodeEncoder} from '../BencodeEncoder';

const writer = new Writer(32);
const encoder = new BencodeEncoder(writer);

const assertEncoder = (value: unknown, expected: Uint8Array) => {
  const encoded = encoder.encode(value);
  expect(encoded).toEqual(expected);
};

describe('null', () => {
  test('null', () => {
    assertEncoder(null, utf8`n`);
  });
});

describe('undefined', () => {
  test('undefined', () => {
    assertEncoder(undefined, utf8`u`);
  });
});

describe('boolean', () => {
  test('true', () => {
    assertEncoder(true, utf8`t`);
  });

  test('false', () => {
    assertEncoder(false, utf8`f`);
  });
});

describe('number', () => {
  test('integers', () => {
    assertEncoder(0, utf8`i0e`);
    assertEncoder(1, utf8`i1e`);
    assertEncoder(-1, utf8`i-1e`);
    assertEncoder(123, utf8`i123e`);
    assertEncoder(-123, utf8`i-123e`);
    assertEncoder(-12321321123, utf8`i-12321321123e`);
    assertEncoder(+2321321123, utf8`i2321321123e`);
  });

  test('bigints', () => {
    assertEncoder(BigInt('0'), utf8`i0e`);
    assertEncoder(BigInt('1'), utf8`i1e`);
    assertEncoder(BigInt('-1'), utf8`i-1e`);
    assertEncoder(BigInt('123456'), utf8`i123456e`);
    assertEncoder(BigInt('-123456'), utf8`i-123456e`);
  });

  test('floats', () => {
    assertEncoder(0.0, utf8`i0e`);
    assertEncoder(1.1, utf8`i1e`);
    assertEncoder(-1.45, utf8`i-1e`);
    assertEncoder(123.34, utf8`i123e`);
    assertEncoder(-123.234, utf8`i-123e`);
    assertEncoder(-12321.321123, utf8`i-12321e`);
    assertEncoder(+2321321.123, utf8`i2321321e`);
  });
});

describe('string', () => {
  test('empty string', () => {
    assertEncoder('', utf8`0:`);
  });

  test('one char strings', () => {
    assertEncoder('a', utf8`1:a`);
    assertEncoder('b', utf8`1:b`);
    assertEncoder('z', utf8`1:z`);
    assertEncoder('~', utf8`1:~`);
    assertEncoder('"', utf8`1:"`);
    assertEncoder('\\', utf8`1:\\`);
    assertEncoder('*', utf8`1:*`);
    assertEncoder('@', utf8`1:@`);
    assertEncoder('9', utf8`1:9`);
  });

  test('short strings', () => {
    assertEncoder('abc', utf8`3:abc`);
    assertEncoder('abc123', utf8`6:abc123`);
  });

  test('long strings', () => {
    const txt =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris. Maecenas congue ligula ac quam viverra nec consectetur ante hendrerit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris. Maecenas congue ligula ac quam viverra nec consectetur ante hendrerit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris. Maecenas congue ligula ac quam viverra nec consectetur ante hendrerit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris. Maecenas congue ligula ac quam viverra nec consectetur ante hendrerit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris. Maecenas congue ligula ac quam viverra nec consectetur ante hendrerit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris. Maecenas congue ligula ac quam viverra nec consectetur ante hendrerit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris. Maecenas congue ligula ac quam viverra nec consectetur ante hendrerit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris. Maecenas congue ligula ac quam viverra nec consectetur ante hendrerit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris. Maecenas congue ligula ac quam viverra nec consectetur ante hendrerit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris. Maecenas congue ligula ac quam viverra nec consectetur ante hendrerit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris. Maecenas congue ligula ac quam viverra nec consectetur ante hendrerit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris. Maecenas congue ligula ac quam viverra nec consectetur ante hendrerit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris. Maecenas congue ligula ac quam viverra nec consectetur ante hendrerit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris. Maecenas congue ligula ac quam viverra nec consectetur ante hendrerit.';
    assertEncoder(txt, utf8(`${txt.length}:${txt}`));
  });
});

describe('binary', () => {
  test('empty blob', () => {
    assertEncoder(new Uint8Array(0), utf8`0:`);
  });

  test('small blob', () => {
    assertEncoder(new Uint8Array([65]), utf8`1:A`);
  });
});

describe('array', () => {
  test('empty array', () => {
    assertEncoder([], utf8`le`);
  });

  test('array with one integer element', () => {
    assertEncoder([1], utf8`li1ee`);
  });

  test('array with two integer elements', () => {
    assertEncoder([1, 2], utf8`li1ei2ee`);
  });

  test('array of array', () => {
    assertEncoder([[123]], utf8`lli123eee`);
  });

  test('array of various types', () => {
    assertEncoder([0, 1.32, 'str', [1, 2, 3]], utf8`li0ei1e3:strli1ei2ei3eee`);
  });
});

describe('set', () => {
  test('empty array', () => {
    assertEncoder(new Set(), utf8`le`);
  });

  test('array with one integer element', () => {
    assertEncoder(new Set([1]), utf8`li1ee`);
  });

  test('array with two integer elements', () => {
    assertEncoder(new Set([1, 2]), utf8`li1ei2ee`);
  });

  test('array of array', () => {
    assertEncoder(new Set([new Set([123])]), utf8`lli123eee`);
  });

  test('array of various types', () => {
    assertEncoder(new Set([0, 1.32, 'str', new Set([1, 2, 3])]), utf8`li0ei1e3:strli1ei2ei3eee`);
  });
});

describe('object', () => {
  test('empty object', () => {
    assertEncoder({}, utf8`de`);
  });

  test('object with one key', () => {
    assertEncoder({foo: 'bar'}, utf8`d3:foo3:bare`);
  });

  test('object with two keys (sorted)', () => {
    assertEncoder({foo: 'bar', baz: 123}, utf8`d3:bazi123e3:foo3:bare`);
  });

  test('object with various nested types', () => {
    assertEncoder(
      {
        str: 'qwerty',
        num: 123,
        arr: [1, 2, 3],
        obj: {foo: 'bar'},
      },
      utf8`d3:arrli1ei2ei3ee3:numi123e3:objd3:foo3:bare3:str6:qwertye`,
    );
  });
});

describe('map', () => {
  test('empty object', () => {
    assertEncoder(new Map(), utf8`de`);
  });

  test('object with one key', () => {
    assertEncoder(new Map([['foo', 'bar']]), utf8`d3:foo3:bare`);
  });

  test('object with two keys (sorted)', () => {
    assertEncoder(
      new Map<unknown, unknown>([
        ['foo', 'bar'],
        ['baz', 123],
      ]),
      utf8`d3:bazi123e3:foo3:bare`,
    );
  });

  test('object with various nested types', () => {
    assertEncoder(
      new Map<unknown, unknown>([
        ['str', 'qwerty'],
        ['num', 123],
        ['arr', [1, 2, 3]],
        ['obj', {foo: 'bar'}],
      ]),
      utf8`d3:arrli1ei2ei3ee3:numi123e3:objd3:foo3:bare3:str6:qwertye`,
    );
  });
});
