import {MsgPackEncoderFast} from '..';

const {TextEncoder} = require('util');
if (!global.TextEncoder) global.TextEncoder = TextEncoder;

const encoder = new MsgPackEncoderFast();
const encode = (x: unknown) => encoder.encode(x);

describe('null', () => {
  test('encodes null', () => {
    const buf = encode(null);
    expect([...new Uint8Array(buf)]).toEqual([0xc0]);
  });
});

describe('boolean', () => {
  test('encodes false', () => {
    const buf = encode(false);
    expect([...new Uint8Array(buf)]).toEqual([0xc2]);
  });

  test('encodes true', () => {
    const buf = encode(true);
    expect([...new Uint8Array(buf)]).toEqual([0xc3]);
  });
});

describe('number', () => {
  test('encodes positive fixint', () => {
    const ints = [0, 1, 2, 0b10, 0b100, 0b1000, 0b10000, 0b100000, 0b1000000, 0x7f];
    for (const int of ints) expect([...new Uint8Array(encode(int))]).toEqual([int]);
  });

  test('encodes negative fixint', () => {
    const ints = [-1, -2, -3, -4, -0b11110, -0b11111];
    const res = [
      0xe0 | (-1 + 0x20),
      0xe0 | (-2 + 0x20),
      0xe0 | (-3 + 0x20),
      0xe0 | (-4 + 0x20),
      0xe0 | (-0b11110 + 0x20),
      0xe0 | (-0b11111 + 0x20),
    ];
    for (let i = 0; i < ints.length; i++) expect([...new Uint8Array(encode(ints[i]))]).toEqual([res[i]]);
  });

  test('encodes doubles', () => {
    const arr = encode(123.456789123123);
    expect(arr.byteLength).toBe(9);
    const view = new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
    expect(view.getUint8(0)).toBe(0xcb);
    expect(view.getFloat64(1)).toBe(123.456789123123);
  });

  // Skipped as due to optimization encoding this as float64
  test.skip('encodes large negative integer', () => {
    const arr = encode(-4807526976);
    expect(arr.byteLength).toBe(9);
    const view = new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
    expect(view.getUint8(0)).toBe(0xd3);
    expect([...new Uint8Array(arr.buffer)]).toEqual([0xd3, 0xff, 0xff, 0xff, 0xfe, 0xe1, 0x72, 0xf5, 0xc0]);
  });
});

describe('string', () => {
  test('encodes a zero length string', () => {
    const buf = encode('');
    expect(buf.byteLength).toBe(1);
    expect([...new Uint8Array(buf)]).toEqual([0b10100000]);
  });

  test('encodes a one char string', () => {
    const buf = encode('a');
    expect(buf.byteLength).toBe(2);
    expect([...new Uint8Array(buf)]).toEqual([0b10100001, 97]);
  });

  test('encodes a short string', () => {
    const buf = encode('foo');
    expect(buf.byteLength).toBe(4);
    expect([...new Uint8Array(buf)]).toEqual([0b10100011, 102, 111, 111]);
  });

  // Skipping these as for performance optimization strings are encoded as 4x longer then they could be.
  test.skip('encodes 31 char string', () => {
    const buf = encode('1234567890123456789012345678901');
    expect(buf.byteLength).toBe(32);
    expect([...new Uint8Array(buf)]).toEqual([
      0b10111111, 49, 50, 51, 52, 53, 54, 55, 56, 57, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 48, 49, 50, 51, 52, 53,
      54, 55, 56, 57, 48, 49,
    ]);
  });
  test.skip('encodes 255 char string', () => {
    const buf = encode('a'.repeat(255));
    expect(buf.byteLength).toBe(257);
    expect([...new Uint8Array(buf)]).toEqual([
      0xd9, 255, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97,
      97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97,
      97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97,
      97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97,
      97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97,
      97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97,
      97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97,
      97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97,
      97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97,
      97, 97, 97, 97, 97,
    ]);
  });
  test.skip('encodes 0xFFFF char string', () => {
    const buf = encode('b'.repeat(0xffff));
    expect(buf.byteLength).toBe(0xffff + 3);
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    expect(view.getUint8(0)).toBe(0xda);
    expect(view.getUint16(1)).toBe(0xffff);
  });

  // Skipping this test as due to optimizations, optimal encoding size is not used.
  test.skip('encodes 2000 char string', () => {
    const buf = encode('ab'.repeat(1000));
    expect(buf.byteLength).toBe(2003);
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    expect(view.getUint8(0)).toBe(0xda);
    expect(view.getUint16(1)).toBe(2000);
  });

  test('encodes 0xFFFF + 1 char string', () => {
    const buf = encode('d'.repeat(0xffff + 1));
    expect(buf.byteLength).toBe(0xffff + 1 + 5);
    // const view = new DataView(buf);
    // expect(view.getUint8(0)).toBe(0xdb);
    // expect(view.getUint32(1)).toBe(0xFFFF + 1);
  });
});

