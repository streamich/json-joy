import {RESP} from './constants';
import {RespAttributes, RespPush, RespVerbatimString} from './extensions';
import {JsonPackExtension} from '../JsonPackExtension';
import {RespEncoder} from './RespEncoder';
import type {IWriter, IWriterGrowable} from '@jsonjoy.com/buffers/lib';

const REG_RN = /[\r\n]/;
const isSafeInteger = Number.isSafeInteger;

/**
 * Implements RESP v2 encoding.
 */
export class RespEncoderLegacy<W extends IWriter & IWriterGrowable = IWriter & IWriterGrowable> extends RespEncoder<W> {
  public writeAny(value: unknown): void {
    switch (typeof value) {
      case 'number':
        return this.writeNumber(value as number);
      case 'string':
        return this.writeStr(value);
      case 'boolean':
        return this.writeSimpleStr(value ? 'TRUE' : 'FALSE');
      case 'object': {
        if (!value) return this.writeNull();
        if (value instanceof Array) return this.writeArr(value);
        if (value instanceof Uint8Array) return this.writeBin(value);
        if (value instanceof Error) return this.writeErr(value.message);
        if (value instanceof Set) return this.writeSet(value);
        if (value instanceof JsonPackExtension) {
          if (value instanceof RespPush) return this.writeArr(value.val);
          if (value instanceof RespVerbatimString) return this.writeStr(value.val);
          if (value instanceof RespAttributes) return this.writeObj(value.val);
        }
        return this.writeObj(value as Record<string, unknown>);
      }
      case 'undefined':
        return this.writeUndef();
      case 'bigint':
        return this.writeSimpleStrAscii(value + '');
      default:
        return this.writeUnknown(value);
    }
  }

  public writeNumber(num: number): void {
    if (isSafeInteger(num)) this.writeInteger(num);
    else this.writeSimpleStrAscii(num + '');
  }

  public writeStr(str: string): void {
    const length = str.length;
    if (length < 64 && !REG_RN.test(str)) this.writeSimpleStr(str);
    else this.writeBulkStr(str);
  }

  public writeNull(): void {
    this.writeNullArr();
  }

  public writeErr(str: string): void {
    if (str.length < 64 && !REG_RN.test(str)) this.writeSimpleErr(str);
    else this.writeBulkStr(str);
  }

  public writeSet(set: Set<unknown>): void {
    this.writeArr([...set]);
  }

  public writeArr(arr: unknown[]): void {
    const writer = this.writer;
    const length = arr.length;
    writer.u8(RESP.ARR); // *
    this.writeLength(length);
    writer.u16(RESP.RN); // \r\n
    for (let i = 0; i < length; i++) {
      const val = arr[i];
      if (val === null) this.writeNullStr();
      else this.writeAny(val);
    }
  }

  public writeObj(obj: Record<string, unknown>): void {
    const writer = this.writer;
    const keys = Object.keys(obj);
    const length = keys.length;
    writer.u8(RESP.ARR); // %
    this.writeLength(length << 1);
    writer.u16(RESP.RN); // \r\n
    for (let i = 0; i < length; i++) {
      const key = keys[i];
      this.writeStr(key);
      const val = obj[key];
      if (val === null) this.writeNullStr();
      else this.writeAny(val);
    }
  }
}
