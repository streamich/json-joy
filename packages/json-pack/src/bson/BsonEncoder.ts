import {
  BsonBinary,
  BsonDbPointer,
  BsonDecimal128,
  BsonFloat,
  BsonInt32,
  BsonInt64,
  BsonJavascriptCode,
  BsonJavascriptCodeWithScope,
  BsonMaxKey,
  BsonMinKey,
  BsonObjectId,
  BsonTimestamp,
} from './values';
import type {IWriter, IWriterGrowable} from '@jsonjoy.com/buffers/lib';
import type {BinaryJsonEncoder} from '../types';

export class BsonEncoder implements BinaryJsonEncoder {
  constructor(public readonly writer: IWriter & IWriterGrowable) {}

  public encode(value: unknown): Uint8Array {
    const writer = this.writer;
    writer.reset();
    this.writeAny(value);
    return writer.flush();
  }

  public writeAny(value: unknown): void {
    switch (typeof value) {
      case 'object': {
        if (value === null) throw new Error('NOT_OBJ');
        return this.writeObj(<Record<string, unknown>>value);
      }
    }
    throw new Error('NOT_OBJ');
  }

  public writeNull(): void {
    // Not used directly in BSON - handled in writeKey
    throw new Error('Use writeKey for BSON encoding');
  }

  public writeUndef(): void {
    // Not used directly in BSON - handled in writeKey
    throw new Error('Use writeKey for BSON encoding');
  }

  public writeBoolean(bool: boolean): void {
    // Not used directly in BSON - handled in writeKey
    throw new Error('Use writeKey for BSON encoding');
  }

  public writeNumber(num: number): void {
    // Not used directly in BSON - handled in writeKey
    throw new Error('Use writeKey for BSON encoding');
  }

  public writeInteger(int: number): void {
    // Not used directly in BSON - handled in writeKey
    throw new Error('Use writeKey for BSON encoding');
  }

  public writeUInteger(uint: number): void {
    // Not used directly in BSON - handled in writeKey
    throw new Error('Use writeKey for BSON encoding');
  }

  public writeInt32(int: number): void {
    const writer = this.writer;
    writer.ensureCapacity(4);
    writer.view.setInt32(writer.x, int, true);
    writer.x += 4;
  }

  public writeInt64(int: number | bigint): void {
    const writer = this.writer;
    writer.ensureCapacity(8);
    writer.view.setBigInt64(writer.x, BigInt(int), true);
    writer.x += 8;
  }

  public writeFloat(float: number): void {
    const writer = this.writer;
    writer.ensureCapacity(8);
    writer.view.setFloat64(writer.x, float, true);
    writer.x += 8;
  }

  public writeBigInt(int: bigint): void {
    // Not used directly in BSON - handled in writeKey
    throw new Error('Use writeKey for BSON encoding');
  }

  public writeBin(buf: Uint8Array): void {
    const length = buf.length;
    this.writeInt32(length);
    const writer = this.writer;
    writer.u8(0);
    writer.buf(buf, length);
  }

  public writeStr(str: string): void {
    const writer = this.writer;
    const length = str.length;
    const maxSize = 4 + 1 + 4 * length;
    writer.ensureCapacity(maxSize);
    const x = writer.x;
    this.writeInt32(length + 1);
    const bytesWritten = writer.utf8(str);
    writer.u8(0);
    if (bytesWritten !== length) {
      writer.view.setInt32(x, bytesWritten + 1, true);
    }
  }

  public writeAsciiStr(str: string): void {
    // Use writeStr for BSON - it handles UTF-8 properly
    this.writeStr(str);
  }

  public writeArr(arr: unknown[]): void {
    this.writeObj(arr as unknown as Record<string, unknown>);
  }

  public writeObj(obj: Record<string, unknown>): void {
    const writer = this.writer;
    writer.ensureCapacity(8);
    const x0 = writer.x0;
    const dx = writer.x - x0;
    writer.x += 4;
    const keys = Object.keys(obj);
    const length = keys.length;
    for (let i = 0; i < length; i++) {
      const key = keys[i];
      const value = obj[key];
      this.writeKey(key, value);
    }
    writer.u8(0);
    const x = writer.x0 + dx;
    const size = writer.x - x;
    writer.view.setUint32(x, size, true);
  }

