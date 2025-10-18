import {b} from '@jsonjoy.com/buffers/lib/b';
import {toStr, toBin, diff, src, dst, apply} from '../bin';
import {PATCH_OP_TYPE, invert} from '../str';

describe('toHex()', () => {
  test('can convert buffer to string', () => {
    const buffer = b(1, 2, 3, 4, 5);
    const hex = toStr(buffer);
    expect(hex).toBe('\x01\x02\x03\x04\x05');
  });

  test('can convert buffer to string', () => {
    const buffer = b(0, 127, 255);
    const hex = toStr(buffer);
    expect(hex).toBe('\x00\x7f\xff');
  });

  test('handles empty buffer', () => {
    const buffer = b();
    const hex = toStr(buffer);
    expect(hex).toBe('');
  });

  test('handles single byte buffer', () => {
    const buffer = b(42);
    const hex = toStr(buffer);
    expect(hex).toBe('\x2a');
  });

  test('handles all byte values', () => {
    const buffer = new Uint8Array(256);
    for (let i = 0; i < 256; i++) {
      buffer[i] = i;
    }
    const hex = toStr(buffer);
    expect(hex.length).toBe(256);
    expect(hex.charCodeAt(0)).toBe(0);
    expect(hex.charCodeAt(255)).toBe(255);
  });
});

describe('fromHex()', () => {
  test('can convert buffer to string', () => {
    const buffer = toBin('\x01\x02\x03\x04\x05');
    expect(buffer).toEqual(b(1, 2, 3, 4, 5));
  });

  test('can convert buffer to string', () => {
    const buffer = toBin('\x00\x7f\xff');
    expect(buffer).toEqual(b(0, 127, 255));
  });

  test('handles empty string', () => {
    const buffer = toBin('');
    expect(buffer).toEqual(b());
  });

  test('handles single character', () => {
    const buffer = toBin('\x2a');
    expect(buffer).toEqual(b(42));
  });

  test('round-trip conversion', () => {
    const originalBuffer = b(0, 1, 127, 128, 254, 255);
    const hex = toStr(originalBuffer);
    const convertedBuffer = toBin(hex);
    expect(convertedBuffer).toEqual(originalBuffer);
  });
});

