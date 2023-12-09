import {Writer} from '../../util/buffers/Writer';
import type {IWriter, IWriterGrowable} from '../../util/buffers';
import type {BinaryJsonEncoder, TlvBinaryJsonEncoder} from '../types';

const REG_RN = /[\n\r]/;
const rn = ('\r'.charCodeAt(0) << 8) | '\n'.charCodeAt(0);

export class Resp2Encoder<W extends IWriter & IWriterGrowable = IWriter & IWriterGrowable> implements BinaryJsonEncoder, TlvBinaryJsonEncoder {
  constructor(public readonly writer: W = new Writer() as any) {}

  public encode(value: unknown): Uint8Array {
    this.writeAny(value);
    return this.writer.flush();
  }

  public encodeToSlice(value: unknown): Slice {
    this.writeAny(value);
    return this.writer.flushSlice();
  }

  public writeAny(value: unknown): void {
    switch (typeof value) {
      case 'number':
        throw new Error('Not implemented');
      case 'string':
        throw new Error('Not implemented');
      case 'boolean':
        throw new Error('Not implemented');
      case 'object': {
        if (!value) throw new Error('Not implemented');
        if (value instanceof Error) {
          this.writeErr(value.message);
          return;
        }
        const constructor = value.constructor;
        switch (constructor) {
          case Array:
            throw new Error('Not implemented');
          default:
            throw new Error('Not implemented');
        }
      }
      case 'undefined':
        throw new Error('Not implemented');
      case 'bigint':
        throw new Error('Not implemented');
      default:
        throw new Error('Not implemented');
    }
  }

  public writeNull(): void {
    throw new Error('Not implemented');
  }

  public writeBoolean(bool: boolean): void {
    throw new Error('Not implemented');
  }

  public writeNumber(num: number): void {
    throw new Error('Not implemented');
  }

  public writeBigInt(int: bigint): void {
    throw new Error('Not implemented');
  }

  public writeInteger(int: number): void {
    throw new Error('Not implemented');
  }

  public writeUInteger(uint: number): void {
    throw new Error('Not implemented');
  }

  public writeFloat(float: number): void {
    throw new Error('Not implemented');
  }

  public writeBin(buf: Uint8Array): void {
    throw new Error('Not implemented');
  }

  public writeBinHdr(length: number): void {
    throw new Error('Not implemented');
  }

  public writeStr(str: string): void {
    throw new Error('Not implemented');
  }

  public writeStrHdr(length: number): void {
    throw new Error('Not implemented');
  }

  public writeSimpleStr(str: string): void {
    const writer = this.writer;
    writer.u8(43); // +
    writer.ascii(str);
    writer.u16(rn);
  }

  public writeBulkStr(str: string): void {
    const writer = this.writer;
    writer.u8(36); // $
    writer.ascii(str.length + '');
    writer.u16(rn);
    writer.ascii(str);
    writer.u16(rn);
  }

  public writeAsciiStr(str: string): void {
    const isSimple = !REG_RN.test(str);
    if (isSimple) this.writeSimpleStr(str);
    else this.writeBulkStr(str);
  }

  public writeSimpleErr(str: string): void {
    const writer = this.writer;
    writer.u8(45); // -
    writer.ascii(str);
    writer.u16(rn);
  }

  public writeBulkErr(str: string): void {
    const writer = this.writer;
    writer.u8(33); // !
    writer.ascii(str.length + '');
    writer.u16(rn);
    writer.ascii(str);
    writer.u16(rn);
  }

  public writeErr(str: string): void {
    const isSimple = !REG_RN.test(str);
    if (isSimple) this.writeSimpleErr(str);
    else this.writeBulkErr(str);
  }

  public writeArr(arr: unknown[]): void {
    throw new Error('Not implemented');
  }

  public writeArrHdr(length: number): void {
    throw new Error('Not implemented');
  }

  public writeObj(obj: Record<string, unknown>): void {
    throw new Error('Not implemented');
  }

  public writeObjHdr(length: number): void {
    throw new Error('Not implemented');
  }

  /**
   * Called when the encoder encounters a value that it does not know how to encode.
   *
   * @param value Some JavaScript value.
   */
  public writeUnknown(value: unknown): void {
    this.writeNull();
  }

  public writeUndef(): void {
    throw new Error('Not implemented');
  }

  protected writeRn(): void {
    this.writer.u16(rn);
  }
}