  public writeCString(str: string): void {
    const writer = this.writer;
    const length = str.length;
    writer.ensureCapacity(1 + 4 * length);
    const uint8 = writer.uint8;
    let x = writer.x;
    let pos = 0;
    while (pos < length) {
      let value = str.charCodeAt(pos++);
      if ((value & 0xffffff80) === 0) {
        if (!value) break;
        uint8[x++] = value;
        continue;
      } else if ((value & 0xfffff800) === 0) {
        const octet = ((value >> 6) & 0x1f) | 0xc0;
        if (!octet) break;
        uint8[x++] = octet;
      } else {
        if (value >= 0xd800 && value <= 0xdbff) {
          if (pos < length) {
            const extra = str.charCodeAt(pos);
            if ((extra & 0xfc00) === 0xdc00) {
              pos++;
              value = ((value & 0x3ff) << 10) + (extra & 0x3ff) + 0x10000;
            }
          }
        }
        if ((value & 0xffff0000) === 0) {
          const octet1 = ((value >> 12) & 0x0f) | 0xe0;
          const octet2 = ((value >> 6) & 0x3f) | 0x80;
          if (!octet1 || !octet2) throw new Error('INVALID_CSTRING');
          uint8[x++] = octet1;
          uint8[x++] = octet2;
        } else {
          const octet1 = ((value >> 18) & 0x07) | 0xf0;
          const octet2 = ((value >> 12) & 0x3f) | 0x80;
          const octet3 = ((value >> 6) & 0x3f) | 0x80;
          if (!octet1 || !octet2 || !octet3) throw new Error('INVALID_CSTRING');
          uint8[x++] = octet1;
          uint8[x++] = octet2;
          uint8[x++] = octet3;
        }
      }
      const octet = (value & 0x3f) | 0x80;
      if (!octet) break;
      uint8[x++] = octet;
    }
    uint8[x++] = 0;
    writer.x = x;
  }

  public writeObjectId(id: BsonObjectId): void {
    const writer = this.writer;
    writer.ensureCapacity(12);
    const uint8 = writer.uint8;
    const x = writer.x;
    const {timestamp, process, counter} = id;
    uint8[x + 0] = timestamp >>> 24;
    uint8[x + 1] = (timestamp >>> 16) & 0xff;
    uint8[x + 2] = (timestamp >>> 8) & 0xff;
    uint8[x + 3] = timestamp & 0xff;
    uint8[x + 4] = process & 0xff;
    uint8[x + 5] = (process >>> 8) & 0xff;
    uint8[x + 6] = (process >>> 16) & 0xff;
    uint8[x + 7] = (process >>> 24) & 0xff;
    let lo32 = process | 0;
    if (lo32 < 0) lo32 += 4294967296;
    const hi32 = (process - lo32) / 4294967296;
    uint8[x + 8] = hi32 & 0xff;
    uint8[x + 9] = counter >>> 16;
    uint8[x + 10] = (counter >>> 8) & 0xff;
    uint8[x + 11] = counter & 0xff;
    writer.x += 12;
  }

