import {PATCH_OP_TYPE, type Patch, diff, diffEdit, overlap, normalize, apply, src, dst, invert, pfx, sfx} from '../str';
import {assertPatch} from './util';

describe('pfx()', () => {
  test('finds common prefixes', () => {
    expect(pfx('abc', 'b')).toEqual(0);
    expect(pfx('abc', 'a')).toEqual(1);
    expect(pfx('abc', 'ab')).toEqual(2);
    expect(pfx('abc', 'abc')).toEqual(3);
    expect(pfx('abc', 'abcd')).toEqual(3);
    expect(pfx('abc', 'abcde')).toEqual(3);
    expect(pfx('👨‍🍳', '👨‍🍳')).toEqual(5);
    expect(pfx('👨‍🍳', '👨‍🍳chef')).toEqual(5);
    expect(pfx('👨‍🍳chef', '👨‍🍳')).toEqual(5);
    expect(pfx('👨‍🍳👨‍🍳', '👨‍🍳')).toEqual(5);
    expect('👨‍🍳chef'.slice(0, 5)).toBe('👨‍🍳');
  });
});

describe('sfx()', () => {
  test('finds common suffixes', () => {
    expect(sfx('abc', 'b')).toEqual(0);
    expect(sfx('abc', 'c')).toEqual(1);
    expect(sfx('abc', 'bc')).toEqual(2);
    expect(sfx('abc', 'abc')).toEqual(3);
    expect(sfx('abc', '_abc')).toEqual(3);
    expect(sfx('abc', 'abcd')).toEqual(0);
    expect(sfx('👨‍🍳', '👨‍🍳')).toEqual(5);
    // expect(sfx('👨‍🍳', '👨‍🍳chef')).toEqual(5);
    // expect(sfx('👨‍🍳chef', '👨‍🍳')).toEqual(5);
    // expect(sfx('👨‍🍳👨‍🍳', '👨‍🍳')).toEqual(5);
  });
});

describe('normalize()', () => {
  test('joins consecutive same type operations', () => {
    expect(
      normalize([
        [1, 'a'],
        [1, 'b'],
        [0, 'c'],
        [0, 'd'],
      ]),
    ).toEqual([
      [1, 'ab'],
      [0, 'cd'],
    ]);
    expect(
      normalize([
        [1, 'a'],
        [0, 'b'],
        [1, 'b'],
        [0, 'c'],
        [0, 'd'],
      ]),
    ).toEqual([
      [1, 'a'],
      [0, 'b'],
      [1, 'b'],
      [0, 'cd'],
    ]);
    expect(
      normalize([
        [1, 'a'],
        [-1, 'b'],
        [0, 'b'],
        [1, 'b'],
        [0, 'c'],
        [0, 'd'],
      ]),
    ).toEqual([
      [1, 'a'],
      [-1, 'b'],
      [0, 'b'],
      [1, 'b'],
      [0, 'cd'],
    ]);
    expect(
      normalize([
        [1, 'a'],
        [-1, 'b'],
        [-1, 'b'],
        [0, 'b'],
        [1, 'b'],
        [0, 'c'],
        [0, 'd'],
      ]),
    ).toEqual([
      [1, 'a'],
      [-1, 'bb'],
      [0, 'b'],
      [1, 'b'],
      [0, 'cd'],
    ]);
    expect(
      normalize([
        [1, 'a'],
        [-1, 'b'],
        [-1, ''],
        [0, 'b'],
        [1, 'b'],
        [0, 'c'],
        [0, 'd'],
      ]),
    ).toEqual([
      [1, 'a'],
      [-1, 'b'],
      [0, 'b'],
      [1, 'b'],
      [0, 'cd'],
    ]);
    expect(
      normalize([
        [1, 'a'],
        [-1, 'b'],
        [-1, ''],
        [0, ''],
        [1, 'b'],
        [0, 'c'],
        [0, 'd'],
      ]),
    ).toEqual([
      [1, 'a'],
      [-1, 'b'],
      [1, 'b'],
      [0, 'cd'],
    ]);
    expect(
      normalize([
        [1, 'a'],
        [-1, 'x'],
        [-1, ''],
        [0, ''],
        [-1, 'b'],
        [0, 'c'],
        [0, 'd'],
      ]),
    ).toEqual([
      [1, 'a'],
      [-1, 'xb'],
      [0, 'cd'],
    ]);
  });
});

