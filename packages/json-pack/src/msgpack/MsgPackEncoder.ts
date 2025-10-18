import {MsgPackEncoderFast} from './MsgPackEncoderFast';
import {isUint8Array} from '@jsonjoy.com/buffers/lib/isUint8Array';
import {JsonPackExtension} from '../JsonPackExtension';
import {JsonPackValue} from '../JsonPackValue';
import {MSGPACK} from './constants';
import type {IWriter, IWriterGrowable} from '@jsonjoy.com/buffers/lib';

/**
 * @category Encoder
 */
export class MsgPackEncoder<
  W extends IWriter & IWriterGrowable = IWriter & IWriterGrowable,
> extends MsgPackEncoderFast<W> {
  public writeAny(value: unknown): void {
    switch (value) {
      case null:
        return this.writer.u8(MSGPACK.NULL);
      case false:
        return this.writer.u8(MSGPACK.FALSE);
      case true:
        return this.writer.u8(MSGPACK.TRUE);
    }
    if (value instanceof Array) return this.encodeArray(value);
    switch (typeof value) {
      case 'number':
        return this.encodeNumber(value);
      case 'string':
        return this.encodeString(value);
      case 'object': {
        if (value instanceof JsonPackValue) return this.writer.buf(value.val, value.val.length);
        if (value instanceof JsonPackExtension) return this.encodeExt(value);
        if (isUint8Array(value)) return this.encodeBinary(value);
        return this.encodeObject(value as Record<string, unknown>);
      }
      case 'undefined':
        return this.writer.u8(MSGPACK.UNDEFINED);
    }
  }
}
