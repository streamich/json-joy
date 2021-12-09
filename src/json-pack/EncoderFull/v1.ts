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
        if (isUint8Array(json)) return this.encodeBinary(json);
        return this.encodeObject(json as Record<string, unknown>);
      }
    }
  }
}