describe('diff()', () => {
  test('returns a single equality tuple, when strings are identical', () => {
    const patch = diffEdit('hello', 'hello', 1);
    expect(patch).toEqual([[PATCH_OP_TYPE.EQL, 'hello']]);
    assertPatch('hello', 'hello', patch);
  });

  test('single character insert at the beginning', () => {
    const patch1 = diff('hello', '_hello');
    const patch2 = diffEdit('hello', '_hello', 1);
    const patch3 = diffEdit('hello', '_hello', 4);
    expect(patch1).toEqual([
      [PATCH_OP_TYPE.INS, '_'],
      [PATCH_OP_TYPE.EQL, 'hello'],
    ]);
    expect(patch2).toEqual([
      [PATCH_OP_TYPE.INS, '_'],
      [PATCH_OP_TYPE.EQL, 'hello'],
    ]);
    expect(patch3).toEqual([
      [PATCH_OP_TYPE.INS, '_'],
      [PATCH_OP_TYPE.EQL, 'hello'],
    ]);
    assertPatch('hello', '_hello', patch1);
    assertPatch('hello', '_hello', patch2);
    assertPatch('hello', '_hello', patch3);
  });

  test('single character insert at the end', () => {
    const patch1 = diff('hello', 'hello!');
    const patch2 = diffEdit('hello', 'hello!', 6);
    const patch3 = diffEdit('hello', 'hello!', 2);
    expect(patch1).toEqual([
      [PATCH_OP_TYPE.EQL, 'hello'],
      [PATCH_OP_TYPE.INS, '!'],
    ]);
    expect(patch2).toEqual([
      [PATCH_OP_TYPE.EQL, 'hello'],
      [PATCH_OP_TYPE.INS, '!'],
    ]);
    expect(patch3).toEqual([
      [PATCH_OP_TYPE.EQL, 'hello'],
      [PATCH_OP_TYPE.INS, '!'],
    ]);
    assertPatch('hello', 'hello!', patch1);
    assertPatch('hello', 'hello!', patch2);
    assertPatch('hello', 'hello!', patch3);
  });

  test('single character removal at the beginning', () => {
    const patch = diff('hello', 'ello');
    expect(patch).toEqual([
      [PATCH_OP_TYPE.DEL, 'h'],
      [PATCH_OP_TYPE.EQL, 'ello'],
    ]);
    assertPatch('hello', 'ello', patch);
  });

  test('single character removal at the end', () => {
    const patch1 = diff('hello', 'hell');
    const patch2 = diffEdit('hello', 'hell', 4);
    expect(patch1).toEqual([
      [PATCH_OP_TYPE.EQL, 'hell'],
      [PATCH_OP_TYPE.DEL, 'o'],
    ]);
    expect(patch2).toEqual([
      [PATCH_OP_TYPE.EQL, 'hell'],
      [PATCH_OP_TYPE.DEL, 'o'],
    ]);
    assertPatch('hello', 'hell', patch1);
    assertPatch('hello', 'hell', patch2);
  });

  test('single character replacement at the beginning', () => {
    const patch1 = diff('hello', 'Hello');
    const patch2 = diffEdit('hello', 'Hello', 1);
    expect(patch1).toEqual([
      [PATCH_OP_TYPE.DEL, 'h'],
      [PATCH_OP_TYPE.INS, 'H'],
      [PATCH_OP_TYPE.EQL, 'ello'],
    ]);
    expect(patch2).toEqual([
      [PATCH_OP_TYPE.DEL, 'h'],
      [PATCH_OP_TYPE.INS, 'H'],
      [PATCH_OP_TYPE.EQL, 'ello'],
    ]);
    assertPatch('hello', 'Hello', patch1);
    assertPatch('hello', 'Hello', patch2);
  });

  test('single character replacement at the end', () => {
    const patch = diff('hello', 'hellO');
    expect(patch).toEqual([
      [PATCH_OP_TYPE.EQL, 'hell'],
      [PATCH_OP_TYPE.DEL, 'o'],
      [PATCH_OP_TYPE.INS, 'O'],
    ]);
    assertPatch('hello', 'hellO', patch);
  });

  test('two inserts', () => {
    const src = '0123456789';
    const dst = '012__3456xx789';
    const patch = diff(src, dst);
    assertPatch(src, dst, patch);
  });

  test('two deletes', () => {
    const src = '0123456789';
    const dst = '0134589';
    const patch = diff(src, dst);
    assertPatch(src, dst, patch);
  });

  test('two inserts and two deletes', () => {
    const src = '0123456789';
    const dst = '01_245-678';
    assertPatch(src, dst);
  });

  test('emoji', () => {
    assertPatch('a🙃b', 'ab');
    assertPatch('a🙃b', 'a🙃');
    assertPatch('a🙃b', '🙃b');
    assertPatch('a🙃b', 'aasasdfdf👋b');
    assertPatch('a🙃b', 'a👋b');
  });

  test('same strings', () => {
    assertPatch('', '');
    assertPatch('1', '1');
    assertPatch('12', '12');
    assertPatch('asdf asdf asdf', 'asdf asdf asdf');
    assertPatch('a🙃b', 'a🙃b');
  });

  test('delete everything', () => {
    assertPatch('1', '');
    assertPatch('12', '');
    assertPatch('123', '');
    assertPatch('asdf asdf asdf asdf asdf', '');
    assertPatch('a🙃b', '');
  });

  test('insert into empty string', () => {
    assertPatch('', '1');
    assertPatch('', '12');
    assertPatch('', '123');
    assertPatch('', '1234');
    assertPatch('', 'asdf asdf asdf asdf asdf asdf asdf asdf asdf');
    assertPatch('', 'a🙃b');
  });

  test('common prefix', () => {
    assertPatch('abc', 'xyz');
    assertPatch('1234abcdef', '1234xyz');
    assertPatch('1234', '1234xyz');
    assertPatch('1234_', '1234xyz');
  });

  test('common suffix', () => {
    assertPatch('abcdef1234', 'xyz1234');
    assertPatch('1234abcdef', 'xyz1234');
    assertPatch('1234', 'xyz1234');
    assertPatch('_1234', 'xyz1234');
  });

  test('common overlap', () => {
    assertPatch('ab', 'bc');
    assertPatch('abc', 'abcd');
    assertPatch('ab', 'abcd');
    assertPatch('xab', 'abcd');
    assertPatch('xabc', 'abcd');
    assertPatch('xyabc', 'abcd_');
    assertPatch('12345xxx', 'xxabcd');
  });
});

