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
  BsonSymbol,
  BsonTimestamp,
} from '../bson/values';
import {toBase64Bin} from '@jsonjoy.com/base64/lib/toBase64Bin';
import {JsonEncoder} from '../json/JsonEncoder';
import type {IWriter, IWriterGrowable} from '@jsonjoy.com/buffers/lib';

export interface EjsonEncoderOptions {
  /** Use canonical format (preserves all type information) or relaxed format (more readable) */
  canonical?: boolean;
}

export class EjsonEncoder extends JsonEncoder {
  constructor(
    writer: IWriter & IWriterGrowable,
    private options: EjsonEncoderOptions = {},
  ) {
    super(writer);
  }

  /**
   * Encode to string (for backward compatibility).
   * This method maintains the previous API but uses the binary encoder internally.
   */
  public encodeToString(value: unknown): string {
    const bytes = this.encode(value);
    return new TextDecoder().decode(bytes);
  }

  public writeUnknown(value: unknown): void {
    this.writeNull();
  }

  public writeAny(value: unknown): void {
    if (value === null || value === undefined) {
      if (value === undefined) {
        return this.writeUndefinedWrapper();
      }
      return this.writeNull();
    }

    if (typeof value === 'boolean') {
      return this.writeBoolean(value);
    }

    if (typeof value === 'string') {
      return this.writeStr(value);
    }

    if (typeof value === 'number') {
      return this.writeNumberAsEjson(value);
    }

    if (Array.isArray(value)) {
      return this.writeArr(value);
    }

    if (value instanceof Date) {
      return this.writeDateAsEjson(value);
    }

    if (value instanceof RegExp) {
      return this.writeRegExpAsEjson(value);
    }

    // Handle BSON value classes
    if (value instanceof BsonObjectId) {
      return this.writeObjectIdAsEjson(value);
    }

    if (value instanceof BsonInt32) {
      return this.writeBsonInt32AsEjson(value);
    }

    if (value instanceof BsonInt64) {
      return this.writeBsonInt64AsEjson(value);
    }

    if (value instanceof BsonFloat) {
      return this.writeBsonFloatAsEjson(value);
    }

    if (value instanceof BsonDecimal128) {
      return this.writeBsonDecimal128AsEjson(value);
    }

    if (value instanceof BsonBinary) {
      return this.writeBsonBinaryAsEjson(value);
    }

    if (value instanceof BsonJavascriptCode) {
      return this.writeBsonCodeAsEjson(value);
    }

    if (value instanceof BsonJavascriptCodeWithScope) {
      return this.writeBsonCodeWScopeAsEjson(value);
    }

    if (value instanceof BsonSymbol) {
      return this.writeBsonSymbolAsEjson(value);
    }

    if (value instanceof BsonTimestamp) {
      return this.writeBsonTimestampAsEjson(value);
    }

    if (value instanceof BsonDbPointer) {
      return this.writeBsonDbPointerAsEjson(value);
    }

    if (value instanceof BsonMinKey) {
      return this.writeBsonMinKeyAsEjson();
    }

    if (value instanceof BsonMaxKey) {
      return this.writeBsonMaxKeyAsEjson();
    }

    if (typeof value === 'object' && value !== null) {
      return this.writeObj(value as Record<string, unknown>);
    }

    // Fallback for unknown types
    return this.writeUnknown(value);
  }

  public writeBin(buf: Uint8Array): void {
    const writer = this.writer;
    const length = buf.length;
    writer.ensureCapacity(38 + 3 + (length << 1));
    // Write: "data:application/octet-stream;base64,
    const view = writer.view;
    let x = writer.x;
    view.setUint32(x, 0x22_64_61_74); // "dat
    x += 4;
    view.setUint32(x, 0x61_3a_61_70); // a:ap
    x += 4;
    view.setUint32(x, 0x70_6c_69_63); // plic
    x += 4;
    view.setUint32(x, 0x61_74_69_6f); // atio
    x += 4;
    view.setUint32(x, 0x6e_2f_6f_63); // n/oc
    x += 4;
    view.setUint32(x, 0x74_65_74_2d); // tet-
    x += 4;
    view.setUint32(x, 0x73_74_72_65); // stre
    x += 4;
    view.setUint32(x, 0x61_6d_3b_62); // am;b
    x += 4;
    view.setUint32(x, 0x61_73_65_36); // ase6
    x += 4;
    view.setUint16(x, 0x34_2c); // 4,
    x += 2;
    x = toBase64Bin(buf, 0, length, view, x);
    writer.uint8[x++] = 0x22; // "
    writer.x = x;
  }

