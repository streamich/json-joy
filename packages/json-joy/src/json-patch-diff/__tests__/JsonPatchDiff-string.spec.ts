import {assertDiff} from './util';
import {RandomJson} from '@jsonjoy.com/util/lib/json-random';

describe('String diff functionality', () => {
  describe('basic string operations', () => {
    test('character insertion at beginning', () => {
      assertDiff('hello', 'xhello');
    });

    test('character insertion at middle', () => {
      assertDiff('hello', 'helxlo');
    });

    test('character insertion at end', () => {
      assertDiff('hello', 'hellox');
    });

    test('character deletion at beginning', () => {
      assertDiff('hello', 'ello');
    });

    test('character deletion at middle', () => {
      assertDiff('hello', 'helo');
    });

    test('character deletion at end', () => {
      assertDiff('hello', 'hell');
    });

    test('character replacement', () => {
      assertDiff('hello', 'hxllo');
      assertDiff('hello', 'xello');
      assertDiff('hello', 'hellx');
    });

    test('multiple operations', () => {
      assertDiff('hello world', 'Hello, World!');
      assertDiff('The quick brown fox', 'A slow red fox');
      assertDiff('Lorem ipsum', 'Lorem dolor');
    });
  });

  describe('unicode string handling', () => {
    test('unicode character insertion', () => {
      assertDiff('café', 'café ☕');
      assertDiff('hello', 'hello 🌍');
    });

    test('unicode character deletion', () => {
      assertDiff('café ☕', 'café');
      assertDiff('hello 🌍', 'hello');
    });

    test('unicode character replacement', () => {
      assertDiff('🌟', '⭐');
      assertDiff('café', 'cafē');
    });

    test('emoji modifications', () => {
      assertDiff('👋 Hello', '👋 Hi');
      assertDiff('🚀 Launch', '🎯 Target');
    });

    test('complex unicode sequences', () => {
      assertDiff('👨‍👩‍👧‍👦', '👨‍👩‍👧');
      assertDiff('🏳️‍🌈', '🏴‍☠️');
    });

    test('chinese characters', () => {
      assertDiff('你好', '您好');
      assertDiff('北京', '上海');
      assertDiff('学习中文', '学习英文');
    });

    test('arabic characters', () => {
      assertDiff('مرحبا', 'أهلا');
      assertDiff('العربية', 'الإنجليزية');
    });

    test('mixed scripts', () => {
      assertDiff('Hello 你好 مرحبا', 'Hi 您好 أهلا');
      assertDiff('English中文العربية', 'Français中国话فارسی');
    });
  });

  describe('special characters', () => {
    test('whitespace handling', () => {
      assertDiff('hello world', 'hello  world');
      assertDiff('hello\tworld', 'hello world');
      assertDiff('hello\nworld', 'hello\r\nworld');
    });

    test('punctuation changes', () => {
      assertDiff('Hello, world!', 'Hello world.');
      assertDiff('Test?', 'Test!');
      assertDiff('(parentheses)', '[brackets]');
    });

    test('quotes and escapes', () => {
      assertDiff('"quoted"', "'quoted'");
      assertDiff("It's working", 'It"s working');
      assertDiff('C:\\\\path\\\\file', 'C:/path/file');
    });

    test('control characters', () => {
      assertDiff('hello\u0000world', 'hello world');
      assertDiff('line1\u0001line2', 'line1\u0002line2');
    });
  });

  describe('performance with large strings', () => {
    test('large string insertions', () => {
      const base = 'Hello world!';
      const large = 'x'.repeat(1000);
      assertDiff(base, base + large);
      assertDiff(large + base, base);
    });

    test('large string deletions', () => {
      const large = 'x'.repeat(1000);
      const small = 'Hello world!';
      assertDiff(large + small, small);
      assertDiff(small + large, small);
    });

    test('modifications in large strings', () => {
      const prefix = 'a'.repeat(500);
      const suffix = 'b'.repeat(500);
      assertDiff(prefix + 'ORIGINAL' + suffix, prefix + 'MODIFIED' + suffix);
    });

    test('many small changes in large string', () => {
      let str1 = '';
      let str2 = '';
      for (let i = 0; i < 100; i++) {
        str1 += `word${i} `;
        str2 += `WORD${i} `;
      }
      assertDiff(str1, str2);
    });
  });

  describe('edge cases', () => {
    test('empty string operations', () => {
      assertDiff('', 'hello');
      assertDiff('hello', '');
      assertDiff('', '');
    });

    test('single character strings', () => {
      assertDiff('a', 'b');
      assertDiff('a', '');
      assertDiff('', 'a');
    });

    test('repeated characters', () => {
      assertDiff('aaa', 'aaaa');
      assertDiff('aaaa', 'aaa');
      assertDiff('aaa', 'bbb');
    });

    test('palindromes', () => {
      assertDiff('racecar', 'racekar');
      assertDiff('level', 'levels');
      assertDiff('madam', 'madams');
    });

    test('similar patterns', () => {
      assertDiff('abcabc', 'abcabcd');
      assertDiff('123123', '123124');
      assertDiff('ababab', 'acacac');
    });
  });

  describe('random string fuzzing', () => {
    const iterations = 50;

    test('random string pairs', () => {
      for (let i = 0; i < iterations; i++) {
        const str1 = RandomJson.genString(Math.floor(Math.random() * 100));
        const str2 = RandomJson.genString(Math.floor(Math.random() * 100));
        try {
          assertDiff(str1, str2);
        } catch (error) {
          console.error('str1', JSON.stringify(str1));
          console.error('str2', JSON.stringify(str2));
          throw error;
        }
      }
    });

    test('modified versions of same string', () => {
      for (let i = 0; i < iterations; i++) {
        const original = RandomJson.genString(Math.floor(Math.random() * 50) + 10);
        let modified = original;

        // Apply random modifications
        const operations = Math.floor(Math.random() * 5) + 1;
        for (let j = 0; j < operations; j++) {
          const opType = Math.floor(Math.random() * 3);
          const pos = Math.floor(Math.random() * (modified.length + 1));

          switch (opType) {
            case 0: {
              // Insert
              const charToInsert = String.fromCharCode(Math.floor(Math.random() * 26) + 97);
              modified = modified.slice(0, pos) + charToInsert + modified.slice(pos);
              break;
            }
            case 1: {
              // Delete
              if (modified.length > 0) {
                const delPos = Math.floor(Math.random() * modified.length);
                modified = modified.slice(0, delPos) + modified.slice(delPos + 1);
              }
              break;
            }
            case 2: {
              // Replace
              if (modified.length > 0) {
                const replPos = Math.floor(Math.random() * modified.length);
                const newChar = String.fromCharCode(Math.floor(Math.random() * 26) + 65);
                modified = modified.slice(0, replPos) + newChar + modified.slice(replPos + 1);
              }
              break;
            }
          }
        }

        try {
          assertDiff(original, modified);
        } catch (error) {
          console.error('original', JSON.stringify(original));
          console.error('modified', JSON.stringify(modified));
          throw error;
        }
      }
    });

    test('unicode string fuzzing', () => {
      const unicodeRanges = [
        [0x0020, 0x007f], // Basic Latin
        [0x00a0, 0x00ff], // Latin-1 Supplement
        [0x0100, 0x017f], // Latin Extended-A
        [0x4e00, 0x9fff], // CJK Unified Ideographs
        [0x1f600, 0x1f64f], // Emoticons
        [0x1f300, 0x1f5ff], // Misc Symbols and Pictographs
      ];

      for (let i = 0; i < iterations; i++) {
        let str1 = '';
        let str2 = '';
        const length1 = Math.floor(Math.random() * 20) + 1;
        const length2 = Math.floor(Math.random() * 20) + 1;

        for (let j = 0; j < length1; j++) {
          const range = unicodeRanges[Math.floor(Math.random() * unicodeRanges.length)];
          const code = Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
          str1 += String.fromCodePoint(code);
        }

        for (let j = 0; j < length2; j++) {
          const range = unicodeRanges[Math.floor(Math.random() * unicodeRanges.length)];
          const code = Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
          str2 += String.fromCodePoint(code);
        }

        try {
          assertDiff(str1, str2);
        } catch (error) {
          console.error('str1', JSON.stringify(str1));
          console.error('str2', JSON.stringify(str2));
          throw error;
        }
      }
    });
  });

  describe('string diffs in data structures', () => {
    test('string changes in objects', () => {
      assertDiff({message: 'Hello world'}, {message: 'Hello beautiful world'});

      assertDiff({title: 'Original Title', body: 'Some content'}, {title: 'Updated Title', body: 'Modified content'});
    });

    test('string changes in arrays', () => {
      assertDiff(['first', 'second', 'third'], ['first', 'SECOND', 'third']);

      assertDiff(['hello world'], ['hello beautiful world']);
    });

    test('nested string changes', () => {
      assertDiff(
        {user: {name: 'John Doe', bio: 'Software developer'}},
        {user: {name: 'John Smith', bio: 'Senior software developer'}},
      );

      assertDiff([{text: 'Original'}, {text: 'Content'}], [{text: 'Modified'}, {text: 'Content updated'}]);
    });
  });
});