describe('diffEdit()', () => {
  const assertDiffEdit = (prefix: string, edit: string, suffix: string) => {
    const src1 = prefix + suffix;
    const dst1 = prefix + edit + suffix;
    const cursor1 = prefix.length + edit.length;
    const patch1 = diffEdit(src1, dst1, cursor1);
    assertPatch(src1, dst1, patch1);
    const patch1Expected: Patch = [];
    if (prefix) patch1Expected.push([PATCH_OP_TYPE.EQL, prefix]);
    if (edit) patch1Expected.push([PATCH_OP_TYPE.INS, edit]);
    if (suffix) patch1Expected.push([PATCH_OP_TYPE.EQL, suffix]);
    expect(patch1).toEqual(patch1Expected);
    const src2 = prefix + edit + suffix;
    const dst2 = prefix + suffix;
    const cursor2 = prefix.length;
    const patch2 = diffEdit(src2, dst2, cursor2);
    assertPatch(src2, dst2, patch2);
    const patch2Expected: Patch = [];
    if (prefix) patch2Expected.push([PATCH_OP_TYPE.EQL, prefix]);
    if (edit) patch2Expected.push([PATCH_OP_TYPE.DEL, edit]);
    if (suffix) patch2Expected.push([PATCH_OP_TYPE.EQL, suffix]);
    expect(patch2).toEqual(patch2Expected);
  };

  test('can handle various inserts', () => {
    assertDiffEdit('', 'a', '');
    assertDiffEdit('a', 'b', '');
    assertDiffEdit('ab', 'c', '');
    assertDiffEdit('abc', 'd', '');
    assertDiffEdit('abcd', 'efg', '');
    assertDiffEdit('abcd', '_', 'efg');
    assertDiffEdit('abcd', '__', 'efg');
    assertDiffEdit('abcd', '___', 'efg');
    assertDiffEdit('', '_', 'var');
    assertDiffEdit('', '_', '_var');
    assertDiffEdit('a', 'b', 'c');
    assertDiffEdit('Hello', ' world', '');
    assertDiffEdit('Hello world', '!', '');
    assertDiffEdit('aaa', 'bbb', 'ccc');
    assertDiffEdit('1', '2', '3');
  });
});