describe('diff()', () => {
  test('returns a single equality tuple, when buffers are identical', () => {
    const patch = diff(b(1, 2, 3), b(1, 2, 3));
    expect(patch).toEqual([[PATCH_OP_TYPE.EQL, toStr(b(1, 2, 3))]]);
    expect(src(patch)).toEqual(b(1, 2, 3));
    expect(dst(patch)).toEqual(b(1, 2, 3));
  });

  test('single character insert at the beginning', () => {
    const patch1 = diff(b(1, 2, 3), b(0, 1, 2, 3));
    expect(patch1).toEqual([
      [PATCH_OP_TYPE.INS, toStr(b(0))],
      [PATCH_OP_TYPE.EQL, toStr(b(1, 2, 3))],
    ]);
    expect(src(patch1)).toEqual(b(1, 2, 3));
    expect(dst(patch1)).toEqual(b(0, 1, 2, 3));
  });

  test('single character insert at the end', () => {
    const patch1 = diff(b(1, 2, 3), b(1, 2, 3, 4));
    expect(patch1).toEqual([
      [PATCH_OP_TYPE.EQL, toStr(b(1, 2, 3))],
      [PATCH_OP_TYPE.INS, toStr(b(4))],
    ]);
    expect(src(patch1)).toEqual(b(1, 2, 3));
    expect(dst(patch1)).toEqual(b(1, 2, 3, 4));
  });

  test('can delete char', () => {
    const patch1 = diff(b(1, 2, 3), b(2, 3, 4));
    expect(patch1).toEqual([
      [PATCH_OP_TYPE.DEL, toStr(b(1))],
      [PATCH_OP_TYPE.EQL, toStr(b(2, 3))],
      [PATCH_OP_TYPE.INS, toStr(b(4))],
    ]);
    expect(src(patch1)).toEqual(b(1, 2, 3));
    expect(dst(patch1)).toEqual(b(2, 3, 4));
  });

  test('handles empty buffers', () => {
    const patch1 = diff(b(), b(1, 2, 3));
    expect(patch1).toEqual([[PATCH_OP_TYPE.INS, toStr(b(1, 2, 3))]]);
    expect(src(patch1)).toEqual(b());
    expect(dst(patch1)).toEqual(b(1, 2, 3));

    const patch2 = diff(b(1, 2, 3), b());
    expect(patch2).toEqual([[PATCH_OP_TYPE.DEL, toStr(b(1, 2, 3))]]);
    expect(src(patch2)).toEqual(b(1, 2, 3));
    expect(dst(patch2)).toEqual(b());

    const patch3 = diff(b(), b());
    expect(patch3).toEqual([]);
    expect(src(patch3)).toEqual(b());
    expect(dst(patch3)).toEqual(b());
  });

  test('handles null bytes', () => {
    const patch1 = diff(b(0, 0, 0), b(0, 1, 0));
    expect(src(patch1)).toEqual(b(0, 0, 0));
    expect(dst(patch1)).toEqual(b(0, 1, 0));

    const patch2 = diff(b(1, 2, 3), b(0, 1, 2, 3, 0));
    expect(src(patch2)).toEqual(b(1, 2, 3));
    expect(dst(patch2)).toEqual(b(0, 1, 2, 3, 0));
  });

  test('handles maximum byte values', () => {
    const patch1 = diff(b(255, 255), b(255, 254, 255));
    expect(src(patch1)).toEqual(b(255, 255));
    expect(dst(patch1)).toEqual(b(255, 254, 255));

    const patch2 = diff(b(0, 255), b(255, 0));
    expect(src(patch2)).toEqual(b(0, 255));
    expect(dst(patch2)).toEqual(b(255, 0));
  });

  test('handles repetitive binary patterns', () => {
    const pattern1 = b(170, 170, 170, 170); // 10101010 pattern
    const pattern2 = b(170, 170, 85, 170); // 10101010, 10101010, 01010101, 10101010
    const patch = diff(pattern1, pattern2);
    expect(src(patch)).toEqual(pattern1);
    expect(dst(patch)).toEqual(pattern2);

    const alternating1 = b(1, 0, 1, 0, 1, 0);
    const alternating2 = b(1, 0, 1, 1, 1, 0);
    const patch2 = diff(alternating1, alternating2);
    expect(src(patch2)).toEqual(alternating1);
    expect(dst(patch2)).toEqual(alternating2);
  });

  test('handles large binary differences', () => {
    const large1 = new Uint8Array(100).fill(42);
    const large2 = new Uint8Array(100).fill(43);
    const patch = diff(large1, large2);
    expect(src(patch)).toEqual(large1);
    expect(dst(patch)).toEqual(large2);
  });

  test('handles single byte arrays', () => {
    const patch1 = diff(b(1), b(2));
    expect(src(patch1)).toEqual(b(1));
    expect(dst(patch1)).toEqual(b(2));

    const patch2 = diff(b(0), b(255));
    expect(src(patch2)).toEqual(b(0));
    expect(dst(patch2)).toEqual(b(255));
  });
});

