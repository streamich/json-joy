import {CborDecoderBase} from '@jsonjoy.com/json-pack/lib/cbor/CborDecoderBase';
import {CrdtReader} from '../../../../json-crdt-patch/util/binary/CrdtReader';
import {CRDT_MAJOR} from './constants';

export class ViewDecoder extends CborDecoderBase<CrdtReader> {
  protected time: number = -1;

  constructor() {
    super(new CrdtReader());
  }

  public decode(data: Uint8Array): unknown {
    const reader = this.reader;
    this.time = -1;
    reader.reset(data);
    const isServerTime = reader.peak() & 0b10000000;
    if (isServerTime) {
      reader.x++;
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

  protected cNode(): unknown {
    const reader = this.reader;
    this.ts();
    const octet = reader.u8();
    const major = octet >> 5;
    const minor = octet & 0b11111;
    const length = minor < 0b11111 ? minor : reader.vu57();
    switch (major) {
      case CRDT_MAJOR.CON:
        return this.cCon(length);
      case CRDT_MAJOR.VAL:
        return this.cNode();
      case CRDT_MAJOR.VEC:
        return this.cVec(length);
      case CRDT_MAJOR.OBJ:
        return this.cObj(length);
      case CRDT_MAJOR.STR:
        return this.cStr(length);
      case CRDT_MAJOR.BIN:
        return this.cBin(length);
      case CRDT_MAJOR.ARR:
        return this.cArr(length);
    }
    return undefined;
  }

  protected cCon(length: number): unknown {
    return !length ? this.val() : (this.ts(), null);
  }

  protected cObj(length: number): Record<string, unknown> {
    const obj: Record<string, unknown> = {};
    for (let i = 0; i < length; i++) {
      const key: string = this.key();
      const value = this.cNode();
      if (value !== undefined) obj[key] = value;
    }
    return obj;
  }

  protected cVec(length: number): unknown[] {
    const reader = this.reader;
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

  protected cStr(length: number): string {
    let str = '';
    for (let i = 0; i < length; i++) {
      this.ts();
      const val = this.val();
      if (typeof val === 'string') str += val;
    }
    return str;
  }

  protected cBin(length: number): Uint8Array {
    const reader = this.reader;
    const buffers: Uint8Array[] = [];
    let totalLength = 0;
    for (let i = 0; i < length; i++) {
      this.ts();
      const [deleted, length] = reader.b1vu56();
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

  protected cArr(length: number): unknown[] {
    const arr: unknown[] = [];
    for (let i = 0; i < length; i++) {
      const values = this.cArrChunk();
      if (values && values.length) arr.push(...values);
    }
    return arr;
  }

  protected cArrChunk(): unknown[] | undefined {
    this.ts();
    const [deleted, length] = this.reader.b1vu56();
    if (deleted) {
      return undefined;
    } else {
      const values: unknown[] = [];
      for (let i = 0; i < length; i++) values.push(this.cNode());
      return values;
    }
  }
}
