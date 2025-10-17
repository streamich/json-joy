import type {IWriter, IWriterGrowable} from '@jsonjoy.com/buffers/lib';
import type {BinaryJsonEncoder, StreamingBinaryJsonEncoder} from '../types';

export class UbjsonEncoder implements BinaryJsonEncoder, StreamingBinaryJsonEncoder {
  constructor(public readonly writer: IWriter & IWriterGrowable) {}

  public encode(value: unknown): Uint8Array {
    const writer = this.writer;
    writer.reset();
    this.writeAny(value);
    return writer.flush();
  }

  public writeAny(value: unknown): void {
    switch (typeof value) {
      case 'boolean':
        return this.writeBoolean(value);
      case 'number':
        return this.writeNumber(value as number);
      case 'string':
        return this.writeStr(value);
      case 'object': {
        if (value === null) return this.writeNull();
        const construct = value.constructor;
        switch (construct) {
          case Array:
            return this.writeArr(value as unknown[]);
          case Uint8Array:
            return this.writeBin(value as Uint8Array);
          default:
            return this.writeObj(value as Record<string, unknown>);
        }
      }
      case 'bigint':
        return this.writeBigInt(value as bigint);
      case 'undefined':
        return this.writeUndef();
      default:
        return this.writeNull();
    }
  }

  public writeNull(): void {
    this.writer.u8(0x5a);
  }

  public writeUndef(): void {
    this.writer.u8(0x4e);
  }

  public writeBoolean(bool: boolean): void {
    this.writer.u8(bool ? 0x54 : 0x46);
  }

  public writeNumber(num: number): void {
    if (num >> 0 === num) return this.writeInteger(num);
    this.writeFloat(num);
  }

  public writeInteger(int: number): void {
    const writer = this.writer;
    if (int <= 0xff && 0 <= int) writer.u16(0x5500 | int);
    else if (int <= 127 && -128 <= int) {
      writer.u16(0x6900);
      writer.view.setInt8(writer.x - 1, int);
    } else if (int <= 32767 && -32768 <= int) {
      writer.ensureCapacity(3);
      writer.u8(0x49);
      writer.view.setInt16(writer.x, int, false);
      writer.x += 2;
    } else if (int <= 2147483647 && -2147483648 <= int) {
      writer.ensureCapacity(5);
      writer.u8(0x6c);
      writer.view.setInt32(writer.x, int, false);
      writer.x += 4;
    }
  }

  public writeUInteger(uint: number): void {
    const writer = this.writer;
    if (uint < 0xff) writer.u16(0x5500 + uint);
  }

  public writeFloat(float: number): void {
    const writer = this.writer;
    writer.ensureCapacity(9);
    const view = writer.view;
    const x = writer.x;
    view.setUint8(x, 0x44);
    view.setFloat64(x + 1, float, false);
    writer.x = x + 9;
  }

  public writeBigInt(int: bigint): void {
    const writer = this.writer;
    writer.ensureCapacity(9);
    const view = writer.view;
    const x = writer.x;
    view.setUint8(x, 0x4c);
    view.setBigInt64(x + 1, int, false);
    writer.x = x + 9;
  }

  public writeBin(buf: Uint8Array): void {
    const writer = this.writer;
    const length = buf.length;
    writer.u32(0x5b_24_55_23); // "[$U#"
    this.writeInteger(length);
    writer.buf(buf, length);
  }

  public writeStr(str: string): void {
    const length = str.length;
    const maxLength = length * 4;
    const capacity = maxLength + 1 + 5; // 1 for string type, 5 for length.
    const writer = this.writer;
    writer.ensureCapacity(capacity);
    const uint8 = writer.uint8;
    uint8[writer.x++] = 0x53;
    const x = writer.x;
    const oneByteLength = maxLength < 0xff;
    if (oneByteLength) {
      uint8[writer.x++] = 0x55;
      writer.x++;
    } else {
      uint8[writer.x++] = 0x6c;
      writer.x += 4;
    }
    const size = writer.utf8(str);
    if (oneByteLength) uint8[x + 1] = size;
    else writer.view.setUint32(x + 1, size);
  }

  public writeAsciiStr(str: string): void {
    this.writeStr(str);
  }

  public writeArr(arr: unknown[]): void {
    const writer = this.writer;
    writer.u8(0x5b);
    const length = arr.length;
    for (let i = 0; i < length; i++) this.writeAny(arr[i]);
    writer.u8(0x5d);
  }

  public writeObj(obj: Record<string, unknown>): void {
    const writer = this.writer;
    const keys = Object.keys(obj);
    const length = keys.length;
    writer.u8(0x7b);
    for (let i = 0; i < length; i++) {
      const key = keys[i];
      const value = obj[key];
      this.writeKey(key);
      this.writeAny(value);
    }
    writer.u8(0x7d);
  }

  public writeKey(str: string): void {
    const length = str.length;
    const maxLength = length * 4;
    const capacity = maxLength + 5; // 5 for int.
    const writer = this.writer;
    writer.ensureCapacity(capacity);
    const uint8 = writer.uint8;
    const x = writer.x;
    const oneByteLength = maxLength < 0xff;
    if (oneByteLength) {
      uint8[writer.x++] = 0x55;
      writer.x++;
    } else {
      uint8[writer.x++] = 0x6c;
      writer.x += 4;
    }
    const size = writer.utf8(str);
    if (oneByteLength) uint8[x + 1] = size;
    else writer.view.setUint32(x + 1, size);
  }

  // ------------------------------------------------------- Streaming encoding

  public writeStartStr(): void {
    throw new Error('Method not implemented.');
  }

  public writeStrChunk(str: string): void {
    throw new Error('Method not implemented.');
  }

  public writeEndStr(): void {
    throw new Error('Method not implemented.');
  }

  public writeStartBin(): void {
    throw new Error('Method not implemented.');
  }

  public writeBinChunk(buf: Uint8Array): void {
    throw new Error('Method not implemented.');
  }

  public writeEndBin(): void {
    throw new Error('Method not implemented.');
  }

  public writeStartArr(): void {
    this.writer.u8(0x5b);
  }

  public writeArrChunk(item: unknown): void {
    this.writeAny(item);
  }

  public writeEndArr(): void {
    this.writer.u8(0x5d);
  }

  public writeStartObj(): void {
    this.writer.u8(0x7b);
  }

  public writeObjChunk(key: string, value: unknown): void {
    this.writeKey(key);
    this.writeAny(value);
  }

  public writeEndObj(): void {
    this.writer.u8(0x7d);
  }
}
