export interface IEncoderWriter {
  /**
   * Write an unsigned 1 byte number.
   */
  u8(char: number): void;

  /**
   * Write an unsigned 2 byte number.
   */
  u16(word: number): void;

  /**
   * Write an unsigned 4 byte number.
   */
  u32(dword: number): void;
}

const EMPTY_UINT8 = new Uint8Array([]);
const EMPTY_VIEW = new DataView(EMPTY_UINT8.buffer);

/**
 * Encoder class provides an efficient way to encode binary data. It grows the
 * internal memory buffer automatically as more space is required. It is useful
 * in cases when it is not known in advance the size of memory needed.
 */
export class Encoder implements IEncoderWriter {
  /** @ignore */
  protected uint8: Uint8Array = EMPTY_UINT8;
  /** @ignore */
  protected view: DataView = EMPTY_VIEW;
  /** @ignore */
  protected offset: number = 0;

  /** @ignore */
  protected grow(size: number) {
    const newUint8 = new Uint8Array(size);
    newUint8.set(this.uint8);
    this.uint8 = newUint8;
    this.view = new DataView(newUint8.buffer);
  }

  /**
   * Make sure the internal buffer has enough space to write the specified number
   * of bytes, otherwise resize the internal buffer to accommodate for more size.
   * 
   * @param capacity Number of bytes.
   */
  protected ensureCapacity(capacity: number) {
    const size = this.offset + capacity;
    const len = this.uint8.byteLength;
    if (len < size) this.grow(Math.max(size, len * 4));
  }

  /**
   * Resets the internal memory buffer and offset for new encoding round. All
   * encodings should happen synchronously.
   */
  public reset() {
    this.uint8 = new Uint8Array(1024);
    this.view = new DataView(this.uint8.buffer);
    this.offset = 0;
  }

  /**
   * @returns Encoded memory buffer contents.
   */
  public flush(): Uint8Array {
    return this.uint8.subarray(0, this.offset);
  }

  public u8(char: number) {
    this.ensureCapacity(1);
    this.uint8[this.offset++] = char;
  }

  public u16(word: number) {
    this.ensureCapacity(2);
    this.view.setUint16(this.offset, word);
    this.offset += 2;
  }

  public u32(dword: number) {
    this.ensureCapacity(4);
    this.view.setUint32(this.offset, dword);
    this.offset += 4;
  }
}
