import type {IWriter, IWriterGrowable} from '@jsonjoy.com/buffers/lib';
import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import type {JsonPackExtension} from '../JsonPackExtension';
import type {BinaryJsonEncoder, TlvBinaryJsonEncoder} from '../types';
import type {IMessagePackEncoder} from './types';

/**
 * @category Encoder
 */
export class MsgPackEncoderFast<W extends IWriter & IWriterGrowable = IWriter & IWriterGrowable>
  implements IMessagePackEncoder, BinaryJsonEncoder, TlvBinaryJsonEncoder
{
  constructor(public readonly writer: W = new Writer() as any) {}

  /**
   * Use this method to encode a JavaScript document into MessagePack format.
   *
   * @param json JSON value to encode.
   * @returns Encoded memory buffer with MessagePack contents.
   */
  public encode(json: unknown): Uint8Array {
    this.writer.reset();
    this.writeAny(json);
    return this.writer.flush();
  }

  /** @deprecated */
  public encodeAny(json: unknown): void {
    this.writeAny(json);
  }

  public writeAny(value: unknown): void {
    switch (value) {
      case null:
        return this.writer.u8(0xc0);
      case false:
        return this.writer.u8(0xc2);
      case true:
        return this.writer.u8(0xc3);
    }
    if (value instanceof Array) return this.writeArr(value);
    switch (typeof value) {
      case 'number':
        return this.writeNumber(value);
      case 'string':
        return this.writeStr(value);
      case 'object':
        return this.writeObj(value as Record<string, unknown>);
    }
  }

  /** @deprecated */
  protected encodeFloat64(num: number): void {
    this.writeFloat(num);
  }

  public writeNull(): void {
    return this.writer.u8(0xc0);
  }

  public writeFloat(float: number): void {
    this.writer.u8f64(0xcb, float);
  }

  public u32(num: number): void {
    const writer = this.writer;
    this.writer.ensureCapacity(5);
    const uint8 = writer.uint8;
    if (num <= 0b1111111) {
      uint8[writer.x++] = num;
      // Commenting this out improves performance, there is not much space savings.
      // } else if (num <= 0xff) {
      //   uint8[writer.x++] = 0xcc;
      //   uint8[writer.x++] = num;
    } else if (num <= 0xffff) {
      uint8[writer.x++] = 0xcd;
      writer.view.setUint16(writer.x, num);
      writer.x += 2;
    } else if (num <= 0xffffffff) {
      uint8[writer.x++] = 0xce;
      writer.view.setUint32(writer.x, num);
      writer.x += 4;
    } else this.writeFloat(num);
  }

  public n32(num: number): void {
    const writer = this.writer;
    this.writer.ensureCapacity(5);
    const uint8 = writer.uint8;
    if (num >= -0x20) {
      uint8[writer.x++] = 0x100 + num;
      // Commenting this out improves performance, there is not much space savings.
      // } else if (num >= -0x80) {
      //   uint8[writer.x++] = 0xd0;
      //   uint8[writer.x++] = num + 0x100;
    } else if (num >= -0x8000) {
      uint8[writer.x++] = 0xd1;
      writer.view.setInt16(writer.x, num);
      writer.x += 2;
    } else if (num >= -0x80000000) {
      uint8[writer.x++] = 0xd2;
      writer.view.setInt32(writer.x, num);
      writer.x += 4;
    } else this.writeFloat(num);
  }

  /** @deprecated */
  public encodeNumber(num: number): void {
    this.writeNumber(num);
  }

  public writeNumber(num: number): void {
    if (num >>> 0 === num) return this.u32(num);
    if (num >> 0 === num) return this.n32(num);
    this.writeFloat(num);
  }

  public writeInteger(int: number): void {
    if (int >= 0)
      if (int <= 0xffffffff) return this.u32(int);
      else if (int > -0x80000000) return this.n32(int);
    this.writeFloat(int);
  }

  public writeUInteger(uint: number): void {
    if (uint <= 0xffffffff) return this.u32(uint);
    this.writeFloat(uint);
  }

  public encodeNull(): void {
    this.writer.u8(0xc0);
  }

  public encodeTrue(): void {
    this.writer.u8(0xc3);
  }

  public encodeFalse(): void {
    this.writer.u8(0xc2);
  }

  /** @deprecated */
  public encodeBoolean(bool: boolean): void {
    this.writeBoolean(bool);
  }

  public writeBoolean(bool: boolean): void {
    if (bool) this.writer.u8(0xc3);
    else this.writer.u8(0xc2);
  }

  /** @deprecated */
  public encodeStringHeader(length: number): void {
    this.writeStrHdr(length);
  }

  public writeStrHdr(length: number): void {
    if (length <= 0b11111) this.writer.u8(0b10100000 | length);
    else if (length <= 0xff) this.writer.u16(0xd900 + length);
    else if (length <= 0xffff) this.writer.u8u16(0xda, length);
    else this.writer.u8u32(0xdb, length);
  }

  /** @deprecated */
  public encodeString(str: string) {
    this.writeStr(str);
  }

  public writeStr(str: string): void {
    const writer = this.writer;
    const length = str.length;
    const maxSize = length * 4;
    writer.ensureCapacity(5 + maxSize);
    const uint8 = writer.uint8;
    let lengthOffset: number = writer.x;
    if (maxSize <= 0b11111) writer.x++;
    else if (maxSize <= 0xff) {
      uint8[writer.x++] = 0xd9;
      lengthOffset = writer.x;
      writer.x++;
    } else if (maxSize <= 0xffff) {
      uint8[writer.x++] = 0xda;
      lengthOffset = writer.x;
      writer.x += 2;
    } else {
      uint8[writer.x++] = 0xdb;
      lengthOffset = writer.x;
      writer.x += 4;
    }
    const bytesWritten = this.writer.utf8(str);
    if (maxSize <= 0b11111) uint8[lengthOffset] = 0b10100000 | bytesWritten;
    else if (maxSize <= 0xff) uint8[lengthOffset] = bytesWritten;
    else if (maxSize <= 0xffff) writer.view.setUint16(lengthOffset, bytesWritten);
    else writer.view.setUint32(lengthOffset, bytesWritten);
  }

  /** @deprecated */
  public encodeAsciiString(str: string) {
    this.writeAsciiStr(str);
  }

  public writeAsciiStr(str: string): void {
    this.writeStrHdr(str.length);
    this.writer.ascii(str);
  }

  /** @deprecated */
  public encodeArrayHeader(length: number): void {
    this.writeArrHdr(length);
  }

  /** @deprecated */
  public encodeArray(arr: unknown[]): void {
    this.writeArr(arr);
  }

  public writeArrHdr(length: number): void {
    if (length <= 0b1111) this.writer.u8(0b10010000 | length);
    else if (length <= 0xffff) this.writer.u8u16(0xdc, length);
    else if (length <= 0xffffffff) this.writer.u8u32(0xdd, length);
  }

  public writeArr(arr: unknown[]): void {
    const length = arr.length;
    if (length <= 0b1111) this.writer.u8(0b10010000 | length);
    else if (length <= 0xffff) this.writer.u8u16(0xdc, length);
    else if (length <= 0xffffffff) this.writer.u8u32(0xdd, length);
    // else return;
    for (let i = 0; i < length; i++) this.writeAny(arr[i]);
  }

  /** @deprecated */
  public encodeObjectHeader(length: number): void {
    this.writeObjHdr(length);
  }

  /** @deprecated */
  public encodeObject(obj: Record<string, unknown>): void {
    this.writeObj(obj);
  }

  public writeObjHdr(length: number): void {
    if (length <= 0b1111) this.writer.u8(0b10000000 | length);
    else if (length <= 0xffff) {
      this.writer.u8u16(0xde, length);
    } else if (length <= 0xffffffff) {
      this.writer.u8u32(0xdf, length);
    }
  }

  public writeObj(obj: Record<string, unknown>): void {
    const keys = Object.keys(obj);
    const length = keys.length;
    this.writeObjHdr(length);
    for (let i = 0; i < length; i++) {
      const key = keys[i];
      this.writeStr(key);
      this.writeAny(obj[key]);
    }
  }

  public encodeExtHeader(type: number, length: number) {
    switch (length) {
      case 1:
        this.writer.u16((0xd4 << 8) | type);
        break;
      case 2:
        this.writer.u16((0xd5 << 8) | type);
        break;
      case 4:
        this.writer.u16((0xd6 << 8) | type);
        break;
      case 8:
        this.writer.u16((0xd7 << 8) | type);
        break;
      case 16:
        this.writer.u16((0xd8 << 8) | type);
        break;
      default:
        if (length <= 0xff) {
          this.writer.u16((0xc7 << 8) | length);
          this.writer.u8(type);
        } else if (length <= 0xffff) {
          this.writer.u8u16(0xc8, length);
          this.writer.u8(type);
        } else if (length <= 0xffffffff) {
          this.writer.u8u32(0xc9, length);
          this.writer.u8(type);
        }
    }
  }

  public encodeExt(ext: JsonPackExtension): void {
    const {tag: type, val: buf} = ext;
    const length = buf.length;
    this.encodeExtHeader(type, length);
    this.writer.buf(buf, length);
  }

  /** @deprecated */
  public encodeBinaryHeader(length: number): void {
    this.writeBinHdr(length);
  }

  /** @deprecated */
  public encodeBinary(buf: Uint8Array): void {
    this.writeBin(buf);
  }

  public writeBinHdr(length: number): void {
    if (length <= 0xff) this.writer.u16((0xc4 << 8) | length);
    else if (length <= 0xffff) {
      this.writer.u8u16(0xc5, length);
    } else if (length <= 0xffffffff) {
      this.writer.u8u32(0xc6, length);
    }
  }

  public writeBin(buf: Uint8Array): void {
    const length = buf.length;
    this.writeBinHdr(length);
    this.writer.buf(buf, length);
  }
}
