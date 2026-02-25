import {Reader} from '../Reader';
import {Writer} from '../Writer';

describe('Reader', () => {
  describe('constructor and initialization', () => {
    test('creates reader with default values', () => {
      const reader = new Reader();
      expect(reader.uint8).toEqual(new Uint8Array([]));
      expect(reader.x).toBe(0);
      expect(reader.end).toBe(0);
      expect(reader.view).toBeInstanceOf(DataView);
    });

    test('creates reader with uint8 array', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const reader = new Reader(data);
      expect(reader.uint8).toBe(data);
      expect(reader.x).toBe(0);
      expect(reader.end).toBe(5);
    });

    test('creates reader with custom cursor position', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const reader = new Reader(data, undefined, 2);
      expect(reader.x).toBe(2);
      expect(reader.end).toBe(5);
    });

    test('creates reader with custom end position', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const reader = new Reader(data, undefined, 1, 4);
      expect(reader.x).toBe(1);
      expect(reader.end).toBe(4);
    });

    test('creates DataView with correct offset and length', () => {
      const buffer = new ArrayBuffer(10);
      const data = new Uint8Array(buffer, 2, 6);
      const reader = new Reader(data);
      expect(reader.view.byteLength).toBe(6);
    });
  });

  describe('reset', () => {
    test('resets reader to beginning', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const reader = new Reader(data);
      reader.x = 3;
      reader.reset(data);
      expect(reader.x).toBe(0);
      expect(reader.uint8).toBe(data);
    });

    test('resets with new data', () => {
      const data1 = new Uint8Array([1, 2, 3]);
      const data2 = new Uint8Array([10, 20, 30, 40]);
      const reader = new Reader(data1);
      reader.x = 2;
      reader.reset(data2);
      expect(reader.x).toBe(0);
      expect(reader.uint8).toBe(data2);
      // Note: reset() doesn't update end, so we check the view length instead
      expect(reader.view.byteLength).toBe(4);
    });

    test('resets DataView when resetting data', () => {
      const data1 = new Uint8Array([1, 2, 3]);
      const data2 = new Uint8Array([10, 20, 30, 40]);
      const reader = new Reader(data1);
      const oldView = reader.view;
      reader.reset(data2);
      expect(reader.view).not.toBe(oldView);
    });
  });

  describe('size', () => {
    test('returns remaining bytes', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const reader = new Reader(data);
      expect(reader.size()).toBe(5);
    });

    test('decreases as cursor advances', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const reader = new Reader(data);
      reader.x = 2;
      expect(reader.size()).toBe(3);
    });

    test('returns zero at end', () => {
      const data = new Uint8Array([1, 2, 3]);
      const reader = new Reader(data);
      reader.x = 3;
      expect(reader.size()).toBe(0);
    });

    test('respects custom end boundary', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const reader = new Reader(data, undefined, 1, 4);
      expect(reader.size()).toBe(3);
    });
  });

  describe('peek', () => {
    test('returns current byte without advancing', () => {
      const data = new Uint8Array([42, 100, 200]);
      const reader = new Reader(data);
      expect(reader.peek()).toBe(42);
      expect(reader.x).toBe(0);
    });

    test('returns correct byte at cursor position', () => {
      const data = new Uint8Array([10, 20, 30, 40]);
      const reader = new Reader(data);
      reader.x = 2;
      expect(reader.peek()).toBe(30);
    });

    test('returns different values as cursor advances', () => {
      const data = new Uint8Array([1, 2, 3]);
      const reader = new Reader(data);
      expect(reader.peek()).toBe(1);
      reader.x = 1;
      expect(reader.peek()).toBe(2);
      reader.x = 2;
      expect(reader.peek()).toBe(3);
    });
  });

  describe('peak (deprecated alias)', () => {
    test('works same as peek', () => {
      const data = new Uint8Array([99, 88, 77]);
      const reader = new Reader(data);
      expect(reader.peak()).toBe(reader.peek());
    });
  });

  describe('skip', () => {
    test('advances cursor by specified amount', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const reader = new Reader(data);
      reader.skip(2);
      expect(reader.x).toBe(2);
    });

    test('can skip to end', () => {
      const data = new Uint8Array([1, 2, 3]);
      const reader = new Reader(data);
      reader.skip(3);
      expect(reader.x).toBe(3);
      expect(reader.size()).toBe(0);
    });

    test('can skip beyond end', () => {
      const data = new Uint8Array([1, 2, 3]);
      const reader = new Reader(data);
      reader.skip(10);
      expect(reader.x).toBe(10);
    });

    test('can skip multiple times', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
      const reader = new Reader(data);
      reader.skip(2);
      reader.skip(3);
      reader.skip(1);
      expect(reader.x).toBe(6);
    });
  });

  describe('u8', () => {
    test('reads byte and advances cursor', () => {
      const data = new Uint8Array([42, 100, 200]);
      const reader = new Reader(data);
      expect(reader.u8()).toBe(42);
      expect(reader.x).toBe(1);
    });

    test('reads bytes sequentially', () => {
      const data = new Uint8Array([10, 20, 30, 40]);
      const reader = new Reader(data);
      expect(reader.u8()).toBe(10);
      expect(reader.u8()).toBe(20);
      expect(reader.u8()).toBe(30);
      expect(reader.x).toBe(3);
    });

    test('reads max byte value', () => {
      const data = new Uint8Array([255]);
      const reader = new Reader(data);
      expect(reader.u8()).toBe(255);
    });

    test('reads multiple bytes at different positions', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const reader = new Reader(data);
      reader.skip(2);
      expect(reader.u8()).toBe(3);
      expect(reader.u8()).toBe(4);
    });
  });

  describe('i8', () => {
    test('reads signed byte', () => {
      const data = new Uint8Array([0xfe]); // -2 in two's complement
      const reader = new Reader(data);
      expect(reader.i8()).toBe(-2);
    });

    test('reads positive signed byte', () => {
      const data = new Uint8Array([127]);
      const reader = new Reader(data);
      expect(reader.i8()).toBe(127);
    });

    test('reads negative signed byte', () => {
      const data = new Uint8Array([0xff]); // -1
      const reader = new Reader(data);
      expect(reader.i8()).toBe(-1);
    });

    test('advances cursor', () => {
      const data = new Uint8Array([1, 2, 3]);
      const reader = new Reader(data);
      reader.i8();
      expect(reader.x).toBe(1);
    });
  });

  describe('u16', () => {
    test('reads 16-bit unsigned integer', () => {
      const data = new Uint8Array([0x12, 0x34]);
      const reader = new Reader(data);
      const value = reader.u16();
      expect(value).toBe((0x12 << 8) + 0x34);
      expect(reader.x).toBe(2);
    });

    test('reads multiple u16 values', () => {
      const data = new Uint8Array([0x12, 0x34, 0x56, 0x78]);
      const reader = new Reader(data);
      expect(reader.u16()).toBe((0x12 << 8) + 0x34);
      expect(reader.u16()).toBe((0x56 << 8) + 0x78);
      expect(reader.x).toBe(4);
    });

    test('reads max u16 value', () => {
      const data = new Uint8Array([0xff, 0xff]);
      const reader = new Reader(data);
      expect(reader.u16()).toBe(0xffff);
    });
  });

  describe('i16', () => {
    test('reads signed 16-bit integer', () => {
      const buffer = new ArrayBuffer(2);
      const view = new DataView(buffer);
      view.setInt16(0, -1000);
      const data = new Uint8Array(buffer);
      const reader = new Reader(data);
      expect(reader.i16()).toBe(-1000);
    });

    test('reads positive i16', () => {
      const buffer = new ArrayBuffer(2);
      const view = new DataView(buffer);
      view.setInt16(0, 1000);
      const data = new Uint8Array(buffer);
      const reader = new Reader(data);
      expect(reader.i16()).toBe(1000);
    });

    test('advances cursor by 2', () => {
      const data = new Uint8Array([0, 0, 1, 2]);
      const reader = new Reader(data);
      reader.i16();
      expect(reader.x).toBe(2);
    });
  });

  describe('u32', () => {
    test('reads 32-bit unsigned integer', () => {
      const buffer = new ArrayBuffer(4);
      const view = new DataView(buffer);
      view.setUint32(0, 0x12345678);
      const data = new Uint8Array(buffer);
      const reader = new Reader(data);
      expect(reader.u32()).toBe(0x12345678);
      expect(reader.x).toBe(4);
    });

    test('reads max u32 value', () => {
      const buffer = new ArrayBuffer(4);
      const view = new DataView(buffer);
      view.setUint32(0, 0xffffffff);
      const data = new Uint8Array(buffer);
      const reader = new Reader(data);
      expect(reader.u32()).toBe(0xffffffff);
    });

    test('reads multiple u32 values sequentially', () => {
      const buffer = new ArrayBuffer(8);
      const view = new DataView(buffer);
      view.setUint32(0, 100000);
      view.setUint32(4, 200000);
      const data = new Uint8Array(buffer);
      const reader = new Reader(data);
      expect(reader.u32()).toBe(100000);
      expect(reader.u32()).toBe(200000);
    });
  });

  describe('i32', () => {
    test('reads signed 32-bit integer', () => {
      const buffer = new ArrayBuffer(4);
      const view = new DataView(buffer);
      view.setInt32(0, -123456);
      const data = new Uint8Array(buffer);
      const reader = new Reader(data);
      expect(reader.i32()).toBe(-123456);
    });

    test('reads positive i32', () => {
      const buffer = new ArrayBuffer(4);
      const view = new DataView(buffer);
      view.setInt32(0, 123456);
      const data = new Uint8Array(buffer);
      const reader = new Reader(data);
      expect(reader.i32()).toBe(123456);
    });

    test('reads -1', () => {
      const buffer = new ArrayBuffer(4);
      const view = new DataView(buffer);
      view.setInt32(0, -1);
      const data = new Uint8Array(buffer);
      const reader = new Reader(data);
      expect(reader.i32()).toBe(-1);
    });
  });

  describe('u64', () => {
    test('reads 64-bit unsigned integer as bigint', () => {
      const buffer = new ArrayBuffer(8);
      const view = new DataView(buffer);
      view.setBigUint64(0, BigInt('0x123456789ABCDEF0'));
      const data = new Uint8Array(buffer);
      const reader = new Reader(data);
      expect(reader.u64()).toBe(BigInt('0x123456789ABCDEF0'));
      expect(reader.x).toBe(8);
    });

    test('reads max u64 value', () => {
      const buffer = new ArrayBuffer(8);
      const view = new DataView(buffer);
      view.setBigUint64(0, BigInt('0xFFFFFFFFFFFFFFFF'));
      const data = new Uint8Array(buffer);
      const reader = new Reader(data);
      expect(reader.u64()).toBe(BigInt('0xFFFFFFFFFFFFFFFF'));
    });

    test('reads multiple u64 values', () => {
      const buffer = new ArrayBuffer(16);
      const view = new DataView(buffer);
      view.setBigUint64(0, BigInt(1000000));
      view.setBigUint64(8, BigInt(2000000));
      const data = new Uint8Array(buffer);
      const reader = new Reader(data);
      expect(reader.u64()).toBe(BigInt(1000000));
      expect(reader.u64()).toBe(BigInt(2000000));
    });
  });

  describe('i64', () => {
    test('reads signed 64-bit integer as bigint', () => {
      const buffer = new ArrayBuffer(8);
      const view = new DataView(buffer);
      view.setBigInt64(0, BigInt(-123456789));
      const data = new Uint8Array(buffer);
      const reader = new Reader(data);
      expect(reader.i64()).toBe(BigInt(-123456789));
    });

    test('reads positive i64', () => {
      const buffer = new ArrayBuffer(8);
      const view = new DataView(buffer);
      view.setBigInt64(0, BigInt(123456789));
      const data = new Uint8Array(buffer);
      const reader = new Reader(data);
      expect(reader.i64()).toBe(BigInt(123456789));
    });

    test('reads -1 as bigint', () => {
      const buffer = new ArrayBuffer(8);
      const view = new DataView(buffer);
      view.setBigInt64(0, BigInt(-1));
      const data = new Uint8Array(buffer);
      const reader = new Reader(data);
      expect(reader.i64()).toBe(BigInt(-1));
    });
  });

  describe('f32', () => {
    test('reads 32-bit float', () => {
      const buffer = new ArrayBuffer(4);
      const view = new DataView(buffer);
      view.setFloat32(0, 3.14);
      const data = new Uint8Array(buffer);
      const reader = new Reader(data);
      expect(reader.f32()).toBeCloseTo(3.14, 2);
      expect(reader.x).toBe(4);
    });

    test('reads negative float', () => {
      const buffer = new ArrayBuffer(4);
      const view = new DataView(buffer);
      view.setFloat32(0, -2.71);
      const data = new Uint8Array(buffer);
      const reader = new Reader(data);
      expect(reader.f32()).toBeCloseTo(-2.71, 2);
    });

    test('reads multiple f32 values', () => {
      const buffer = new ArrayBuffer(8);
      const view = new DataView(buffer);
      view.setFloat32(0, 1.5);
      view.setFloat32(4, 2.5);
      const data = new Uint8Array(buffer);
      const reader = new Reader(data);
      expect(reader.f32()).toBeCloseTo(1.5);
      expect(reader.f32()).toBeCloseTo(2.5);
    });
  });

  describe('f64', () => {
    test('reads 64-bit float', () => {
      const buffer = new ArrayBuffer(8);
      const view = new DataView(buffer);
      view.setFloat64(0, Math.PI);
      const data = new Uint8Array(buffer);
      const reader = new Reader(data);
      // biome-ignore lint: ignore precision
      expect(reader.f64()).toBeCloseTo(3.14159265, 8);
      expect(reader.x).toBe(8);
    });

    test('reads negative double', () => {
      const buffer = new ArrayBuffer(8);
      const view = new DataView(buffer);
      // biome-ignore lint: ignore precision
      view.setFloat64(0, -2.718281828);
      const data = new Uint8Array(buffer);
      const reader = new Reader(data);
      // biome-ignore lint: ignore precision
      expect(reader.f64()).toBeCloseTo(-2.718281828, 8);
    });

    test('reads multiple f64 values', () => {
      const buffer = new ArrayBuffer(16);
      const view = new DataView(buffer);
      view.setFloat64(0, 1.11);
      view.setFloat64(8, 2.22);
      const data = new Uint8Array(buffer);
      const reader = new Reader(data);
      expect(reader.f64()).toBeCloseTo(1.11);
      expect(reader.f64()).toBeCloseTo(2.22);
    });
  });

  describe('buf', () => {
    test('reads buffer of specified size', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const reader = new Reader(data);
      const result = reader.buf(3);
      expect(result).toEqual(new Uint8Array([1, 2, 3]));
      expect(reader.x).toBe(3);
    });

    test('reads remaining buffer when no size given', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const reader = new Reader(data);
      reader.x = 2;
      const result = reader.buf();
      expect(result).toEqual(new Uint8Array([3, 4, 5]));
      expect(reader.x).toBe(5);
    });

    test('reads zero-length buffer', () => {
      const data = new Uint8Array([1, 2, 3]);
      const reader = new Reader(data);
      const result = reader.buf(0);
      expect(result.length).toBe(0);
      expect(reader.x).toBe(0);
    });

    test('reads entire buffer', () => {
      const data = new Uint8Array([10, 20, 30]);
      const reader = new Reader(data);
      const result = reader.buf(3);
      expect(result).toEqual(data);
      expect(reader.x).toBe(3);
    });

    test('reads buffer at intermediate position', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5, 6, 7]);
      const reader = new Reader(data);
      reader.x = 2;
      const result = reader.buf(3);
      expect(result).toEqual(new Uint8Array([3, 4, 5]));
      expect(reader.x).toBe(5);
    });

    test('returns subarray not copy', () => {
      const data = new Uint8Array([1, 2, 3, 4]);
      const reader = new Reader(data);
      const result = reader.buf(2);
      expect(result.buffer).toBe(data.buffer);
    });
  });

  describe('subarray', () => {
    test('returns subarray from current position', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const reader = new Reader(data);
      reader.x = 1;
      const result = reader.subarray();
      expect(result).toEqual(new Uint8Array([2, 3, 4, 5]));
      expect(reader.x).toBe(1); // Cursor should not advance
    });

    test('returns subarray with start offset', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const reader = new Reader(data);
      reader.x = 1;
      const result = reader.subarray(1, 3);
      expect(result).toEqual(new Uint8Array([3, 4]));
    });

    test('returns subarray with end offset', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const reader = new Reader(data);
      reader.x = 0;
      const result = reader.subarray(0, 3);
      expect(result).toEqual(new Uint8Array([1, 2, 3]));
    });

    test('returns zero-length subarray', () => {
      const data = new Uint8Array([1, 2, 3]);
      const reader = new Reader(data);
      const result = reader.subarray(0, 0);
      expect(result.length).toBe(0);
    });

    test('does not advance cursor', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const reader = new Reader(data);
      reader.x = 2;
      reader.subarray(1, 3);
      expect(reader.x).toBe(2);
    });

    test('works with custom end boundary', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const reader = new Reader(data, undefined, 1, 4);
      const result = reader.subarray();
      expect(result).toEqual(new Uint8Array([2, 3, 4]));
    });
  });

  describe('slice', () => {
    test('creates independent reader', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const reader = new Reader(data);
      const slice = reader.slice();
      expect(slice.x).toBe(0);
      expect(slice.end).toBe(5);
      expect(slice.uint8).toBe(data);
    });

    test('does not advance original cursor', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const reader = new Reader(data);
      reader.slice();
      expect(reader.x).toBe(0);
    });

    test('slice with start offset', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const reader = new Reader(data);
      const slice = reader.slice(2);
      expect(slice.x).toBe(2);
      expect(slice.end).toBe(5);
    });

    test('slice with start and end offsets', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const reader = new Reader(data);
      const slice = reader.slice(1, 3);
      expect(slice.x).toBe(1);
      expect(slice.end).toBe(3);
    });

    test('slice after advancing cursor', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const reader = new Reader(data);
      reader.x = 2;
      const slice = reader.slice(1);
      expect(slice.x).toBe(3);
      expect(slice.end).toBe(5);
    });

    test('slice shares underlying buffer', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const reader = new Reader(data);
      const slice = reader.slice();
      expect(slice.uint8).toBe(data);
    });

    test('slice has same DataView', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const reader = new Reader(data);
      const slice = reader.slice();
      expect(slice.view).toBe(reader.view);
    });

    test('multiple slices are independent', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const reader = new Reader(data);
      const slice1 = reader.slice(0, 2);
      const slice2 = reader.slice(2, 5);
      expect(slice1.u8()).toBe(1);
      expect(slice2.u8()).toBe(3);
      expect(slice1.u8()).toBe(2);
      expect(slice2.u8()).toBe(4);
    });

    test('slice respects original end boundary', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const reader = new Reader(data, undefined, 0, 3);
      const slice = reader.slice();
      expect(slice.x).toBe(0);
      expect(slice.end).toBe(3);
    });
  });

  describe('cut', () => {
    test('creates slice and advances cursor', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const reader = new Reader(data);
      const cut = reader.cut(2);
      expect(cut.x).toBe(0);
      expect(cut.end).toBe(2);
      expect(reader.x).toBe(2);
    });

    test('cut returns readable slice', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const reader = new Reader(data);
      const cut = reader.cut(3);
      expect(cut.u8()).toBe(1);
      expect(cut.u8()).toBe(2);
      expect(cut.u8()).toBe(3);
    });

    test('multiple cuts work sequentially', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5, 6]);
      const reader = new Reader(data);
      const cut1 = reader.cut(2);
      const cut2 = reader.cut(2);
      const cut3 = reader.cut(2);
      expect(cut1.buf()).toEqual(new Uint8Array([1, 2]));
      expect(cut2.buf()).toEqual(new Uint8Array([3, 4]));
      expect(cut3.buf()).toEqual(new Uint8Array([5, 6]));
    });

    test('cut without size uses remaining', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const reader = new Reader(data);
      reader.x = 2;
      const cut = reader.cut();
      expect(cut.x).toBe(2);
      expect(cut.end).toBe(5);
      expect(reader.x).toBe(5);
    });

    test('zero-length cut', () => {
      const data = new Uint8Array([1, 2, 3]);
      const reader = new Reader(data);
      const cut = reader.cut(0);
      expect(cut.size()).toBe(0);
      expect(reader.x).toBe(0);
    });

    test('cut respects end boundary', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const reader = new Reader(data, undefined, 0, 3);
      const cut = reader.cut(2);
      expect(cut.end).toBe(2);
      expect(reader.x).toBe(2);
    });
  });

  describe('utf8', () => {
    test('decodes UTF-8 string', () => {
      const encoded = new TextEncoder().encode('Hello');
      const reader = new Reader(encoded);
      const result = reader.utf8(encoded.length);
      expect(result).toBe('Hello');
      expect(reader.x).toBe(5);
    });

    test('decodes empty string', () => {
      const reader = new Reader(new Uint8Array([]));
      const result = reader.utf8(0);
      expect(result).toBe('');
      expect(reader.x).toBe(0);
    });

    test('decodes UTF-8 with multibyte characters', () => {
      const encoded = new TextEncoder().encode('café');
      const reader = new Reader(encoded);
      const result = reader.utf8(encoded.length);
      expect(result).toBe('café');
    });

    test('decodes emoji', () => {
      const encoded = new TextEncoder().encode('👍');
      const reader = new Reader(encoded);
      const result = reader.utf8(encoded.length);
      expect(result).toBe('👍');
    });

    test('decodes CJK characters', () => {
      const encoded = new TextEncoder().encode('你好');
      const reader = new Reader(encoded);
      const result = reader.utf8(encoded.length);
      expect(result).toBe('你好');
    });

    test('decodes Cyrillic', () => {
      const encoded = new TextEncoder().encode('Привет');
      const reader = new Reader(encoded);
      const result = reader.utf8(encoded.length);
      expect(result).toBe('Привет');
    });

    test('decodes mixed scripts', () => {
      const encoded = new TextEncoder().encode('Hello мир 世界 🌍');
      const reader = new Reader(encoded);
      const result = reader.utf8(encoded.length);
      expect(result).toBe('Hello мир 世界 🌍');
    });

    test('advances cursor correctly', () => {
      const encoded = new TextEncoder().encode('Test');
      const reader = new Reader(encoded);
      reader.utf8(4);
      expect(reader.x).toBe(4);
    });

    test('decodes partial UTF-8 from buffer', () => {
      const encoded = new TextEncoder().encode('HelloWorld');
      const reader = new Reader(encoded);
      reader.x = 5;
      const result = reader.utf8(5);
      expect(result).toBe('World');
      expect(reader.x).toBe(10);
    });

    test('decodes with null bytes', () => {
      const encoded = new TextEncoder().encode('hello\x00world');
      const reader = new Reader(encoded);
      const result = reader.utf8(encoded.length);
      expect(result).toBe('hello\x00world');
    });

    test('stress test: very long UTF-8 string', () => {
      const longStr = 'a'.repeat(100000);
      const encoded = new TextEncoder().encode(longStr);
      const reader = new Reader(encoded);
      const result = reader.utf8(encoded.length);
      expect(result).toBe(longStr);
    });

    test('stress test: UTF-8 with many multibyte characters', () => {
      const longStr = 'ä'.repeat(50000);
      const encoded = new TextEncoder().encode(longStr);
      const reader = new Reader(encoded);
      const result = reader.utf8(encoded.length);
      expect(result).toBe(longStr);
    });

    test('stress test: UTF-8 with many emojis', () => {
      const emojiStr = '😀'.repeat(1000);
      const encoded = new TextEncoder().encode(emojiStr);
      const reader = new Reader(encoded);
      const result = reader.utf8(encoded.length);
      expect(result).toBe(emojiStr);
    });

    test('stress test: mixed unicode characters', () => {
      const chars = ['a', 'ä', 'Ελ', '你', '👍', '🌈', 'мир'];
      const mixed = chars.join('').repeat(100);
      const encoded = new TextEncoder().encode(mixed);
      const reader = new Reader(encoded);
      const result = reader.utf8(encoded.length);
      expect(result).toBe(mixed);
    });

    test('roundtrip with Writer', () => {
      const testStrings = ['simple', 'café', '日本語', '😀', 'мир', 'Hello мир 世界 🌍'];

      for (const str of testStrings) {
        const writer = new Writer();
        writer.ensureCapacity(str.length * 4);
        writer.utf8(str);
        const encoded = writer.flush();

        const reader = new Reader(encoded);
        const decoded = reader.utf8(encoded.length);
        expect(decoded).toBe(str);
      }
    });
  });

  describe('ascii', () => {
    test('reads ASCII string', () => {
      const data = new Uint8Array([72, 101, 108, 108, 111]); // 'Hello'
      const reader = new Reader(data);
      const result = reader.ascii(5);
      expect(result).toBe('Hello');
      expect(reader.x).toBe(5);
    });

    test('reads empty ASCII string', () => {
      const data = new Uint8Array([65, 66, 67]);
      const reader = new Reader(data);
      const result = reader.ascii(0);
      expect(result).toBe('');
      expect(reader.x).toBe(0);
    });

    test('reads ASCII at position', () => {
      const data = new Uint8Array([65, 66, 67, 68, 69]); // 'ABCDE'
      const reader = new Reader(data);
      reader.x = 2;
      const result = reader.ascii(3);
      expect(result).toBe('CDE');
      expect(reader.x).toBe(5);
    });

    test('reads ASCII with special characters', () => {
      const str = 'Hello!@#123';
      const data = new Uint8Array(str.split('').map((c) => c.charCodeAt(0)));
      const reader = new Reader(data);
      const result = reader.ascii(str.length);
      expect(result).toBe(str);
    });

    test('reads all printable ASCII', () => {
      let str = '';
      for (let i = 32; i < 127; i++) {
        str += String.fromCharCode(i);
      }
      const data = new Uint8Array(str.split('').map((c) => c.charCodeAt(0)));
      const reader = new Reader(data);
      const result = reader.ascii(str.length);
      expect(result).toBe(str);
    });

    test('stress test: very long ASCII string', () => {
      const longStr = 'a'.repeat(100000);
      const data = new Uint8Array(longStr.split('').map((c) => c.charCodeAt(0)));
      const reader = new Reader(data);
      const result = reader.ascii(longStr.length);
      expect(result).toBe(longStr);
      expect(reader.x).toBe(100000);
    });

    test('reads multiple ASCII segments', () => {
      const data = new Uint8Array([65, 66, 67, 68, 69, 70]);
      const reader = new Reader(data);
      const result1 = reader.ascii(2);
      const result2 = reader.ascii(2);
      const result3 = reader.ascii(2);
      expect(result1).toBe('AB');
      expect(result2).toBe('CD');
      expect(result3).toBe('EF');
    });
  });

  describe('complex scenarios', () => {
    test('reads mixed data types', () => {
      const buffer = new ArrayBuffer(15);
      const view = new DataView(buffer);
      view.setUint8(0, 42);
      view.setUint16(1, 0x1234);
      view.setUint32(3, 0xdeadbeef);
      const asciiStr = 'test';
      const uint8 = new Uint8Array(buffer);
      for (let i = 0; i < asciiStr.length; i++) {
        uint8[7 + i] = asciiStr.charCodeAt(i);
      }

      const reader = new Reader(uint8);
      expect(reader.u8()).toBe(42);
      expect(reader.u16()).toBe(0x1234);
      expect(reader.u32()).toBe(0xdeadbeef);
      expect(reader.ascii(4)).toBe('test');
    });

    test('creates slices and reads from them', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
      const reader = new Reader(data);
      const slice1 = reader.slice(0, 3);
      const slice2 = reader.slice(3, 6);

      expect(slice1.u8()).toBe(1);
      expect(slice1.u8()).toBe(2);
      expect(slice1.u8()).toBe(3);

      expect(slice2.u8()).toBe(4);
      expect(slice2.u8()).toBe(5);
      expect(slice2.u8()).toBe(6);
    });

    test('interleaves peek and read', () => {
      const data = new Uint8Array([10, 20, 30, 40, 50]);
      const reader = new Reader(data);
      expect(reader.peek()).toBe(10);
      expect(reader.u8()).toBe(10);
      expect(reader.peek()).toBe(20);
      reader.skip(1);
      expect(reader.peek()).toBe(30);
      expect(reader.u8()).toBe(30);
    });

    test('handles cursor beyond data', () => {
      const data = new Uint8Array([1, 2, 3]);
      const reader = new Reader(data);
      reader.x = 5;
      expect(reader.size()).toBe(-2);
    });
  });

  describe('edge cases', () => {
    test('empty buffer operations', () => {
      const reader = new Reader();
      expect(reader.size()).toBe(0);
    });

    test('single byte buffer', () => {
      const data = new Uint8Array([42]);
      const reader = new Reader(data);
      expect(reader.u8()).toBe(42);
      expect(reader.size()).toBe(0);
    });

    test('reader with offset buffer', () => {
      const arrayBuffer = new ArrayBuffer(10);
      const uint8Full = new Uint8Array(arrayBuffer);
      for (let i = 0; i < 10; i++) {
        uint8Full[i] = i;
      }
      const uint8Offset = new Uint8Array(arrayBuffer, 2, 5);
      const reader = new Reader(uint8Offset);
      expect(reader.u8()).toBe(2);
      expect(reader.u8()).toBe(3);
    });

    test('reset after partial read', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const reader = new Reader(data);
      reader.u8();
      reader.u8();
      const newData = new Uint8Array([10, 20, 30]);
      reader.reset(newData);
      expect(reader.x).toBe(0);
      expect(reader.u8()).toBe(10);
    });

    test('multiple sequential slices', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const reader = new Reader(data);
      const slice1 = reader.slice();
      const slice2 = slice1.slice(1, 3);
      const slice3 = slice2.slice(0, 1);
      expect(slice3.x).toBe(1);
    });

    test('size() with custom end boundary', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const reader = new Reader(data, undefined, 1, 4);
      expect(reader.size()).toBe(3);
      reader.skip(2);
      expect(reader.size()).toBe(1);
    });

    test('buf() respects end boundary', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const reader = new Reader(data, undefined, 1, 4);
      const result = reader.buf();
      expect(result).toEqual(new Uint8Array([2, 3, 4]));
    });

    test('slice() with offsets beyond boundary', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const reader = new Reader(data);
      const slice = reader.slice(2, 10);
      expect(slice.x).toBe(2);
      expect(slice.end).toBe(10);
    });
  });

  describe('stress tests', () => {
    test('reads large buffer incrementally', () => {
      const size = 1000000;
      const data = new Uint8Array(size);
      for (let i = 0; i < size; i++) {
        data[i] = i % 256;
      }
      const reader = new Reader(data);
      let _checksum = 0;
      for (let i = 0; i < size; i++) {
        _checksum += reader.u8();
      }
      expect(reader.x).toBe(size);
    });

    test('creates many slices', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const reader = new Reader(data);
      for (let i = 0; i < 1000; i++) {
        const slice = reader.slice();
        expect(slice.x).toBe(0);
      }
    });

    test('alternating peeks and reads', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const reader = new Reader(data);
      for (let i = 0; i < 5; i++) {
        expect(reader.peek()).toBe(i + 1);
        expect(reader.u8()).toBe(i + 1);
      }
    });

    test('many consecutive u16 reads', () => {
      const buffer = new ArrayBuffer(4000);
      const view = new DataView(buffer);
      for (let i = 0; i < 2000; i++) {
        view.setUint16(i * 2, i);
      }
      const data = new Uint8Array(buffer);
      const reader = new Reader(data);
      for (let i = 0; i < 2000; i++) {
        expect(reader.u16()).toBe(i);
      }
    });

    test('many consecutive u32 reads', () => {
      const buffer = new ArrayBuffer(4000);
      const view = new DataView(buffer);
      for (let i = 0; i < 1000; i++) {
        view.setUint32(i * 4, i * 1000);
      }
      const data = new Uint8Array(buffer);
      const reader = new Reader(data);
      for (let i = 0; i < 1000; i++) {
        expect(reader.u32()).toBe(i * 1000);
      }
    });
  });
});