describe('overlap()', () => {
  test('can compute various overlaps', () => {
    expect(overlap('abc', 'xyz')).toEqual(0);
    expect(overlap('abc', 'cxyz')).toEqual(1);
    expect(overlap('abc', 'xyzc')).toEqual(0);
    expect(overlap('abc', 'xyza')).toEqual(0);
    expect(overlap('Have some CoCo and CoCo', 'CoCo and CoCo is here.')).toEqual('CoCo and CoCo'.length);
    expect(overlap('Fire at Will', 'William Riker is number one')).toEqual('Will'.length);
  });

  test('edge cases with empty strings', () => {
    expect(overlap('', '')).toEqual(0);
    expect(overlap('abc', '')).toEqual(0);
    expect(overlap('', 'abc')).toEqual(0);
  });

  test('edge cases with identical strings', () => {
    expect(overlap('abc', 'abc')).toEqual(3);
    expect(overlap('a', 'a')).toEqual(1);
  });
});

describe('Unicode edge cases', () => {
  test('handles surrogate pairs at boundaries', () => {
    const emoji1 = '🙃'; // surrogate pair
    const emoji2 = '👋'; // surrogate pair

    assertPatch(`a${emoji1}`, `a${emoji2}`);
    assertPatch(emoji1, emoji2);
    assertPatch(`${emoji1}b`, `${emoji2}b`);
    assertPatch(`a${emoji1}b`, `a${emoji2}b`);
  });

  test('handles complex emoji sequences', () => {
    const family = '👨‍👩‍👧‍👦'; // family emoji with ZWJ sequences
    const flag = '🇺🇸'; // flag emoji (regional indicator)

    assertPatch('hello', family);
    assertPatch(family, 'world');
    assertPatch(family, flag);
    assertPatch(`a${family}b`, `a${flag}b`);
  });

  test('handles combining characters', () => {
    const combining = 'e\u0301'; // e with acute accent (combining)
    const precomposed = 'é'; // precomposed acute e

    assertPatch(combining, precomposed);
    assertPatch(precomposed, combining);
    assertPatch(`a${combining}b`, `a${precomposed}b`);
  });

  test('handles zero-width characters', () => {
    const zwj = '\u200D'; // zero-width joiner
    const zwnj = '\u200C'; // zero-width non-joiner
    const zwsp = '\u200B'; // zero-width space

    assertPatch(`a${zwj}b`, 'ab');
    assertPatch(`a${zwnj}b`, 'ab');
    assertPatch(`a${zwsp}b`, 'ab');
    assertPatch('abc', `a${zwj}b${zwnj}c`);
  });

  test('handles mixed Unicode normalization forms', () => {
    const nfc = 'é'; // NFC normalized
    const nfd = 'e\u0301'; // NFD normalized

    assertPatch(nfc, nfd);
    assertPatch(nfd, nfc);
    assertPatch(`hello ${nfc}`, `hello ${nfd}`);
  });
});

