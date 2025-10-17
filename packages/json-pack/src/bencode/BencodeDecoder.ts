import {Reader} from '@jsonjoy.com/buffers/lib/Reader';
import type {BinaryJsonDecoder, PackValue} from '../types';

export class BencodeDecoder implements BinaryJsonDecoder {
  public reader = new Reader();

  public read(uint8: Uint8Array): unknown {
    this.reader.reset(uint8);
    return this.readAny();
  }

  public decode(uint8: Uint8Array): unknown {
    this.reader.reset(uint8);
    return this.readAny();
  }

  public readAny(): unknown {
    const reader = this.reader;
    const x = reader.x;
    const uint8 = reader.uint8;
    const char = uint8[x];
    switch (char) {
      case 0x69: // i
        return this.readNum();
      case 0x64: // d
        return this.readObj();
      case 0x6c: // l
        return this.readArr();
      case 0x66: // f
        return this.readFalse();
      case 0x74: // t
        return this.readTrue();
      case 110: // n
        return this.readNull();
      case 117: // u
        return this.readUndef();
      default:
        if (char >= 48 && char <= 57) return this.readBin();
    }
    throw new Error('INVALID_BENCODE');
  }

  public readNull(): null {
    if (this.reader.u8() !== 0x6e) throw new Error('INVALID_BENCODE');
    return null;
  }

  public readUndef(): undefined {
    if (this.reader.u8() !== 117) throw new Error('INVALID_BENCODE');
    return undefined;
  }

  public readTrue(): true {
    if (this.reader.u8() !== 0x74) throw new Error('INVALID_BENCODE');
    return true;
  }

  public readFalse(): false {
    if (this.reader.u8() !== 0x66) throw new Error('INVALID_BENCODE');
    return false;
  }

  public readBool(): unknown {
    const reader = this.reader;
    switch (reader.uint8[reader.x]) {
      case 0x66: // f
        return this.readFalse();
      case 0x74: // t
        return this.readTrue();
      default:
        throw new Error('INVALID_BENCODE');
    }
  }

  public readNum(): number {
    const reader = this.reader;
    const startChar = reader.u8();
    if (startChar !== 0x69) throw new Error('INVALID_BENCODE');
    const u8 = reader.uint8;
    let x = reader.x;
    let numStr = '';
    let c = u8[x++];
    let i = 0;
    while (c !== 0x65) {
      numStr += String.fromCharCode(c);
      c = u8[x++];
      if (i > 25) throw new Error('INVALID_BENCODE');
      i++;
    }
    if (!numStr) throw new Error('INVALID_BENCODE');
    reader.x = x;
    return +numStr;
  }

  public readStr(): string {
    const bin = this.readBin();
    return new TextDecoder().decode(bin);
  }

  public readBin(): Uint8Array {
    const reader = this.reader;
    const u8 = reader.uint8;
    let lenStr = '';
    let x = reader.x;
    let c = u8[x++];
    let i = 0;
    while (c !== 0x3a) {
      if (c < 48 || c > 57) throw new Error('INVALID_BENCODE');
      lenStr += String.fromCharCode(c);
      c = u8[x++];
      if (i > 10) throw new Error('INVALID_BENCODE');
      i++;
    }
    reader.x = x;
    const len = +lenStr;
    const bin = reader.buf(len);
    return bin;
  }

  public readArr(): unknown[] {
    const reader = this.reader;
    if (reader.u8() !== 0x6c) throw new Error('INVALID_BENCODE');
    const arr: unknown[] = [];
    const uint8 = reader.uint8;
    while (true) {
      const char = uint8[reader.x];
      if (char === 0x65) {
        reader.x++;
        return arr;
      }
      arr.push(this.readAny());
    }
  }

  public readObj(): PackValue | Record<string, unknown> | unknown {
    const reader = this.reader;
    if (reader.u8() !== 0x64) throw new Error('INVALID_BENCODE');
    const obj: Record<string, unknown> = {};
    const uint8 = reader.uint8;
    while (true) {
      const char = uint8[reader.x];
      if (char === 0x65) {
        reader.x++;
        return obj;
      }
      const key = this.readStr();
      if (key === '__proto__') throw new Error('INVALID_KEY');
      obj[key] = this.readAny();
    }
  }
}
