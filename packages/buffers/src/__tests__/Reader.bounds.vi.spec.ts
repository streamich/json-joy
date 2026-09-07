import {describe, expect, test} from 'vitest';
import {Reader} from '../Reader';

/**
 * Every read is bounded by `end`. Decoders parse untrusted input, and a length
 * the input does not back has to fail loudly: returning `undefined` (`u8`),
 * `NaN` (`u16`) or a short buffer (`buf`) lets a decoder invent a value out of
 * bytes that are not there, and lets a lying length header drive unbounded work.
 */
describe('reads past the end throw', () => {
  /** Read, and how many octets it needs. */
  const reads: [string, (reader: Reader) => unknown, number][] = [
    ['u8', (r) => r.u8(), 1],
    ['i8', (r) => r.i8(), 1],
    ['u16', (r) => r.u16(), 2],
    ['i16', (r) => r.i16(), 2],
    ['u32', (r) => r.u32(), 4],
    ['i32', (r) => r.i32(), 4],
    ['u64', (r) => r.u64(), 8],
    ['i64', (r) => r.i64(), 8],
    ['f32', (r) => r.f32(), 4],
    ['f64', (r) => r.f64(), 8],
    ['buf', (r) => r.buf(9), 9],
    ['utf8', (r) => r.utf8(9), 9],
    ['ascii', (r) => r.ascii(9), 9],
  ];

  for (const [name, read, octets] of reads) {
    test(`${name}() throws on an empty buffer`, () => {
      expect(() => read(new Reader(new Uint8Array(0)))).toThrow(RangeError);
    });

    test(`${name}() throws when the buffer is one byte short`, () => {
      expect(() => read(new Reader(new Uint8Array(octets - 1)))).toThrow(RangeError);
    });

    test(`${name}() succeeds when the buffer is exactly long enough`, () => {
      const reader = new Reader(new Uint8Array(octets));
      expect(() => read(reader)).not.toThrow();
      expect(reader.x).toBe(octets);
    });

    test(`${name}() does not advance the cursor when it throws`, () => {
      const reader = new Reader(new Uint8Array(0));
      try {
        read(reader);
      } catch {}
      expect(reader.x).toBe(0);
    });
  }

  test('a read that exactly fills the buffer succeeds', () => {
    expect(new Reader(new Uint8Array(1)).u8()).toBe(0);
    expect(new Reader(new Uint8Array(2)).u16()).toBe(0);
    expect(new Reader(new Uint8Array(4)).u32()).toBe(0);
    expect(new Reader(new Uint8Array(8)).u64()).toBe(BigInt(0));
    expect(new Reader(new Uint8Array(8)).buf(8).length).toBe(8);
    expect(new Reader(new Uint8Array(8)).utf8(8).length).toBe(8);
  });

  test('buf() and utf8() throw for a NaN size, which is a truncated length header', () => {
    expect(() => new Reader(new Uint8Array(8)).buf(Number.NaN)).toThrow(RangeError);
    expect(() => new Reader(new Uint8Array(8)).utf8(Number.NaN)).toThrow(RangeError);
  });

  test('buf() no longer silently returns a short buffer', () => {
    const reader = new Reader(new Uint8Array([1, 2, 3]));
    expect(() => reader.buf(0xffffffff)).toThrow(RangeError);
    expect(reader.buf(3)).toStrictEqual(new Uint8Array([1, 2, 3]));
  });

  test('reads are bounded by a narrowed end, not by the buffer', () => {
    const uint8 = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
    const reader = new Reader(uint8, new DataView(uint8.buffer), 0, 2);
    expect(reader.u8()).toBe(1);
    expect(reader.u8()).toBe(2);
    expect(() => reader.u8()).toThrow(RangeError);
  });

  test('a reader cut from another is bounded by the cut', () => {
    const reader = new Reader(new Uint8Array([1, 2, 3, 4, 5, 6]));
    const cut = reader.cut(2);
    expect(cut.u8()).toBe(1);
    expect(cut.u8()).toBe(2);
    expect(() => cut.u8()).toThrow(RangeError);
    // The parent still reads the rest.
    expect(reader.u8()).toBe(3);
  });
});

describe('reset() updates the end boundary', () => {
  test('size() reflects the new buffer, not the old one', () => {
    const reader = new Reader(new Uint8Array(10));
    expect(reader.size()).toBe(10);
    reader.reset(new Uint8Array(100));
    expect(reader.size()).toBe(100);
    reader.reset(new Uint8Array(3));
    expect(reader.size()).toBe(3);
  });

  test('a default constructed reader is usable after reset()', () => {
    const reader = new Reader();
    expect(reader.size()).toBe(0);
    reader.reset(new Uint8Array([1, 2, 3, 4, 5]));
    expect(reader.size()).toBe(5);
    expect(reader.buf().length).toBe(5);
  });

  test('reads past the new buffer throw, and reads inside it do not', () => {
    const reader = new Reader(new Uint8Array(100));
    reader.reset(new Uint8Array([7, 7]));
    expect(reader.u8()).toBe(7);
    expect(reader.u8()).toBe(7);
    expect(() => reader.u8()).toThrow(RangeError);
  });

  test('reset() clears a narrowed end from a previous buffer', () => {
    const uint8 = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
    const reader = new Reader(uint8, new DataView(uint8.buffer), 0, 2);
    expect(reader.size()).toBe(2);
    reader.reset(new Uint8Array([9, 9, 9, 9]));
    expect(reader.size()).toBe(4);
    expect(reader.buf().length).toBe(4);
  });
});