describe('Algorithm edge cases', () => {
  test('handles repetitive patterns', () => {
    assertPatch('aaaaaaaaaa', 'aaabaaaa');
    assertPatch('abcabcabc', 'abcabcabcd');
    assertPatch('xyxyxyxy', 'xyxyxyz');
    assertPatch('121212121212', '121212131212');
  });

  test('handles one string contained in another', () => {
    assertPatch('abcdefghijk', 'def');
    assertPatch('def', 'abcdefghijk');
    assertPatch('xabcdefghijky', 'abcdefghijk');
    assertPatch('abcdefghijk', 'xabcdefghijky');
  });

  test('handles strings with many small differences', () => {
    assertPatch('abcdefghijklmnop', 'aXcXeXgXiXkXmXoX');
    assertPatch('1234567890', '1X3X5X7X9X');
    assertPatch('abababababab', 'acacacacacac');
  });

  test('handles very different strings of same length', () => {
    assertPatch('aaaaaaaaaa', 'bbbbbbbbbb');
    assertPatch('1234567890', 'abcdefghij');
    assertPatch('!@#$%^&*()', '0987654321');
  });

  test('handles prefix-suffix edge cases', () => {
    // Cases where prefix/suffix detection might be tricky
    assertPatch('abcabc', 'abcdef');
    assertPatch('defdef', 'abcdef');
    assertPatch('abcdefabc', 'abcxyzabc');
    assertPatch('xyzabcxyz', 'xyzdefxyz');
  });
});

describe('Patch operation edge cases', () => {
  test('handles patches with empty operations mixed in', () => {
    const patch: Patch = [
      [PATCH_OP_TYPE.EQL, 'hello'],
      [PATCH_OP_TYPE.INS, ''],
      [PATCH_OP_TYPE.EQL, ' world'],
      [PATCH_OP_TYPE.DEL, ''],
    ];
    const normalized = normalize(patch);
    expect(normalized).toEqual([[PATCH_OP_TYPE.EQL, 'hello world']]);
  });

  test('handles patches with only insertions', () => {
    const originalPatch: Patch = [
      [PATCH_OP_TYPE.INS, 'hello'],
      [PATCH_OP_TYPE.INS, ' '],
      [PATCH_OP_TYPE.INS, 'world'],
    ];
    // Make a deep copy to avoid mutation
    const patch: Patch = originalPatch.map((op) => [op[0], op[1]]);

    const normalized = normalize(patch);
    expect(normalized).toEqual([[PATCH_OP_TYPE.INS, 'hello world']]);

    // Test with original patch, not normalized one
    const srcText = src(originalPatch);
    const dstText = dst(originalPatch);
    expect(srcText).toBe('');
    expect(dstText).toBe('hello world');
    // Test this specific patch directly without assertPatch since it's a manual patch
  });

  test('handles patches with only deletions', () => {
    const originalPatch: Patch = [
      [PATCH_OP_TYPE.DEL, 'hello'],
      [PATCH_OP_TYPE.DEL, ' '],
      [PATCH_OP_TYPE.DEL, 'world'],
    ];
    // Make a deep copy to avoid mutation
    const patch: Patch = originalPatch.map((op) => [op[0], op[1]]);

    const normalized = normalize(patch);
    expect(normalized).toEqual([[PATCH_OP_TYPE.DEL, 'hello world']]);

    // Test with original patch, not normalized one
    const srcText = src(originalPatch);
    const dstText = dst(originalPatch);
    expect(srcText).toBe('hello world');
    expect(dstText).toBe('');
    // Test this specific patch directly without assertPatch since it's a manual patch
  });

  test('handles empty patch', () => {
    const patch: Patch = [];
    assertPatch('', '', patch);
    assertPatch('hello', 'hello', [[PATCH_OP_TYPE.EQL, 'hello']]);
  });

  test('validates src and dst functions work correctly', () => {
    // Test with real diffs to ensure src/dst functions work
    const testCases = [
      {srcStr: '', dstStr: 'hello'},
      {srcStr: 'hello', dstStr: ''},
      {srcStr: 'hello', dstStr: 'world'},
      {srcStr: 'hello world', dstStr: 'hello universe'},
    ];

    for (const {srcStr, dstStr} of testCases) {
      const patch = diff(srcStr, dstStr);
      expect(src(patch)).toBe(srcStr);
      expect(dst(patch)).toBe(dstStr);
    }
  });
});