  public writeStr(str: string): void {
    const writer = this.writer;
    const length = str.length;
    writer.ensureCapacity(length * 4 + 2);
    if (length < 256) {
      let x = writer.x;
      const uint8 = writer.uint8;
      uint8[x++] = 0x22; // "
      for (let i = 0; i < length; i++) {
        const code = str.charCodeAt(i);
        switch (code) {
          case 34: // "
          case 92: // \
            uint8[x++] = 0x5c; // \
            break;
        }
        if (code < 32 || code > 126) {
          writer.utf8(JSON.stringify(str));
          return;
        } else uint8[x++] = code;
      }
      uint8[x++] = 0x22; // "
      writer.x = x;
      return;
    }
    writer.utf8(JSON.stringify(str));
  }

  public writeAsciiStr(str: string): void {
    const length = str.length;
    const writer = this.writer;
    writer.ensureCapacity(length * 2 + 2);
    const uint8 = writer.uint8;
    let x = writer.x;
    uint8[x++] = 0x22; // "
    for (let i = 0; i < length; i++) {
      const code = str.charCodeAt(i);
      switch (code) {
        case 34: // "
        case 92: // \
          uint8[x++] = 0x5c; // \
          break;
      }
      uint8[x++] = code;
    }
    uint8[x++] = 0x22; // "
    writer.x = x;
  }

  public writeArr(arr: unknown[]): void {
    const writer = this.writer;
    writer.u8(0x5b); // [
    const length = arr.length;
    const last = length - 1;
    for (let i = 0; i < last; i++) {
      this.writeAny(arr[i]);
      writer.u8(0x2c); // ,
    }
    if (last >= 0) this.writeAny(arr[last]);
    writer.u8(0x5d); // ]
  }

  public writeObj(obj: Record<string, unknown>): void {
    const writer = this.writer;
    const keys = Object.keys(obj);
    const length = keys.length;
    if (!length) return writer.u16(0x7b7d); // {}
    writer.u8(0x7b); // {
    for (let i = 0; i < length; i++) {
      const key = keys[i];
      const value = obj[key];
      this.writeStr(key);
      writer.u8(0x3a); // :
      this.writeAny(value);
      writer.u8(0x2c); // ,
    }
    writer.uint8[writer.x - 1] = 0x7d; // }
  }

  // EJSON-specific type wrapper methods

  private writeUndefinedWrapper(): void {
    // Write {"$undefined":true}
    const writer = this.writer;
    writer.ensureCapacity(18);
    writer.u8(0x7b); // {
    writer.u32(0x2224756e);
    writer.u32(0x64656669);
    writer.u32(0x6e656422); // "$undefined"
    writer.u8(0x3a); // :
    writer.u32(0x74727565); // true
    writer.u8(0x7d); // }
  }

  private writeNumberAsEjson(value: number): void {
    if (this.options.canonical) {
      if (Number.isInteger(value)) {
        // Determine if it fits in Int32 or needs Int64
        if (value >= -2147483648 && value <= 2147483647) {
          this.writeNumberIntWrapper(value);
        } else {
          this.writeNumberLongWrapper(value);
        }
      } else {
        this.writeNumberDoubleWrapper(value);
      }
    } else {
      // Relaxed format
      if (!Number.isFinite(value)) {
        this.writeNumberDoubleWrapper(value);
      } else {
        this.writeNumber(value);
      }
    }
  }

  private writeNumberIntWrapper(value: number): void {
    // Write {"$numberInt":"value"}
    const writer = this.writer;
    writer.u8(0x7b); // {
    writer.u32(0x22246e75);
    writer.u32(0x6d626572);
    writer.u32(0x496e7422); // "$numberInt"
    writer.u8(0x3a); // :
    this.writeStr(value + '');
    writer.u8(0x7d); // }
  }

  private writeNumberLongWrapper(value: number): void {
    // Write {"$numberLong":"value"}
    const writer = this.writer;
    writer.u8(0x7b); // {
    writer.u32(0x22246e75);
    writer.u32(0x6d626572);
    writer.u32(0x4c6f6e67);
    writer.u16(0x223a); // "$numberLong":
    this.writeStr(value + '');
    writer.u8(0x7d); // }
  }

  private writeNumberDoubleWrapper(value: number): void {
    // Write {"$numberDouble":"value"}
    const writer = this.writer;
    writer.u8(0x7b); // {
    writer.u32(0x22246e75);
    writer.u32(0x6d626572);
    writer.u32(0x446f7562);
    writer.u16(0x6c65);
    writer.u16(0x223a); // "$numberDouble":
    if (!Number.isFinite(value)) {
      this.writeStr(this.formatNonFinite(value));
    } else {
      this.writeStr(value + '');
    }
    writer.u8(0x7d); // }
  }

