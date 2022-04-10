import {JsonPackValue} from '..';
import {JsonPackExtension} from '../JsonPackExtension';
import {CachedKeyDecoder} from './CachedKeyDecoder';

const sharedCachedKeyDecoder = new CachedKeyDecoder();

/**
 * @category Decoder
 */
export class Decoder {
  /** @ignore */
  protected uint8 = new Uint8Array([]);
  /** @ignore */
  protected view = new DataView(this.uint8.buffer);
  /** @ignore */
  protected x = 0;

  public constructor(private readonly keyDecoder: CachedKeyDecoder = sharedCachedKeyDecoder) {}

  public getOffset(): number {
    return this.x;
  }

  public reset(uint8: Uint8Array): void {
    this.x = 0;
    this.uint8 = uint8;
    this.view = new DataView(uint8.buffer, uint8.byteOffset, uint8.byteLength);
  }

  public decode(uint8: Uint8Array): unknown {
    this.reset(uint8);
    return this.val();
  }

  /** @ignore */
  protected val(): unknown {
    const byte = this.u8();
    if (byte >= 0xe0) return byte - 0x100; // 0xe0
    if (byte <= 0xbf) {
      if (byte < 0x90) {
        if (byte <= 0b1111111) return byte; // 0x7f
        return this.obj(byte & 0b1111); // 0x80
      } else {
        if (byte < 0xa0) return this.arr(byte & 0b1111);
        // 0x90
        else return this.str(byte & 0b11111); // 0xa0
      }
    }
    if (byte <= 0xce) {
      if (byte <= 0xc8) {
        if (byte <= 0xc4) {
          if (byte <= 0xc2) return byte === 0xc2 ? false : null;
          else return byte === 0xc4 ? this.bin(this.u8()) : true;
        } else {
          if (byte <= 0xc6) return byte === 0xc6 ? this.bin(this.u32()) : this.bin(this.u16());
          else return byte === 0xc8 ? this.ext(this.u16()) : this.ext(this.u8());
        }
      } else {
        return byte <= 0xcc
          ? byte <= 0xca
            ? byte === 0xca
              ? this.f32()
              : this.ext(this.u32())
            : byte === 0xcc
            ? this.u8()
            : this.f64()
          : byte <= 0xce
          ? byte === 0xce
            ? this.u32()
            : this.u16()
          : byte === 0xd0
          ? this.i8()
          : this.u32() * 4294967296 + this.u32();
      }
    } else if (byte <= 0xd8) {
      return byte <= 0xd4
        ? byte <= 0xd2
          ? byte === 0xd2
            ? this.i32()
            : this.i16()
          : byte === 0xd4
          ? this.ext(1)
          : this.i32() * 4294967296 + this.i32()
        : byte <= 0xd6
        ? byte === 0xd6
          ? this.ext(4)
          : this.ext(2)
        : byte === 0xd8
        ? this.ext(16)
        : this.ext(8);
    } else {
      switch (byte) {
        case 0xd9:
          return this.str(this.u8());
        case 0xda:
          return this.str(this.u16());
        case 0xdb:
          return this.str(this.u32());
        case 0xdc:
          return this.arr(this.u16());
        case 0xdd:
          return this.arr(this.u32());
        case 0xde:
          return this.obj(this.u16());
        case 0xdf:
          return this.obj(this.u32());
      }
    }
    return undefined;
  }

  /** @ignore */
  protected str(size: number): string {
    const uint8 = this.uint8;
    const end = this.x + size;
    let x = this.x;
    let str = '';
    while (x < end) {
      const b1 = uint8[x++]!;
      if ((b1 & 0x80) === 0) {
        str += String.fromCharCode(b1);
        continue;
      } else if ((b1 & 0xe0) === 0xc0) {
        str += String.fromCharCode(((b1 & 0x1f) << 6) | (uint8[x++]! & 0x3f));
      } else if ((b1 & 0xf0) === 0xe0) {
        str += String.fromCharCode(((b1 & 0x1f) << 12) | ((uint8[x++]! & 0x3f) << 6) | (uint8[x++]! & 0x3f));
      } else if ((b1 & 0xf8) === 0xf0) {
        const b2 = uint8[x++]! & 0x3f;
        const b3 = uint8[x++]! & 0x3f;
        const b4 = uint8[x++]! & 0x3f;
        let code = ((b1 & 0x07) << 0x12) | (b2 << 0x0c) | (b3 << 0x06) | b4;
        if (code > 0xffff) {
          code -= 0x10000;
          str += String.fromCharCode(((code >>> 10) & 0x3ff) | 0xd800);
          code = 0xdc00 | (code & 0x3ff);
        }
        str += String.fromCharCode(code);
      } else {
        str += String.fromCharCode(b1);
      }
    }
    this.x = end;
    return str;
  }

