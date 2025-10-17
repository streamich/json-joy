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
import {JsonDecoder} from '../json/JsonDecoder';
import {readKey} from '../json/JsonDecoder';

export interface EjsonDecoderOptions {
  /** Whether to parse legacy Extended JSON formats */
  legacy?: boolean;
}

export class EjsonDecoder extends JsonDecoder {
  constructor(private options: EjsonDecoderOptions = {}) {
    super();
  }

  /**
   * Decode from string (for backward compatibility).
   * This method maintains the previous API but uses the binary decoder internally.
   */
  public decodeFromString(json: string): unknown {
    const bytes = new TextEncoder().encode(json);
    return this.decode(bytes);
  }

  public readAny(): unknown {
    this.skipWhitespace();
    const reader = this.reader;
    const uint8 = reader.uint8;
    const char = uint8[reader.x];
    switch (char) {
      case 34 /* " */:
        return this.readStr();
      case 91 /* [ */:
        return this.readArr();
      case 102 /* f */:
        return this.readFalse();
      case 110 /* n */:
        return this.readNull();
      case 116 /* t */:
        return this.readTrue();
      case 123 /* { */:
        return this.readObjWithEjsonSupport();
      default:
        if ((char >= 48 /* 0 */ && char <= 57) /* 9 */ || char === 45 /* - */) return this.readNum();
        throw new Error('Invalid JSON');
    }
  }

  public readArr(): unknown[] {
    const reader = this.reader;
    if (reader.u8() !== 0x5b /* [ */) throw new Error('Invalid JSON');
    const arr: unknown[] = [];
    const uint8 = reader.uint8;
    let first = true;
    while (true) {
      this.skipWhitespace();
      const char = uint8[reader.x];
      if (char === 0x5d /* ] */) return reader.x++, arr;
      if (char === 0x2c /* , */) reader.x++;
      else if (!first) throw new Error('Invalid JSON');
      this.skipWhitespace();
      arr.push(this.readAny()); // Arrays should process EJSON objects recursively
      first = false;
    }
  }

  public readObjWithEjsonSupport(): unknown {
    const reader = this.reader;
    if (reader.u8() !== 0x7b /* { */) throw new Error('Invalid JSON');
    const obj: Record<string, unknown> = {};
    const uint8 = reader.uint8;
    let first = true;
    while (true) {
      this.skipWhitespace();
      let char = uint8[reader.x];
      if (char === 0x7d /* } */) {
        reader.x++;
        // Check if this is an EJSON type wrapper
        return this.transformEjsonObject(obj);
      }
      if (char === 0x2c /* , */) reader.x++;
      else if (!first) throw new Error('Invalid JSON');
      this.skipWhitespace();
      char = uint8[reader.x++];
      if (char !== 0x22 /* " */) throw new Error('Invalid JSON');
      const key = readKey(reader);
      if (key === '__proto__') throw new Error('Invalid JSON');
      this.skipWhitespace();
      if (reader.u8() !== 0x3a /* : */) throw new Error('Invalid JSON');
      this.skipWhitespace();

      // For EJSON type wrapper detection, we need to read nested objects as raw first
      obj[key] = this.readValue();
      first = false;
    }
  }

  private readValue(): unknown {
    this.skipWhitespace();
    const reader = this.reader;
    const uint8 = reader.uint8;
    const char = uint8[reader.x];
    switch (char) {
      case 34 /* " */:
        return this.readStr();
      case 91 /* [ */:
        return this.readArr();
      case 102 /* f */:
        return this.readFalse();
      case 110 /* n */:
        return this.readNull();
      case 116 /* t */:
        return this.readTrue();
      case 123 /* { */:
        return this.readRawObj(); // Read as raw object first
      default:
        if ((char >= 48 /* 0 */ && char <= 57) /* 9 */ || char === 45 /* - */) return this.readNum();
        throw new Error('Invalid JSON');
    }
  }