describe('apply()', () => {
  test('applies binary patches correctly', () => {
    const src1 = b(1, 2, 3, 4, 5);
    const dst1 = b(1, 0, 3, 4, 6);
    const patch = diff(src1, dst1);

    const result = src1.slice(); // copy
    const insertions: {pos: number; data: Uint8Array}[] = [];
    const deletions: {pos: number; len: number}[] = [];

    apply(
      patch,
      result.length,
      (pos, data) => {
        insertions.push({pos, data});
      },
      (pos, len) => {
        deletions.push({pos, len});
      },
    );

    // Apply deletions and insertions to verify the logic works
    // (Note: this is just testing the callback mechanism)
    expect(insertions.length + deletions.length).toBeGreaterThan(0);
  });

  test('handles empty buffer patches', () => {
    const patch1 = diff(b(), b(1, 2, 3));
    let insertCount = 0;
    let deleteCount = 0;

    apply(
      patch1,
      0,
      (pos, data) => {
        insertCount++;
        expect(data).toEqual(b(1, 2, 3));
        expect(pos).toBe(0);
      },
      (pos, len) => {
        deleteCount++;
      },
    );

    expect(insertCount).toBe(1);
    expect(deleteCount).toBe(0);
  });
});

describe('Binary edge cases and stress tests', () => {
  test('handles binary data that looks like text', () => {
    // Binary data that coincidentally forms valid UTF-8
    const text1 = new TextEncoder().encode('Hello World');
    const text2 = new TextEncoder().encode('Hello Universe');

    const patch = diff(text1, text2);
    expect(src(patch)).toEqual(text1);
    expect(dst(patch)).toEqual(text2);
  });

  test('handles large binary arrays efficiently', () => {
    const large1 = new Uint8Array(1000);
    const large2 = new Uint8Array(1000);

    // Fill with different patterns
    for (let i = 0; i < 1000; i++) {
      large1[i] = i % 256;
      large2[i] = (i + 1) % 256;
    }

    const startTime = Date.now();
    const patch = diff(large1, large2);
    const endTime = Date.now();

    expect(endTime - startTime).toBeLessThan(1000); // Should be fast
    expect(src(patch)).toEqual(large1);
    expect(dst(patch)).toEqual(large2);
  });

  test('handles binary patterns with many repetitions', () => {
    const pattern1 = new Uint8Array(100);
    const pattern2 = new Uint8Array(100);

    // Create repetitive patterns
    for (let i = 0; i < 100; i++) {
      pattern1[i] = i % 4; // 0,1,2,3,0,1,2,3...
      pattern2[i] = (i + 1) % 4; // 1,2,3,0,1,2,3,0...
    }

    const patch = diff(pattern1, pattern2);
    expect(src(patch)).toEqual(pattern1);
    expect(dst(patch)).toEqual(pattern2);
  });

  test('handles binary inversion', () => {
    const buf1 = b(1, 2, 3, 4, 5);
    const buf2 = b(1, 0, 3, 4, 6);

    const patch = diff(buf1, buf2);
    const inverted = invert(patch);

    // Inverted patch should transform buf2 back to buf1
    expect(src(inverted)).toEqual(buf2);
    expect(dst(inverted)).toEqual(buf1);
  });

  test('handles mixed null and non-null bytes', () => {
    const mixed1 = b(0, 255, 0, 128, 0);
    const mixed2 = b(255, 0, 255, 0, 255);

    const patch = diff(mixed1, mixed2);
    expect(src(patch)).toEqual(mixed1);
    expect(dst(patch)).toEqual(mixed2);
  });

  test('validates conversion consistency across operations', () => {
    const testBuffers = [
      b(),
      b(0),
      b(255),
      b(0, 255),
      b(255, 0),
      b(1, 2, 3, 4, 5),
      new Uint8Array(256).map((_, i) => i), // All possible byte values
    ];

    for (let i = 0; i < testBuffers.length; i++) {
      for (let j = 0; j < testBuffers.length; j++) {
        if (i === j) continue;

        const buf1 = testBuffers[i];
        const buf2 = testBuffers[j];
        const patch = diff(buf1, buf2);

        // Verify conversion consistency
        expect(src(patch)).toEqual(buf1);
        expect(dst(patch)).toEqual(buf2);

        // Verify round-trip conversion
        const str1 = toStr(buf1);
        const str2 = toStr(buf2);
        expect(toBin(str1)).toEqual(buf1);
        expect(toBin(str2)).toEqual(buf2);
      }
    }
  });
});