describe('Apply function edge cases', () => {
  test('applies complex patches correctly', () => {
    const src = 'The quick brown fox jumps over the lazy dog';
    const dst = 'A fast red fox leaps over a sleepy cat';
    const patch = diff(src, dst);

    let result = src;
    apply(
      patch,
      result.length,
      (pos, str) => {
        result = result.slice(0, pos) + str + result.slice(pos);
      },
      (pos, len) => {
        result = result.slice(0, pos) + result.slice(pos + len);
      },
    );

    expect(result).toBe(dst);
  });
});

describe('Performance and stress tests', () => {
  test('handles very long strings efficiently', () => {
    const longStr1 = 'a'.repeat(1000) + 'different' + 'b'.repeat(1000);
    const longStr2 = 'a'.repeat(1000) + 'changed' + 'b'.repeat(1000);

    const startTime = Date.now();
    const patch = diff(longStr1, longStr2);
    const endTime = Date.now();

    // Should complete in reasonable time (less than 1 second for this size)
    expect(endTime - startTime).toBeLessThan(1000);
    assertPatch(longStr1, longStr2, patch);
  });

  test('handles worst-case scenario strings', () => {
    // Strings that could cause quadratic behavior in naive algorithms
    const str1 = 'x'.repeat(100) + 'y';
    const str2 = 'y' + 'x'.repeat(100);

    const patch = diff(str1, str2);
    assertPatch(str1, str2, patch);
  });

  test('handles strings with many tiny differences', () => {
    let str1 = '';
    let str2 = '';
    for (let i = 0; i < 50; i++) {
      str1 += 'a' + 'b'.repeat(10);
      str2 += 'c' + 'b'.repeat(10);
    }

    const patch = diff(str1, str2);
    assertPatch(str1, str2, patch);
  });
});

describe('Boundary conditions', () => {
  test('handles strings with only whitespace differences', () => {
    assertPatch('hello world', 'hello  world');
    assertPatch('hello\tworld', 'hello world');
    assertPatch('hello\nworld', 'hello world');
    assertPatch('hello\r\nworld', 'hello\nworld');
  });

  test('handles strings with control characters', () => {
    assertPatch('hello\x00world', 'hello\x01world');
    assertPatch('hello\x1fworld', 'helloworld');
    assertPatch('hello\x7fworld', 'hello world');
  });

  test('handles very similar strings with tiny differences', () => {
    const base = 'The quick brown fox jumps over the lazy dog';
    assertPatch(base, base.replace('quick', 'slow'));
    assertPatch(base, base.replace('brown', 'red'));
    assertPatch(base, base.replace('fox', 'cat'));
    assertPatch(base, base.replace(' ', ''));
    assertPatch(base, base + '.');
  });

  test('handles palindromes and symmetric strings', () => {
    assertPatch('racecar', 'racekar');
    assertPatch('abccba', 'abcdcba');
    assertPatch('12321', '123321');
  });

  test('handles strings with repeated substrings', () => {
    assertPatch('abcabcabc', 'abcdefabc');
    assertPatch('aaabaaabaaab', 'aaabbbabaaab');
    assertPatch('121212121212', '121213121212');
  });
});

