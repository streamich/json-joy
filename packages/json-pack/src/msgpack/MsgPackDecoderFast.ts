import {Reader} from '@jsonjoy.com/buffers/lib/Reader';
import sharedCachedUtf8Decoder from '@jsonjoy.com/buffers/lib/utf8/sharedCachedUtf8Decoder';
import {JsonPackExtension} from '../JsonPackExtension';
import {ERROR} from '../cbor/constants';
import type {BinaryJsonDecoder, PackValue} from '../types';
import type {CachedUtf8Decoder} from '@jsonjoy.com/buffers/lib/utf8/CachedUtf8Decoder';

/**
 * @category Decoder
 */
export class MsgPackDecoderFast<R extends Reader> implements BinaryJsonDecoder {
  public constructor(
    public reader: R = new Reader() as R,
    protected readonly keyDecoder: CachedUtf8Decoder = sharedCachedUtf8Decoder,
  ) {}

  /** @deprecated */
  public decode(uint8: Uint8Array): unknown {
    this.reader.reset(uint8);
    return this.readAny();
  }

  public read(uint8: Uint8Array): PackValue {
    this.reader.reset(uint8);
    return this.readAny() as PackValue;
  }

  public val(): unknown {
    return this.readAny();
  }

  public readAny(): unknown {
    const reader = this.reader;
    const byte = reader.u8();
    if (byte >= 0xe0) return byte - 0x100; // 0xe0
    if (byte <= 0xbf) {
      if (byte < 0x90) {
        if (byte <= 0b1111111) return byte; // 0x7f
        return this.obj(byte & 0b1111); // 0x80
      } else {
        if (byte < 0xa0) return this.arr(byte & 0b1111);
        // 0x90
        else return reader.utf8(byte & 0b11111); // 0xa0
      }
    }
    if (byte <= 0xd0) {
      if (byte <= 0xc8) {
        if (byte <= 0xc4) {
          if (byte <= 0xc2) return byte === 0xc2 ? false : byte === 0xc0 ? null : undefined;
          else return byte === 0xc4 ? reader.buf(reader.u8()) : true;
        } else {
          if (byte <= 0xc6) return byte === 0xc6 ? reader.buf(reader.u32()) : reader.buf(reader.u16());
          else return byte === 0xc8 ? this.ext(reader.u16()) : this.ext(reader.u8());
        }
      } else {
        return byte <= 0xcc
          ? byte <= 0xca
            ? byte === 0xca
              ? reader.f32()
              : this.ext(reader.u32())
            : byte === 0xcc
              ? reader.u8()
              : reader.f64()
          : byte <= 0xce
            ? byte === 0xce
              ? reader.u32()
              : reader.u16()
            : byte === 0xd0
              ? reader.i8()
              : reader.u32() * 4294967296 + reader.u32();
      }
    } else if (byte <= 0xd8) {
      return byte <= 0xd4
        ? byte <= 0xd2
          ? byte === 0xd2
            ? reader.i32()
            : reader.i16()
          : byte === 0xd4
            ? this.ext(1)
            : reader.i32() * 4294967296 + reader.u32()
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
          return reader.utf8(reader.u8());
        case 0xda:
          return reader.utf8(reader.u16());
        case 0xdb:
          return reader.utf8(reader.u32());
        case 0xdc:
          return this.arr(reader.u16());
        case 0xdd:
          return this.arr(reader.u32());
        case 0xde:
          return this.obj(reader.u16());
        case 0xdf:
          return this.obj(reader.u32());
      }
    }
    return undefined;
  }

  public str(): unknown {
    const reader = this.reader;
    const byte = reader.u8();
    if (byte >> 5 === 0b101) return reader.utf8(byte & 0b11111);
    switch (byte) {
      case 0xd9:
        return reader.utf8(reader.u8());
      case 0xda:
        return reader.utf8(reader.u16());
      case 0xdb:
        return reader.utf8(reader.u32());
    }
    return undefined;
  }

  /** @ignore */
  protected obj(size: number): object {
    const obj: Record<string, unknown> = {};
    for (let i = 0; i < size; i++) {
      const key = this.key();
      if (key === '__proto__') throw ERROR.UNEXPECTED_OBJ_KEY;
      obj[key] = this.readAny();
    }
    return obj;
  }

  /** @ignore */
  protected key(): string {
    const reader = this.reader;
    const byte = reader.view.getUint8(reader.x);
    if (byte >= 0b10100000 && byte <= 0b10111111) {
      const size = byte & 0b11111;
      const key = this.keyDecoder.decode(reader.uint8, reader.x + 1, size);
      reader.x += 1 + size;
      return key;
    } else if (byte === 0xd9) {
      const size = reader.view.getUint8(reader.x + 1);
      if (size < 32) {
        const key = this.keyDecoder.decode(reader.uint8, reader.x + 2, size);
        reader.x += 2 + size;
        return key;
      }
    }
    reader.x++;
    switch (byte) {
      case 0xd9:
        return reader.utf8(reader.u8());
      case 0xda:
        return reader.utf8(reader.u16());
      case 0xdb:
        return reader.utf8(reader.u32());
      default:
        return '';
    }
  }

  /** @ignore */
  protected arr(size: number): unknown[] {
    const arr: unknown[] = [];
    for (let i = 0; i < size; i++) arr.push(this.readAny());
    return arr;
  }

  /** @ignore */
  protected ext(size: number): JsonPackExtension {
    const reader = this.reader;
    const type = reader.u8();
    const end = reader.x + size;
    const buf = reader.uint8.subarray(reader.x, end);
    reader.x = end;
    return new JsonPackExtension(type, buf);
  }

  protected back(bytes: number) {
    this.reader.x -= bytes;
  }
}
