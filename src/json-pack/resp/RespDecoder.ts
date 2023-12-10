import {Reader} from '../../util/buffers/Reader';
import {RESP} from './constants';
import sharedCachedUtf8Decoder from '../../util/buffers/utf8/sharedCachedUtf8Decoder';
import type {CachedUtf8Decoder} from '../../util/buffers/utf8/CachedUtf8Decoder';
import type {IReader, IReaderResettable} from '../../util/buffers';
import type {BinaryJsonDecoder, PackValue} from '../types';

export class RespDecoder<R extends IReader & IReaderResettable = IReader & IReaderResettable>
  implements BinaryJsonDecoder
{
  public constructor(
    public reader: R = new Reader() as any,
    protected readonly keyDecoder: CachedUtf8Decoder = sharedCachedUtf8Decoder,
  ) {}

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
      case RESP.STR_VERBATIM:
        return this.readStrVerbatim();
      case RESP.BOOL:
        return this.readBool();
      case RESP.NULL:
        return (reader.x += 2), null;
      case RESP.STR_BULK:
        return this.readStrBulk();
      case RESP.ARR:
        return this.readArr();
      case RESP.BIG:
        return this.readBigint();
      case RESP.SET:
        return this.readSet();
      case RESP.ERR_SIMPLE:
        return this.readErrSimple();
      case RESP.ERR_BULK:
        return this.readErrBulk();
    }
    throw new Error('UNKNOWN_TYPE');
  }

  public readMinorLen(minor: number): number {
    throw new Error('Not implemented');
  }

  protected readLength(): number {
    const reader = this.reader;
    const uint8 = reader.uint8;
    const x = reader.x;
    let number: number = 0;
    for (let i = x; ; i++) {
      const c = uint8[i];
      if (c === RESP.R) {
        reader.x = i + 2;
        return number;
      }
      number = number * 10 + (c - 48);
    }
  }

  // ------------------------------------------------------------------ Boolean

  public readBool(): boolean {
    const reader = this.reader;
    const x = reader.x;
    const c = reader.uint8[x];
    reader.x = x + 3;
    return c === 116; // t
  }

  // ------------------------------------------------------------------ Numbers

  public readInt(): number {
    const reader = this.reader;
    const uint8 = reader.uint8;
    let x = reader.x;
    let negative = false;
    let c = uint8[x];
    let number: number = 0;
    if (c === RESP.MINUS) {
      negative = true;
      x++;
    } else if (c === RESP.PLUS) x++;
    for (let i = x; ; i++) {
      c = uint8[i];
      if (c === RESP.R) {
        reader.x = i + 2; // Skip "\r\n".
        return negative ? -number : number;
      }
      number = number * 10 + (c - 48);
    }
  }

  public readFloat(): number {
    const reader = this.reader;
    const uint8 = reader.uint8;
    let x = reader.x;
    let c = uint8[x];
    for (let i = x; ; i++) {
      c = uint8[i];
      if (c === RESP.R) {
        const length = i - x;
        const str = reader.ascii(length);
        switch (length) {
          case 3:
            switch (str) {
              case 'inf':
                reader.x = i + 2; // Skip "\r\n".
                return Infinity;
              case 'nan':
                reader.x = i + 2; // Skip "\r\n".
                return NaN;
            }
            break;
          case 4:
            if (str === '-inf') {
              reader.x = i + 2; // Skip "\r\n".
              return -Infinity;
            }
            break;
        }
        reader.x = i + 2; // Skip "\r\n".
        return Number(str);
      }
    }
  }

  public readBigint(): bigint {
    const reader = this.reader;
    const uint8 = reader.uint8;
    let x = reader.x;
    let c = uint8[x];
    for (let i = x; ; i++) {
      c = uint8[i];
      if (c === RESP.R) {
        const str = reader.ascii(i - x);
        reader.x = i + 2; // Skip "\r\n".
        return BigInt(str);
      }
    }
  }

  // ----------------------------------------------------------- String reading

  public readStrSimple(): string {
    const reader = this.reader;
    const uint8 = reader.uint8;
    const x = reader.x;
    for (let i = x; i < uint8.length; i++) {
      if (uint8[i] !== RESP.R) continue;
      // if (uint8[i + 1] !== RESP.N) throw new Error('INVALID_STR');
      const str = reader.utf8(i - reader.x);
      reader.x = i + 2;
      return str;
    }
    throw new Error('INVALID_STR');
  }

  public readStrVerbatim(): string | Uint8Array {
    const reader = this.reader;
    const length = this.readLength();
    const encoding = reader.utf8(3);
    reader.x++; // Skip ":".
    if (encoding === 'txt') {
      const str = reader.utf8(length);
      reader.x += 2; // Skip "\r\n".
      return str;
    }
    const buf = reader.buf(length);
    reader.x += 2; // Skip "\r\n".
    return buf;
  }

  public readStrBulk(): Uint8Array {
    const reader = this.reader;
    const length = this.readLength();
    const buf = reader.buf(length);
    reader.x += 2; // Skip "\r\n".
    return buf;
  }

  // ------------------------------------------------------------ Error reading

  public readErrSimple(): Error {
    const reader = this.reader;
    const uint8 = reader.uint8;
    const x = reader.x;
    for (let i = x; i < uint8.length; i++) {
      if (uint8[i] !== RESP.R) continue;
      // if (uint8[i + 1] !== RESP.N) throw new Error('INVALID_STR');
      const message = reader.utf8(i - reader.x);
      reader.x = i + 2;
      return new Error(message);
    }
    throw new Error('INVALID_ERR');
  }

  public readErrBulk(): Error {
    const reader = this.reader;
    const length = this.readLength();
    const message = reader.utf8(length);
    reader.x += 2; // Skip "\r\n".
    return new Error(message);
  }

  // ------------------------------------------------------------ Array reading

  public readArr(): unknown[] {
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

  public readObj(minor: number): Record<string, unknown> {
    throw new Error('Not implemented');
  }

  public readObjIndef(): Record<string, unknown> {
    throw new Error('Not implemented');
  }

  public key(): string {
    throw new Error('Not implemented');
  }
}