  private readRawObj(): Record<string, unknown> {
    const reader = this.reader;
    if (reader.u8() !== 0x7b /* { */) throw new Error('Invalid JSON');
    const obj: Record<string, unknown> = {};
    const uint8 = reader.uint8;
    let first = true;
    while (true) {
      this.skipWhitespace();
      let char = uint8[reader.x];
      if (char === 0x7d /* } */) {
        reader.x++;
        return obj; // Return raw object without transformation
      }
      if (char === 0x2c /* , */) reader.x++;
      else if (!first) throw new Error('Invalid JSON');
      this.skipWhitespace();
      char = uint8[reader.x++];
      if (char !== 0x22 /* " */) throw new Error('Invalid JSON');
      const key = readKey(reader);
      if (key === '__proto__') throw new Error('Invalid JSON');
      this.skipWhitespace();
      if (reader.u8() !== 0x3a /* : */) throw new Error('Invalid JSON');
      this.skipWhitespace();
      obj[key] = this.readValue();
      first = false;
    }
  }

  private transformEjsonObject(obj: Record<string, unknown>): unknown {
    const keys = Object.keys(obj);

    // Helper function to validate exact key match
    const hasExactKeys = (expectedKeys: string[]): boolean => {
      if (keys.length !== expectedKeys.length) return false;
      return expectedKeys.every((key) => keys.includes(key));
    };

    // Check if object has any special $ keys that indicate a type wrapper
    const specialKeys = keys.filter((key) => key.startsWith('$'));

    if (specialKeys.length > 0) {
      // ObjectId
      if (specialKeys.includes('$oid')) {
        if (!hasExactKeys(['$oid'])) {
          throw new Error('Invalid ObjectId format: extra keys not allowed');
        }
        const oidStr = obj.$oid as string;
        if (typeof oidStr === 'string' && /^[0-9a-fA-F]{24}$/.test(oidStr)) {
          return this.parseObjectId(oidStr);
        }
        throw new Error('Invalid ObjectId format');
      }

      // Int32
      if (specialKeys.includes('$numberInt')) {
        if (!hasExactKeys(['$numberInt'])) {
          throw new Error('Invalid Int32 format: extra keys not allowed');
        }
        const intStr = obj.$numberInt as string;
        if (typeof intStr === 'string') {
          const value = parseInt(intStr, 10);
          if (!Number.isNaN(value) && value >= -2147483648 && value <= 2147483647) {
            return new BsonInt32(value);
          }
        }
        throw new Error('Invalid Int32 format');
      }

      // Int64
      if (specialKeys.includes('$numberLong')) {
        if (!hasExactKeys(['$numberLong'])) {
          throw new Error('Invalid Int64 format: extra keys not allowed');
        }
        const longStr = obj.$numberLong as string;
        if (typeof longStr === 'string') {
          const value = parseFloat(longStr); // Use parseFloat to handle large numbers better
          if (!Number.isNaN(value)) {
            return new BsonInt64(value);
          }
        }
        throw new Error('Invalid Int64 format');
      }

      // Double
      if (specialKeys.includes('$numberDouble')) {
        if (!hasExactKeys(['$numberDouble'])) {
          throw new Error('Invalid Double format: extra keys not allowed');
        }
        const doubleStr = obj.$numberDouble as string;
        if (typeof doubleStr === 'string') {
          if (doubleStr === 'Infinity') return new BsonFloat(Infinity);
          if (doubleStr === '-Infinity') return new BsonFloat(-Infinity);
          if (doubleStr === 'NaN') return new BsonFloat(NaN);
          const value = parseFloat(doubleStr);
          if (!Number.isNaN(value)) {
            return new BsonFloat(value);
          }
        }
        throw new Error('Invalid Double format');
      }

      // Decimal128
      if (specialKeys.includes('$numberDecimal')) {
        if (!hasExactKeys(['$numberDecimal'])) {
          throw new Error('Invalid Decimal128 format: extra keys not allowed');
        }
        const decimalStr = obj.$numberDecimal as string;
        if (typeof decimalStr === 'string') {
          return new BsonDecimal128(new Uint8Array(16));
        }
        throw new Error('Invalid Decimal128 format');
      }

      // Binary
      if (specialKeys.includes('$binary')) {
        if (!hasExactKeys(['$binary'])) {
          throw new Error('Invalid Binary format: extra keys not allowed');
        }
        const binaryObj = obj.$binary as Record<string, unknown>;
        if (typeof binaryObj === 'object' && binaryObj !== null) {
          const binaryKeys = Object.keys(binaryObj);
          if (binaryKeys.length === 2 && binaryKeys.includes('base64') && binaryKeys.includes('subType')) {
            const base64 = binaryObj.base64 as string;
            const subType = binaryObj.subType as string;
            if (typeof base64 === 'string' && typeof subType === 'string') {
              const data = this.base64ToUint8Array(base64);
              const subtype = parseInt(subType, 16);
              return new BsonBinary(subtype, data);
            }
          }
        }
        throw new Error('Invalid Binary format');
      }

      // UUID (special case of Binary)
      if (specialKeys.includes('$uuid')) {
        if (!hasExactKeys(['$uuid'])) {
          throw new Error('Invalid UUID format: extra keys not allowed');
        }
        const uuidStr = obj.$uuid as string;
        if (typeof uuidStr === 'string' && this.isValidUuid(uuidStr)) {
          const data = this.uuidToBytes(uuidStr);
          return new BsonBinary(4, data); // Subtype 4 for UUID
        }
        throw new Error('Invalid UUID format');
      }

      // Code
      if (specialKeys.includes('$code') && !specialKeys.includes('$scope')) {
        if (!hasExactKeys(['$code'])) {
          throw new Error('Invalid Code format: extra keys not allowed');
        }
        const code = obj.$code as string;
        if (typeof code === 'string') {
          return new BsonJavascriptCode(code);
        }
        throw new Error('Invalid Code format');
      }

      // CodeWScope
      if (specialKeys.includes('$code') && specialKeys.includes('$scope')) {
        if (!hasExactKeys(['$code', '$scope'])) {
          throw new Error('Invalid CodeWScope format: extra keys not allowed');
        }
        const code = obj.$code as string;
        const scope = obj.$scope;
        if (typeof code === 'string' && typeof scope === 'object' && scope !== null) {
          return new BsonJavascriptCodeWithScope(
            code,
            this.transformEjsonObject(scope as Record<string, unknown>) as Record<string, unknown>,
          );
        }
        throw new Error('Invalid CodeWScope format');
      }

      // Symbol
      if (specialKeys.includes('$symbol')) {
        if (!hasExactKeys(['$symbol'])) {
          throw new Error('Invalid Symbol format: extra keys not allowed');
        }
        const symbol = obj.$symbol as string;
        if (typeof symbol === 'string') {
          return new BsonSymbol(symbol);
        }
        throw new Error('Invalid Symbol format');
      }

      // Timestamp
      if (specialKeys.includes('$timestamp')) {
        if (!hasExactKeys(['$timestamp'])) {
          throw new Error('Invalid Timestamp format: extra keys not allowed');
        }
        const timestampObj = obj.$timestamp as Record<string, unknown>;
        if (typeof timestampObj === 'object' && timestampObj !== null) {
          const timestampKeys = Object.keys(timestampObj);
          if (timestampKeys.length === 2 && timestampKeys.includes('t') && timestampKeys.includes('i')) {
            const t = timestampObj.t as number;
            const i = timestampObj.i as number;
            if (typeof t === 'number' && typeof i === 'number' && t >= 0 && i >= 0) {
              return new BsonTimestamp(i, t);
            }
          }
        }
        throw new Error('Invalid Timestamp format');
      }

      // Regular Expression
      if (specialKeys.includes('$regularExpression')) {
        if (!hasExactKeys(['$regularExpression'])) {
          throw new Error('Invalid RegularExpression format: extra keys not allowed');
        }
        const regexObj = obj.$regularExpression as Record<string, unknown>;
        if (typeof regexObj === 'object' && regexObj !== null) {
          const regexKeys = Object.keys(regexObj);
          if (regexKeys.length === 2 && regexKeys.includes('pattern') && regexKeys.includes('options')) {
            const pattern = regexObj.pattern as string;
            const options = regexObj.options as string;
            if (typeof pattern === 'string' && typeof options === 'string') {
              return new RegExp(pattern, options);
            }
          }
        }
        throw new Error('Invalid RegularExpression format');
      }

      // DBPointer
      if (specialKeys.includes('$dbPointer')) {
        if (!hasExactKeys(['$dbPointer'])) {
          throw new Error('Invalid DBPointer format: extra keys not allowed');
        }
        const dbPointerObj = obj.$dbPointer as Record<string, unknown>;
        if (typeof dbPointerObj === 'object' && dbPointerObj !== null) {
          const dbPointerKeys = Object.keys(dbPointerObj);
          if (dbPointerKeys.length === 2 && dbPointerKeys.includes('$ref') && dbPointerKeys.includes('$id')) {
            const ref = dbPointerObj.$ref as string;
            const id = dbPointerObj.$id;
            if (typeof ref === 'string' && id !== undefined) {
              const transformedId = this.transformEjsonObject(id as Record<string, unknown>) as BsonObjectId;
              if (transformedId instanceof BsonObjectId) {
                return new BsonDbPointer(ref, transformedId);
              }
            }
          }
        }
        throw new Error('Invalid DBPointer format');
      }

      // Date
      if (specialKeys.includes('$date')) {
        if (!hasExactKeys(['$date'])) {
          throw new Error('Invalid Date format: extra keys not allowed');
        }
        const dateValue = obj.$date;
        if (typeof dateValue === 'string') {
          // ISO-8601 format (relaxed)
          const date = new Date(dateValue);
          if (!Number.isNaN(date.getTime())) {
            return date;
          }
        } else if (typeof dateValue === 'object' && dateValue !== null) {
          // Canonical format with $numberLong
          const longObj = dateValue as Record<string, unknown>;
          const longKeys = Object.keys(longObj);
          if (longKeys.length === 1 && longKeys[0] === '$numberLong' && typeof longObj.$numberLong === 'string') {
            const timestamp = parseFloat(longObj.$numberLong);
            if (!Number.isNaN(timestamp)) {
              return new Date(timestamp);
            }
          }
        }
        throw new Error('Invalid Date format');
      }

      // MinKey
      if (specialKeys.includes('$minKey')) {
        if (!hasExactKeys(['$minKey'])) {
          throw new Error('Invalid MinKey format: extra keys not allowed');
        }
        if (obj.$minKey === 1) {
          return new BsonMinKey();
        }
        throw new Error('Invalid MinKey format');
      }

      // MaxKey
      if (specialKeys.includes('$maxKey')) {
        if (!hasExactKeys(['$maxKey'])) {
          throw new Error('Invalid MaxKey format: extra keys not allowed');
        }
        if (obj.$maxKey === 1) {
          return new BsonMaxKey();
        }
        throw new Error('Invalid MaxKey format');
      }

      // Undefined
      if (specialKeys.includes('$undefined')) {
        if (!hasExactKeys(['$undefined'])) {
          throw new Error('Invalid Undefined format: extra keys not allowed');
        }
        if (obj.$undefined === true) {
          return undefined;
        }
        throw new Error('Invalid Undefined format');
      }
    }

    // DBRef (not a BSON type, but a convention) - special case, can have additional fields
    if (keys.includes('$ref') && keys.includes('$id')) {
      const ref = obj.$ref as string;
      const id = this.transformEjsonObject(obj.$id as Record<string, unknown>);
      const result: Record<string, unknown> = {$ref: ref, $id: id};

      if (keys.includes('$db')) {
        result.$db = obj.$db;
      }

      // Add any other fields
      for (const key of keys) {
        if (key !== '$ref' && key !== '$id' && key !== '$db') {
          result[key] = this.transformEjsonObject(obj[key] as Record<string, unknown>);
        }
      }

      return result;
    }

    // Regular object - transform all properties
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(obj)) {
      if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
        result[key] = this.transformEjsonObject(val as Record<string, unknown>);
      } else if (Array.isArray(val)) {
        result[key] = val.map((item) =>
          typeof item === 'object' && item !== null && !Array.isArray(item)
            ? this.transformEjsonObject(item as Record<string, unknown>)
            : item,
        );
      } else {
        result[key] = val;
      }
    }
    return result;
  }

  // Utility methods
  private parseObjectId(hex: string): BsonObjectId {
    // Parse 24-character hex string into ObjectId components
    const timestamp = parseInt(hex.slice(0, 8), 16);
    const process = parseInt(hex.slice(8, 18), 16);
    const counter = parseInt(hex.slice(18, 24), 16);
    return new BsonObjectId(timestamp, process, counter);
  }

  private base64ToUint8Array(base64: string): Uint8Array {
    // Convert base64 string to Uint8Array
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  private isValidUuid(uuid: string): boolean {
    // UUID pattern: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    const uuidPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    return uuidPattern.test(uuid);
  }

  private uuidToBytes(uuid: string): Uint8Array {
    // Convert UUID string to 16-byte array
    const hex = uuid.replace(/-/g, '');
    const bytes = new Uint8Array(16);
    for (let i = 0; i < 16; i++) {
      bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }
    return bytes;
  }
}
