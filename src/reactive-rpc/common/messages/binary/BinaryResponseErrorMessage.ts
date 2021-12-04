import type {BinaryMessage} from './types';
import {getHeaderSize} from '../../codec/binary/header';
import {ResponseErrorMessage} from '../nominal';
import type {Encoder} from '../../../../json-pack';

/**
 * @category Message
 */
export class BinaryResponseErrorMessage extends ResponseErrorMessage<Uint8Array> implements BinaryMessage {
  public size(): number {
    const dataSize = this.data.byteLength;
    return getHeaderSize(dataSize) + 2 + dataSize;
  }

  public writeCompact(encoder: Encoder): void {
    const data = this.data;
    encoder.encodeArrayHeader(3);
    encoder.encodeUnsignedInteger(-1);
    encoder.encodeUnsignedInteger(this.id);
    encoder.buf(data, data.byteLength);
  }
}