  private writeDateAsEjson(value: Date): void {
    const timestamp = value.getTime();
    // Check if date is valid
    if (Number.isNaN(timestamp)) {
      throw new Error('Invalid Date');
    }

    const writer = this.writer;
    writer.u8(0x7b); // {
    writer.u32(0x22246461);
    writer.u16(0x7465);
    writer.u16(0x223a); // "$date":

    if (this.options.canonical) {
      // Write {"$numberLong":"timestamp"}
      writer.u8(0x7b); // {
      writer.u32(0x22246e75);
      writer.u32(0x6d626572);
      writer.u32(0x4c6f6e67);
      writer.u16(0x223a); // "$numberLong":
      this.writeStr(timestamp + '');
      writer.u8(0x7d); // }
    } else {
      // Use ISO format for dates between 1970-9999 in relaxed mode
      const year = value.getFullYear();
      if (year >= 1970 && year <= 9999) {
        this.writeStr(value.toISOString());
      } else {
        // Write {"$numberLong":"timestamp"}
        writer.u8(0x7b); // {
        writer.u32(0x22246e75);
        writer.u32(0x6d626572);
        writer.u32(0x4c6f6e67);
        writer.u16(0x223a); // "$numberLong":
        this.writeStr(timestamp + '');
        writer.u8(0x7d); // }
      }
    }
    writer.u8(0x7d); // }
  }

  private writeRegExpAsEjson(value: RegExp): void {
    // Write {"$regularExpression":{"pattern":"...","options":"..."}}
    const writer = this.writer;
    writer.u8(0x7b); // {
    writer.u32(0x22247265);
    writer.u32(0x67756c61);
    writer.u32(0x72457870);
    writer.u32(0x72657373);
    writer.u32(0x696f6e22); // "$regularExpression"
    writer.u16(0x3a7b); // :{
    writer.u32(0x22706174);
    writer.u32(0x7465726e);
    writer.u16(0x223a); // "pattern":
    this.writeStr(value.source);
    writer.u8(0x2c); // ,
    writer.u32(0x226f7074);
    writer.u32(0x696f6e73);
    writer.u16(0x223a); // "options":
    this.writeStr(value.flags);
    writer.u16(0x7d7d); // }}
  }

  private writeObjectIdAsEjson(value: BsonObjectId): void {
    // Write {"$oid":"hexstring"}
    const writer = this.writer;
    writer.u8(0x7b); // {
    writer.u32(0x22246f69);
    writer.u16(0x6422); // "$oid"
    writer.u8(0x3a); // :
    this.writeStr(this.objectIdToHex(value));
    writer.u8(0x7d); // }
  }

  private writeBsonInt32AsEjson(value: BsonInt32): void {
    if (this.options.canonical) {
      this.writeNumberIntWrapper(value.value);
    } else {
      this.writeNumber(value.value);
    }
  }

  private writeBsonInt64AsEjson(value: BsonInt64): void {
    if (this.options.canonical) {
      this.writeNumberLongWrapper(value.value);
    } else {
      this.writeNumber(value.value);
    }
  }

  private writeBsonFloatAsEjson(value: BsonFloat): void {
    if (this.options.canonical) {
      this.writeNumberDoubleWrapper(value.value);
    } else {
      if (!Number.isFinite(value.value)) {
        this.writeNumberDoubleWrapper(value.value);
      } else {
        this.writeNumber(value.value);
      }
    }
  }

  private writeBsonDecimal128AsEjson(value: BsonDecimal128): void {
    // Write {"$numberDecimal":"..."}
    const writer = this.writer;
    writer.u8(0x7b); // {
    writer.u32(0x22246e75);
    writer.u32(0x6d626572);
    writer.u32(0x44656369);
    writer.u32(0x6d616c22); // "$numberDecimal"
    writer.u8(0x3a); // :
    this.writeStr(this.decimal128ToString(value.data));
    writer.u8(0x7d); // }
  }

  private writeBsonBinaryAsEjson(value: BsonBinary): void {
    // Write {"$binary":{"base64":"...","subType":"..."}}
    const writer = this.writer;
    writer.u8(0x7b); // {
    writer.u32(0x22246269);
    writer.u32(0x6e617279);
    writer.u16(0x223a); // "$binary":
    writer.u8(0x7b); // {
    writer.u32(0x22626173);
    writer.u32(0x65363422); // "base64"
    writer.u8(0x3a); // :
    this.writeStr(this.uint8ArrayToBase64(value.data));
    writer.u8(0x2c); // ,
    writer.u32(0x22737562);
    writer.u32(0x54797065);
    writer.u16(0x223a); // "subType":
    this.writeStr(value.subtype.toString(16).padStart(2, '0'));
    writer.u16(0x7d7d); // }}
  }

