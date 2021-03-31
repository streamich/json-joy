import {encode} from '../encode';
import {decode} from '../decode';

describe('null', () => {
  test('can decode null', () => {
    const buf = encode(null);
    const res = decode(new DataView(buf), 0);
    expect(res).toBe(null);
  });
});

describe('boolean', () => {
  test('can decode false', () => {
    const buf = encode(false);
    const res = decode(new DataView(buf), 0);
    expect(res).toBe(false);
  });

  test('can decode true', () => {
    const buf = encode(true);
    const res = decode(new DataView(buf), 0);
    expect(res).toBe(true);
  });
});

describe('number', () => {
  test('can decode positive fixint', () => {
    const buf = encode(123);
    const res = decode(new DataView(buf), 0);
    expect(res).toBe(123);
  });

  test('can decode 0', () => {
    const buf = encode(0);
    const res = decode(new DataView(buf), 0);
    expect(res).toBe(0);
  });

  test('can decode negative fixint', () => {
    const buf = encode(-1);
    const res = decode(new DataView(buf), 0);
    expect(res).toBe(-1);
  });

  test('can decode negative fixint - 2', () => {
    const buf = encode(-32);
    const res = decode(new DataView(buf), 0);
    expect(res).toBe(-32);
  });

  test('can decode double', () => {
    const buf = encode(3456.12345678902234);
    const res = decode(new DataView(buf), 0);
    expect(res).toBe(3456.12345678902234);
  });
});
