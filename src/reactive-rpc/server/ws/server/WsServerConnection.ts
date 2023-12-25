import * as net from 'net';
import {WsCloseFrame, WsFrameDecoder, WsFrameHeader, WsFrameOpcode, WsPingFrame, WsPongFrame} from '../codec';
import {utf8Size} from '../../../../util/strings/utf8';
import {FanOut} from 'thingies/es2020/fanout';
import type {WsFrameEncoder} from '../codec/WsFrameEncoder';

export class WsServerConnection {
  protected readonly decoder: WsFrameDecoder;

  public closed: WsCloseFrame | null = null;

  /**
   * If this is not null, then the connection is receiving a stream: a sequence
   * of fragment frames.
   */
  protected stream: FanOut<Uint8Array> | null = null;

  public readonly defaultOnPing = (data: Uint8Array | null): void => {
    this.sendPong(data);
  };

  public readonly defaultOnClose = (frame: WsCloseFrame): void => {
    this.closed = frame;
    this.socket.end();
  };

  public onmessage: (data: Uint8Array, isUtf8: boolean) => void = () => {};
  public onping: (data: Uint8Array | null) => void = this.defaultOnPing;
  public onpong: (data: Uint8Array | null) => void = () => {};
  public onclose: (frame: WsCloseFrame) => void = this.defaultOnClose;

  constructor(
    protected readonly encoder: WsFrameEncoder,
    public readonly socket: net.Socket,
  ) {
    const decoder = this.decoder = new WsFrameDecoder();
    socket.on('data', (data) => {
      decoder.push(data);
      while (true) {
        const frame = decoder.readFrameHeader();
        if (!frame) break;
        else if (frame instanceof WsPingFrame) {
          this.onping(frame.data);
        } else if (frame instanceof WsPongFrame) {
          this.onpong(frame.data);
        } else if (frame instanceof WsCloseFrame) {
          this.onclose(frame);
        } else if (frame instanceof WsFrameHeader) {
          if (this.stream) {
            if (frame.opcode !== WsFrameOpcode.CONTINUE) throw new Error('WRONG_OPCODE');
            return;
          }
          console.log('Data frame received');
          // switch (frame.opcode) {
          //   case WsFrameOpcode.BINARY: {
          //     const payload = decoder.readFrameData(frame, )
          //     break;
          //   }
          //   case WsFrameOpcode.TEXT: {
          //     break;
          //   }
          //   default: {
          //     throw new Error('WRONG_OPCODE');
          //   }
          // }
        }
      }
    });
  }

  public sendPing(data: Uint8Array | null): void {
    const frame = this.encoder.encodePing(data);
    this.socket.write(frame);
  }

  public sendPong(data: Uint8Array | null): void {
    const frame = this.encoder.encodePong(data);
    this.socket.write(frame);
  }

  public sendBinMsg(data: Uint8Array): void {
    const encoder = this.encoder;
    const socket = this.socket;
    const header = encoder.encodeDataMsgHdrFast(data.length);
    // TODO: benchmark if corking helps
    // TODO: maybe cork and uncork on macro task boundary
    socket.cork();
    socket.write(header);
    socket.write(data);
    socket.uncork();
  }

  public sendTxtMsg(txt: string): void {
    const encoder = this.encoder;
    const writer = encoder.writer;
    const size = utf8Size(txt);
    encoder.writeHdr(1, WsFrameOpcode.TEXT, size, 0);
    writer.ensureCapacity(size);
    writer.utf8(txt);
    const buf = writer.flush();
    this.socket.write(buf);
  }
}
