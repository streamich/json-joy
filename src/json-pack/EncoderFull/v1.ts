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
        if (json instanceof JsonPackExtension) return this.ext(json);
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

  /** @ignore */
  protected ext(ext: JsonPackExtension): void {
    const {type, buf} = ext;
    const length = buf.byteLength;
    switch (length) {
      case 1:
        return this.ext0(buf, (0xd4 << 8) | type, 1);
      case 2:
        return this.ext0(buf, (0xd5 << 8) | type, 2);
      case 4:
        return this.ext0(buf, (0xd6 << 8) | type, 4);
      case 8:
        return this.ext0(buf, (0xd7 << 8) | type, 8);
      case 16:
        return this.ext0(buf, (0xd8 << 8) | type, 16);
    }
    if (length <= 0xff) {
      this.u16((0xc7 << 8) | length);
      this.u8(type);
    } else if (length <= 0xffff) {
      this.u8(0xc8);
      this.u16(length);
      this.u8(type);
    } else if (length <= 0xffffffff) {
      this.u8(0xc9);
      this.u32(length);
      this.u8(type);
    }
    this.buf(buf, length);
  }

  /** @ignore */
  protected ext0(buf: Uint8Array, firstTwo: number, length: number): void {
    this.u16(firstTwo);
    this.buf(buf, length);
  }

  /** @ignore */
  protected buf(buf: Uint8Array, length: number): void {
    this.ensureCapacity(length);
    this.uint8.set(buf, this.offset);
    this.offset += length;
  }
}
