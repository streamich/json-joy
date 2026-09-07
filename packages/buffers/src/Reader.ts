import {decodeUtf8} from './utf8/decodeUtf8';
import type {IReader, IReaderResettable} from './types';

const oob = (): never => {
  throw new RangeError('OUT_OF_BOUNDS');
};

/**
 * Reads binary data. Every read is bounded by {@link Reader.end}: a read that
 * would go past it throws a `RangeError` instead of returning a value made up
 * of bytes that are not there. Decoders parse untrusted input, so a length that
 * the input does not back has to fail loudly, not quietly.
 */
export class Reader implements IReader, IReaderResettable {
  constructor(
    public uint8: Uint8Array = new Uint8Array([]),
    public view: DataView = new DataView(uint8.buffer as ArrayBuffer, uint8.byteOffset, uint8.length),
    public x: number = 0,
    public end: number = uint8.length,
  ) {}

  public reset(uint8: Uint8Array): void {
    this.x = 0;
    this.end = uint8.length;
    this.uint8 = uint8;
    this.view = new DataView(uint8.buffer as ArrayBuffer, uint8.byteOffset, uint8.length);
  }

  public size(): number {
    return this.end - this.x;
  }

  /**
   * Get current byte value without advancing the cursor.
   */
  public peek(): number {
    return this.view.getUint8(this.x);
  }

  /**
   * @deprecated Use peek() instead.
   */
  public peak(): number {
    return this.peek();
  }

  public skip(length: number): void {
    this.x += length;
  }

  public buf(size: number = this.size()): Uint8Array {
    const x = this.x;
    const end = x + size;
    // Negated so that a `NaN` size, which is what a truncated length header
    // decodes to, fails the check rather than passing it.
    if (!(end <= this.end)) return oob();
    const bin = this.uint8.subarray(x, end);
    this.x = end;
    return bin;
  }

  public subarray(start: number = 0, end?: number): Uint8Array {
    const x = this.x;
    const actualStart = x + start;
    const actualEnd = typeof end === 'number' ? x + end : this.end;
    return this.uint8.subarray(actualStart, actualEnd);
  }

  /**
   * Creates a new {@link Reader} that references the same underlying memory
   * buffer. But with independent cursor and end.
   *
   * Preferred over {@link buf} since it also provides a DataView and is much
   * faster to allocate a new {@link Slice} than a new {@link Uint8Array}.
   *
   * @param start Start offset relative to the current cursor position.
   * @param end End offset relative to the current cursor position.
   * @returns A new {@link Reader} instance.
   */
  public slice(start: number = 0, end?: number): Reader {
    const x = this.x;
    const actualStart = x + start;
    const actualEnd = typeof end === 'number' ? x + end : this.end;
    return new Reader(this.uint8, this.view, actualStart, actualEnd);
  }

  /**
   * Similar to {@link slice} but also advances the cursor. Returns a new
   * {@link Reader} that references the same underlying memory buffer, starting
   * from the current cursor position.
   *
   * @param size Number of bytes to cut from the current position.
   * @returns A new {@link Reader} instance.
   */
  public cut(size: number = this.size()): Reader {
    const slice = this.slice(0, size);
    this.skip(size);
    return slice;
  }

  public u8(): number {
    const x = this.x;
    if (x >= this.end) return oob();
    this.x = x + 1;
    return this.uint8[x];
  }

  public i8(): number {
    const x = this.x;
    if (x >= this.end) return oob();
    this.x = x + 1;
    return this.view.getInt8(x);
  }

  public u16(): number {
    let x = this.x;
    if (x + 2 > this.end) return oob();
    const num = (this.uint8[x++] << 8) + this.uint8[x++];
    this.x = x;
    return num;
  }

  public i16(): number {
    const x = this.x;
    if (x + 2 > this.end) return oob();
    this.x = x + 2;
    return this.view.getInt16(x);
  }

  public u32(): number {
    const x = this.x;
    if (x + 4 > this.end) return oob();
    this.x = x + 4;
    return this.view.getUint32(x);
  }

  public i32(): number {
    const x = this.x;
    if (x + 4 > this.end) return oob();
    this.x = x + 4;
    return this.view.getInt32(x);
  }

  public u64(): bigint {
    const x = this.x;
    if (x + 8 > this.end) return oob();
    this.x = x + 8;
    return this.view.getBigUint64(x);
  }

  public i64(): bigint {
    const x = this.x;
    if (x + 8 > this.end) return oob();
    this.x = x + 8;
    return this.view.getBigInt64(x);
  }

  public f32(): number {
    const x = this.x;
    if (x + 4 > this.end) return oob();
    this.x = x + 4;
    return this.view.getFloat32(x);
  }

  public f64(): number {
    const x = this.x;
    if (x + 8 > this.end) return oob();
    this.x = x + 8;
    return this.view.getFloat64(x);
  }

  public utf8(size: number): string {
    const start = this.x;
    const end = start + size;
    // Negated so that a `NaN` size, which is what a truncated length header
    // decodes to, fails the check rather than passing it.
    if (!(end <= this.end)) return oob();
    this.x = end;
    return decodeUtf8(this.uint8, start, size);
  }

  public ascii(length: number): string {
    const uint8 = this.uint8;
    let str = '';
    const x = this.x;
    const end = x + length;
    if (!(end <= this.end)) return oob();
    for (let i = x; i < end; i++) str += String.fromCharCode(uint8[i]);
    this.x = end;
    return str;
  }
}
