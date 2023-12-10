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
      case RESP.STR_SIMPLE: return this.readStrSimple();
      case RESP.STR_VERBATIM: return this.readStrVerbatim();
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
    for (let i = x;; i++) {
      const c = uint8[i];
      if (c === RESP.R) {
        reader.x = i + 2;
        return number;
      }
      number = (number * 10) + (c - 48);
    }
  }

  // ----------------------------------------------------- Unsigned int reading

  public readUint(minor: number): number | bigint {
    throw new Error('Not implemented');
  }

  // ----------------------------------------------------- Negative int reading

  public readNint(minor: number): number | bigint {
    throw new Error('Not implemented');
  }

  // ----------------------------------------------------------- Binary reading

  public readBin(minor: number): Uint8Array {
    throw new Error('Not implemented');
  }

  public readBinChunk(): Uint8Array {
    throw new Error('Not implemented');
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

  // ------------------------------------------------------------ Array reading

  public readArr(minor: number): unknown[] {
    throw new Error('Not implemented');
  }

  public readArrRaw(length: number): unknown[] {
    throw new Error('Not implemented');
  }

  public readArrIndef(): unknown[] {
    throw new Error('Not implemented');
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
