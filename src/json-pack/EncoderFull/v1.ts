import {isUint8Array} from "../../util/isUint8Array";
import {Encoder} from "../Encoder/v4";

export class EncoderFull extends Encoder {
  protected encodeAny(json: unknown): void {
    switch (json) {
      case null: return this.u8(0xc0);
      case false: return this.u8(0xc2);
      case true: return this.u8(0xc3);
    }
    if (json instanceof Array) return this.encodeArray(json);
    switch (typeof json) {
      case 'number': return this.encodeNumber(json);
      case 'string': return this.encodeString(json);
      case 'object': {
        // if (json instanceof JsonPackValue) return writeBuffer(view, json.buf, offset);
        // if (json instanceof JsonPackExtension) return encodeExtension(view, offset, json);
        if (isUint8Array(json)) return this.bin(json);
        return this.encodeObject(json as Record<string, unknown>);
      }
    }
  }

  protected bin(buf: Uint8Array): void {
    const length = buf.byteLength
    if (length <= 0xFF) this.u16((0xc4 << 8) | length);
    else if (length <= 0xFFFF) {
      this.u8(0xc5);
      this.u16(length);
    } else if (length <= 0xFFFFFFFF) {
      this.u8(0xc6);
      this.u32(length);
    }
    this.ensureCapacity(length);
    this.uint8.set(buf, this.offset);
    this.offset += length;
  }
}
