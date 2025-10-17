import {sort} from '@jsonjoy.com/util/lib/sort/insertion';
import {MsgPackEncoderFast} from './MsgPackEncoderFast';

/**
 * @category Encoder
 */
export class MsgPackEncoderStable extends MsgPackEncoderFast {
  public writeObj(obj: Record<string, unknown>): void {
    const keys = sort(Object.keys(obj));
    const length = keys.length;
    this.writeObjHdr(length);
    for (let i = 0; i < length; i++) {
      const key = keys[i];
      this.writeStr(key);
      this.writeAny(obj[key]);
    }
  }
}
