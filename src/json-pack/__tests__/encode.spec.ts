import {encode} from '../encode';

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
    const ints = [-1, -2, -3, -4, -0b11110, -0b11111, -0b100000];
    const res = [0xe0, 0b11100001, 0b11100010, 0b11100011, 0b11111101, 0b11111110, 0b11111111];
    for (let i = 0; i < ints.length; i++) expect([...new Uint8Array(encode(ints[i]))]).toEqual([res[i]]);
  });

  test('encodes doubles', () => {
    const buf = encode(123.456789123123);
    expect(buf.byteLength).toBe(9);
    const view = new DataView(buf);
    expect(view.getUint8(0)).toBe(0xcb);
    expect(view.getFloat64(1)).toBe(123.456789123123);
  });
});
