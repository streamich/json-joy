import {Encoder} from '../Encoder';

/**
 * @category Encoder
 */
export class EncoderStable extends Encoder {
  public encodeObject(obj: Record<string, unknown>): void {
    const keys = Object.keys(obj).sort((a, b) => a > b ? 1 : -1);
    const length = keys.length;
    this.encodeObjectHeader(length);
    for (let i = 0; i < length; i++) {
      const key = keys[i];
      this.encodeString(key);
      this.encodeAny(obj[key]);
    }
  }
}
