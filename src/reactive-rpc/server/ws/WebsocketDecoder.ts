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
}
