import {Encoder as BaseEncoder} from '../../util/encoder';
import {JsonPackExtension} from '../JsonPackExtension';
import {IMessagePackEncoder} from './types';

const isSafeInteger = Number.isSafeInteger;

/**
 * @category Encoder
 */
export class Encoder extends BaseEncoder implements IMessagePackEncoder {
  /**
   * Use this method to encode a JavaScript document into MessagePack format.
   *
   * @param json JSON value to encode.
   * @returns Encoded memory buffer with MessagePack contents.
   */
  public encode(json: unknown): Uint8Array {
    this.reset();
    this.encodeAny(json);
    return this.flush();
  }

  public encodeAny(json: unknown): void {
    switch (json) {
      case null:
        return this.u8(0xc0);
      case false:
        return this.u8(0xc2);
      case true:
        return this.u8(0xc3);
    }
    if (json instanceof Array) return this.encodeArray(json);
    switch (typeof json) {
      case 'number':
        return this.encodeNumber(json);
      case 'string':
        return this.encodeString(json);
      case 'object':
        return this.encodeObject(json as Record<string, unknown>);
    }
  }

  public encodeNumber(num: number) {
    if (isSafeInteger(num)) {
      if (num >= 0) {
        if (num <= 0b1111111) return this.u8(num);
        if (num <= 0xff) return this.u16((0xcc << 8) | num);
        else if (num <= 0xffff) {
          this.ensureCapacity(3);
          this.uint8[this.offset++] = 0xcd;
          this.uint8[this.offset++] = num >>> 8;
          this.uint8[this.offset++] = num & 0xff;
          return;
        } else if (num <= 0xffffffff) {
          this.ensureCapacity(5);
          this.uint8[this.offset++] = 0xce;
          this.view.setUint32(this.offset, num);
          this.offset += 4;
          return;
        }
      } else {
        if (num >= -0b100000) return this.u8(0b11100000 | (num + 0x20));
        else if (num > -0x7fff) {
          this.ensureCapacity(3);
          this.uint8[this.offset++] = 0xd1;
          this.view.setInt16(this.offset, num);
          this.offset += 2;
          return;
        } else if (num > -0x7fffffff) {
          this.ensureCapacity(5);
          this.uint8[this.offset++] = 0xd2;
          this.view.setInt32(this.offset, num);
          this.offset += 4;
          return;
        }
      }
    }
    this.ensureCapacity(9);
    this.uint8[this.offset++] = 0xcb;
    this.view.setFloat64(this.offset, num);
    this.offset += 8;
  }

  public encodeNull(): void {
    this.u8(0xc0);
  }

  public encodeTrue(): void {
    this.u8(0xc3);
  }

  public encodeFalse(): void {
    this.u8(0xc2);
  }

  public encodeBoolean(bool: boolean): void {
    switch (bool) {
      case false: return this.encodeFalse();
      case true: return this.encodeTrue();
    }
  }

  public encodeStringHeader(length: number): void {
    if (length <= 0b11111) this.u8(0b10100000 | length);
    else if (length <= 0xff) {
      this.u8(0xd9);
      this.u8(length);
    } else if (length <= 0xffff) {
      this.u8(0xda);
      this.u16(length);
    } else if (length <= 0xffffffff) {
      this.u8(0xdb);
      this.u32(length);
    }
  }

