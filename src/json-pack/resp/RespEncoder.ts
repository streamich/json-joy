import {Writer} from '../../util/buffers/Writer';
import {RESP} from './constants';
import {utf8Size} from '../../util/strings/utf8';
import type {IWriter, IWriterGrowable} from '../../util/buffers';
import type {BinaryJsonEncoder, StreamingBinaryJsonEncoder, TlvBinaryJsonEncoder} from '../types';
import type {Slice} from '../../util/buffers/Slice';

const REG_RN = /[\n\r]/;
const isSafeInteger = Number.isSafeInteger;

export class RespEncoder<W extends IWriter & IWriterGrowable = IWriter & IWriterGrowable>
  implements BinaryJsonEncoder, StreamingBinaryJsonEncoder, TlvBinaryJsonEncoder
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
        if (value instanceof Array) return this.writeArr(value);
        if (value instanceof Uint8Array) return this.writeBin(value);
        if (value instanceof Error) return this.writeErr(value.message);
        if (value instanceof Set) return this.writeSet(value);
        return this.writeObj(value as Record<string, unknown>);
      }
      case 'undefined':
        return this.writeUndef();
      case 'bigint':
        return this.writeBigInt(value);
      default:
        return this.writeUnknown(value);
    }
  }

  public writeNull(): void {
    this.writer.u8u16(
      RESP.NULL, // _
      RESP.RN, // \r\n
    );
  }

  public writeNullStr(): void {
    this.writer.u8u32(
      RESP.STR_BULK, // $
      45 * 0x1000000 + // -
        49 * 0x10000 + // 1
        RESP.RN, // \r\n
    );
  }

  public writeNullArr(): void {
    this.writer.u8u32(
      RESP.ARR, // *
      45 * 0x1000000 + // -
        49 * 0x10000 + // 1
        RESP.RN, // \r\n
    );
  }

  public writeBoolean(bool: boolean): void {
    this.writer.u32(
      bool
        ? RESP.BOOL * 0x1000000 + // #
            116 * 0x10000 + // t
            RESP.RN // \r\n
        : RESP.BOOL * 0x1000000 + // #
            102 * 0x10000 + // f
            RESP.RN, // \r\n
    );
  }

  public writeNumber(num: number): void {
    if (isSafeInteger(num)) this.writeInteger(num);
    else if (typeof num === 'bigint') this.writeBigInt(num);
    else this.writeFloat(num);
  }

  public writeBigInt(int: bigint): void {
    const writer = this.writer;
    writer.u8(RESP.BIG); // (
    writer.ascii(int + '');
    writer.u16(RESP.RN); // \r\n
  }

  public writeInteger(int: number): void {
    const writer = this.writer;
    writer.u8(RESP.INT); // :
    writer.ascii(int + '');
    writer.u16(RESP.RN); // \r\n
  }

  public writeUInteger(uint: number): void {
    this.writeInteger(uint);
  }

  public writeFloat(float: number): void {
    const writer = this.writer;
    writer.u8(RESP.FLOAT); // ,
    writer.ascii(float + '');
    writer.u16(RESP.RN); // \r\n
  }

  public writeBin(buf: Uint8Array): void {
    const writer = this.writer;
    const length = buf.length;
    writer.u8(RESP.STR_BULK); // $
    writer.ascii(length + '');
    writer.u16(RESP.RN); // \r\n
    writer.buf(buf, length);
    writer.u16(RESP.RN); // \r\n
  }

  public writeBinHdr(length: number): void {
    throw new Error('Not implemented');
    // Because then we also need `.writeBinBody()` which would emit trailing `\r\n`.
  }

  public writeStr(str: string): void {
    const length = str.length;
    if (length < 64 && !REG_RN.test(str)) this.writeSimpleStr(str);
    else this.writeVerbatimStr('txt', str);
  }

  public writeStrHdr(length: number): void {
    throw new Error('Not implemented');
    // Because then we also need `.writeBinBody()` which would emit trailing `\r\n`.
  }

  public writeSimpleStr(str: string): void {
    const writer = this.writer;
    writer.u8(RESP.STR_SIMPLE); // +
    writer.utf8(str);
    writer.u16(RESP.RN); // \r\n
  }

  public writeBulkStr(str: string): void {
    const writer = this.writer;
    writer.u8(RESP.STR_BULK); // $
    writer.ascii(str.length + '');
    writer.u16(RESP.RN); // \r\n
    writer.ascii(str);
    writer.u16(RESP.RN); // \r\n
  }

  public writeAsciiStr(str: string): void {
    const isSimple = !REG_RN.test(str);
    if (isSimple) this.writeSimpleStr(str);
    else this.writeBulkStr(str);
  }

  public writeVerbatimStr(encoding: string, str: string): void {
    const writer = this.writer;
    writer.u8(RESP.STR_VERBATIM); // =
    writer.ascii(utf8Size(str) + '');
    writer.u16(RESP.RN); // \r\n
    writer.u32(
      encoding.charCodeAt(0) * 0x1000000 + // t
        (encoding.charCodeAt(1) << 16) + // x
        (encoding.charCodeAt(2) << 8) + // t
        58, // :
    );
    writer.utf8(str);
    writer.u16(RESP.RN); // \r\n
  }

  public writeErr(str: string): void {
    if (str.length < 64 && !REG_RN.test(str)) this.writeSimpleErr(str);
    else this.writeBulkErr(str);
  }

  public writeSimpleErr(str: string): void {
    const writer = this.writer;
    writer.u8(RESP.ERR_SIMPLE); // -
    writer.utf8(str);
    writer.u16(RESP.RN); // \r\n
  }

  public writeBulkErr(str: string): void {
    const writer = this.writer;
    writer.u8(RESP.ERR_BULK); // !
    writer.ascii(utf8Size(str) + '');
    writer.u16(RESP.RN); // \r\n
    writer.utf8(str);
    writer.u16(RESP.RN); // \r\n
  }

  public writeArr(arr: unknown[]): void {
    const writer = this.writer;
    const length = arr.length;
    writer.u8(RESP.ARR); // *
    writer.ascii(length + '');
    writer.u16(RESP.RN); // \r\n
    for (let i = 0; i < length; i++) this.writeAny(arr[i]);
  }

  public writeArrHdr(length: number): void {
    const writer = this.writer;
    writer.u8(RESP.ARR); // *
    writer.ascii(length + '');
    writer.u16(RESP.RN); // \r\n
  }

  public writeObj(obj: Record<string, unknown>): void {
    const writer = this.writer;
    const keys = Object.keys(obj);
    const length = keys.length;
    writer.u8(RESP.OBJ); // %
    writer.ascii(length + '');
    writer.u16(RESP.RN); // \r\n
    for (let i = 0; i < length; i++) {
      const key = keys[i];
      this.writeStr(key);
      this.writeAny(obj[key]);
    }
  }

  public writeObjHdr(length: number): void {
    const writer = this.writer;
    writer.u8(RESP.OBJ); // %
    writer.ascii(length + '');
    writer.u16(RESP.RN); // \r\n
  }

  public writeAttr(obj: Record<string, unknown>): void {
    const writer = this.writer;
    const keys = Object.keys(obj);
    const length = keys.length;
    writer.u8(RESP.ATTR); // |
    writer.ascii(length + '');
    writer.u16(RESP.RN); // \r\n
    for (let i = 0; i < length; i++) {
      const key = keys[i];
      this.writeStr(key);
      this.writeAny(obj[key]);
    }
  }

  public writeSet(set: Set<unknown>): void {
    const writer = this.writer;
    const length = set.size;
    writer.u8(RESP.SET); // ~
    writer.ascii(length + '');
    writer.u16(RESP.RN); // \r\n
    for (let i = 0; i < length; i++) set.forEach((value) => this.writeAny(value));
  }

  public writePush(elements: unknown[]): void {
    const writer = this.writer;
    const length = elements.length;
    writer.u8(RESP.PUSH); // >
    writer.ascii(length + '');
    writer.u16(RESP.RN); // \r\n
    for (let i = 0; i < length; i++) this.writeAny(elements[i]);
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
    this.writeNull();
  }

  protected writeRn(): void {
    this.writer.u16(RESP.RN); // \r\n
  }

  // ------------------------------------------------------- Streaming encoding

  public writeStartStr(): void {
    this.writer.u32(
      RESP.STR_BULK * 0x1000000 + // $
        (63 << 16) + // ?
        RESP.RN, // \r\n
    );
  }

  public writeStrChunk(str: string): void {
    const writer = this.writer;
    writer.u8(59); // ;
    writer.ascii(str.length + '');
    writer.u16(RESP.RN); // \r\n
    writer.ascii(str);
    writer.u16(RESP.RN); // \r\n
  }

  public writeEndStr(): void {
    this.writer.u32(
      59 * 0x1000000 + // ;
        (48 << 16) + // 0
        RESP.RN, // \r\n
    );
  }

  public writeStartBin(): void {
    this.writer.u32(
      36 * 0x1000000 + // $
        (63 << 16) + // ?
        RESP.RN, // \r\n
    );
  }

  public writeBinChunk(buf: Uint8Array): void {
    const writer = this.writer;
    const length = buf.length;
    writer.u8(59); // ;
    writer.ascii(length + '');
    writer.u16(RESP.RN); // \r\n
    writer.buf(buf, length);
    writer.u16(RESP.RN); // \r\n
  }

  public writeEndBin(): void {
    this.writer.u32(
      59 * 0x1000000 + // ;
        (48 << 16) + // 0
        RESP.RN, // \r\n
    );
  }

  public writeStartArr(): void {
    this.writer.u32(
      RESP.ARR * 0x1000000 + // *
        (63 << 16) + // ?
        RESP.RN, // \r\n
    );
  }

  public writeArrChunk(item: unknown): void {
    this.writeAny(item);
  }

  public writeEndArr(): void {
    this.writer.u8u16(
      46, // .
      RESP.RN, // \r\n
    );
  }

  public writeStartObj(): void {
    this.writer.u32(
      37 * 0x1000000 + // %
        (63 << 16) + // ?
        RESP.RN, // \r\n
    );
  }

  public writeObjChunk(key: string, value: unknown): void {
    this.writeStr(key);
    this.writeAny(value);
  }

  public writeEndObj(): void {
    this.writer.u8u16(
      46, // .
      RESP.RN, // \r\n
    );
  }
}
