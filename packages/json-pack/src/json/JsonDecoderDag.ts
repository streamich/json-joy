import {JsonDecoder} from './JsonDecoder';
import {findEndingQuote} from './util';
import type {PackValue} from '../types';
import {createFromBase64Bin} from '@jsonjoy.com/base64/lib/createFromBase64Bin';

export const fromBase64Bin = createFromBase64Bin(undefined, '');

export class JsonDecoderDag extends JsonDecoder {
  public readObj(): PackValue | Record<string, PackValue> | Uint8Array | unknown {
    const bytes = this.tryReadBytes();
    if (bytes) return bytes;
    const cid = this.tryReadCid();
    if (cid) return cid;
    return super.readObj();
  }

  protected tryReadBytes(): Uint8Array | undefined {
    const reader = this.reader;
    const x = reader.x;
    if (reader.u8() !== 0x7b) {
      // {
      reader.x = x;
      return;
    }
    this.skipWhitespace();
    if (reader.u8() !== 0x22 || reader.u8() !== 0x2f || reader.u8() !== 0x22) {
      // "/"
      reader.x = x;
      return;
    }
    this.skipWhitespace();
    if (reader.u8() !== 0x3a) {
      // :
      reader.x = x;
      return;
    }
    this.skipWhitespace();
    if (reader.u8() !== 0x7b) {
      // {
      reader.x = x;
      return;
    }
    this.skipWhitespace();
    if (
      reader.u8() !== 0x22 ||
      reader.u8() !== 0x62 ||
      reader.u8() !== 0x79 ||
      reader.u8() !== 0x74 ||
      reader.u8() !== 0x65 ||
      reader.u8() !== 0x73 ||
      reader.u8() !== 0x22
    ) {
      // "bytes"
      reader.x = x;
      return;
    }
    this.skipWhitespace();
    if (reader.u8() !== 0x3a) {
      // :
      reader.x = x;
      return;
    }
    this.skipWhitespace();
    if (reader.u8() !== 0x22) {
      // "
      reader.x = x;
      return;
    }
    const bufStart = reader.x;
    const bufEnd = findEndingQuote(reader.uint8, bufStart);
    reader.x = 1 + bufEnd;
    this.skipWhitespace();
    if (reader.u8() !== 0x7d) {
      // }
      reader.x = x;
      return;
    }
    this.skipWhitespace();
    if (reader.u8() !== 0x7d) {
      // }
      reader.x = x;
      return;
    }
    const bin = fromBase64Bin(reader.view, bufStart, bufEnd - bufStart);
    return bin;
  }

  protected tryReadCid(): undefined | unknown {
    const reader = this.reader;
    const x = reader.x;
    if (reader.u8() !== 0x7b) {
      // {
      reader.x = x;
      return;
    }
    this.skipWhitespace();
    if (reader.u8() !== 0x22 || reader.u8() !== 0x2f || reader.u8() !== 0x22) {
      // "/"
      reader.x = x;
      return;
    }
    this.skipWhitespace();
    if (reader.u8() !== 0x3a) {
      // :
      reader.x = x;
      return;
    }
    this.skipWhitespace();
    if (reader.u8() !== 0x22) {
      // "
      reader.x = x;
      return;
    }
    const bufStart = reader.x;
    const bufEnd = findEndingQuote(reader.uint8, bufStart);
    reader.x = 1 + bufEnd;
    this.skipWhitespace();
    if (reader.u8() !== 0x7d) {
      // }
      reader.x = x;
      return;
    }
    const finalX = reader.x;
    reader.x = bufStart;
    const cid = reader.ascii(bufEnd - bufStart);
    reader.x = finalX;
    return this.readCid(cid);
  }

  public readCid(cid: string): unknown {
    return cid;
  }
}
