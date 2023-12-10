import {Writer} from './Writer';
import {decodeUtf8} from './utf8/decodeUtf8';
import type {IReader, IReaderResettable} from './types';

export class StreamingReader implements IReader, IReaderResettable {
  protected readonly writer: Writer;

  constructor(allocSize: number = 16 * 1024) {
    this.writer = new Writer(allocSize);
  }

  /**
   * Add a chunk of data to be decoded.
   * @param uint8 `Uint8Array` chunk of data to be decoded.
   */
  public push(uint8: Uint8Array): void {
    this.writer.buf(uint8, uint8.length);
  }

  /**
   * Mark the current position as consumed. This will free up memory
   * for reuse.
   */
  public consume(): void {
    this.writer.x0 += this.dx;
    this.dx = 0;
  }

  // ------------------------------------------------------------------ IReader

  protected dx = 0;

  /**
   * Returns the number of bytes remaining in the buffer.
   */
  public size(): number {
    return this.writer.x - this.x;
  }

  protected assertSize(size: number): void {
    if (size > this.size()) throw new RangeError('OUT_OF_BOUNDS');
  }

  public get uint8(): Uint8Array {
    return this.writer.uint8;
  }

  public get view(): DataView {
    return this.writer.view;
  }

  public get x(): number {
    return this.writer.x0 + this.dx;
  }

  public set x(x: number) {
    this.dx = x - this.writer.x0;
  }

  public peak(): number {
    return this.view.getUint8(this.x);
  }

  public skip(length: number): void {
    this.assertSize(length);
    this.x += length;
  }

  public buf(size: number): Uint8Array {
    this.assertSize(size);
    const end = this.x + size;
    const bin = this.uint8.subarray(this.x, end);
    this.x = end;
    return bin;
  }

  public u8(): number {
    return this.view.getUint8(this.x++);
  }

  public i8(): number {
    return this.view.getInt8(this.x++);
  }

  public u16(): number {
    const num = this.view.getUint16(this.x);
    this.x += 2;
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
    this.assertSize(size);
    const start = this.x;
    this.x += size;
    return decodeUtf8(this.uint8, start, size);
  }

  public ascii(length: number): string {
    this.assertSize(length);
    const uint8 = this.uint8;
    let str = '';
    const end = this.x + length;
    for (let i = this.x; i < end; i++) str += String.fromCharCode(uint8[i]);
    this.x = end;
    return str;
  }


  // -------------------------------------------------------- IReaderResettable

  public reset(uint8: Uint8Array): void {
    this.dx = 0;
    this.writer.reset();
    this.push(uint8);
  }
}
