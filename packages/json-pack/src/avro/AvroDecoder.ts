import {Reader} from '@jsonjoy.com/buffers/lib/Reader';
import type {BinaryJsonDecoder} from '../types';

/**
 * Apache Avro binary decoder for basic value decoding.
 * Implements the Avro binary decoding specification without schema validation.
 * Based on https://avro.apache.org/docs/1.12.0/specification/
 */
export class AvroDecoder implements BinaryJsonDecoder {
  public reader = new Reader();

  public read(uint8: Uint8Array): unknown {
    this.reader.reset(uint8);
    return this.readAny();
  }

  public decode(uint8: Uint8Array): unknown {
    this.reader.reset(uint8);
    return this.readAny();
  }

  /**
   * Generic method to read any value - typically used when schema type is unknown
   */
  public readAny(): unknown {
    throw new Error('readAny() requires schema information. Use readNull, readBoolean, etc. directly.');
  }

  /**
   * Reads an Avro null value.
   */
  public readNull(): null {
    // Null values are encoded as zero bytes
    return null;
  }

  /**
   * Reads an Avro boolean value.
   */
  public readBoolean(): boolean {
    return this.reader.u8() === 1;
  }

  /**
   * Reads an Avro int value using zigzag decoding.
   */
  public readInt(): number {
    const zigzag = this.readVarIntUnsigned();
    return this.decodeZigZag32(zigzag);
  }

  /**
   * Reads an Avro long value using zigzag decoding.
   */
  public readLong(): number | bigint {
    const zigzag = this.readVarLong();
    const decoded = this.decodeZigZag64(zigzag);

    // Return number if it fits in safe integer range, otherwise bigint
    if (decoded >= BigInt(Number.MIN_SAFE_INTEGER) && decoded <= BigInt(Number.MAX_SAFE_INTEGER)) {
      return Number(decoded);
    }
    return decoded;
  }

  /**
   * Reads an Avro float value using IEEE 754 single-precision.
   */
  public readFloat(): number {
    const reader = this.reader;
    const value = reader.view.getFloat32(reader.x, true); // little-endian
    reader.x += 4;
    return value;
  }

  /**
   * Reads an Avro double value using IEEE 754 double-precision.
   */
  public readDouble(): number {
    const reader = this.reader;
    const value = reader.view.getFloat64(reader.x, true); // little-endian
    reader.x += 8;
    return value;
  }

  /**
   * Reads an Avro bytes value with length-prefixed encoding.
   */
  public readBytes(): Uint8Array {
    const length = this.readVarIntUnsigned();
    return this.reader.buf(length);
  }

  /**
   * Reads an Avro string value with UTF-8 encoding and length prefix.
   */
  public readString(): string {
    const length = this.readVarIntUnsigned();
    const bytes = this.reader.buf(length);
    return new TextDecoder().decode(bytes);
  }

  /**
   * Reads an Avro array with length-prefixed encoding.
   * The itemReader function is called for each array item.
   */
  public readArray<T>(itemReader: () => T): T[] {
    const result: T[] = [];

    while (true) {
      const count = this.readVarIntUnsigned();
      if (count === 0) break; // End of array marker

      for (let i = 0; i < count; i++) {
        result.push(itemReader());
      }
    }

    return result;
  }

  /**
   * Reads an Avro map with length-prefixed encoding.
   * The valueReader function is called for each map value.
   */
  public readMap<T>(valueReader: () => T): Record<string, T> {
    const result: Record<string, T> = {};

    while (true) {
      const count = this.readVarIntUnsigned();
      if (count === 0) break; // End of map marker

      for (let i = 0; i < count; i++) {
        const key = this.readString();
        if (key === '__proto__') throw new Error('INVALID_KEY');
        result[key] = valueReader();
      }
    }

    return result;
  }

  /**
   * Reads an Avro union value.
   * Returns an object with index and value.
   */
  public readUnion<T>(schemaReaders: Array<() => T>): {index: number; value: T} {
    const index = this.decodeZigZag32(this.readVarIntUnsigned());
    if (index < 0 || index >= schemaReaders.length) {
      throw new Error(`Invalid union index: ${index}`);
    }

    const value = schemaReaders[index]();
    return {index, value};
  }

  /**
   * Reads an Avro enum value.
   * Returns the symbol index.
   */
  public readEnum(): number {
    return this.decodeZigZag32(this.readVarIntUnsigned());
  }

  /**
   * Reads an Avro fixed value with specified length.
   */
  public readFixed(size: number): Uint8Array {
    return this.reader.buf(size);
  }

  /**
   * Reads an Avro record.
   * The fieldReaders array contains functions to read each field in order.
   */
  public readRecord<T>(fieldReaders: Array<() => any>): T {
    const result: any = {};
    for (let i = 0; i < fieldReaders.length; i++) {
      const fieldValue = fieldReaders[i]();
      // Note: This generic record reader doesn't know field names
      // The schema-aware decoder will handle proper field mapping
      result[`field${i}`] = fieldValue;
    }
    return result as T;
  }

  // Utility methods for Avro decoding

  /**
   * Reads a variable-length integer (for unsigned values like lengths)
   */
  private readVarIntUnsigned(): number {
    const reader = this.reader;
    let result = 0;
    let shift = 0;

    while (true) {
      const byte = reader.u8();
      result |= (byte & 0x7f) << shift;

      if ((byte & 0x80) === 0) break;

      shift += 7;
      if (shift >= 32) {
        throw new Error('Variable-length integer is too long');
      }
    }

    return result >>> 0; // Convert to unsigned 32-bit
  }

  /**
   * Reads a variable-length long
   */
  private readVarLong(): bigint {
    const reader = this.reader;
    let result = BigInt(0);
    let shift = BigInt(0);

    while (true) {
      const byte = BigInt(reader.u8());
      result |= (byte & BigInt(0x7f)) << shift;

      if ((byte & BigInt(0x80)) === BigInt(0)) break;

      shift += BigInt(7);
      if (shift >= BigInt(64)) {
        throw new Error('Variable-length long is too long');
      }
    }

    return result;
  }

  /**
   * Decodes a 32-bit integer using zigzag decoding
   */
  private decodeZigZag32(value: number): number {
    return (value >>> 1) ^ -(value & 1);
  }

  /**
   * Decodes a 64-bit integer using zigzag decoding
   */
  private decodeZigZag64(value: bigint): bigint {
    return (value >> BigInt(1)) ^ -(value & BigInt(1));
  }
}
