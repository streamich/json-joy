import {JsonEncoder} from './JsonEncoder';
import {sort} from '@jsonjoy.com/util/lib/sort/insertion2';
import {objKeyCmp} from '@jsonjoy.com/util/lib/objKeyCmp';

export class JsonEncoderStable extends JsonEncoder {
  public writeObj(obj: Record<string, unknown>): void {
    const writer = this.writer;
    const keys = Object.keys(obj);
    sort(keys, objKeyCmp);
    const length = keys.length;
    if (!length) return writer.u16(0x7b7d); // {}
    writer.u8(0x7b); // {
    for (let i = 0; i < length; i++) {
      const key = keys[i];
      const value = obj[key];
      this.writeStr(key);
      writer.u8(0x3a); // :
      this.writeAny(value);
      writer.u8(0x2c); // ,
    }
    writer.uint8[writer.x - 1] = 0x7d; // }
  }
}
