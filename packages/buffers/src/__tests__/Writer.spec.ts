import {Writer} from '../Writer';
import {Slice} from '../Slice';

describe('Writer', () => {
  describe('constructor and basic properties', () => {
    test('creates writer with default allocation size', () => {
      const writer = new Writer();
      expect(writer.allocSize).toBe(64 * 1024);
      expect(writer.uint8).toBeInstanceOf(Uint8Array);
      expect(writer.view).toBeInstanceOf(DataView);
      expect(writer.x).toBe(0);
      expect(writer.x0).toBe(0);
    });

    test('creates writer with custom allocation size', () => {
      const writer = new Writer(1024);
      expect(writer.allocSize).toBe(1024);
      expect(writer.uint8.length).toBe(1024);
    });

    test('initializes with correct buffer size', () => {
      const writer = new Writer(512);
      expect(writer.uint8.length).toBe(512);
    });
  });

  describe('ensureCapacity', () => {
    test('does not grow if capacity is available', () => {
      const writer = new Writer(100);
      const originalUint8 = writer.uint8;
      writer.ensureCapacity(50);
      expect(writer.uint8).toBe(originalUint8);
    });

    test('grows buffer when capacity is exceeded', () => {
      const writer = new Writer(100);
      const originalUint8 = writer.uint8;
      writer.x = 90;
      writer.ensureCapacity(50);
      expect(writer.uint8).not.toBe(originalUint8);
      expect(writer.uint8.length).toBeGreaterThanOrEqual(90 + 50);
    });

    test('preserves data when growing', () => {
      const writer = new Writer(100);
      writer.u8(42);
      writer.u8(43);
      writer.u8(44);
      writer.x = 90;
      writer.ensureCapacity(50);
      expect(writer.uint8[0]).toBe(42);
      expect(writer.uint8[1]).toBe(43);
      expect(writer.uint8[2]).toBe(44);
    });
  });

  describe('move', () => {
    test('advances position by specified amount', () => {
      const writer = new Writer();
      writer.move(10);
      expect(writer.x).toBe(10);
    });

    test('ensures capacity before moving', () => {
      const writer = new Writer(50);
      writer.move(40);
      writer.move(50); // Would exceed if no growth
      expect(writer.x).toBe(90);
    });
  });

  describe('reset', () => {
    test('sets x0 to current x position', () => {
      const writer = new Writer();
      writer.x = 42;
      writer.reset();
      expect(writer.x0).toBe(42);
    });

    test('does not change x', () => {
      const writer = new Writer();
      writer.x = 42;
      writer.reset();
      expect(writer.x).toBe(42);
    });
  });

  describe('newBuffer', () => {
    test('allocates new buffer of specified size', () => {
      const writer = new Writer();
      writer.newBuffer(512);
      expect(writer.uint8.length).toBe(512);
    });

    test('resets position markers', () => {
      const writer = new Writer();
      writer.x = 100;
      writer.x0 = 50;
      writer.newBuffer(512);
      expect(writer.x).toBe(0);
      expect(writer.x0).toBe(0);
    });

    test('creates new DataView', () => {
      const writer = new Writer();
      const oldView = writer.view;
      writer.newBuffer(512);
      expect(writer.view).not.toBe(oldView);
    });
  });

  describe('flush', () => {
    test('returns subarray from x0 to x', () => {
      const writer = new Writer();
      writer.u8(10);
      writer.u8(20);
      writer.u8(30);
      const result = writer.flush();
      expect(result).toEqual(new Uint8Array([10, 20, 30]));
    });

    test('advances x0 to x after flush', () => {
      const writer = new Writer();
      writer.x = 10;
      writer.flush();
      expect(writer.x0).toBe(10);
    });

    test('returns empty array if no data written', () => {
      const writer = new Writer();
      const result = writer.flush();
      expect(result.length).toBe(0);
    });

    test('multiple flushes work correctly', () => {
      const writer = new Writer();
      writer.u8(1);
      writer.u8(2);
      const first = writer.flush();
      writer.u8(3);
      writer.u8(4);
      const second = writer.flush();
      expect(first).toEqual(new Uint8Array([1, 2]));
      expect(second).toEqual(new Uint8Array([3, 4]));
    });
  });

  describe('flushSlice', () => {
    test('returns Slice object', () => {
      const writer = new Writer();
      writer.u8(10);
      const result = writer.flushSlice();
      expect(result).toBeInstanceOf(Slice);
    });

    test('slice contains correct data', () => {
      const writer = new Writer();
      writer.u8(10);
      writer.u8(20);
      const slice = writer.flushSlice();
      expect(slice.uint8).toBe(writer.uint8);
      expect(slice.start).toBe(0);
      expect(slice.end).toBe(2);
    });
  });

  describe('u8', () => {
    test('writes single byte', () => {
      const writer = new Writer();
      writer.u8(42);
      expect(writer.uint8[0]).toBe(42);
      expect(writer.x).toBe(1);
    });

    test('writes multiple bytes', () => {
      const writer = new Writer();
      writer.u8(10);
      writer.u8(20);
      writer.u8(30);
      expect(writer.uint8[0]).toBe(10);
      expect(writer.uint8[1]).toBe(20);
      expect(writer.uint8[2]).toBe(30);
      expect(writer.x).toBe(3);
    });

    test('grows buffer when necessary', () => {
      const writer = new Writer(2);
      writer.u8(1);
      writer.u8(2);
      writer.u8(3); // Should trigger growth
      expect(writer.uint8[2]).toBe(3);
    });
  });

  describe('u16', () => {
    test('writes 16-bit unsigned integer', () => {
      const writer = new Writer();
      writer.u16(0xabcd);
      expect(writer.x).toBe(2);
      // Check the values written (assuming little-endian or system endianness)
      const value = writer.view.getUint16(0);
      expect(value).toBe(0xabcd);
    });
  });

  describe('u32', () => {
    test('writes 32-bit unsigned integer', () => {
      const writer = new Writer();
      writer.u32(0x12345678);
      expect(writer.x).toBe(4);
      const value = writer.view.getUint32(0);
      expect(value).toBe(0x12345678);
    });
  });

  describe('i32', () => {
    test('writes 32-bit signed integer', () => {
      const writer = new Writer();
      writer.i32(-1);
      expect(writer.x).toBe(4);
      const value = writer.view.getInt32(0);
      expect(value).toBe(-1);
    });

    test('handles negative values', () => {
      const writer = new Writer();
      writer.i32(-123456);
      const value = writer.view.getInt32(0);
      expect(value).toBe(-123456);
    });
  });

  describe('u64', () => {
    test('writes 64-bit unsigned integer as number', () => {
      const writer = new Writer();
      writer.u64(0x1234567890abcdef);
      expect(writer.x).toBe(8);
      const value = writer.view.getBigUint64(0);
      expect(value).toBe(BigInt(0x1234567890abcdef));
    });

    test('writes 64-bit unsigned integer as bigint', () => {
      const writer = new Writer();
      writer.u64(BigInt('0x1234567890ABCDEF'));
      const value = writer.view.getBigUint64(0);
      expect(value).toBe(BigInt('0x1234567890ABCDEF'));
    });
  });

  describe('f64', () => {
    test('writes 64-bit float', () => {
      const writer = new Writer();
      writer.f64(3.14159);
      expect(writer.x).toBe(8);
      const value = writer.view.getFloat64(0);
      expect(value).toBeCloseTo(3.14159);
    });

    test('writes negative float', () => {
      const writer = new Writer();
      writer.f64(-2.71828);
      const value = writer.view.getFloat64(0);
      expect(value).toBeCloseTo(-2.71828);
    });
  });

  describe('u8u16', () => {
    test('writes byte and 16-bit word', () => {
      const writer = new Writer();
      writer.u8u16(0xff, 0x1234);
      expect(writer.x).toBe(3);
      expect(writer.uint8[0]).toBe(0xff);
      expect(writer.uint8[1]).toBe(0x12);
      expect(writer.uint8[2]).toBe(0x34);
    });
  });

  describe('u8u32', () => {
    test('writes byte and 32-bit dword', () => {
      const writer = new Writer();
      writer.u8u32(0xaa, 0x12345678);
      expect(writer.x).toBe(5);
      expect(writer.uint8[0]).toBe(0xaa);
    });
  });

  describe('u8u64', () => {
    test('writes byte and 64-bit qword', () => {
      const writer = new Writer();
      writer.u8u64(0xff, 0x123456789abcdef0);
      expect(writer.x).toBe(9);
      expect(writer.uint8[0]).toBe(0xff);
    });
  });

  describe('u8f32', () => {
    test('writes byte and 32-bit float', () => {
      const writer = new Writer();
      writer.u8f32(0xaa, 1.5);
      expect(writer.x).toBe(5);
      expect(writer.uint8[0]).toBe(0xaa);
      const value = writer.view.getFloat32(1);
      expect(value).toBeCloseTo(1.5);
    });
  });

  describe('u8f64', () => {
    test('writes byte and 64-bit float', () => {
      const writer = new Writer();
      writer.u8f64(0xbb, 3.14159);
      expect(writer.x).toBe(9);
      expect(writer.uint8[0]).toBe(0xbb);
      const value = writer.view.getFloat64(1);
      expect(value).toBeCloseTo(3.14159);
    });
  });

  describe('buf', () => {
    test('writes buffer', () => {
      const writer = new Writer();
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      writer.buf(data, 5);
      expect(writer.x).toBe(5);
      expect(writer.uint8.slice(0, 5)).toEqual(data);
    });

    test('writes partial buffer', () => {
      const writer = new Writer();
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      writer.buf(data, 3);
      expect(writer.x).toBe(3);
      expect(writer.uint8[0]).toBe(1);
      expect(writer.uint8[1]).toBe(2);
      expect(writer.uint8[2]).toBe(3);
    });

    test('writes buffer at current position', () => {
      const writer = new Writer();
      writer.u8(99);
      const data = new Uint8Array([1, 2, 3]);
      writer.buf(data, 3);
      expect(writer.x).toBe(4);
      expect(writer.uint8[0]).toBe(99);
      expect(writer.uint8[1]).toBe(1);
    });
  });

  describe('ascii', () => {
    test('writes ASCII string', () => {
      const writer = new Writer();
      writer.ascii('Hello');
      const result = writer.flush();
      expect(result).toEqual(new Uint8Array([72, 101, 108, 108, 111])); // H,e,l,l,o
    });

    test('writes empty string', () => {
      const writer = new Writer();
      writer.ascii('');
      expect(writer.x).toBe(0);
    });

    test('writes ASCII with special characters', () => {
      const writer = new Writer();
      writer.ascii('ABC123!@#');
      expect(writer.x).toBe(9);
    });

    test('grows buffer for long ASCII strings', () => {
      const writer = new Writer(5);
      writer.ascii('Hello World'); // 11 characters
      expect(writer.x).toBe(11);
      expect(writer.uint8.length).toBeGreaterThanOrEqual(11);
    });
  });

  describe('utf8() - Basic functionality', () => {
    test('writes empty string', () => {
      const writer = new Writer();
      const length = writer.utf8('');
      expect(length).toBe(0);
      expect(writer.x).toBe(0);
    });

    test('writes ASCII string', () => {
      const writer = new Writer();
      const length = writer.utf8('Hello');
      expect(length).toBe(5);
      const result = writer.flush();
      expect(result).toEqual(new Uint8Array([72, 101, 108, 108, 111]));
    });

    test('returns number of bytes written', () => {
      const writer = new Writer();
      const result = writer.utf8('test');
      expect(result).toBe(4);
      expect(writer.x).toBe(4);
    });

    test('writes latin1 supplement characters', () => {
      const writer = new Writer();
      const str = 'café'; // é is U+00E9
      const length = writer.utf8(str);
      expect(length).toBeGreaterThan(4); // More than ASCII
      expect(writer.x).toBe(length);
    });

    test('writes greek characters', () => {
      const writer = new Writer();
      const str = 'Ελληνικά'; // Greek
      const length = writer.utf8(str);
      expect(length).toBeGreaterThan(0);
      expect(writer.x).toBe(length);
    });

    test('writes cyrillic characters', () => {
      const writer = new Writer();
      const str = 'Привет'; // Russian "Hello"
      const length = writer.utf8(str);
      expect(length).toBeGreaterThan(0);
      expect(writer.x).toBe(length);
    });

    test('writes emoji', () => {
      const writer = new Writer();
      const str = '👍'; // Thumbs up emoji
      const length = writer.utf8(str);
      expect(length).toBeGreaterThan(0);
      expect(writer.x).toBe(length);
    });

    test('writes CJK characters', () => {
      const writer = new Writer();
      const str = '你好'; // Chinese "hello"
      const length = writer.utf8(str);
      expect(length).toBeGreaterThan(0);
      expect(writer.x).toBe(length);
    });

    test('writes mixed scripts', () => {
      const writer = new Writer();
      const str = 'Hello мир 世界 🌍';
      const length = writer.utf8(str);
      expect(length).toBeGreaterThan(0);
      expect(writer.x).toBe(length);
    });
  });

  describe('utf8() - Surrogate pairs', () => {
    test('writes emoji with surrogate pairs', () => {
      const writer = new Writer();
      const str = '😀😁😂'; // Multiple emojis
      const length = writer.utf8(str);
      expect(length).toBeGreaterThan(0);
      const result = writer.flush();
      // Emojis should be encoded as 4-byte UTF-8 sequences
      expect(result.length).toBe(length);
    });

    test('writes emoji sequence with skin tone modifiers', () => {
      const writer = new Writer();
      const str = '👨‍👩‍👧‍👦'; // Family emoji
      const length = writer.utf8(str);
      expect(length).toBeGreaterThan(0);
      const result = writer.flush();
      expect(result.length).toBe(length);
    });

    test('encodes to valid UTF-8', () => {
      const writer = new Writer();
      const str = '🎉🎊🎈'; // Party emojis
      writer.utf8(str);
      const result = writer.flush();
      // Verify it can be decoded back
      const decoded = new TextDecoder().decode(result);
      expect(decoded).toBe(str);
    });
  });

  describe('utf8() - Stress tests', () => {
    test('handles very long ASCII string', () => {
      const writer = new Writer();
      const longStr = 'a'.repeat(100000);
      writer.ensureCapacity(longStr.length);
      const length = writer.utf8(longStr);
      expect(length).toBe(100000);
      expect(writer.x).toBe(100000);
    });

    test('handles very long multibyte string', () => {
      const writer = new Writer();
      const longStr = 'ä'.repeat(50000); // Each ä is 2 bytes in UTF-8
      writer.ensureCapacity(longStr.length * 4);
      const length = writer.utf8(longStr);
      expect(length).toBe(100000);
      expect(writer.x).toBe(100000);
    });

    test('handles string with many emojis', () => {
      const writer = new Writer();
      const emojiStr = '😀'.repeat(1000);
      const length = writer.utf8(emojiStr);
      expect(length).toBeGreaterThan(0);
      expect(writer.x).toBe(length);
      const result = writer.flush();
      const decoded = new TextDecoder().decode(result);
      expect(decoded).toBe(emojiStr);
    });

    test('handles random unicode characters', () => {
      const writer = new Writer();
      const chars = ['a', 'ä', 'Ελ', '你', '👍', '🌈', 'мир'];
      const str = chars.join('').repeat(100);
      const length = writer.utf8(str);
      expect(length).toBeGreaterThan(0);
      const result = writer.flush();
      const decoded = new TextDecoder().decode(result);
      expect(decoded).toBe(str);
    });

    test('handles all printable ASCII', () => {
      const writer = new Writer();
      let str = '';
      for (let i = 32; i < 127; i++) {
        str += String.fromCharCode(i);
      }
      const length = writer.utf8(str);
      expect(length).toBe(str.length);
    });

    test('handles all 2-byte UTF-8 characters', () => {
      const writer = new Writer();
      let str = '';
      // Latin Extended-A range
      for (let i = 0x0100; i < 0x0200; i++) {
        str += String.fromCharCode(i);
      }
      const length = writer.utf8(str);
      expect(length).toBeGreaterThan(0);
      const result = writer.flush();
      const decoded = new TextDecoder().decode(result);
      expect(decoded).toBe(str);
    });

    test('handles mixed length encodings', () => {
      const writer = new Writer();
      const str =
        'ASCII' + // 1 byte per char
        'ü' + // 2 bytes
        '中' + // 3 bytes
        '🎉'; // 4 bytes
      const length = writer.utf8(str);
      expect(length).toBe(5 + 2 + 3 + 4); // 14 bytes
      const result = writer.flush();
      const decoded = new TextDecoder().decode(result);
      expect(decoded).toBe(str);
    });

    test('encodes to same bytes as TextEncoder', () => {
      const writer = new Writer();
      const testStrings = ['Hello', 'café', '你好', '👍', 'Привет', 'mixed: Hello мир 世界 🌍'];

      for (const str of testStrings) {
        writer.newBuffer(str.length * 4 + 1);
        writer.utf8(str);
        const writerResult = writer.flush();

        const textEncoderResult = new TextEncoder().encode(str);

        expect(writerResult).toEqual(textEncoderResult);
      }
    });

    test('handles consecutive writes', () => {
      const writer = new Writer();
      const strings = ['Hello ', 'мир ', '世界 ', '👍'];
      let totalLength = 0;
      for (const str of strings) {
        const len = writer.utf8(str);
        totalLength += len;
      }
      const result = writer.flush();
      const decoded = new TextDecoder().decode(result);
      expect(decoded).toBe(strings.join(''));
      expect(result.length).toBe(totalLength);
    });

    test('handles null characters', () => {
      const writer = new Writer();
      const str = 'hello\x00world';
      const length = writer.utf8(str);
      expect(length).toBe(11);
      const result = writer.flush();
      const decoded = new TextDecoder().decode(result);
      expect(decoded).toBe(str);
    });

    test('handles all unicode control characters', () => {
      const writer = new Writer();
      const str = '\t\n\r\f\b\v';
      const length = writer.utf8(str);
      const result = writer.flush();
      const decoded = new TextDecoder().decode(result);
      expect(decoded).toBe(str);
    });

    test('stress test: alternating small and large strings', () => {
      const writer = new Writer(10); // Small initial buffer
      const strings = ['a', '😀'.repeat(1000), 'test', '中国'.repeat(500), '!'];

      for (const str of strings) {
        writer.ensureCapacity(str.length * 4);
        writer.utf8(str);
      }

      const result = writer.flush();
      const decoded = new TextDecoder().decode(result);
      expect(decoded).toBe(strings.join(''));
    });
  });

  describe('utf8Native() - Fallback implementation', () => {
    test('encodes ASCII correctly', () => {
      const writer = new Writer();
      const length = writer.utf8Native('Hello');
      expect(length).toBe(5);
      const result = writer.flush();
      expect(result).toEqual(new Uint8Array([72, 101, 108, 108, 111]));
    });

    test('matches TextEncoder output', () => {
      const writer = new Writer();
      const testStrings = ['simple', 'café', '日本語', '😀', 'мир'];

      for (const str of testStrings) {
        writer.newBuffer(str.length * 4 + 1);
        writer.utf8Native(str);
        const result = writer.flush();
        const expected = new TextEncoder().encode(str);
        expect(result).toEqual(expected);
      }
    });
  });

  describe('complex scenarios', () => {
    test('writes multiple different types sequentially', () => {
      const writer = new Writer();
      writer.u8(42);
      writer.u16(0x1234);
      writer.utf8('test');
      writer.u32(0xdeadbeef);
      expect(writer.x).toBeGreaterThan(0);
    });

    test('interleaves writes and flushes', () => {
      const writer = new Writer();
      writer.u8(1);
      const first = writer.flush();
      writer.u8(2);
      writer.u8(3);
      const second = writer.flush();
      expect(first).toEqual(new Uint8Array([1]));
      expect(second).toEqual(new Uint8Array([2, 3]));
    });

    test('handles reset correctly', () => {
      const writer = new Writer();
      writer.u8(1);
      writer.u8(2);
      writer.u8(3);
      writer.reset();
      writer.u8(4);
      const result = writer.flush();
      expect(result).toEqual(new Uint8Array([4]));
    });

    test('buffer survives multiple growths', () => {
      const writer = new Writer(10);
      for (let i = 0; i < 1000; i++) {
        writer.u8(i % 256);
      }
      expect(writer.x).toBe(1000);
      const result = writer.flush();
      expect(result.length).toBe(1000);
      // Verify some values
      expect(result[0]).toBe(0);
      expect(result[255]).toBe(255);
      expect(result[256]).toBe(0);
    });
  });

  describe('edge cases', () => {
    test('handles zero-length flush', () => {
      const writer = new Writer();
      const result = writer.flush();
      expect(result.length).toBe(0);
    });

    test('handles large single byte', () => {
      const writer = new Writer();
      writer.u8(255);
      expect(writer.uint8[0]).toBe(255);
    });

    test('handles maximum safe integer in u64', () => {
      const writer = new Writer();
      writer.u64(Number.MAX_SAFE_INTEGER);
      expect(writer.x).toBe(8);
    });

    test('flushSlice with empty buffer', () => {
      const writer = new Writer();
      const slice = writer.flushSlice();
      expect(slice.start).toBe(0);
      expect(slice.end).toBe(0);
    });

    test('utf8 with lone surrogate handling', () => {
      // Test that lone surrogates don't crash the encoder
      const writer = new Writer();
      // High surrogate followed by non-surrogate
      const str = String.fromCharCode(0xd800) + 'a';
      expect(() => writer.utf8(str)).not.toThrow();
    });
  });
});