  public encodeString(str: string) {
    const length = str.length;
    const maxSize = length * 4;
    this.ensureCapacity(5 + maxSize);
    const uint8 = this.uint8;
    let lengthOffset: number = this.offset;
    if (maxSize <= 0b11111) this.offset++;
    else if (maxSize <= 0xff) {
      uint8[this.offset++] = 0xd9;
      lengthOffset = this.offset;
      this.offset++;
    } else if (maxSize <= 0xffff) {
      uint8[this.offset++] = 0xda;
      lengthOffset = this.offset;
      this.offset += 2;
    } else {
      uint8[this.offset++] = 0xdb;
      lengthOffset = this.offset;
      this.offset += 4;
    }
    let offset = this.offset;
    let pos = 0;
    while (pos < length) {
      let value = str.charCodeAt(pos++);
      if ((value & 0xffffff80) === 0) {
        uint8[offset++] = value;
        continue;
      } else if ((value & 0xfffff800) === 0) {
        uint8[offset++] = ((value >> 6) & 0x1f) | 0xc0;
      } else {
        if (value >= 0xd800 && value <= 0xdbff) {
          if (pos < length) {
            const extra = str.charCodeAt(pos);
            if ((extra & 0xfc00) === 0xdc00) {
              pos++;
              value = ((value & 0x3ff) << 10) + (extra & 0x3ff) + 0x10000;
            }
          }
        }
        if ((value & 0xffff0000) === 0) {
          uint8[offset++] = ((value >> 12) & 0x0f) | 0xe0;
          uint8[offset++] = ((value >> 6) & 0x3f) | 0x80;
        } else {
          uint8[offset++] = ((value >> 18) & 0x07) | 0xf0;
          uint8[offset++] = ((value >> 12) & 0x3f) | 0x80;
          uint8[offset++] = ((value >> 6) & 0x3f) | 0x80;
        }
      }
      uint8[offset++] = (value & 0x3f) | 0x80;
    }
    this.offset = offset;
    if (maxSize <= 0b11111) uint8[lengthOffset] = 0b10100000 | (offset - lengthOffset - 1);
    else if (maxSize <= 0xff) uint8[lengthOffset] = offset - lengthOffset - 1;
    else if (maxSize <= 0xffff) this.view.setUint16(lengthOffset, offset - lengthOffset - 2);
    else this.view.setUint32(lengthOffset, offset - lengthOffset - 4);
  }

  public encodeArrayHeader(length: number): void {
    if (length <= 0b1111) this.u8(0b10010000 | length);
    else if (length <= 0xffff) {
      this.u8(0xdc);
      this.u16(length);
    } else if (length <= 0xffffffff) {
      this.u8(0xdd);
      this.u32(length);
    }
  }

  public encodeArray(arr: unknown[]): void {
    const length = arr.length;
    if (length <= 0b1111) this.u8(0b10010000 | length);
    else if (length <= 0xffff) {
      this.u8(0xdc);
      this.u16(length);
    } else if (length <= 0xffffffff) {
      this.u8(0xdd);
      this.u32(length);
    } else return;
    for (let i = 0; i < length; i++) this.encodeAny(arr[i]);
  }

  public encodeObjectHeader(length: number): void {
    if (length <= 0b1111) this.u8(0b10000000 | length);
    else if (length <= 0xffff) {
      this.u8(0xde);
      this.u16(length);
    } else if (length <= 0xffffffff) {
      this.u8(0xdf);
      this.u32(length);
    }
  }

  public encodeObject(obj: Record<string, unknown>): void {
    const keys = Object.keys(obj);
    const length = keys.length;
    this.encodeObjectHeader(length);
    for (let i = 0; i < length; i++) {
      const key = keys[i];
      this.encodeString(key);
      this.encodeAny(obj[key]);
    }
  }

  public buf(buf: Uint8Array, length: number): void {
    this.ensureCapacity(length);
    this.uint8.set(buf, this.offset);
    this.offset += length;
  }

  public encodeExtHeader(type: number, length: number) {
    switch (length) {
      case 1:
        this.u16((0xd4 << 8) | type);
        break;
      case 2:
        this.u16((0xd5 << 8) | type);
        break;
      case 4:
        this.u16((0xd6 << 8) | type);
        break;
      case 8:
        this.u16((0xd7 << 8) | type);
        break;
      case 16:
        this.u16((0xd8 << 8) | type);
        break;
      default:
        if (length <= 0xff) {
          this.u16((0xc7 << 8) | length);
          this.u8(type);
        } else if (length <= 0xffff) {
          this.u8(0xc8);
          this.u16(length);
          this.u8(type);
        } else if (length <= 0xffffffff) {
          this.u8(0xc9);
          this.u32(length);
          this.u8(type);
        }
    }
  }

  public encodeExt(ext: JsonPackExtension): void {
    const {type, buf} = ext;
    const length = buf.byteLength;
    this.encodeExtHeader(type, length);
    this.buf(buf, length);
  }

  /** @ignore */
  protected encodeBinary(buf: Uint8Array): void {
    const length = buf.byteLength;
    if (length <= 0xff) this.u16((0xc4 << 8) | length);
    else if (length <= 0xffff) {
      this.u8(0xc5);
      this.u16(length);
    } else if (length <= 0xffffffff) {
      this.u8(0xc6);
      this.u32(length);
    }
    this.buf(buf, length);
  }
}
