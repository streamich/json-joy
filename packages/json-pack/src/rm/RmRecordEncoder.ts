import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import type {IWriter, IWriterGrowable} from '@jsonjoy.com/buffers';

const RM_HEADER_SIZE = 4;
const MAX_SINGLE_FRAME_SIZE = 0x7fffffff;

export class RmRecordEncoder<W extends IWriter & IWriterGrowable = IWriter & IWriterGrowable> {
  constructor(public readonly writer: W = new Writer() as any) {}

  public encodeHdr(fin: 0 | 1, length: number): Uint8Array {
    this.writeHdr(fin, length);
    return this.writer.flush();
  }

  public encodeRecord(record: Uint8Array): Uint8Array {
    this.writeRecord(record);
    return this.writer.flush();
  }

  public writeHdr(fin: 0 | 1, length: number): void {
    this.writer.u32((fin ? 0b10000000_00000000_00000000_00000000 : 0) + length);
  }

  public writeRecord(record: Uint8Array): void {
    const length = record.length;
    if (length <= 2147483647) {
      const writer = this.writer;
      writer.u32(0b10000000_00000000_00000000_00000000 + length);
      writer.buf(record, length);
      return;
    }
    let offset = 0;
    while (offset < length) {
      const fragmentLength = Math.min(length - offset, 0x7fffffff);
      const fin = fragmentLength + offset >= length ? 1 : 0;
      this.writeFragment(record, offset, fragmentLength, fin);
      offset += fragmentLength;
    }
  }

  public writeFragment(record: Uint8Array, offset: number, length: number, fin: 0 | 1): void {
    this.writeHdr(fin, length);
    const fragment = record.subarray(offset, offset + length);
    this.writer.buf(fragment, length);
  }

  /**
   * To write an RM record in one pass this method reserves space for the RM
   * header, and returns the state, which needs to passed to `endRmRecord` to
   * finalize the RM header.
   */
  public startRecord(): number {
    const writer = this.writer;
    const rmHeaderPosition = writer.x;
    writer.x += RM_HEADER_SIZE;
    return rmHeaderPosition;
  }

  /**
   * Finalize the RM header started by `startRmRecord`.
   *
   * @param rmHeaderPosition The position returned by `startRmRecord`
   * @remarks This method will check if the data written after `startRmRecord`
   * fits into a single RM frame. If it does, it will write the RM header in
   * place. If it doesn't, it will move the data to a new location and write
   * it as multiple RM frames.
   */
  public endRecord(rmHeaderPosition: number): void {
    const writer = this.writer;
    const totalSize = writer.x - rmHeaderPosition - RM_HEADER_SIZE;
    if (totalSize <= MAX_SINGLE_FRAME_SIZE) {
      const currentX = writer.x;
      writer.x = rmHeaderPosition;
      this.writeHdr(1, totalSize);
      writer.x = currentX;
    } else {
      const currentX = writer.x;
      writer.x = rmHeaderPosition;
      const data = writer.uint8.subarray(rmHeaderPosition + RM_HEADER_SIZE, currentX);
      writer.reset();
      this.writeRecord(data);
    }
  }
}
