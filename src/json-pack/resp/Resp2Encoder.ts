import {Writer} from '../../util/buffers/Writer';
import type {IWriter, IWriterGrowable} from '../../util/buffers';
import type {BinaryJsonEncoder, TlvBinaryJsonEncoder} from '../types';

const REG_RN = /[\n\r]/;
const rn = ('\r'.charCodeAt(0) << 8) | '\n'.charCodeAt(0);
const isSafeInteger = Number.isSafeInteger;

export class Resp2Encoder<W extends IWriter & IWriterGrowable = IWriter & IWriterGrowable>
  implements BinaryJsonEncoder, TlvBinaryJsonEncoder
{
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
        return this.writeNumber(value as number);
      case 'string':
        return this.writeStr(value);
      case 'boolean':
        return this.writeBoolean(value);
      case 'object': {
        if (!value) return this.writeNull();
        if (value instanceof Error) return this.writeErr(value.message);
        const constructor = value.constructor;
        switch (constructor) {
          case Array:
            return this.writeArr(value as unknown[]);
          default:
            return this.writeObj(value as Record<string, unknown>);
        }
      }
      case 'undefined':
        throw new Error('Not implemented');
      case 'bigint':
        return this.writeBigInt(value);
      default:
        throw new Error('Not implemented');
    }
  }

  public writeNull(): void {
    this.writer.u8u16(
      95, // _
      rn, // \r\n
    );
  }

  public writeNullStr(): void {
    this.writer.u8u32(
      36, // $
      45 * 0x1000000 + // -
        49 * 0x10000 + // 1
        rn, // \r\n
    );
  }

  public writeNullArr(): void {
    this.writer.u8u32(
      42, // *
      45 * 0x1000000 + // -
        49 * 0x10000 + // 1
        rn, // \r\n
    );
  }

  public writeBoolean(bool: boolean): void {
    this.writer.u32(
      bool
        ? 35 * 0x1000000 + // #
            116 * 0x10000 + // t
            rn // \r\n
        : 35 * 0x1000000 + // #
            102 * 0x10000 + // f
            rn, // \r\n
    );
  }

  public writeNumber(num: number): void {
    if (isSafeInteger(num)) this.writeInteger(num);
    else if (typeof num === 'bigint') this.writeBigInt(num);
    else this.writeFloat(num);
  }

  public writeBigInt(int: bigint): void {
    const writer = this.writer;
    writer.u8(40); // (
    writer.ascii(int + '');
    writer.u16(rn); // \r\n
  }

  public writeInteger(int: number): void {
    const writer = this.writer;
    writer.u8(58); // :
    writer.ascii(int + '');
    writer.u16(rn); // \r\n
  }

  public writeUInteger(uint: number): void {
    throw new Error('Not implemented');
  }

  public writeFloat(float: number): void {
    const writer = this.writer;
    writer.u8(44); // ,
    writer.ascii(float + '');
    writer.u16(rn); // \r\n
  }

  public writeBin(buf: Uint8Array): void {
    throw new Error('Not implemented');
  }

  public writeBinHdr(length: number): void {
    throw new Error('Not implemented');
  }

  public writeStr(str: string): void {
    this.writeBulkStr(str);
  }

  public writeStrHdr(length: number): void {
    throw new Error('Not implemented');
  }

  public writeSimpleStr(str: string): void {
    const writer = this.writer;
    writer.u8(43); // +
    writer.ascii(str);
    writer.u16(rn); // \r\n
  }

  public writeBulkStr(str: string): void {
    const writer = this.writer;
    writer.u8(36); // $
    writer.ascii(str.length + '');
    writer.u16(rn); // \r\n
    writer.ascii(str);
    writer.u16(rn); // \r\n
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
    writer.u16(rn); // \r\n
  }

  public writeBulkErr(str: string): void {
    const writer = this.writer;
    writer.u8(33); // !
    writer.ascii(str.length + '');
    writer.u16(rn); // \r\n
    writer.ascii(str);
    writer.u16(rn); // \r\n
  }

  public writeErr(str: string): void {
    const isSimple = !REG_RN.test(str);
    if (isSimple) this.writeSimpleErr(str);
    else this.writeBulkErr(str);
  }

  public writeArr(arr: unknown[]): void {
    const writer = this.writer;
    const length = arr.length;
    writer.u8(42); // *
    writer.ascii(length + '');
    writer.u16(rn); // \r\n
    for (let i = 0; i < length; i++) this.writeAny(arr[i]);
  }

  public writeArrHdr(length: number): void {
    const writer = this.writer;
    writer.u8(42); // *
    writer.ascii(length + '');
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
    this.writer.u16(rn); // \r\n
  }
}
