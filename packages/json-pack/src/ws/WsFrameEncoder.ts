import {Writer} from '@jsonjoy.com/util/lib/buffers/Writer';
import {WsFrameOpcode} from './constants';
import {WsFrameEncodingError} from './errors';
import type {IWriter, IWriterGrowable} from '@jsonjoy.com/util/lib/buffers';

const maskBuf = new Uint8Array(4);
const maskBufView = new DataView(maskBuf.buffer, maskBuf.byteOffset, maskBuf.byteLength);

export class WsFrameEncoder<W extends IWriter & IWriterGrowable = IWriter & IWriterGrowable> {
  constructor(public readonly writer: W = new Writer() as any) {}

  public encodePing(data: Uint8Array | null): Uint8Array {
    this.writePing(data);
    return this.writer.flush();
  }

  public encodePong(data: Uint8Array | null): Uint8Array {
    this.writePong(data);
    return this.writer.flush();
  }

  public encodeClose(reason: string, code = 0): Uint8Array {
    this.writeClose(reason, code);
    return this.writer.flush();
  }

  public encodeHdr(fin: 0 | 1, opcode: WsFrameOpcode, length: number, mask: number): Uint8Array {
    this.writeHdr(fin, opcode, length, mask);
    return this.writer.flush();
  }

  public encodeDataMsgHdrFast(length: number): Uint8Array {
    this.writeDataMsgHdrFast(length);
    return this.writer.flush();
  }

  public writePing(data: Uint8Array | null): void {
    let length = 0;
    if (data && (length = data.length)) {
      this.writeHdr(1, WsFrameOpcode.PING, length, 0);
      this.writer.buf(data, length);
    } else {
      this.writeHdr(1, WsFrameOpcode.PING, 0, 0);
    }
  }

  public writePong(data: Uint8Array | null): void {
    let length = 0;
    if (data && (length = data.length)) {
      this.writeHdr(1, WsFrameOpcode.PONG, length, 0);
      this.writer.buf(data, length);
    } else {
      this.writeHdr(1, WsFrameOpcode.PONG, 0, 0);
    }
  }

  public writeClose(reason: string, code = 0): void {
    if (reason || code) {
      const reasonLength = reason.length;
      const length = 2 + reasonLength;
      const writer = this.writer;
      writer.ensureCapacity(
        2 + // Frame header
          2 + // Close code 2 bytes
          reasonLength * 4, // Close reason, max 4 bytes per UTF-8 char
      );
      const lengthX = writer.x + 1;
      this.writeHdr(1, WsFrameOpcode.CLOSE, length, 0);
      writer.u16(code);
      if (reasonLength) {
        const utf8Length = writer.utf8(reason);
        if (utf8Length !== reasonLength) {
          if (utf8Length > 126 - 2) throw new WsFrameEncodingError();
          writer.uint8[lengthX] = (writer.uint8[lengthX] & 0b10000000) | (utf8Length + 2);
        }
      }
    } else {
      this.writeHdr(1, WsFrameOpcode.CLOSE, 0, 0);
    }
  }

  public writeHdr(fin: 0 | 1, opcode: WsFrameOpcode, length: number, mask: number): void {
    const octet1 = (fin << 7) | opcode;
    const maskBit = mask ? 0b10000000 : 0b00000000;
    const writer = this.writer;
    if (length < 126) {
      const octet2 = maskBit | length;
      writer.u16((octet1 << 8) | octet2);
    } else if (length < 0x10000) {
      const octet2 = maskBit | 126;
      writer.u32(((octet1 << 8) | octet2) * 0x10000 + length);
    } else {
      const octet2 = maskBit | 127;
      writer.u16((octet1 << 8) | octet2);
      writer.u32(0);
      writer.u32(length);
    }
    if (mask) writer.u32(mask);
  }

  public writeDataMsgHdrFast(length: number): void {
    const writer = this.writer;
    if (length < 126) {
      writer.u16(0b10000010_00000000 + length);
      return;
    }
    if (length < 0x10000) {
      writer.u32(0b10000010_01111110_00000000_00000000 + length);
      return;
    }
    writer.u16(0b10000010_01111111);
    writer.u32(0);
    writer.u32(length);
  }

  public writeBufXor(buf: Uint8Array, mask: number): void {
    maskBufView.setUint32(0, mask, false);
    const writer = this.writer;
    const length = buf.length;
    writer.ensureCapacity(length);
    let x = writer.x;
    const uint8 = writer.uint8;
    for (let i = 0; i < length; i++) uint8[x++] = buf[i] ^ maskBuf[i & 3];
    writer.x = x;
  }
}
