import {NullObject} from '@jsonjoy.com/util/lib/NullObject';
import {MsgPackDecoderFast} from '../MsgPackDecoderFast';
import {MsgPackEncoderFast} from '../MsgPackEncoderFast';

const encoder = new MsgPackEncoderFast();
const decoder = new MsgPackDecoderFast();
const encode = (x: unknown) => encoder.encode(x);
const decode = (x: Uint8Array, offset: number) => decoder.decode(x);

describe('null', () => {
  test('can decode null', () => {
    const buf = encode(null);
    const res = decode(buf, 0);
    expect(res).toBe(null);
  });
});

describe('boolean', () => {
  test('can decode false', () => {
    const buf = encode(false);
    const res = decode(buf, 0);
    expect(res).toBe(false);
  });

  test('can decode true', () => {
    const buf = encode(true);
    const res = decode(buf, 0);
    expect(res).toBe(true);
  });
});

describe('number', () => {
  test('can decode positive fixint', () => {
    const buf = new Uint8Array([123]);
    const res = decode(buf, 0);
    expect(res).toBe(123);
  });

  test('can decode positive fixint encoded at offset', () => {
    const buf1 = new Uint8Array([0, 123]);
    const buf2 = buf1.subarray(1);
    const res = decode(buf2, 0);
    expect(res).toBe(123);
  });

  test('can decode 0', () => {
    const buf = encode(0);
    const res = decode(buf, 0);
    expect(res).toBe(0);
  });

  test('can decode negative fixint', () => {
    const buf = encode(-1);
    const res = decode(buf, 0);
    expect(res).toBe(-1);
  });

  test('can decode negative fixint - 2', () => {
    const buf = encode(-32);
    const res = decode(buf, 0);
    expect(res).toBe(-32);
  });

  test('can decode double', () => {
    const buf = encode(
      // biome-ignore lint: precision loss is acceptable in this test
      3456.12345678902234,
    );
    const res = decode(buf, 0);
    expect(res).toBe(
      // biome-ignore lint: precision loss is acceptable in this test
      3456.12345678902234,
    );
  });

  test('can decode 8 byte negative int', () => {
    const buf = encode(-4807526976);
    const res = decode(buf, 0);
    expect(res).toBe(-4807526976);
  });
});

