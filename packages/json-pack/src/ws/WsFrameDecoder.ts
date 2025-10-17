import {StreamingOctetReader} from '@jsonjoy.com/buffers/lib/StreamingOctetReader';
import {WsFrameOpcode} from './constants';
import {WsFrameDecodingError} from './errors';
import {WsCloseFrame, WsFrameHeader, WsPingFrame, WsPongFrame} from './frames';

export class WsFrameDecoder {
  public readonly reader = new StreamingOctetReader();

  public push(uint8: Uint8Array): void {
    this.reader.push(uint8);
  }

  public readFrameHeader(): WsFrameHeader | undefined {
    try {
      const reader = this.reader;
      if (reader.size() < 2) return undefined;
      const b0 = reader.u8();
      const b1 = reader.u8();
      const fin = <0 | 1>(b0 >>> 7);
      const opcode = b0 & 0b1111;
      const maskBit = b1 >>> 7;
      let length = b1 & 0b01111111;
      if (length === 126) {
        if (reader.size() < 2) return undefined;
        length = (reader.u8() << 8) | reader.u8();
      } else if (length === 127) {
        if (reader.size() < 8) return undefined;
        reader.skip(4);
        length = reader.u32();
      }
      let mask: undefined | [number, number, number, number];
      if (maskBit) {
        if (reader.size() < 4) return undefined;
        mask = [reader.u8(), reader.u8(), reader.u8(), reader.u8()];
      }
      if (opcode >= WsFrameOpcode.MIN_CONTROL_OPCODE) {
        switch (opcode) {
          case WsFrameOpcode.CLOSE: {
            return new WsCloseFrame(fin, opcode, length, mask, 0, '');
          }
          case WsFrameOpcode.PING: {
            if (length > 125) throw new WsFrameDecodingError();
            const data = mask ? reader.bufXor(length, mask, 0) : reader.buf(length);
            return new WsPingFrame(fin, opcode, length, mask, data);
          }
          case WsFrameOpcode.PONG: {
            if (length > 125) throw new WsFrameDecodingError();
            const data = mask ? reader.bufXor(length, mask, 0) : reader.buf(length);
            return new WsPongFrame(fin, opcode, length, mask, data);
          }
          default: {
            throw new WsFrameDecodingError();
          }
        }
      }
      return new WsFrameHeader(fin, opcode, length, mask);
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
  public readFrameData(frame: WsFrameHeader, remaining: number, dst: Uint8Array, pos: number): number {
    const reader = this.reader;
    const mask = frame.mask;
    const readSize = Math.min(reader.size(), remaining);
    if (!mask) reader.copy(readSize, dst, pos);
    else {
      const alreadyRead = frame.length - remaining;
      reader.copyXor(readSize, dst, pos, mask, alreadyRead);
    }
    return remaining - readSize;
  }

  public copyFrameData(frame: WsFrameHeader, dst: Uint8Array, pos: number): void {
    const reader = this.reader;
    const mask = frame.mask;
    const readSize = frame.length;
    if (!mask) reader.copy(readSize, dst, pos);
    else reader.copyXor(readSize, dst, pos, mask, 0);
  }

  /**
   * Reads application data of the CLOSE frame and sets the code and reason
   * properties of the frame.
   *
   * @param frame Close frame.
   */
  public readCloseFrameData(frame: WsCloseFrame): void {
    let length = frame.length;
    if (length > 125) throw new WsFrameDecodingError();
    let code = 0;
    let reason = '';
    if (length > 0) {
      if (length < 2) throw new WsFrameDecodingError();
      const reader = this.reader;
      const mask = frame.mask;
      const octet1 = reader.u8() ^ (mask ? mask[0] : 0);
      const octet2 = reader.u8() ^ (mask ? mask[1] : 0);
      code = (octet1 << 8) | octet2;
      length -= 2;
      if (length) reason = reader.utf8(length, mask ?? [0, 0, 0, 0], 2);
    }
    frame.code = code;
    frame.reason = reason;
  }
}
