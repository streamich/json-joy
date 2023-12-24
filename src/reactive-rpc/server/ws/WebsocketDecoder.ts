import {StreamingOctetReader} from "../../../util/buffers/StreamingOctetReader";
import {FrameHeader} from "./FrameHeader";

export class WebsocketDecoder {
  public readonly reader = new StreamingOctetReader();

  public push(uint8: Uint8Array): void {
    this.reader.push(uint8);
  }

  public readFrameHeader(): FrameHeader | undefined {
    try {
      const reader = this.reader;
      if (reader.size() < 2) return undefined;
      const b0 = reader.u8();
      const b1 = reader.u8();
      const fin = <0 | 1>(b0 >>> 7);
      const opcode = b0 & 0b1111;
      const mask = b1 >>> 7;
      let length = b1 & 0b01111111;
      if (length === 126) {
        if (reader.size() < 2) return undefined;
        length = reader.u8() << 8 | reader.u8();
      } else if (length === 127) {
        if (reader.size() < 8) return undefined;
        reader.skip(4);
        length = reader.u32();
      }
      let maskBytes: undefined | [number, number, number, number];
      if (mask) {
        if (reader.size() < 4) return undefined;
        maskBytes = [
          reader.u8(),
          reader.u8(),
          reader.u8(),
          reader.u8(),
        ];
      }
      return new FrameHeader(fin, opcode, length, maskBytes);
    } catch (err) {
      if (err instanceof RangeError) return undefined;
      throw err;
    }
  }

  /**
   * Read application data of a frame and copy it to the destination buffer.
   * Receives the frame header and the number of bytes that still need to be
   * copied, returns back the number of bytes that still need to be copied in
   * subsequent calls.
   *
   * @param frame Frame header.
   * @param remaining How many bytes are remaining to be copied.
   * @param dst The destination buffer to write to.
   * @param pos Position in the destination buffer to start writing to.
   * @returns The number of bytes that still need to be copied in the next call.
   */
  public readFrameData(frame: FrameHeader, remaining: number, dst: Uint8Array, pos: number): number {
    const reader = this.reader;
    const mask = frame.mask;
    const readSize = Math.min(reader.size(), remaining);
    if (!mask) {
      for (let i = 0; i < readSize; i++) dst[pos++] = reader.u8();
    } else {
      const alreadyRead = frame.length - remaining;
      for (let i = 0; i < readSize; i++) {
        const octet = reader.u8();
        const j = (i + alreadyRead) % 4;
        const unmasked = octet ^ mask[j];
        dst[pos++] = unmasked;
      }
    }
    return remaining - readSize;
  }
}
