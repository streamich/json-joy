import {assertDiff} from './util';

/**
 * Tests for a specific bug where the string diff algorithm would incorrectly
 * handle surrogate pairs (emoji characters) when they appeared in different
 * positions in the source and destination strings.
 */
describe('String diff with emoji - specific bug cases', () => {
  test('emoji at beginning - from error log', () => {
    // This is the exact case that was failing in the fuzzing tests
    const str1 = '💚莡韚😻襘😴}诇';
    const str2 = '😻Ê¯愂H😤副🗶íŋ😒😹Ù';
    assertDiff(str1, str2);
  });

  test('simple emoji replacement at start', () => {
    assertDiff('😻hello', '😤hello');
  });

  test('emoji deletion at start', () => {
    assertDiff('😻hello', 'hello');
  });

  test('emoji insertion at start', () => {
    assertDiff('hello', '😻hello');
  });

  test('multiple emojis at start', () => {
    assertDiff('😻😤hello', '😤😻hello');
  });

  test('emoji in middle position', () => {
    assertDiff('hello😻world', 'hello😤world');
  });

  test('complex emoji sequences', () => {
    assertDiff('👨‍👩‍👧‍👦test', 'test👨‍👩‍👧‍👦');
  });

  test('emoji with other unicode', () => {
    assertDiff('😻你好', 'hello😻');
  });

  test('surrogate pair handling', () => {
    // Test surrogate pairs specifically
    // 😻 is encoded as \uD83D\uDE3B (two UTF-16 code units)
    const emoji = '\uD83D\uDE3B'; // 😻
    assertDiff(emoji + 'test', 'test' + emoji);
  });

  test('mixed emoji and CJK', () => {
    assertDiff('😻中文😤', '中文😻😤');
  });

  test('emoji at same position in both strings', () => {
    // Should recognize emoji as common part
    assertDiff('😻test', '😻best');
  });

  test('multiple different emojis starting with same high surrogate', () => {
    // Many emojis share the same high surrogate (d83d)
    // 😻 = d83d de3b
    // 😤 = d83d de24
    // 😴 = d83d de34
    // 💚 = d83d dc9a
    assertDiff('💚😻😤', '😴😻😤');
  });

  test('emoji moved from middle to beginning', () => {
    assertDiff('abc😻def', '😻abcdef');
  });

  test('emoji moved from beginning to middle', () => {
    assertDiff('😻abcdef', 'abc😻def');
  });

  test('two identical emojis at different positions', () => {
    assertDiff('😻abc😻def', 'abc😻def😻');
  });

  test('long strings with emoji in common', () => {
    const prefix = 'a'.repeat(100);
    const suffix = 'b'.repeat(100);
    assertDiff(prefix + '😻' + suffix, prefix + '😤' + suffix);
  });

  test('regression: emoji not in common but sharing high surrogate', () => {
    // This specifically tests the case where emojis share a high surrogate
    // but are different characters - should NOT be treated as common
    assertDiff('💚test', '😻test');
  });
});
