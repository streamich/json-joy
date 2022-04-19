import {CrdtDecoder} from '../../../json-crdt-patch/util/binary/CrdtDecoder';

export class ViewDecoder extends CrdtDecoder {
  protected literals?: unknown[];
  protected time: number = -1;

  public decode(data: Uint8Array): unknown {
    this.time = -1;
    this.reset(data);
    const [isServerTime, x] = this.b1vuint56();
    if (isServerTime) {
      this.time = x;
    } else {
      this.decodeClockTable(x);
    }
    this.literals = this.val() as unknown[];
    if (!(this.literals instanceof Array)) throw new Error('INVALID_LITERALS');
    return this.decodeRoot();
  }

  protected decodeClockTable(length: number): void {
    this.uint53vuint39();
    for (let i = 1; i < length; i++) this.uint53vuint39();
  }

  protected ts(): any {
    if (this.time < 0) {
      this.id();
    } else {
      const [isServerTime] = this.b1vuint56();
      if (isServerTime) {
        // ...
      } else {
        this.vuint57();
      }
    }
  }

  protected decodeRoot(): unknown {
    this.ts();
    return this.decodeNode();
  }

  public decodeNode(): unknown {
    const byte = this.u8();
    if (byte < 0b10000000) return this.createConst(byte);
    else if (byte <= 0b10001111) return this.decodeObj(byte & 0b1111);
    else if (byte <= 0b10011111) return this.decodeArr(byte & 0b1111);
    else if (byte <= 0b10111111) return this.decodeStr(byte & 0b11111);
    else if (byte >= 0b11100000) return this.createConst(byte - 0x100);
    else {
      switch (byte) {
        case 0xc0:
          return null;
        case 0xc1:
          return undefined;
        case 0xc2:
          return false;
        case 0xc3:
          return true;
        case 0xc4:
          return this.decodeBin(this.u8());
        case 0xc5:
          return this.decodeBin(this.u16());
        case 0xc6:
          return this.decodeBin(this.u32());
        case 0xca:
          return this.f32();
        case 0xcb:
          return this.f64();
        case 0xcc:
          return this.u8();
        case 0xcd:
          return this.u16();
        case 0xce:
          return this.u32();
        case 0xcf:
          return this.u32() * 4294967296 + this.u32();
        case 0xd0:
          return this.i8();
        case 0xd1:
          return this.i16();
        case 0xd2:
          return this.i32();
        case 0xd3:
          return this.i32() * 4294967296 + this.i32();
        case 0xd4:
          return this.val();
        case 0xd5: {
          this.ts();
          this.ts();
          return this.val();
        }
        case 0xd6: {
          this.ts();
          this.ts();
          const literalIndex = this.vuint57();
          return this.literals![literalIndex] as unknown;
        }
        case 0xde:
          return this.decodeObj(this.u16());
        case 0xdf:
          return this.decodeObj(this.u32());
        case 0xdc:
          return this.decodeArr(this.u16());
        case 0xdd:
          return this.decodeArr(this.u32());
        case 0xd9:
          return this.decodeStr(this.u8());
        case 0xda:
          return this.decodeStr(this.u16());
        case 0xdb:
          return this.decodeStr(this.u32());
      }
    }
    return null;
  }

  private createConst(value: unknown) {
    return value;
  }

  public decodeObj(length: number): Record<string, unknown> {
    this.ts();
    const obj: Record<string, unknown> = {};
    for (let i = 0; i < length; i++) {
      this.ts();
      const [isLiteralIndex, x] = this.b1vuint56();
      let key: string;
      if (isLiteralIndex) {
        key = this.literals![x] as string;
      } else {
        key = this.str(x);
      }
      const value = this.decodeNode();
      if (value !== undefined) obj[key] = value;
    }
    return obj;
  }

  public decodeArr(length: number): unknown[] {
    this.ts();
    const arr: unknown[] = [];
    for (let i = 0; i < length; i++) {
      const values = this.decodeArrChunk();
      if (values && values.length) arr.push(...values);
    }
    return arr;
  }

  private decodeArrChunk(): unknown[] | undefined {
    const [deleted, length] = this.b1vuint56();
    this.ts();
    if (deleted) {
      return undefined;
    } else {
      const values: unknown[] = [];
      for (let i = 0; i < length; i++) values.push(this.decodeNode());
      return values;
    }
  }

  public decodeStr(length: number): string {
    this.ts();
    let str = '';
    for (let i = 0; i < length; i++) {
      const [deleted, length] = this.b1vuint56();
      this.ts();
      if (deleted) continue;
      if (length === 0) str += this.literals![this.vuint57()] as string;
      str += this.str(length);
    }
    return str;
  }

  public decodeBin(length: number): Uint8Array {
    this.ts();
    const buffers: Uint8Array[] = [];
    let totalLength = 0;
    for (let i = 0; i < length; i++) {
      const [deleted, length] = this.b1vuint56();
      this.ts();
      if (deleted) continue;
      buffers.push(this.bin(length));
      totalLength += length;
    }
    const res = new Uint8Array(totalLength);
    let offset = 0;
    for (let i = 0; i < buffers.length; i++) {
      const byteLength = buffers[i].byteLength;
      res.set(buffers[i], offset);
      offset += byteLength;
    }
    return res;
  }
}