describe('string', () => {
  test('can decode empty string', () => {
    const buf = encode('');
    const res = decode(buf, 0);
    expect(res).toBe('');
  });

  test('can decode short string', () => {
    const buf = encode('abc');
    const res = decode(buf, 0);
    expect(res).toBe('abc');
  });

  test('can decode 31 char string', () => {
    const buf = encode('1234567890123456789012345678901');
    const res = decode(buf, 0);
    expect(res).toBe('1234567890123456789012345678901');
  });

  test('can decode 32 char string', () => {
    const buf = encode('12345678901234567890123456789012');
    const res = decode(buf, 0);
    expect(res).toBe('12345678901234567890123456789012');
  });

  test('can decode 255 char string', () => {
    const str = 'a'.repeat(255);
    const buf = encode(str);
    const res = decode(buf, 0);
    expect(res).toBe(str);
  });

  test('can decode 256 char string', () => {
    const str = 'a'.repeat(256);
    const buf = encode(str);
    const res = decode(buf, 0);
    expect(res).toBe(str);
  });

  test('can decode a long string', () => {
    const arr = [218, 4, 192];
    for (let i = 0; i < 1216; i++) arr.push(101);
    const uint8 = new Uint8Array(arr);
    const res = decode(uint8, 0);
    expect(res).toBe(
      'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    );
  });

  test('can decode 0xFFFF char string', () => {
    const str = 'a'.repeat(256);
    const buf = encode(str);
    const res = decode(buf, 0);
    expect(res).toBe(str);
  });

  test('can decode 0xFFFF + 1 char string', () => {
    const str = 'a'.repeat(0xffff + 1);
    const buf = encode(str);
    const res = decode(buf, 0);
    expect(res).toBe(str);
  });
});

describe('array', () => {
  test('can decode empty array', () => {
    const buf = encode([]);
    const res = decode(buf, 0);
    expect(res).toEqual([]);
  });

  test('can decode one element array', () => {
    const buf = encode(['abc']);
    const res = decode(buf, 0);
    expect(res).toEqual(['abc']);
  });

  test('can decode 15 element array', () => {
    const buf = encode([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    const res = decode(buf, 0);
    expect(res).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
  });

  test('can decode 16 element array', () => {
    const buf = encode([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    const res = decode(buf, 0);
    expect(res).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
  });

  test('can decode 255 element array', () => {
    const arr = '3'.repeat(256).split('').map(Number);
    const buf = encode(arr);
    const res = decode(buf, 0);
    expect(res).toEqual(arr);
  });

  test('can decode 0xFFFF element array', () => {
    const arr = '3'.repeat(0xffff).split('').map(Number);
    const buf = encode(arr);
    const res = decode(buf, 0);
    expect(res).toEqual(arr);
  });

  test('can decode 0xFFFF + 1 element array', () => {
    const arr = '3'.repeat(0xffff + 1).split('');
    const buf = encode(arr);
    const res = decode(buf, 0);
    expect(res).toEqual(arr);
  });

  test('can decode nested array', () => {
    const arr = [1, [2], 3];
    const buf = encode(arr);
    const res = decode(buf, 0);
    expect(res).toEqual(arr);
  });

  test('can decode nested array - 2', () => {
    const arr = [1, [2], [3, 4, [5]]];
    const buf = encode(arr);
    const res = decode(buf, 0);
    expect(res).toEqual(arr);
  });
});

describe('object', () => {
  test('can decode empty object', () => {
    const obj = {};
    const buf = encode(obj);
    const res = decode(buf, 0);
    expect(res).toEqual(obj);
  });

  test('can decode simple object', () => {
    const obj = {foo: 'bar'};
    const buf = encode(obj);
    const res = decode(buf, 0);
    expect(res).toEqual(obj);
  });

  test('can decode 14 key object', () => {
    const obj: any = {};
    for (let i = 0; i < 15; i++) obj[String(i)] = i;
    const buf = encode(obj);
    const res = decode(buf, 0);
    expect(res).toEqual(obj);
  });

  test('can decode 15 key object', () => {
    const obj: any = {};
    for (let i = 0; i < 15; i++) obj[String(i)] = i;
    const buf = encode(obj);
    const res = decode(buf, 0);
    expect(res).toEqual(obj);
  });

  test('can decode 16 key object', () => {
    const obj: any = {};
    for (let i = 0; i < 16; i++) obj[String(i)] = i;
    const buf = encode(obj);
    const res = decode(buf, 0);
    expect(res).toEqual(obj);
  });

  test('can decode 32 key object', () => {
    const obj: any = {};
    for (let i = 0; i < 32; i++) obj[String(i)] = i;
    const buf = encode(obj);
    const res = decode(buf, 0);
    expect(res).toEqual(obj);
  });

  test('can decode 255 key object', () => {
    const obj: any = {};
    for (let i = 0; i < 255; i++) obj[String(i)] = i;
    const buf = encode(obj);
    const res = decode(buf, 0);
    expect(res).toEqual(obj);
  });

  test('can decode 256 key object', () => {
    const obj: any = {};
    for (let i = 0; i < 256; i++) obj[String(i)] = i;
    const buf = encode(obj);
    const res = decode(buf, 0);
    expect(res).toEqual(obj);
  });

  test('can decode 0xFFFF key object', () => {
    const obj: any = {};
    for (let i = 0; i < 0xffff; i++) obj[String(i)] = i;
    const buf = encode(obj);
    const res = decode(buf, 0);
    expect(res).toEqual(obj);
  });

  test('can decode 0xFFFF + 1 key object', () => {
    const obj: any = {};
    for (let i = 0; i < 0xffff + 1; i++) obj[String(i)] = i;
    const buf = encode(obj);
    const res = decode(buf, 0);
    expect(res).toEqual(obj);
  });

  test('can decode nested objects', () => {
    const obj: any = {
      a: {},
      b: {
        c: {},
        d: {g: 123},
      },
    };
    const buf = encode(obj);
    const res = decode(buf, 0);
    expect(res).toEqual(obj);
  });

  test('throws on __proto__ key', () => {
    const obj = new NullObject();
    // tslint:disable-next-line: no-string-literal
    obj.__proto__ = 123;
    const buf = encode(obj);
    expect(() => decode(buf, 0)).toThrow();
  });
});