  private writeBsonCodeAsEjson(value: BsonJavascriptCode): void {
    // Write {"$code":"..."}
    const writer = this.writer;
    writer.u8(0x7b); // {
    writer.u32(0x2224636f);
    writer.u16(0x6465);
    writer.u16(0x223a); // "$code":
    this.writeStr(value.code);
    writer.u8(0x7d); // }
  }

  private writeBsonCodeWScopeAsEjson(value: BsonJavascriptCodeWithScope): void {
    // Write {"$code":"...","$scope":{...}}
    const writer = this.writer;
    writer.u8(0x7b); // {
    writer.u32(0x2224636f);
    writer.u16(0x6465);
    writer.u16(0x223a); // "$code":
    this.writeStr(value.code);
    writer.u8(0x2c); // ,
    writer.u32(0x22247363);
    writer.u32(0x6f706522); // "$scope"
    writer.u8(0x3a); // :
    this.writeAny(value.scope);
    writer.u8(0x7d); // }
  }

  private writeBsonSymbolAsEjson(value: BsonSymbol): void {
    // Write {"$symbol":"..."}
    const writer = this.writer;
    writer.u8(0x7b); // {
    writer.u32(0x22247379);
    writer.u32(0x6d626f6c);
    writer.u16(0x223a); // "$symbol":
    this.writeStr(value.symbol);
    writer.u8(0x7d); // }
  }

  private writeBsonTimestampAsEjson(value: BsonTimestamp): void {
    // Write {"$timestamp":{"t":...,"i":...}}
    const writer = this.writer;
    writer.u8(0x7b); // {
    writer.u32(0x22247469);
    writer.u32(0x6d657374);
    writer.u32(0x616d7022); // "$timestamp"
    writer.u16(0x3a7b); // :{
    writer.u16(0x2274);
    writer.u16(0x223a); // "t":
    this.writeNumber(value.timestamp);
    writer.u8(0x2c); // ,
    writer.u16(0x2269);
    writer.u16(0x223a); // "i":
    this.writeNumber(value.increment);
    writer.u16(0x7d7d); // }}
  }

  private writeBsonDbPointerAsEjson(value: BsonDbPointer): void {
    // Write {"$dbPointer":{"$ref":"...","$id":{...}}}
    const writer = this.writer;
    writer.u8(0x7b); // {
    writer.u32(0x22246462);
    writer.u32(0x506f696e);
    writer.u32(0x74657222); // "$dbPointer"
    writer.u16(0x3a7b); // :{
    writer.u32(0x22247265);
    writer.u16(0x6622); // "$ref"
    writer.u8(0x3a); // :
    this.writeStr(value.name);
    writer.u8(0x2c); // ,
    writer.u32(0x22246964);
    writer.u16(0x223a); // "$id":
    this.writeAny(value.id);
    writer.u16(0x7d7d); // }}
  }

  private writeBsonMinKeyAsEjson(): void {
    // Write {"$minKey":1}
    const writer = this.writer;
    writer.u8(0x7b); // {
    writer.u32(0x22246d69);
    writer.u32(0x6e4b6579);
    writer.u16(0x223a); // "$minKey":
    this.writeNumber(1);
    writer.u8(0x7d); // }
  }

  private writeBsonMaxKeyAsEjson(): void {
    // Write {"$maxKey":1}
    const writer = this.writer;
    writer.u8(0x7b); // {
    writer.u32(0x22246d61);
    writer.u32(0x784b6579);
    writer.u16(0x223a); // "$maxKey":
    this.writeNumber(1);
    writer.u8(0x7d); // }
  }

  // Utility methods

  private formatNonFinite(value: number): string {
    if (value === Infinity) return 'Infinity';
    if (value === -Infinity) return '-Infinity';
    return 'NaN';
  }

  private objectIdToHex(objectId: BsonObjectId): string {
    // Convert ObjectId components to 24-character hex string
    const timestamp = objectId.timestamp.toString(16).padStart(8, '0');
    const process = objectId.process.toString(16).padStart(10, '0');
    const counter = objectId.counter.toString(16).padStart(6, '0');
    return timestamp + process + counter;
  }

  private uint8ArrayToBase64(data: Uint8Array): string {
    // Convert Uint8Array to base64 string
    let binary = '';
    for (let i = 0; i < data.length; i++) {
      binary += String.fromCharCode(data[i]);
    }
    return btoa(binary);
  }

  private decimal128ToString(data: Uint8Array): string {
    // This is a simplified implementation
    // In a real implementation, you'd need to parse the IEEE 754-2008 decimal128 format
    // For now, return a placeholder that indicates the format
    return '0'; // TODO: Implement proper decimal128 to string conversion
  }
}