describe('array', () => {
  test('encodes empty array', () => {
    const buf = encode([]);
    expect(buf.byteLength).toBe(1);
    expect([...new Uint8Array(buf)]).toEqual([0b10010000]);
  });

  test('encodes one element array', () => {
    const buf = encode([1]);
    expect(buf.byteLength).toBe(2);
    expect([...new Uint8Array(buf)]).toEqual([0b10010001, 1]);
  });

  test('encodes three element array', () => {
    const buf = encode([1, 2, 3]);
    expect(buf.byteLength).toBe(4);
    expect([...new Uint8Array(buf)]).toEqual([0b10010011, 1, 2, 3]);
  });

  test('encodes 15 element array', () => {
    const arr = '1'.repeat(15).split('').map(Number);
    const buf = encode(arr);
    expect(buf.byteLength).toBe(16);
    expect([...new Uint8Array(buf)]).toEqual([0b10011111, ...arr]);
  });

  test('encodes 16 element array', () => {
    const arr = '2'.repeat(16).split('').map(Number);
    const buf = encode(arr);
    expect(buf.byteLength).toBe(19);
    expect([...new Uint8Array(buf)]).toEqual([0xdc, 0, 16, ...arr]);
  });

  test('encodes 255 element array', () => {
    const arr = '3'.repeat(255).split('').map(Number);
    const buf = encode(arr);
    expect(buf.byteLength).toBe(1 + 2 + 255);
    expect([...new Uint8Array(buf)]).toEqual([0xdc, 0, 255, ...arr]);
  });

  test('encodes 256 element array', () => {
    const arr = '3'.repeat(256).split('').map(Number);
    const buf = encode(arr);
    expect(buf.byteLength).toBe(1 + 2 + 256);
    expect([...new Uint8Array(buf)]).toEqual([0xdc, 1, 0, ...arr]);
  });

  test('encodes 0xFFFF element array', () => {
    const arr = '3'.repeat(0xffff).split('').map(Number);
    const buf = encode(arr);
    expect(buf.byteLength).toBe(1 + 2 + 0xffff);
    expect([...new Uint8Array(buf)]).toEqual([0xdc, 0xff, 0xff, ...arr]);
  });

  test('encodes 0xFFFF + 1 element array', () => {
    const arr = '3'
      .repeat(0xffff + 1)
      .split('')
      .map(Number);
    const buf = encode(arr);
    expect(buf.byteLength).toBe(1 + 4 + 0xffff + 1);
    expect([...new Uint8Array(buf)]).toEqual([0xdd, 0, 1, 0, 0, ...arr]);
  });
});

describe('object', () => {
  test('encodes empty object', () => {
    const buf = encode({});
    expect(buf.byteLength).toBe(1);
    expect([...new Uint8Array(buf)]).toEqual([0b10000000]);
  });

  test('encodes object with one key', () => {
    const buf = encode({a: 1});
    expect(buf.byteLength).toBe(1 + 2 + 1);
    expect([...new Uint8Array(buf)]).toEqual([0b10000001, 0b10100001, 97, 1]);
  });

  test('encodes object with 15 keys', () => {
    const arr = encode({
      1: 1,
      2: 1,
      3: 1,
      4: 1,
      5: 1,
      6: 1,
      7: 1,
      8: 1,
      9: 1,
      10: 1,
      11: 1,
      12: 1,
      13: 1,
      14: 1,
      15: 1,
    });
    expect(arr.byteLength).toBe(1 + 3 + 3 + 3 + 3 + 3 + 3 + 3 + 3 + 3 + 4 + 4 + 4 + 4 + 4 + 4);
    const view = new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
    expect(view.getUint8(0)).toBe(0b10001111);
  });

  test('encodes object with 16 keys', () => {
    const arr = encode({
      1: 1,
      2: 1,
      3: 1,
      4: 1,
      5: 1,
      6: 1,
      7: 1,
      8: 1,
      9: 1,
      10: 1,
      11: 1,
      12: 1,
      13: 1,
      14: 1,
      15: 1,
      16: 1,
    });
    expect(arr.byteLength).toBe(1 + 2 + 3 + 3 + 3 + 3 + 3 + 3 + 3 + 3 + 3 + 4 + 4 + 4 + 4 + 4 + 4 + 4);
    const view = new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
    expect(view.getUint8(0)).toBe(0xde);
    expect(view.getUint16(1)).toBe(16);
  });

  test('encodes object with 255 keys', () => {
    const obj: any = {};
    for (let i = 0; i < 255; i++) obj[String(i)] = i;
    const arr = encode(obj);
    const view = new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
    expect(view.getUint8(0)).toBe(0xde);
    expect(view.getUint16(1)).toBe(255);
    expect(view.getUint8(3)).toBe(0b10100001);
    expect(view.getUint8(4)).toBe(48);
  });

  test('encodes object with 0xFFFF keys', () => {
    const obj: any = {};
    for (let i = 0; i < 0xffff; i++) obj[String(i)] = i;
    const arr = encode(obj);
    const view = new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
    expect(view.getUint8(0)).toBe(0xde);
    expect(view.getUint16(1)).toBe(0xffff);
    expect(view.getUint8(3)).toBe(0b10100001);
    expect(view.getUint8(4)).toBe(48);
  });

  test('encodes object with 0xFFFF + 1 keys', () => {
    const obj: any = {};
    for (let i = 0; i < 0xffff + 1; i++) obj[String(i)] = i;
    const arr = encode(obj);
    const view = new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
    expect(view.getUint8(0)).toBe(0xdf);
    expect(view.getUint32(1)).toBe(0xffff + 1);
    expect(view.getUint8(5)).toBe(0b10100001);
    expect(view.getUint8(6)).toBe(48);
  });
});
