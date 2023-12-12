import {Reader} from '../../util/buffers/Reader';
import {RESP} from './constants';
import {RespAttributes, RespPush} from './extensions';
import type {IReader, IReaderResettable} from '../../util/buffers';
import type {BinaryJsonDecoder, PackValue} from '../types';
import {isUtf8} from '../../util/buffers/utf8/isUtf8';

export class RespDecoder<R extends IReader & IReaderResettable = IReader & IReaderResettable>
  implements BinaryJsonDecoder
{
  /**
   * When set to true, the decoder will attempt to decode RESP Bulk strings
   * (which are binary strings, i.e. Uint8Array) as UTF-8 strings. If the
   * string is not valid UTF-8, it will be returned as a Uint8Array.
   *
   * You can toggle this setting at any time, before each call to `decode()`
   * or `read()`, or other methods.
   */
  public tryUtf8 = false;

  public constructor(public reader: R = new Reader() as any) {}

  public read(uint8: Uint8Array): PackValue {
    this.reader.reset(uint8);
    return this.val() as PackValue;
  }

  /** @deprecated */
  public decode(uint8: Uint8Array): unknown {
    this.reader.reset(uint8);
    return this.val();
  }

  // -------------------------------------------------------- Any value reading

  public val(): unknown {
    const reader = this.reader;
    const type = reader.u8();
    switch (type) {
      case RESP.INT:
        return this.readInt();
      case RESP.FLOAT:
        return this.readFloat();
      case RESP.STR_SIMPLE:
        return this.readStrSimple();
      case RESP.STR_BULK:
        return this.readStrBulk();
      case RESP.BOOL:
        return this.readBool();
      case RESP.NULL:
        return reader.skip(2), null;
      case RESP.OBJ:
        return this.readObj();
      case RESP.ARR:
        return this.readArr();
      case RESP.STR_VERBATIM:
        return this.readStrVerbatim();
      case RESP.PUSH:
        return new RespPush(this.readArr() || []);
      case RESP.BIG:
        return this.readBigint();
      case RESP.SET:
        return this.readSet();
      case RESP.ERR_SIMPLE:
        return this.readErrSimple();
      case RESP.ERR_BULK:
        return this.readErrBulk();
      case RESP.ATTR:
        return new RespAttributes(this.readObj());
    }
    throw new Error('UNKNOWN_TYPE');
  }

  protected readLength(): number {
    const reader = this.reader;
    let number: number = 0;
    while (true) {
      const c = reader.u8();
      if (c === RESP.R) return reader.skip(1), number;
      number = number * 10 + (c - 48);
    }
  }

  // ---------------------------------------------------------- Boolean reading

  public readBool(): boolean {
    const reader = this.reader;
    const c = reader.u8();
    reader.skip(2); // Skip "\r\n".
    return c === 116; // t
  }

  // ----------------------------------------------------------- Number reading

  public readInt(): number {
    const reader = this.reader;
    let negative = false;
    let c = reader.u8();
    let number: number = 0;
    if (c === RESP.MINUS) {
      negative = true;
    } else if (c !== RESP.PLUS) number = c - 48;
    while (true) {
      c = reader.u8();
      if (c === RESP.R) {
        reader.skip(1); // Skip "\n".
        return negative ? -number : number;
      }
      number = number * 10 + (c - 48);
    }
  }

  public readFloat(): number {
    const reader = this.reader;
    const x = reader.x;
    while (true) {
      const c = reader.u8();
      if (c !== RESP.R) continue;
      const length = reader.x - x - 1;
      reader.x = x;
      const str = reader.ascii(length);
      switch (length) {
        case 3:
          switch (str) {
            case 'inf':
              return reader.skip(2), Infinity;
            case 'nan':
              return reader.skip(2), NaN;
          }
          break;
        case 4:
          if (str === '-inf') {
            return reader.skip(2), -Infinity;
          }
          break;
      }
      reader.skip(2); // Skip "\n".
      return Number(str);
    }
  }

  public readBigint(): bigint {
    const reader = this.reader;
    const x = reader.x;
    while (true) {
      const c = reader.u8();
      if (c !== RESP.R) continue;
      const length = reader.x - x;
      reader.x = x;
      const str = reader.ascii(length);
      reader.skip(1); // Skip "\n".
      return BigInt(str);
    }
  }

  // ----------------------------------------------------------- String reading

  public readStrSimple(): string {
    const reader = this.reader;
    const x = reader.x;
    while (true) {
      const c = reader.u8();
      if (c !== RESP.R) continue;
      const size = reader.x - x - 1;
      reader.x = x;
      const str = reader.utf8(size);
      reader.skip(2); // Skip "\r\n".
      return str;
    }
  }

  public readStrBulk(): Uint8Array | string | null {
    const reader = this.reader;
    if (reader.peak() === RESP.MINUS) {
      reader.skip(4); // Skip "-1\r\n".
      return null;
    }
    const length = this.readLength();
    let res: Uint8Array | string;
    if (this.tryUtf8 && isUtf8(reader.uint8, reader.x, length)) res = reader.utf8(length);
    else res = reader.buf(length);
    reader.skip(2); // Skip "\r\n".
    return res;
  }

  public readAsciiAsStrBulk(): string {
    const reader = this.reader;
    reader.skip(1); // Skip "$".
    const length = this.readLength();
    const buf = reader.ascii(length);
    reader.skip(2); // Skip "\r\n".
    return buf;
  }

  public readStrVerbatim(): string | Uint8Array {
    const reader = this.reader;
    const length = this.readLength();
    const u32 = reader.u32();
    const isTxt = u32 === 1954051130; // "txt:"
    if (isTxt) {
      const str = reader.utf8(length);
      reader.skip(2); // Skip "\r\n".
      return str;
    }
    const buf = reader.buf(length);
    reader.skip(2); // Skip "\r\n".
    return buf;
  }

  // ------------------------------------------------------------ Error reading

  public readErrSimple(): Error {
    const reader = this.reader;
    const x = reader.x;
    while (true) {
      const c = reader.u8();
      if (c !== RESP.R) continue;
      const size = reader.x - x - 1;
      reader.x = x;
      const str = reader.utf8(size);
      reader.skip(2); // Skip "\r\n".
      return new Error(str);
    }
  }

  public readErrBulk(): Error {
    const reader = this.reader;
    const length = this.readLength();
    const message = reader.utf8(length);
    reader.skip(2); // Skip "\r\n".
    return new Error(message);
  }

  // ------------------------------------------------------------ Array reading

  public readArr(): unknown[] | null {
    const reader = this.reader;
    const c = reader.peak();
    if (c === RESP.MINUS) {
      reader.skip(4); // Skip "-1\r\n".
      return null;
    }
    const length = this.readLength();
    const arr: unknown[] = [];
    for (let i = 0; i < length; i++) arr.push(this.val());
    return arr;
  }

  public readSet(): Set<unknown> {
    const length = this.readLength();
    const set = new Set();
    for (let i = 0; i < length; i++) set.add(this.val());
    return set;
  }

  // ----------------------------------------------------------- Object reading

  public readObj(): Record<string, unknown> {
    const length = this.readLength();
    const obj: Record<string, unknown> = {};
    for (let i = 0; i < length; i++) {
      const key = this.val() + '';
      obj[key] = this.val();
    }
    return obj;
  }
}