  /** @ignore */
  protected obj(size: number): object {
    const obj: Record<string, unknown> = {};
    for (let i = 0; i < size; i++) {
      const key = this.key();
      obj[key] = this.val();
    }
    return obj;
  }

  /** @ignore */
  protected key(): string {
    const byte = this.view.getUint8(this.x);
    if (byte >= 0b10100000 && byte <= 0b10111111) {
      const size = byte & 0b11111;
      const key = this.keyDecoder.decode(this.uint8, this.x + 1, size);
      this.x += 1 + size;
      return key;
    } else if (byte === 0xd9) {
      const size = this.view.getUint8(this.x + 1);
      if (size < 32) {
        const key = this.keyDecoder.decode(this.uint8, this.x + 2, size);
        this.x += 2 + size;
        return key;
      } else return this.val() as string;
    } else return this.val() as string;
  }

  /** @ignore */
  protected arr(size: number): unknown[] {
    const arr: unknown[] = [];
    for (let i = 0; i < size; i++) arr.push(this.val());
    return arr;
  }

  /** @ignore */
  protected bin(size: number): Uint8Array {
    const end = this.x + size;
    const bin = this.uint8.subarray(this.x, end);
    this.x = end;
    return bin;
  }

  /** @ignore */
  protected ext(size: number): JsonPackExtension {
    const type = this.u8();
    const end = this.x + size;
    const buf = this.uint8.subarray(this.x, end);
    this.x = end;
    return new JsonPackExtension(type, buf);
  }

  protected back(bytes: number) {
    this.x -= bytes;
  }

  /** @ignore */
  protected peak(): number {
    return this.view.getUint8(this.x);
  }

  /** @ignore */
  protected u8(): number {
    return this.view.getUint8(this.x++);
  }

  /** @ignore */
  protected u16(): number {
    const num = this.view.getUint16(this.x);
    this.x += 2;
    return num;
  }

  /** @ignore */
  protected u32(): number {
    const num = this.view.getUint32(this.x);
    this.x += 4;
    return num;
  }

  /** @ignore */
  protected i8(): number {
    return this.view.getInt8(this.x++);
  }

  /** @ignore */
  protected i16(): number {
    const num = this.view.getInt16(this.x);
    this.x += 2;
    return num;
  }

  /** @ignore */
  protected i32(): number {
    const num = this.view.getInt32(this.x);
    this.x += 4;
    return num;
  }

  /** @ignore */
  protected f32(): number {
    const pos = this.x;
    this.x += 4;
    return this.view.getFloat32(pos);
  }

  /** @ignore */
  protected f64(): number {
    const pos = this.x;
    this.x += 8;
    return this.view.getFloat64(pos);
  }

  // Decode one level of a JSON object or array. -------------------------------

  public decodeOneLevel(uint8: Uint8Array): unknown {
    this.reset(uint8);
    return this.valOneLevel();
  }

  protected valOneLevel(): unknown {
    const byte = this.view.getUint8(this.x);
    const isMap = byte === 0xde || byte === 0xdf || byte >> 4 === 0b1000;
    if (isMap) {
      this.x++;
      const size = byte === 0xde ? this.u16() : byte === 0xdf ? this.u32() : byte & 0b1111;
      const obj: Record<string, unknown> = {};
      for (let i = 0; i < size; i++) {
        const key = this.key();
        obj[key] = this.primitive();
      }
      return obj;
    }
    const isArray = byte === 0xdc || byte === 0xdd || byte >> 4 === 0b1001;
    if (isArray) {
      this.x++;
      const size = byte === 0xdc ? this.u16() : byte === 0xdd ? this.u32() : byte & 0b1111;
      const arr: unknown[] = [];
      for (let i = 0; i < size; i++) arr.push(this.primitive());
      return arr;
    }
    return this.val();
  }

