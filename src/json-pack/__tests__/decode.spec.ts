import {encode} from '../encode';
import {decode} from '../decode';

describe('null', () => {
  test('can decode null', () => {
    const buf = encode(null);
    const res = decode(buf, 0);
    expect(res[0]).toBe(null);
  });
});

describe('boolean', () => {
  test('can decode false', () => {
    const buf = encode(false);
    const res = decode(buf, 0);
    expect(res[0]).toBe(false);
  });

  test('can decode true', () => {
    const buf = encode(true);
    const res = decode(buf, 0);
    expect(res[0]).toBe(true);
  });
});

describe('number', () => {
  test('can decode positive fixint', () => {
    const buf = encode(123);
    const res = decode(buf, 0);
    expect(res[0]).toBe(123);
  });

  test('can decode 0', () => {
    const buf = encode(0);
    const res = decode(buf, 0);
    expect(res[0]).toBe(0);
  });

  test('can decode negative fixint', () => {
    const buf = encode(-1);
    const res = decode(buf, 0);
    expect(res[0]).toBe(-1);
  });

  test('can decode negative fixint - 2', () => {
    const buf = encode(-32);
    const res = decode(buf, 0);
    expect(res[0]).toBe(-32);
  });

  test('can decode double', () => {
    const buf = encode(3456.12345678902234);
    const res = decode(buf, 0);
    expect(res[0]).toBe(3456.12345678902234);
  });
});

describe('string', () => {
  test('can decode empty string', () => {
    const buf = encode('');
    const res = decode(buf, 0);
    expect(res[0]).toBe('');
  });

  test('can decode short string', () => {
    const buf = encode('abc');
    const res = decode(buf, 0);
    expect(res[0]).toBe('abc');
  });

  test('can decode 31 char string', () => {
    const buf = encode('1234567890123456789012345678901');
    const res = decode(buf, 0);
    expect(res[0]).toBe('1234567890123456789012345678901');
  });

  test('can decode 32 char string', () => {
    const buf = encode('12345678901234567890123456789012');
    const res = decode(buf, 0);
    expect(res[0]).toBe('12345678901234567890123456789012');
  });

  test('can decode 255 char string', () => {
    const str = 'a'.repeat(255);
    const buf = encode(str);
    const res = decode(buf, 0);
    expect(res[0]).toBe(str);
  });

  test('can decode 256 char string', () => {
    const str = 'a'.repeat(256);
    const buf = encode(str);
    const res = decode(buf, 0);
    expect(res[0]).toBe(str);
  });

  test('can decode 0xFFFF char string', () => {
    const str = 'a'.repeat(0xFFFF);
    const buf = encode(str);
    const res = decode(buf, 0);
    expect(res[0]).toBe(str);
  });

  test('can decode 0xFFFF + 1 char string', () => {
    const str = 'a'.repeat(0xFFFF + 1);
    const buf = encode(str);
    const res = decode(buf, 0);
    expect(res[0]).toBe(str);
  });
});

describe('array', () => {
  test('can decode empty array', () => {
    const buf = encode([]);
    const res = decode(buf, 0);
    expect(res[0]).toEqual([]);
  });

  test('can decode one element array', () => {
    const buf = encode(['abc']);
    const res = decode(buf, 0);
    expect(res[0]).toEqual(['abc']);
  });

  test('can decode 15 element array', () => {
    const buf = encode([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    const res = decode(buf, 0);
    expect(res[0]).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
  });

  test('can decode 16 element array', () => {
    const buf = encode([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    const res = decode(buf, 0);
    expect(res[0]).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
  });

  test('can decode 255 element array', () => {
    const arr = '3'.repeat(256).split('').map(Number);
    const buf = encode(arr);
    const res = decode(buf, 0);
    expect(res[0]).toEqual(arr);
  });

  test('can decode 0xFFFF element array', () => {
    const arr = '3'.repeat(0xFFFF).split('').map(Number);
    const buf = encode(arr);
    const res = decode(buf, 0);
    expect(res[0]).toEqual(arr);
  });

  test('can decode 0xFFFF + 1 element array', () => {
    const arr = '3'.repeat(0xFFFF + 1).split('');
    const buf = encode(arr);
    const res = decode(buf, 0);
    expect(res[0]).toEqual(arr);
  });
});
