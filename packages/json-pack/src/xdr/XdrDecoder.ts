import {Reader} from '@jsonjoy.com/buffers/lib/Reader';
import type {IReader, IReaderResettable} from '@jsonjoy.com/buffers/lib';
import type {BinaryJsonDecoder} from '../types';

/**
 * XDR (External Data Representation) binary decoder for basic value decoding.
 * Implements XDR binary decoding according to RFC 4506.
 *
 * Key XDR decoding principles:
 * - All data types are aligned to 4-byte boundaries
 * - Multi-byte quantities are transmitted in big-endian byte order
 * - Strings and opaque data are padded to 4-byte boundaries
 * - Variable-length arrays and strings are preceded by their length
 */
export class XdrDecoder<R extends IReader & IReaderResettable = IReader & IReaderResettable>
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
    // For now, we'll throw as this should be used with schema decoder
    throw new Error('not implemented');
  }

  /**
   * Reads an XDR void value (no data is actually read).
   */
  public readVoid(): void {
    // Void values have no representation in XDR
  }

  /**
   * Reads an XDR boolean value as a 4-byte integer.
   * Returns true for non-zero values, false for zero.
   */
  public readBoolean(): boolean {
    return this.readInt() !== 0;
  }

  /**
   * Reads an XDR signed 32-bit integer in big-endian format.
   */
  public readInt(): number {
    const reader = this.reader;
    const value = reader.view.getInt32(reader.x, false); // false = big-endian
    reader.x += 4;
    return value;
  }

  /**
   * Reads an XDR unsigned 32-bit integer in big-endian format.
   */
  public readUnsignedInt(): number {
    const reader = this.reader;
    const value = reader.view.getUint32(reader.x, false); // false = big-endian
    reader.x += 4;
    return value;
  }

  /**
   * Reads an XDR signed 64-bit integer (hyper) in big-endian format.
   */
  public readHyper(): bigint {
    const reader = this.reader;
    const value = reader.view.getBigInt64(reader.x, false); // false = big-endian
    reader.x += 8;
    return value;
  }

  /**
   * Reads an XDR unsigned 64-bit integer (unsigned hyper) in big-endian format.
   */
  public readUnsignedHyper(): bigint {
    const reader = this.reader;
    const value = reader.view.getBigUint64(reader.x, false); // false = big-endian
    reader.x += 8;
    return value;
  }

  /**
   * Reads an XDR float value using IEEE 754 single-precision in big-endian format.
   */
  public readFloat(): number {
    const reader = this.reader;
    const value = reader.view.getFloat32(reader.x, false); // false = big-endian
    reader.x += 4;
    return value;
  }

  /**
   * Reads an XDR double value using IEEE 754 double-precision in big-endian format.
   */
  public readDouble(): number {
    const reader = this.reader;
    const value = reader.view.getFloat64(reader.x, false); // false = big-endian
    reader.x += 8;
    return value;
  }

  /**
   * Reads an XDR quadruple value (128-bit float).
   * Note: JavaScript doesn't have native 128-bit float support.
   */
  public readQuadruple(): number {
    throw new Error('not implemented');
  }

  /**
   * Reads XDR opaque data with known fixed length.
   * Data is padded to 4-byte boundary but only the actual data is returned.
   */
  public readOpaque(size: number): Uint8Array {
    const reader = this.reader;
    const data = reader.buf(size);

    // Skip padding bytes to reach 4-byte boundary
    const paddedSize = size % 4 === 0 ? size : size + (4 - (size % 4));
    reader.skip(paddedSize - size);

    return data;
  }

  /**
   * Reads XDR variable-length opaque data.
   * Length is read first, followed by data padded to 4-byte boundary.
   */
  public readVarlenOpaque(): Uint8Array {
    const size = this.readUnsignedInt();
    return this.readOpaque(size);
  }

  /**
   * Reads an XDR string with UTF-8 encoding.
   * Length is read first, followed by UTF-8 bytes padded to 4-byte boundary.
   */
  public readString(): string {
    const size = this.readUnsignedInt();
    const reader = this.reader;
    const text = reader.utf8(size);

    // Skip padding bytes to reach 4-byte boundary
    const paddedSize = size % 4 === 0 ? size : size + (4 - (size % 4));
    reader.skip(paddedSize - size);

    return text;
  }

  /**
   * Reads an XDR enum value as an unsigned integer.
   */
  public readEnum(): number {
    return this.readInt();
  }

  /**
   * Reads a fixed-size array of elements.
   * Caller must provide the decode function for each element.
   */
  public readArray<T>(size: number, elementReader: () => T): T[] {
    const array: T[] = [];
    for (let i = 0; i < size; i++) array.push(elementReader());
    return array;
  }

  /**
   * Reads a variable-length array of elements.
   * Length is read first, followed by elements.
   */
  public readVarlenArray<T>(elementReader: () => T): T[] {
    const size = this.readUnsignedInt();
    return this.readArray(size, elementReader);
  }
}
