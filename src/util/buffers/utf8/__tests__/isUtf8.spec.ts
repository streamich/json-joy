import {isUtf8} from '../isUtf8';

describe('returns true for valid UTF8', () => {
  const strings = [
    '',
    'hello',
    'hello world',
    'emoji: 🤔',
    'russian: Привет',
    'chinese: 你好',
    'japanese: こんにちは',
    'korean: 안녕하세요',
    'arabic: مرحبا',
    'hebrew: שלום',
    'greek: γεια σας',
    'bulgarian: Здравейте',
    'hindi: नमस्ते',
    'thai: สวัสดี',
    'special chars: !@#$%^&*()_+{}|:"<>?`-=[]\\;\',./',
  ];
  for (const str of strings) {
    test(str, () => {
      const buf = Buffer.from(str);
      expect(isUtf8(buf, 0, buf.length)).toBe(true);
    });
  }
});

describe('returns false for non-UTF8 sequences', () => {
  const strings: [name: string, Uint8Array][] = [
    ['two octets', Buffer.from([0xc3, 0x28])],
    ['three octets', Buffer.from([0xe2, 0x82, 0x28])],
    ['four octets', Buffer.from([0xf0, 0x90, 0x82, 0x28])],
    ['five octets', Buffer.from([0xf8, 0x88, 0x82, 0x82, 0x28])],
    ['six octets', Buffer.from([0xfc, 0x84, 0x82, 0x82, 0x82, 0x28])],
  ];
  for (const [name, str] of strings) {
    test(name, () => {
      expect(isUtf8(str, 0, str.length)).toBe(false);
    });
  }
});

describe('returns true for valid non-UTF8 sequences in the middle of buffer', () => {
  const strings: [name: string, str: Uint8Array, from: number, length: number][] = [
    ['mid char valid', Buffer.from([0xc3, 0x28, 64, 0xc3, 0x28]), 2, 1],
  ];
  for (const [name, str, from, length] of strings) {
    test(name, () => {
      expect(isUtf8(str, from, length)).toBe(true);
      expect(isUtf8(str, 0, from + length)).toBe(false);
    });
  }
});
