import {JsonPackExtension} from "../JsonPackExtension";
import {CachedKeyDecoder, KeyDecoder} from "./CachedKeyDecoder";

const sharedCachedKeyDecoder = new CachedKeyDecoder();

export class Decoder {
  protected uint8 = new Uint8Array([]);
  protected view = new DataView(this.uint8.buffer);
  protected x = 0;

  public constructor(
    private readonly keyDecoder: KeyDecoder = sharedCachedKeyDecoder,
  ) {}

  public decode(uint8: Uint8Array): unknown {
    this.x = 0;
    this.uint8 = uint8;
    this.view = new DataView(this.uint8.buffer);
    return this.val();
  }

  protected val(): unknown {
    const byte = this.u8();
    if (byte >= 0xe0) return byte - 0x100; // 0xe0
    if (byte <= 0xbf) {
      if (byte < 0x90) {
        if (byte <= 0b1111111) return byte; // 0x7f
        return this.obj(byte & 0b1111); // 0x80
      } else {
        if (byte < 0xa0) return this.arr(byte & 0b1111); // 0x90
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
            ? byte === 0xca ? this.f32() : this.ext(this.u32())
            : byte === 0xcc ? this.u8() : this.f64()
          : byte <= 0xce
            ? byte === 0xce ? this.u32() : this.u16()
            : byte === 0xd0 ? this.i8() : this.u32() * 4294967296 + this.u32();
      }
    } else if (byte <= 0xd8) {
      return byte <= 0xd4
        ? byte <= 0xd2
          ? byte === 0xd2 ? this.i32() : this.i16()
          : byte === 0xd4 ? this.ext(1) : this.i32() * 4294967296 + this.i32()
        : byte <= 0xd6
          ? byte === 0xd6 ? this.ext(4) : this.ext(2)
          : byte === 0xd8 ? this.ext(16) : this.ext(8);
    } else {

      switch (byte) {
        case 0xd9: return this.str(this.u8());
        case 0xda: return this.str(this.u16());
        case 0xdb: return this.str(this.u32());
        case 0xdc: return this.arr(this.u16());
        case 0xdd: return this.arr(this.u32());
        case 0xde: return this.obj(this.u16());
        case 0xdf: return this.obj(this.u32());
      }
    }
    return undefined;
  }

  protected str(size: number): string {
    const uint8 = this.uint8;
    const end = this.x + size;
    let offset = this.x;
    let str = '';
    while (offset < end) {
      const b1 = uint8[offset++]!;
      if ((b1 & 0x80) === 0) {
        str += String.fromCharCode(b1);
        continue;
      } else if ((b1 & 0xe0) === 0xc0) {
        str += String.fromCharCode(((b1 & 0x1f) << 6) | uint8[offset++]! & 0x3f);
      } else if ((b1 & 0xf0) === 0xe0) {
        str += String.fromCharCode(((b1 & 0x1f) << 12) | ((uint8[offset++]! & 0x3f) << 6) | (uint8[offset++]! & 0x3f));
      } else if ((b1 & 0xf8) === 0xf0) {
        const b2 = uint8[offset++]! & 0x3f;
        const b3 = uint8[offset++]! & 0x3f;
        const b4 = uint8[offset++]! & 0x3f;
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

  protected obj(size: number): object {
    const obj: Record<string, unknown> = {};
    for (let i = 0; i < size; i++) {
      const key = this.key();
      obj[key] = this.val();
    }
    return obj;
  }

  protected key(): string {
    const byte = this.view.getUint8(this.x);
    if ((byte >= 0b10100000) && (byte <= 0b10111111)) {
      const size = byte & 0b11111;
      const key = this.keyDecoder.decode(this.uint8, this.x + 1, size);
      this.x += 1 + size;
      return key;
    } else return this.val() as string;
  }

  protected arr(size: number): unknown[] {
    const arr = [];
    for (let i = 0; i < size; i++) arr.push(this.val());
    return arr;
  }

  protected bin(size: number): Uint8Array {
    const end = this.x + size;
    const bin = this.uint8.subarray(this.x, end);
    this.x = end;
    return bin;
  }

  protected ext(size: number): JsonPackExtension {
    const type = this.u8();
    const end = this.x + size;
    const buf = this.uint8.subarray(this.x, end);
    this.x = end;
    return new JsonPackExtension(type, buf);
  }

  protected u8(): number {
    return this.view.getUint8(this.x++);
  }

  protected u16(): number {
    const num = this.view.getUint16(this.x);
    this.x += 2;
    return num;
  }

  protected u32(): number {
    const num = this.view.getUint32(this.x);
    this.x += 4;
    return num;
  }

  protected i8(): number {
    return this.view.getInt8(this.x++);
  }

  protected i16(): number {
    const num = this.view.getInt16(this.x);
    this.x += 2;
    return num;
  }

  protected i32(): number {
    const num = this.view.getInt32(this.x);
    this.x += 4;
    return num;
  }

  protected f32(): number {
    const pos = this.x;
    this.x += 4;
    return this.view.getFloat32(pos);
  }

  protected f64(): number {
    const pos = this.x;
    this.x += 8;
    return this.view.getFloat64(pos);
  }
}
