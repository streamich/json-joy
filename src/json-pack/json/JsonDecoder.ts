import {decodeUtf8} from '../../util/buffers/utf8/decodeUtf8';
import {Reader} from '../../util/buffers/Reader';
import {fromBase64Bin} from '../../util/base64/fromBase64Bin';
import type {BinaryJsonDecoder, PackValue} from '../types';

const REGEX_REPLACE_ESCAPED_CHARS = /\\(b|f|n|r|t|"|\/|\\)/g;
const escapedCharReplacer = (char: string) => {
  switch (char) {
    case '\\b':
      return '\b';
    case '\\f':
      return '\f';
    case '\\n':
      return '\n';
    case '\\r':
      return '\r';
    case '\\t':
      return '\t';
    case '\\"':
      return '"';
    case '\\/':
      return '/';
    case '\\\\':
      return '\\';
  }
  return char;
};

// Starts with "data:application/octet-stream;base64," - 64 61 74 61 3a 61 70 70 6c 69 63 61 74 69 6f 6e 2f 6f 63 74 65 74 2d 73 74 72 65 61 6d 3b 62 61 73 65 36 34 2c
const hasBinaryPrefix = (u8: Uint8Array, x: number) =>
  u8[x] === 0x64 &&
  u8[x + 1] === 0x61 &&
  u8[x + 2] === 0x74 &&
  u8[x + 3] === 0x61 &&
  u8[x + 4] === 0x3a &&
  u8[x + 5] === 0x61 &&
  u8[x + 6] === 0x70 &&
  u8[x + 7] === 0x70 &&
  u8[x + 8] === 0x6c &&
  u8[x + 9] === 0x69 &&
  u8[x + 10] === 0x63 &&
  u8[x + 11] === 0x61 &&
  u8[x + 12] === 0x74 &&
  u8[x + 13] === 0x69 &&
  u8[x + 14] === 0x6f &&
  u8[x + 15] === 0x6e &&
  u8[x + 16] === 0x2f &&
  u8[x + 17] === 0x6f &&
  u8[x + 18] === 0x63 &&
  u8[x + 19] === 0x74 &&
  u8[x + 20] === 0x65 &&
  u8[x + 21] === 0x74 &&
  u8[x + 22] === 0x2d &&
  u8[x + 23] === 0x73 &&
  u8[x + 24] === 0x74 &&
  u8[x + 25] === 0x72 &&
  u8[x + 26] === 0x65 &&
  u8[x + 27] === 0x61 &&
  u8[x + 28] === 0x6d &&
  u8[x + 29] === 0x3b &&
  u8[x + 30] === 0x62 &&
  u8[x + 31] === 0x61 &&
  u8[x + 32] === 0x73 &&
  u8[x + 33] === 0x65 &&
  u8[x + 34] === 0x36 &&
  u8[x + 35] === 0x34 &&
  u8[x + 36] === 0x2c;

const findEndingQuote = (uint8: Uint8Array, x: number): number => {
  const len = uint8.length;
  let char = uint8[x];
  let prev = 0;
  while (x < len) {
    if (char === 34 && prev !== 92) break;
    if (char === 92 && prev === 92) prev = 0;
    else prev = char;
    char = uint8[++x];
  }
  if (x === len) throw new Error('Invalid JSON');
  return x;
};

export class JsonDecoder implements BinaryJsonDecoder {
  public reader = new Reader();

  public read(uint8: Uint8Array): PackValue {
    this.reader.reset(uint8);
    return this.readAny();
  }

  public readAny(): PackValue {
    this.skipWhitespace();
    const reader = this.reader;
    const x = reader.x;
    const uint8 = reader.uint8;
    const char = uint8[x];
    switch (char) {
      case 34: // "
        return uint8[x + 1] === 0x64 // d
          ? this.tryReadBin() || this.readStr()
          : this.readStr();
      case 91: // [
        return this.readArr();
      case 102: // f
        return this.readFalse();
      case 110: // n
        return this.readNull();
      case 116: // t
        return this.readTrue();
      case 123: // {
        return this.readObj();
      default:
        if ((char >= 48 && char <= 57) || char === 45) return this.readNum();
        throw new Error('Invalid JSON');
    }
  }

  public skipWhitespace(): void {
    const reader = this.reader;
    const uint8 = reader.uint8;
    let x = reader.x;
    let char: number = 0;
    while (true) {
      char = uint8[x];
      switch (char) {
        case 32: // space
        case 9: // tab
        case 10: // line feed
        case 13: // carriage return
          x++;
          continue;
        default:
          reader.x = x;
          return;
      }
    }
  }

  public readNull(): null {
    if (this.reader.u32() !== 0x6e756c6c) throw new Error('Invalid JSON');
    return null;
  }

  public readTrue(): true {
    if (this.reader.u32() !== 0x74727565) throw new Error('Invalid JSON');
    return true;
  }

  public readFalse(): false {
    const reader = this.reader;
    if (reader.u8() !== 0x66 || reader.u32() !== 0x616c7365) throw new Error('Invalid JSON');
    return false;
  }

  public readBool(): unknown {
    const reader = this.reader;
    switch (reader.uint8[reader.x]) {
      case 102: // f
        return this.readFalse();
      case 116: // t
        return this.readTrue();
      default:
        throw new Error('Invalid JSON');
    }
  }

  public readNum(): number {
    const reader = this.reader;
    const uint8 = reader.uint8;
    let x = reader.x;
    let str = '';
    let char = uint8[x];
    while ((char >= 45 && char <= 57) || char === 43 || char === 69 || char === 101) {
      str += String.fromCharCode(char);
      char = uint8[++x];
    }
    const num = +str;
    if (num !== num) throw new Error('Invalid JSON');
    reader.x = x;
    return num;
  }

  public readStr(): string {
    const reader = this.reader;
    const uint8 = reader.uint8;
    const char = uint8[reader.x++];
    if (char !== 0x22) throw new Error('Invalid JSON');
    const x0 = reader.x;
    const x1 = findEndingQuote(uint8, x0);
    let str = decodeUtf8(uint8, x0, x1 - x0);
    /** @todo perf: maybe faster is to first check if there are any escaped chars. */
    str = str.replace(REGEX_REPLACE_ESCAPED_CHARS, escapedCharReplacer);
    reader.x = x1 + 1;
    return str;
  }

  public tryReadBin(): Uint8Array | undefined {
    const reader = this.reader;
    const u8 = reader.uint8;
    let x = reader.x;
    if (u8[x++] !== 0x22) return undefined;
    const hasDataUrlPrefix = hasBinaryPrefix(u8, x);
    if (!hasDataUrlPrefix) return undefined;
    x += 37;
    const x0 = x;
    x = findEndingQuote(u8, x);
    reader.x = x0;
    const bin = fromBase64Bin(reader.view, x0, x - x0);
    reader.x = x + 1;
    return bin;
  }

  public readBin(): Uint8Array {
    const reader = this.reader;
    const u8 = reader.uint8;
    let x = reader.x;
    if (u8[x++] !== 0x22) throw new Error('Invalid JSON');
    const hasDataUrlPrefix = hasBinaryPrefix(u8, x);
    if (!hasDataUrlPrefix) throw new Error('Invalid JSON');
    x += 37;
    const x0 = x;
    x = findEndingQuote(u8, x);
    reader.x = x0;
    const bin = fromBase64Bin(reader.view, x0, x - x0);
    reader.x = x + 1;
    return bin;
  }

  public readArr(): PackValue[] {
    const reader = this.reader;
    if (reader.u8() !== 0x5b) throw new Error('Invalid JSON');
    const arr: PackValue[] = [];
    const uint8 = reader.uint8;
    while (true) {
      this.skipWhitespace();
      const char = uint8[reader.x];
      if (char === 0x5d) return reader.x++, arr; // ]
      if (char === 0x2c) {
        reader.x++;
        continue;
      } // ,
      arr.push(this.readAny());
    }
  }

  public readObj(): Record<string, PackValue> {
    const reader = this.reader;
    if (reader.u8() !== 0x7b) throw new Error('Invalid JSON');
    const obj: Record<string, PackValue> = {};
    const uint8 = reader.uint8;
    while (true) {
      this.skipWhitespace();
      const char = uint8[reader.x];
      if (char === 0x7d) return reader.x++, obj; // }
      if (char === 0x2c) {
        reader.x++;
        continue;
      } // ,
      const key = this.readStr();
      if (key === '__proto__') throw new Error('Invalid JSON');
      this.skipWhitespace();
      if (reader.u8() !== 0x3a) throw new Error('Invalid JSON');
      this.skipWhitespace();
      obj[key] = this.readAny();
    }
  }
}
