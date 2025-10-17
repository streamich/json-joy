import {JsonPackValue} from '.';
import {MsgPackDecoderFast} from './MsgPackDecoderFast';
import type {Path} from '@jsonjoy.com/json-pointer';
import type {Reader} from '@jsonjoy.com/buffers/lib/Reader';

/**
 * @category Decoder
 */
export class MsgPackDecoder extends MsgPackDecoderFast<Reader> {
  // ---------------------------------------------------------- Skipping values

  /**
   * Skips a whole JSON value and returns back the number of bytes
   * that value consumed.
   */
  public skipAny(): number {
    const byte = this.reader.u8();
    if (byte >= 0xe0) return 1; // 0xe0
    if (byte <= 0xbf) {
      if (byte < 0x90) {
        if (byte <= 0b1111111) return 1; // 0x7f
        return 1 + this.skipObj(byte & 0b1111); // 0x80, obj(1)
      } else {
        if (byte < 0xa0) return 1 + this.skipArr(byte & 0b1111);
        // 0x90
        else return 1 + this.skip(byte & 0b11111); // 0xa0, str(1)
      }
    }
    if (byte <= 0xd0) {
      if (byte <= 0xc8) {
        if (byte <= 0xc4) {
          if (byte <= 0xc2) return byte === 0xc2 ? 1 : 1;
          else return byte === 0xc4 ? 2 + this.skip(this.reader.u8()) : 1;
        } else {
          if (byte <= 0xc6) return byte === 0xc6 ? 5 + this.skip(this.reader.u32()) : 3 + this.skip(this.reader.u16());
          else return byte === 0xc8 ? 4 + this.skip(this.reader.u16()) : 3 + this.skip(this.reader.u8());
        }
      } else {
        return byte <= 0xcc
          ? byte <= 0xca
            ? byte === 0xca
              ? 1 + this.skip(4) // f32
              : 1 + 1 + 4 + this.skip(this.reader.u32()) // ext32
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
          return 2 + this.skip(this.reader.u8()); // str8
        case 0xda:
          return 3 + this.skip(this.reader.u16()); // str16
        case 0xdb:
          return 5 + this.skip(this.reader.u32()); // str32
        case 0xdc:
          return 3 + this.skipArr(this.reader.u16());
        case 0xdd:
          return 5 + this.skipArr(this.reader.u32());
        case 0xde:
          return 3 + this.skipObj(this.reader.u16());
        case 0xdf:
          return 5 + this.skipObj(this.reader.u32());
      }
    }
    return 1;
  }

  /** @ignore */
  protected skipArr(size: number): number {
    let length = 0;
    for (let i = 0; i < size; i++) length += this.skipAny();
    return length;
  }

  /** @ignore */
  protected skipObj(size: number): number {
    let length = 0;
    for (let i = 0; i < size; i++) {
      length += this.skipAny() + this.skipAny();
    }
    return length;
  }

  // -------------------------------------------------------- One level reading

  public readLevel(uint8: Uint8Array): unknown {
    this.reader.reset(uint8);
    return this.valOneLevel();
  }

  protected valOneLevel(): unknown {
    const byte = this.reader.view.getUint8(this.reader.x);
    const isMap = byte === 0xde || byte === 0xdf || byte >> 4 === 0b1000;
    if (isMap) {
      this.reader.x++;
      const size = byte === 0xde ? this.reader.u16() : byte === 0xdf ? this.reader.u32() : byte & 0b1111;
      const obj: Record<string, unknown> = {};
      for (let i = 0; i < size; i++) {
        const key = this.key();
        obj[key] = this.primitive();
      }
      return obj;
    }
    const isArray = byte === 0xdc || byte === 0xdd || byte >> 4 === 0b1001;
    if (isArray) {
      this.reader.x++;
      const size = byte === 0xdc ? this.reader.u16() : byte === 0xdd ? this.reader.u32() : byte & 0b1111;
      const arr: unknown[] = [];
      for (let i = 0; i < size; i++) arr.push(this.primitive());
      return arr;
    }
    return this.readAny();
  }

  /**
   * @ignore
   * @returns Returns a primitive value or {@link JsonPackValue} object, if the value
   *          is a "map" or an "arr".
   */
  protected primitive(): unknown {
    const reader = this.reader;
    const byte = reader.view.getUint8(reader.x);
    const isMapOrArray = byte === 0xde || byte === 0xdf || byte === 0xdc || byte === 0xdd || byte >> 5 === 0b100;
    if (isMapOrArray) {
      const length = this.skipAny();
      reader.x -= length;
      const buf = reader.buf(length);
      return new JsonPackValue(buf);
    }
    return this.readAny();
  }

  protected skip(length: number): number {
    this.reader.x += length;
    return length;
  }

  // --------------------------------------------------------------- Validation

  /**
   * Throws if at given offset in a buffer there is an invalid MessagePack
   * value, or if the value does not span the exact length specified in `size`.
   * I.e. throws if:
   *
   * - The value is not a valid MessagePack value.
   * - The value is shorter than `size`.
   * - The value is longer than `size`.
   *
   * @param value Buffer in which to validate MessagePack value.
   * @param offset Offset at which the value starts.
   * @param size Expected size of the value.
   */
  public validate(value: Uint8Array, offset: number = 0, size: number = value.length): void {
    this.reader.reset(value);
    this.reader.x = offset;
    const start = offset;
    this.skipAny();
    const end = this.reader.x;
    if (end - start !== size) throw new Error('INVALID_SIZE');
  }

  // ---------------------------------------------------------- Shallow reading

  public readObjHdr(): number {
    const reader = this.reader;
    const byte = reader.u8();
    const isFixMap = byte >> 4 === 0b1000;
    if (isFixMap) return byte & 0b1111;
    switch (byte) {
      case 0xde:
        return reader.u16();
      case 0xdf:
        return reader.u32();
    }
    throw new Error('NOT_OBJ');
  }

  public readStrHdr(): number {
    const reader = this.reader;
    const byte = reader.u8();
    if (byte >> 5 === 0b101) return byte & 0b11111;
    switch (byte) {
      case 0xd9:
        return reader.u8();
      case 0xda:
        return reader.u16();
      case 0xdb:
        return reader.u32();
    }
    throw new Error('NOT_STR');
  }

  public findKey(key: string): this {
    const size = this.readObjHdr();
    for (let i = 0; i < size; i++) {
      const k = this.key();
      if (k === key) return this;
      this.skipAny();
    }
    throw new Error('KEY_NOT_FOUND');
  }

  public readArrHdr(): number {
    const reader = this.reader;
    const byte = reader.u8();
    const isFixArr = byte >> 4 === 0b1001;
    if (isFixArr) return byte & 0b1111;
    switch (byte) {
      case 0xdc:
        return this.reader.u16();
      case 0xdd:
        return this.reader.u32();
    }
    throw new Error('NOT_ARR');
  }

  public findIndex(index: number): this {
    const size = this.readArrHdr();
    if (index >= size) throw new Error('INDEX_OUT_OF_BOUNDS');
    for (let i = 0; i < index; i++) this.skipAny();
    return this;
  }

  public find(path: Path): this {
    for (let i = 0; i < path.length; i++) {
      const segment = path[i];
      if (typeof segment === 'string') this.findKey(segment);
      else this.findIndex(segment);
    }
    return this;
  }
}
