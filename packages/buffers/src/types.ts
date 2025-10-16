import type {Slice} from './Slice';

export interface IWriter {
  /**
   * Uint8Array view of the current memory buffer.
   */
  uint8: Uint8Array;

  /**
   * DataView view of the current memory buffer.
   */
  view: DataView;

  /**
   * Position where last flush happened.
   */
  x0: number;

  /**
   * Current position in the internal buffer.
   */
  x: number;

  u8(char: number): void;
  u16(word: number): void;
  u32(dword: number): void;
  i32(dword: number): void;
  u64(qword: number | bigint): void;
  u8u16(u8: number, u16: number): void;
  u8u32(u8: number, u32: number): void;
  u8u64(u8: number, u64: number | bigint): void;
  u8f32(u8: number, f64: number): void;
  u8f64(u8: number, f64: number): void;
  f64(dword: number): void;

  /**
   * Write contents of a buffer.
   *
   * @param buf Buffer to copy from.
   * @param length Number of octets to copy.
   */
  buf(buf: Uint8Array, length: number): void;

  /**
   * Write string as UTF-8. You need to call .ensureCapacity(str.length * 4)
   * before calling
   *
   * @param str JavaScript string to encode as UTF-8 byte sequence.
   */
  utf8(str: string): number;

  ascii(str: string): void;
}

export interface IWriterGrowable {
  /** @deprecated */
  reset(): void;

  /**
   * Calling this method might reset the internal buffer. So, your references
   * (such as `x`, `uint8`, `view`) to the internal buffer might become invalid.
   *
   * @param capacity How many octets to ensure are available after `x`.
   */
  ensureCapacity(capacity: number): void;
  move(length: number): void;
  flush(): Uint8Array;
  flushSlice(): Slice;
  newBuffer(size: number): void;
}

export interface IReaderBase {
  /**
   * Creates a new {@link IReaderBase} that references the same underlying memory
   * buffer. But with independent cursor and end.
   *
   * @param start Start offset relative to the current cursor position.
   * @param end End offset relative to the current cursor position.
   * @returns A new {@link IReaderBase} instance.
   */
  slice(start?: number, end?: number): IReaderBase;

  /**
   * Similar to {@link slice} but also advances the cursor. Returns a new
   * {@link IReaderBase} that references the same underlying memory buffer, starting
   * from the current cursor position.
   *
   * @param size Number of bytes to cut from the current position.
   * @returns A new {@link IReaderBase} instance.
   */
  cut(size?: number): IReaderBase;

  subarray(start?: number, end?: number): Uint8Array;

  /** Get current byte value without advancing the cursor. */
  peek(): number;

  /**
   * Get current byte value without advancing the cursor.
   * @deprecated Use peek() instead.
   */
  peak(): number;

  /** Advance the cursor given number of octets. */
  skip(length: number): void;

  /**
   * Create a new Uint8Array view of provided length starting at
   * the current cursor position.
   *
   * If size is not provided, it will return a view of all remaining bytes.
   *
   * @param size Length of the returned Uint8Array.
   */
  buf(size?: number): Uint8Array;

  u8(): number;
  i8(): number;
  u16(): number;
  i16(): number;
  u32(): number;
  u64(): bigint;
  i64(): bigint;
  i32(): number;
  f32(): number;
  f64(): number;

  /**
   * Decode a UTF-8 string.
   *
   * @param size Length of the string.
   */
  utf8(size: number): string;

  ascii(length: number): string;
}

export interface IReader extends IReaderBase {
  /**
   * Uint8Array view of the current memory buffer.
   */
  uint8: Uint8Array;

  /**
   * DataView view of the current memory buffer.
   */
  view: DataView;

  /**
   * Cursor in the current memory buffer.
   */
  x: number;
}

export interface IReaderResettable {
  /** Set a new underlying buffer and reset cursor position to 0. */
  reset(uint8: Uint8Array): void;
}
