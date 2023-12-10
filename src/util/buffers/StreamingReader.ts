import {Writer} from './Writer';
import type {IReader, IReaderResettable} from './types';

export class StreamingReader implements IReader, IReaderResettable {
  protected readonly writer: Writer;

  constructor(allocSize: number = 16 * 1024) {
    this.writer = new Writer(allocSize);
  }

  public push(uint8: Uint8Array): void {
    this.writer.buf(uint8, uint8.length);
  }
  
  // ------------------------------------------------------------------ IReader

  public get uint8(): Uint8Array {
    return this.writer.uint8;
  }

  public get view(): DataView {
    return this.writer.view;
  }

  public get x(): number {
    return this.writer.x;
  }

  public set x(x: number) {
    this.writer.x = x;
  }

  public peak(): number {
    throw new Error('Not implemented');
  }

  public skip(length: number): void {
    throw new Error('Not implemented');
  }

  public buf(size: number): Uint8Array {
    throw new Error('Not implemented');
  }

  public u8(): number {
    throw new Error('Not implemented');
  }

  public i8(): number {
    throw new Error('Not implemented');
  }

  public u16(): number {
    throw new Error('Not implemented');
  }

  public i16(): number {
    throw new Error('Not implemented');
  }

  public u32(): number {
    throw new Error('Not implemented');
  }

  public i32(): number {
    throw new Error('Not implemented');
  }

  public u64(): bigint {
    throw new Error('Not implemented');
  }

  public i64(): bigint {
    throw new Error('Not implemented');
  }

  public f32(): number {
    throw new Error('Not implemented');
  }

  public f64(): number {
    throw new Error('Not implemented');
  }

  public utf8(size: number): string {
    throw new Error('Not implemented');
  }

  public ascii(length: number): string {
    throw new Error('Not implemented');
  }


  // -------------------------------------------------------- IReaderResettable

  public reset(uint8: Uint8Array): void {
    throw new Error('Not implemented');
  }
}
