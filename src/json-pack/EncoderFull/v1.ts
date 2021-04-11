import {isUint8Array} from '../../util/isUint8Array';
import {Encoder} from '../Encoder/v4';
import {JsonPackExtension} from '../JsonPackExtension';
import {JsonPackValue} from '../JsonPackValue';

/**
 * @category Encoder
 */
export class EncoderFull extends Encoder {
  public encodeAny(json: unknown): void {
    switch (json) {
      case null:
        return this.u8(0xc0);
      case false:
        return this.u8(0xc2);
      case true:
        return this.u8(0xc3);
    }
    if (json instanceof Array) return this.encodeArray(json);
    switch (typeof json) {
      case 'number':
        return this.encodeNumber(json);
      case 'string':
        return this.encodeString(json);
      case 'object': {
        if (json instanceof JsonPackValue) return this.buf(json.buf, json.buf.byteLength);
        if (json instanceof JsonPackExtension) return this.encodeExt(json);
        if (isUint8Array(json)) return this.bin(json);
        return this.encodeObject(json as Record<string, unknown>);
      }
    }
  }

  /** @ignore */
  protected bin(buf: Uint8Array): void {
    const length = buf.byteLength;
    if (length <= 0xff) this.u16((0xc4 << 8) | length);
    else if (length <= 0xffff) {
      this.u8(0xc5);
      this.u16(length);
    } else if (length <= 0xffffffff) {
      this.u8(0xc6);
      this.u32(length);
    }
    this.buf(buf, length);
  }
}