describe('Invert function', () => {
  test('correctly inverts basic patches', () => {
    const testCases = [
      {src: 'hello', dst: 'world'},
      {src: '', dst: 'hello'},
      {src: 'hello', dst: ''},
      {src: 'abc', dst: 'def'},
      {src: 'hello world', dst: 'hello universe'},
    ];

    for (const {src: srcStr, dst: dstStr} of testCases) {
      const patch = diff(srcStr, dstStr);
      const inverted = invert(patch);

      // Inverted patch should transform dst back to src
      expect(src(inverted)).toBe(dstStr);
      expect(dst(inverted)).toBe(srcStr);

      // Double inversion should give original patch
      const doubleInverted = invert(inverted);
      expect(src(doubleInverted)).toBe(srcStr);
      expect(dst(doubleInverted)).toBe(dstStr);
    }
  });

  test('preserves equality operations in inversion', () => {
    const patch: Patch = [
      [PATCH_OP_TYPE.EQL, 'hello'],
      [PATCH_OP_TYPE.INS, ' world'],
    ];
    const inverted = invert(patch);
    expect(inverted).toEqual([
      [PATCH_OP_TYPE.EQL, 'hello'],
      [PATCH_OP_TYPE.DEL, ' world'],
    ]);
  });

  test('swaps insert and delete operations', () => {
    const patch: Patch = [
      [PATCH_OP_TYPE.DEL, 'old'],
      [PATCH_OP_TYPE.INS, 'new'],
    ];
    const inverted = invert(patch);
    expect(inverted).toEqual([
      [PATCH_OP_TYPE.INS, 'old'],
      [PATCH_OP_TYPE.DEL, 'new'],
    ]);
  });
});

describe('Apply function edge cases', () => {
  test('handles patches applied to different positions', () => {
    // Test that apply function works correctly for simple cases
    // The apply function processes patches backwards, so we need to understand the correct behavior

    // Test simple insertion at beginning
    let result1 = 'abc';
    const patch1: Patch = [
      [PATCH_OP_TYPE.INS, 'x'],
      [PATCH_OP_TYPE.EQL, 'abc'],
    ];
    apply(
      patch1,
      result1.length,
      (pos, str) => {
        result1 = result1.slice(0, pos) + str + result1.slice(pos);
      },
      (pos, len, str) => {
        result1 = result1.slice(0, pos) + result1.slice(pos + len);
      },
    );
    expect(result1).toBe('xabc');

    // Test simple deletion at beginning
    let result2 = 'abc';
    const patch2: Patch = [
      [PATCH_OP_TYPE.DEL, 'a'],
      [PATCH_OP_TYPE.EQL, 'bc'],
    ];
    apply(
      patch2,
      result2.length,
      (pos, str) => {
        result2 = result2.slice(0, pos) + str + result2.slice(pos);
      },
      (pos, len, str) => {
        result2 = result2.slice(0, pos) + result2.slice(pos + len);
      },
    );
    expect(result2).toBe('bc');

    // Test insertion in middle
    let result3 = 'abc';
    const patch3: Patch = [
      [PATCH_OP_TYPE.EQL, 'ab'],
      [PATCH_OP_TYPE.INS, 'x'],
      [PATCH_OP_TYPE.EQL, 'c'],
    ];
    apply(
      patch3,
      result3.length,
      (pos, str) => {
        result3 = result3.slice(0, pos) + str + result3.slice(pos);
      },
      (pos, len, str) => {
        result3 = result3.slice(0, pos) + result3.slice(pos + len);
      },
    );
    expect(result3).toBe('abxc');
  });

  test('handles empty operations gracefully', () => {
    let result = 'hello';
    const patch: Patch = [
      [PATCH_OP_TYPE.EQL, 'hello'],
      [PATCH_OP_TYPE.INS, ''],
      [PATCH_OP_TYPE.DEL, ''],
    ];

    apply(
      patch,
      result.length,
      (pos, str) => {
        result = result.slice(0, pos) + str + result.slice(pos);
      },
      (pos, len, str) => {
        result = result.slice(0, pos) + result.slice(pos + len);
      },
    );

    expect(result).toBe('hello'); // Should be unchanged
  });
});
