import {decodeUtf8} from './utf8/decodeUtf8';
import type {IReader, IReaderResettable} from './types';

export class Reader implements IReader, IReaderResettable {
  constructor(
    public uint8: Uint8Array = new Uint8Array([]),
    public view: DataView = new DataView(uint8.buffer as ArrayBuffer, uint8.byteOffset, uint8.length),
    public x: number = 0,
    public end: number = uint8.length,
  ) {}

  public reset(uint8: Uint8Array): void {
    this.x = 0;
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
    return this.uint8[this.x++];
    // return this.view.getUint8(this.x++);
  }

  public i8(): number {
    return this.view.getInt8(this.x++);
  }

  public u16(): number {
    // const num = this.view.getUint16(this.x);
    // this.x += 2;
    // return num;
    let x = this.x;
    const num = (this.uint8[x++] << 8) + this.uint8[x++];
    this.x = x;
    return num;
  }

  public i16(): number {
    const num = this.view.getInt16(this.x);
    this.x += 2;
    return num;
  }

  public u32(): number {
    const num = this.view.getUint32(this.x);
    this.x += 4;
    return num;
  }

  public i32(): number {
    const num = this.view.getInt32(this.x);
    this.x += 4;
    return num;
  }

  public u64(): bigint {
    const num = this.view.getBigUint64(this.x);
    this.x += 8;
    return num;
  }

  public i64(): bigint {
    const num = this.view.getBigInt64(this.x);
    this.x += 8;
    return num;
  }

  public f32(): number {
    const pos = this.x;
    this.x += 4;
    return this.view.getFloat32(pos);
  }

  public f64(): number {
    const pos = this.x;
    this.x += 8;
    return this.view.getFloat64(pos);
  }

  public utf8(size: number): string {
    const start = this.x;
    this.x += size;
    return decodeUtf8(this.uint8, start, size);
  }

  public ascii(length: number): string {
    const uint8 = this.uint8;
    let str = '';
    const end = this.x + length;
    for (let i = this.x; i < end; i++) str += String.fromCharCode(uint8[i]);
    this.x = end;
    return str;
  }
}
