import type {IWriter, IWriterGrowable} from '@jsonjoy.com/buffers/lib';
import type {BinaryJsonEncoder} from '../types';

/**
 * Apache Avro binary encoder for basic value encoding.
 * Implements the Avro binary encoding specification without schema validation.
 * Based on https://avro.apache.org/docs/1.12.0/specification/
 */
export class AvroEncoder implements BinaryJsonEncoder {
  constructor(public readonly writer: IWriter & IWriterGrowable) {}

  public encode(value: unknown): Uint8Array {
    const writer = this.writer;
    writer.reset();
    this.writeAny(value);
    return writer.flush();
  }

  /**
   * Called when the encoder encounters a value that it does not know how to encode.
   */
  public writeUnknown(value: unknown): void {
    this.writeNull();
  }

  public writeAny(value: unknown): void {
    switch (typeof value) {
      case 'boolean':
        return this.writeBoolean(value);
      case 'number':
        return this.writeNumber(value);
      case 'string':
        return this.writeStr(value);
      case 'object': {
        if (value === null) return this.writeNull();
        const construct = value.constructor;
        switch (construct) {
          case Object:
            return this.writeObj(value as Record<string, unknown>);
          case Array:
            return this.writeArr(value as unknown[]);
          case Uint8Array:
            return this.writeBin(value as Uint8Array);
          default:
            return this.writeUnknown(value);
        }
      }
      case 'bigint':
        return this.writeLong(value);
      case 'undefined':
        return this.writeNull();
      default:
        return this.writeUnknown(value);
    }
  }

  /**
   * Writes an Avro null value.
   */
  public writeNull(): void {
    // Null values are encoded as zero bytes
  }

  /**
   * Writes an Avro boolean value.
   */
  public writeBoolean(bool: boolean): void {
    this.writer.u8(bool ? 1 : 0);
  }

  /**
   * Writes an Avro int value using zigzag encoding.
   */
  public writeInt(int: number): void {
    this.writeVarIntSigned(this.encodeZigZag32(Math.trunc(int)));
  }

  /**
   * Writes an Avro long value using zigzag encoding.
   */
  public writeLong(long: number | bigint): void {
    if (typeof long === 'bigint') {
      this.writeVarLong(this.encodeZigZag64(long));
    } else {
      this.writeVarLong(this.encodeZigZag64(BigInt(Math.trunc(long))));
    }
  }

  /**
   * Writes an Avro float value using IEEE 754 single-precision.
   */
  public writeFloatAvro(float: number): void {
    const writer = this.writer;
    writer.ensureCapacity(4);
    writer.view.setFloat32(writer.x, float, true); // little-endian
    writer.move(4);
  }

  /**
   * Writes an Avro double value using IEEE 754 double-precision.
   */
  public writeDouble(double: number): void {
    const writer = this.writer;
    writer.ensureCapacity(8);
    writer.view.setFloat64(writer.x, double, true); // little-endian
    writer.move(8);
  }

  /**
   * Writes an Avro bytes value with length-prefixed encoding.
   */
  public writeBin(bytes: Uint8Array): void {
    this.writeVarIntUnsigned(bytes.length);
    this.writer.buf(bytes, bytes.length);
  }

  /**
   * Writes an Avro string value with UTF-8 encoding and length prefix.
   */
  public writeStr(str: string): void {
    const writer = this.writer;
    const maxSize = str.length * 4; // Max UTF-8 bytes for string
    writer.ensureCapacity(5 + maxSize); // 5 bytes max for varint length

    // Reserve space for length (we'll come back to fill this)
    const lengthOffset = writer.x;
    writer.x += 5; // Max varint size

    // Write the string and get actual byte count
    const bytesWritten = writer.utf8(str);
    const endPos = writer.x;

    // Go back to encode the actual length
    writer.x = lengthOffset;
    this.writeVarIntUnsigned(bytesWritten);
    const actualLengthSize = writer.x - lengthOffset;

    // If we reserved more space than needed, shift the string data
    if (actualLengthSize < 5) {
      const stringStart = lengthOffset + 5;
      const stringData = writer.uint8.slice(stringStart, endPos);
      writer.x = lengthOffset + actualLengthSize;
      writer.buf(stringData, stringData.length);
    } else {
      writer.x = endPos;
    }
  }

