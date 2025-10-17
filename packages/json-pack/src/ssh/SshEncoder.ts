import {JsonPackMpint} from '../JsonPackMpint';
import type {IWriter, IWriterGrowable} from '@jsonjoy.com/buffers/lib';
import type {BinaryJsonEncoder} from '../types';

/**
 * SSH 2.0 binary encoder for SSH protocol data types.
 * Implements SSH binary encoding according to RFC 4251.
 *
 * Key SSH encoding principles:
 * - Multi-byte quantities are transmitted in big-endian byte order (network byte order)
 * - Strings are length-prefixed with uint32
 * - No padding is used (unlike XDR)
 */
export class SshEncoder implements BinaryJsonEncoder {
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
    throw new Error('SSH encoder does not support unknown types');
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
          case Uint8Array:
            return this.writeBin(value as Uint8Array);
          case Array:
            return this.writeNameList(value as string[]);
          case JsonPackMpint:
            return this.writeMpint(value as JsonPackMpint);
          default:
            return this.writeUnknown(value);
        }
      }
      case 'bigint':
        return this.writeUint64(value);
      case 'undefined':
        return this.writeNull();
      default:
        return this.writeUnknown(value);
    }
  }

  /**
   * SSH doesn't have a null type, but we provide it for interface compatibility.
   */
  public writeNull(): void {
    throw new Error('SSH protocol does not have a null type');
  }

  /**
   * Writes an SSH boolean value as a single byte.
   * The value 0 represents FALSE, and the value 1 represents TRUE.
   */
  public writeBoolean(bool: boolean): void {
    this.writer.u8(bool ? 1 : 0);
  }

  /**
   * Writes an SSH byte value (8-bit).
   */
  public writeByte(byte: number): void {
    this.writer.u8(byte & 0xff);
  }

  /**
   * Writes an SSH uint32 value in big-endian format.
   */
  public writeUint32(uint: number): void {
    const writer = this.writer;
    writer.ensureCapacity(4);
    writer.view.setUint32(writer.x, Math.trunc(uint) >>> 0, false); // big-endian
    writer.move(4);
  }

  /**
   * Writes an SSH uint64 value in big-endian format.
   */
  public writeUint64(uint: number | bigint): void {
    const writer = this.writer;
    writer.ensureCapacity(8);

    if (typeof uint === 'bigint') {
      writer.view.setBigUint64(writer.x, uint, false); // big-endian
    } else {
      const truncated = Math.trunc(Math.abs(uint));
      const high = Math.floor(truncated / 0x100000000);
      const low = truncated >>> 0;
      writer.view.setUint32(writer.x, high, false); // high 32 bits
      writer.view.setUint32(writer.x + 4, low, false); // low 32 bits
    }
    writer.move(8);
  }

  /**
   * Writes an SSH string as binary data (Uint8Array).
   * Format: uint32 length + data bytes (no padding).
   */
  public writeBinStr(data: Uint8Array): void {
    this.writeUint32(data.length);
    this.writer.buf(data, data.length);
  }

  /**
   * Writes an SSH string with UTF-8 encoding.
   * Format: uint32 length + UTF-8 bytes (no padding).
   */
  public writeStr(str: string): void {
    const writer = this.writer;
    const maxSize = str.length * 4; // Max UTF-8 bytes for string
    writer.ensureCapacity(4 + maxSize);

    // Reserve space for length
    const lengthOffset = writer.x;
    writer.x += 4;

    // Write the string and get actual byte count
    const bytesWritten = writer.utf8(str);

    // Go back to encode the actual length
    const endPos = writer.x;
    writer.x = lengthOffset;
    this.writeUint32(bytesWritten);
    writer.x = endPos;
  }

  /**
   * Writes an SSH string with ASCII encoding.
   * Format: uint32 length + ASCII bytes (no padding).
   */
  public writeAsciiStr(str: string): void {
    const writer = this.writer;
    writer.ensureCapacity(4 + str.length);

    this.writeUint32(str.length);
    for (let i = 0; i < str.length; i++) {
      writer.u8(str.charCodeAt(i) & 0x7f); // ASCII only
    }
  }

  /**
   * Writes an SSH mpint (multiple precision integer).
   * Format: uint32 length + data bytes in two's complement format, MSB first.
   */
  public writeMpint(mpint: JsonPackMpint): void {
    this.writeUint32(mpint.data.length);
    this.writer.buf(mpint.data, mpint.data.length);
  }

  /**
   * Writes an SSH name-list.
   * Format: uint32 length + comma-separated names.
   */
  public writeNameList(names: string[]): void {
    const nameListStr = names.join(',');
    this.writeAsciiStr(nameListStr);
  }

  // BinaryJsonEncoder interface methods

  /**
   * Generic number writing - writes as uint32 by default
   */
  public writeNumber(num: number): void {
    if (Number.isInteger(num)) {
      if (num >= 0 && num <= 0xffffffff) {
        this.writeUint32(num);
      } else {
        this.writeUint64(num);
      }
    } else {
      throw new Error('SSH protocol does not support floating point numbers');
    }
  }

  /**
   * Writes an integer value as uint32
   */
  public writeInteger(int: number): void {
    this.writeUint32(int);
  }

  /**
   * Writes an unsigned integer value as uint32
   */
  public writeUInteger(uint: number): void {
    this.writeUint32(uint);
  }

  /**
   * Writes a float value - SSH doesn't support floats
   */
  public writeFloat(float: number): void {
    throw new Error('SSH protocol does not support floating point numbers');
  }

  /**
   * Writes binary data as SSH string
   */
  public writeBin(buf: Uint8Array): void {
    this.writeBinStr(buf);
  }

  /**
   * Writes arrays - not supported in base SSH protocol
   */
  public writeArr(arr: unknown[]): void {
    throw new Error('SSH protocol does not have a generic array type. Use writeNameList for name-list type.');
  }

  /**
   * Writes objects - not supported in base SSH protocol
   */
  public writeObj(obj: Record<string, unknown>): void {
    throw new Error('SSH protocol does not have an object type');
  }
}