  public writeKey(key: string, value: unknown): void {
    const writer = this.writer;
    switch (typeof value) {
      case 'number': {
        const isFloat = Math.floor(value) !== value;
        if (isFloat) {
          writer.u8(0x01);
          this.writeCString(key);
          this.writeFloat(value);
          break;
        }
        if (value <= 2147483647 && value >= -2147483648) {
          writer.u8(0x10);
          this.writeCString(key);
          this.writeInt32(value);
          break;
        }
        writer.u8(0x12);
        this.writeCString(key);
        this.writeInt64(value);
        break;
      }
      case 'string': {
        writer.u8(0x02);
        this.writeCString(key);
        this.writeStr(value);
        break;
      }
      case 'object': {
        if (value === null) {
          writer.u8(0x0a);
          this.writeCString(key);
          break;
        }
        const constr = value.constructor;
        switch (constr) {
          case Object: {
            writer.u8(0x03);
            this.writeCString(key);
            this.writeObj(value as Record<string, unknown>);
            break;
          }
          case Array: {
            writer.u8(0x04);
            this.writeCString(key);
            this.writeObj(value as Record<string, unknown>);
            break;
          }
          case Uint8Array: {
            writer.u8(0x05);
            this.writeCString(key);
            this.writeBin(value as Uint8Array);
            break;
          }
          case BsonObjectId: {
            writer.u8(0x07);
            this.writeCString(key);
            this.writeObjectId(value as BsonObjectId);
            break;
          }
          case Date: {
            writer.u8(0x09);
            this.writeCString(key);
            writer.ensureCapacity(8);
            writer.view.setBigUint64(writer.x, BigInt((value as Date).getTime()), true);
            writer.x += 8;
            break;
          }
          case RegExp: {
            writer.u8(0x0b);
            this.writeCString(key);
            this.writeCString((<RegExp>value).source);
            this.writeCString((<RegExp>value).flags);
            break;
          }
          case BsonDbPointer: {
            writer.u8(0x0c);
            this.writeCString(key);
            const pointer = value as BsonDbPointer;
            this.writeStr(pointer.name);
            this.writeObjectId(pointer.id);
            break;
          }
          case BsonJavascriptCode: {
            writer.u8(0x0d);
            this.writeCString(key);
            this.writeStr((value as BsonJavascriptCode).code);
            break;
          }
          case BsonJavascriptCodeWithScope: {
            writer.u8(0x0f);
            this.writeCString(key);
            const codeWithScope = value as BsonJavascriptCodeWithScope;
            const x0 = writer.x;
            writer.x += 4; // Reserve space for total length
            this.writeStr(codeWithScope.code);
            this.writeObj(codeWithScope.scope);
            const totalLength = writer.x - x0;
            writer.view.setInt32(x0, totalLength, true);
            break;
          }
          case BsonInt32: {
            writer.u8(0x10);
            this.writeCString(key);
            this.writeInt32((value as BsonInt32).value);
            break;
          }
          case BsonInt64: {
            writer.u8(0x12);
            this.writeCString(key);
            this.writeInt64((value as BsonInt64).value);
            break;
          }
          case BsonFloat: {
            writer.u8(0x01);
            this.writeCString(key);
            this.writeFloat((value as BsonFloat).value);
            break;
          }
          case BsonTimestamp: {
            writer.u8(0x11);
            this.writeCString(key);
            const ts = value as BsonTimestamp;
            this.writeInt32(ts.increment);
            this.writeInt32(ts.timestamp);
            break;
          }
          case BsonDecimal128: {
            writer.u8(0x13);
            this.writeCString(key);
            const dec = value as BsonDecimal128;
            if (dec.data.length !== 16) throw new Error('INVALID_DECIMAL128');
            writer.buf(dec.data, 16);
            break;
          }
          case BsonMinKey: {
            writer.u8(0xff);
            this.writeCString(key);
            break;
          }
          case BsonMaxKey: {
            writer.u8(0x7f);
            this.writeCString(key);
            break;
          }
          case BsonBinary: {
            writer.u8(0x05);
            this.writeCString(key);
            const bin = value as BsonBinary;
            const length = bin.data.length;
            this.writeInt32(length);
            writer.u8(bin.subtype);
            writer.buf(bin.data, length);
            break;
          }
          default: {
            writer.u8(0x03);
            this.writeCString(key);
            this.writeObj(value as Record<string, unknown>);
            break;
          }
        }
        break;
      }
      case 'boolean': {
        writer.u8(0x08);
        this.writeCString(key);
        writer.u8(+value);
        break;
      }
      case 'undefined': {
        writer.u8(0x06);
        this.writeCString(key);
        break;
      }
      case 'symbol': {
        writer.u8(0x0e);
        this.writeCString(key);
        this.writeStr(value.description || '');
        break;
      }
    }
  }
}