  /**
   * @ignore
   * @returns Returns a primitive value or {@link JsonPackValue} object, if the value
   *          is a "map" or an "arr".
   */
  protected primitive(): unknown {
    const byte = this.view.getUint8(this.x);
    const isMapOrArray = byte === 0xde || byte === 0xdf || byte === 0xdc || byte === 0xdd || byte >> 5 === 0b100;
    if (isMapOrArray) {
      const length = this.valSkip();
      this.x -= length;
      const buf = this.bin(length);
      return new JsonPackValue(buf);
    }
    return this.val();
  }

  protected skip(length: number): number {
    this.x += length;
    return length;
  }

  /**
   * Skips a whole JSON value and returns back the number of bytes
   * that value consumed.
   */
  public valSkip(): number {
    const byte = this.u8();
    if (byte >= 0xe0) return 1; // 0xe0
    if (byte <= 0xbf) {
      if (byte < 0x90) {
        if (byte <= 0b1111111) return 1; // 0x7f
        return 1 + this.objSkip(byte & 0b1111); // 0x80, obj(1)
      } else {
        if (byte < 0xa0) return 1 + this.arrSkip(byte & 0b1111);
        // 0x90
        else return 1 + this.skip(byte & 0b11111); // 0xa0, str(1)
      }
    }
    if (byte <= 0xce) {
      if (byte <= 0xc8) {
        if (byte <= 0xc4) {
          if (byte <= 0xc2) return byte === 0xc2 ? 1 : 1;
          else return byte === 0xc4 ? 2 + this.skip(this.u8()) : 1;
        } else {
          if (byte <= 0xc6) return byte === 0xc6 ? 5 + this.skip(this.u32()) : 3 + this.skip(this.u16());
          else return byte === 0xc8 ? 4 + this.skip(this.u16()) : 3 + this.skip(this.u8());
        }
      } else {
        return byte <= 0xcc
          ? byte <= 0xca
            ? byte === 0xca
              ? 1 + this.skip(4) // f32
              : 1 + 1 + 4 + this.skip(this.u32()) // ext32
            : byte === 0xcc
            ? 1 + this.skip(1) // u8
            : 1 + this.skip(8) // f64
          : byte <= 0xce
          ? byte === 0xce
            ? 1 + this.skip(4) // u32
            : 1 + this.skip(2) // u16
          : byte === 0xd0
          ? 1 + this.skip(1) // i8
          : 1 + this.skip(8); // u64
      }
    } else if (byte <= 0xd8) {
      return byte <= 0xd4
        ? byte <= 0xd2
          ? byte === 0xd2
            ? 1 + this.skip(4) // i32
            : 1 + this.skip(2) // i16
          : byte === 0xd4
          ? 1 + this.skip(2) // ext1
          : 1 + this.skip(8) // i64
        : byte <= 0xd6
        ? byte === 0xd6
          ? 1 + this.skip(5) // ext4
          : 1 + this.skip(3) // ext2
        : byte === 0xd8
        ? 1 + this.skip(17) // ext16
        : 1 + this.skip(9); // ext8
    } else {
      switch (byte) {
        case 0xd9:
          return 2 + this.skip(this.u8()); // str8
        case 0xda:
          return 3 + this.skip(this.u16()); // str16
        case 0xdb:
          return 5 + this.skip(this.u32()); // str32
        case 0xdc:
          return 3 + this.arrSkip(this.u16());
        case 0xdd:
          return 5 + this.arrSkip(this.u32());
        case 0xde:
          return 3 + this.objSkip(this.u16());
        case 0xdf:
          return 5 + this.objSkip(this.u32());
      }
    }
    return 1;
  }

  /** @ignore */
  protected arrSkip(size: number): number {
    let length = 0;
    for (let i = 0; i < size; i++) length += this.valSkip();
    return length;
  }

  /** @ignore */
  protected objSkip(size: number): number {
    let length = 0;
    for (let i = 0; i < size; i++) {
      length += this.valSkip() + this.valSkip();
    }
    return length;
  }
}
