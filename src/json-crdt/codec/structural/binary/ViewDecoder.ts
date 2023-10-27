import {CrdtReader} from '../../../../json-crdt-patch/util/binary/CrdtDecoder';
import {MsgPackDecoderFast} from '../../../../json-pack/msgpack';

export class ViewDecoder extends MsgPackDecoderFast<CrdtReader> {
  protected time: number = -1;

  constructor() {
    super(new CrdtReader());
  }

  public decode(data: Uint8Array): unknown {
    const reader = this.reader;
    this.time = -1;
    reader.reset(data);
    const isServerTime = reader.u8() === 0;
    if (isServerTime) {
      this.time = reader.vu57();
    } else {
      reader.x += 4;
    }
    return this.cRoot();
  }

  protected ts(): any {
    if (this.time < 0) this.reader.idSkip();
    else this.reader.vu57Skip();
  }

  protected cRoot(): unknown {
    const reader = this.reader;
    const peek = reader.uint8[reader.x];
    return !peek ? undefined : this.cNode();
  }

  public cNode(): unknown {
    const reader = this.reader;
    this.ts();
    const byte = reader.u8();
    if (byte <= 0b10001111) return this.cObj(byte & 0b1111);
    else if (byte <= 0b10011111) return this.cArr(byte & 0b1111);
    else if (byte <= 0b10111111) return this.cStr(byte & 0b11111);
    else {
      switch (byte) {
        case 0xc4:
          return this.cBin(reader.u8());
        case 0xc5:
          return this.cBin(reader.u16());
        case 0xc6:
          return this.cBin(reader.u32());
        case 0xd4:
          return this.val();
        case 0xd5:
          return null;
        case 0xd6:
          return this.cNode();
        case 0xde:
          return this.cObj(reader.u16());
        case 0xdf:
          return this.cObj(reader.u32());
        case 0xdc:
          return this.cArr(reader.u16());
        case 0xdd:
          return this.cArr(reader.u32());
        case 0xd9:
          return this.cStr(reader.u8());
        case 0xda:
          return this.cStr(reader.u16());
        case 0xdb:
          return this.cStr(reader.u32());
        case 0xc7:
          return this.cTup();
      }
    }
    return undefined;
  }

  public cObj(length: number): Record<string, unknown> {
    const obj: Record<string, unknown> = {};
    for (let i = 0; i < length; i++) {
      const key: string = this.key();
      const value = this.cNode();
      if (value !== undefined) obj[key] = value;
    }
    return obj;
  }

  public cTup(): unknown[] {
    const reader = this.reader;
    const length = this.reader.u8();
    reader.x++;
    const obj: unknown[] = [];
    for (let i = 0; i < length; i++) {
      const octet = reader.peak();
      if (!octet) {
        reader.x++;
        obj.push(undefined);
      } else obj.push(this.cNode());
    }
    return obj;
  }

  public cArr(length: number): unknown[] {
    const arr: unknown[] = [];
    for (let i = 0; i < length; i++) {
      const values = this.cArrChunk();
      if (values && values.length) arr.push(...values);
    }
    return arr;
  }

  private cArrChunk(): unknown[] | undefined {
    const [deleted, length] = this.reader.b1vu28();
    this.ts();
    if (deleted) {
      return undefined;
    } else {
      const values: unknown[] = [];
      for (let i = 0; i < length; i++) values.push(this.cNode());
      return values;
    }
  }

  public cStr(length: number): string {
    const reader = this.reader;
    let str = '';
    for (let i = 0; i < length; i++) {
      this.ts();
      const isTombstone = reader.uint8[reader.x] === 0;
      if (isTombstone) {
        reader.x++;
        reader.vu39Skip();
        continue;
      }
      const text: string = this.val() as string;
      str += text;
    }
    return str;
  }

  public cBin(length: number): Uint8Array {
    const reader = this.reader;
    const buffers: Uint8Array[] = [];
    let totalLength = 0;
    for (let i = 0; i < length; i++) {
      const [deleted, length] = reader.b1vu28();
      this.ts();
      if (deleted) continue;
      buffers.push(reader.buf(length));
      totalLength += length;
    }
    const res = new Uint8Array(totalLength);
    let offset = 0;
    for (let i = 0; i < buffers.length; i++) {
      const byteLength = buffers[i].length;
      res.set(buffers[i], offset);
      offset += byteLength;
    }
    return res;
  }
}