  /**
   * Writes an Avro array with length-prefixed encoding.
   */
  public writeArr(arr: unknown[]): void {
    this.writeVarIntUnsigned(arr.length);
    const length = arr.length;
    for (let i = 0; i < length; i++) {
      this.writeAny(arr[i]);
    }
    this.writeVarIntUnsigned(0); // End of array marker
  }

  /**
   * Writes an Avro map with length-prefixed encoding.
   */
  public writeObj(obj: Record<string, unknown>): void {
    const entries = Object.entries(obj);
    const length = entries.length;
    this.writeVarIntUnsigned(length);
    for (let i = 0; i < length; i++) {
      const entry = entries[i];
      this.writeStr(entry[0]);
      this.writeAny(entry[1]);
    }
    this.writeVarIntUnsigned(0); // End of map marker
  }

  // BinaryJsonEncoder interface methods

  /**
   * Generic number writing - determines type based on value
   */
  public writeNumber(num: number): void {
    if (Number.isInteger(num)) {
      if (num >= -2147483648 && num <= 2147483647) {
        this.writeInt(num);
      } else {
        this.writeLong(num);
      }
    } else {
      this.writeDouble(num);
    }
  }

  /**
   * Writes an integer value
   */
  public writeInteger(int: number): void {
    this.writeInt(int);
  }

  /**
   * Writes an unsigned integer value
   */
  public writeUInteger(uint: number): void {
    this.writeInt(uint);
  }

  /**
   * Writes a float value (interface method)
   */
  public writeFloat(float: number): void {
    this.writeFloatValue(float);
  }

  /**
   * Writes a float value using IEEE 754 single-precision.
   */
  private writeFloatValue(float: number): void {
    const writer = this.writer;
    writer.ensureCapacity(4);
    writer.view.setFloat32(writer.x, float, true); // little-endian
    writer.move(4);
  }

  /**
   * Writes an ASCII string (same as regular string in Avro)
   */
  public writeAsciiStr(str: string): void {
    const writer = this.writer;
    this.writeVarIntUnsigned(str.length);
    writer.ascii(str);
  }

  // Utility methods for Avro encoding

  /**
   * Encodes a variable-length integer (for signed values with zigzag)
   */
  private writeVarIntSigned(value: number): void {
    const writer = this.writer;
    let n = value >>> 0; // Convert to unsigned 32-bit
    while (n >= 0x80) {
      writer.u8((n & 0x7f) | 0x80);
      n >>>= 7;
    }
    writer.u8(n & 0x7f);
  }

  /**
   * Encodes a variable-length integer (for unsigned values like lengths)
   */
  private writeVarIntUnsigned(value: number): void {
    const writer = this.writer;
    let n = value >>> 0; // Convert to unsigned 32-bit
    while (n >= 0x80) {
      writer.u8((n & 0x7f) | 0x80);
      n >>>= 7;
    }
    writer.u8(n & 0x7f);
  }

  /**
   * Encodes a variable-length long using Avro's encoding
   */
  private writeVarLong(value: bigint): void {
    const writer = this.writer;
    let n = value;
    const mask = BigInt(0x7f);
    const shift = BigInt(7);

    while (n >= BigInt(0x80)) {
      writer.u8(Number((n & mask) | BigInt(0x80)));
      n >>= shift;
    }
    writer.u8(Number(n & mask));
  }

  /**
   * Encodes a 32-bit integer using zigzag encoding
   */
  private encodeZigZag32(value: number): number {
    return (value << 1) ^ (value >> 31);
  }

  /**
   * Encodes a 64-bit integer using zigzag encoding
   */
  private encodeZigZag64(value: bigint): bigint {
    return (value << BigInt(1)) ^ (value >> BigInt(63));
  }
}
