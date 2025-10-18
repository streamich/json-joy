import {Reader} from '@jsonjoy.com/buffers/lib/Reader';
import {JsonPackMpint} from '../JsonPackMpint';
import type {IReader, IReaderResettable} from '@jsonjoy.com/buffers/lib';
import type {BinaryJsonDecoder} from '../types';

/**
 * SSH 2.0 binary decoder for SSH protocol data types.
 * Implements SSH binary decoding according to RFC 4251.
 *
 * Key SSH decoding principles:
 * - Multi-byte quantities are transmitted in big-endian byte order (network byte order)
 * - Strings are length-prefixed with uint32
 * - No padding is used (unlike XDR)
 */
export class SshDecoder<R extends IReader & IReaderResettable = IReader & IReaderResettable>
  implements BinaryJsonDecoder
{
  public constructor(public reader: R = new Reader() as any) {}

  public read(uint8: Uint8Array): unknown {
    this.reader.reset(uint8);
    return this.readAny();
  }

  public decode(uint8: Uint8Array): unknown {
    this.reader.reset(uint8);
    return this.readAny();
  }

  public readAny(): unknown {
    // Basic implementation - in practice this would need schema info
    // For now, we'll throw as this should be used with explicit type methods
    throw new Error('SshDecoder.readAny() requires explicit type methods');
  }

  /**
   * Reads an SSH boolean value as a single byte.
   * Returns true for non-zero values, false for zero.
   */
  public readBoolean(): boolean {
    return this.reader.u8() !== 0;
  }

  /**
   * Reads an SSH byte value (8-bit).
   */
  public readByte(): number {
    return this.reader.u8();
  }

  /**
   * Reads an SSH uint32 value in big-endian format.
   */
  public readUint32(): number {
    const reader = this.reader;
    const value = reader.view.getUint32(reader.x, false); // false = big-endian
    reader.x += 4;
    return value;
  }

  /**
   * Reads an SSH uint64 value in big-endian format.
   */
  public readUint64(): bigint {
    const reader = this.reader;
    const value = reader.view.getBigUint64(reader.x, false); // false = big-endian
    reader.x += 8;
    return value;
  }

  /**
   * Reads an SSH string as binary data (Uint8Array).
   * Format: uint32 length + data bytes (no padding).
   */
  public readBinStr(): Uint8Array {
    const length = this.readUint32();
    const reader = this.reader;
    const data = new Uint8Array(length);

    for (let i = 0; i < length; i++) {
      data[i] = reader.u8();
    }

    return data;
  }

  /**
   * Reads an SSH string with UTF-8 encoding.
   * Format: uint32 length + UTF-8 bytes (no padding).
   */
  public readStr(): string {
    const length = this.readUint32();
    const reader = this.reader;

    // Read UTF-8 bytes
    const utf8Bytes = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      utf8Bytes[i] = reader.u8();
    }

    // Decode UTF-8 to string
    return new TextDecoder('utf-8').decode(utf8Bytes);
  }

  /**
   * Reads an SSH string with ASCII encoding.
   * Format: uint32 length + ASCII bytes (no padding).
   */
  public readAsciiStr(): string {
    const length = this.readUint32();
    const reader = this.reader;
    let str = '';

    for (let i = 0; i < length; i++) {
      str += String.fromCharCode(reader.u8());
    }

    return str;
  }

  /**
   * Reads an SSH mpint (multiple precision integer).
   * Format: uint32 length + data bytes in two's complement format, MSB first.
   */
  public readMpint(): JsonPackMpint {
    const length = this.readUint32();
    const reader = this.reader;
    const data = new Uint8Array(length);

    for (let i = 0; i < length; i++) {
      data[i] = reader.u8();
    }

    return new JsonPackMpint(data);
  }

  /**
   * Reads an SSH name-list.
   * Format: uint32 length + comma-separated names.
   * Returns an array of name strings.
   */
  public readNameList(): string[] {
    const nameListStr = this.readAsciiStr();
    if (nameListStr === '') {
      return [];
    }
    return nameListStr.split(',');
  }

  /**
   * Reads binary data as SSH string (alias for readBinStr)
   */
  public readBin(): Uint8Array {
    return this.readBinStr();
  }
}
