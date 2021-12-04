import type {BinaryMessage} from './types';
import {getHeaderSize} from '../../codec/binary/header';
import {RequestCompleteMessage} from '../nominal';
import type {Encoder} from '../../../../json-pack';

/**
 * @category Message
 */
export class BinaryRequestCompleteMessage extends RequestCompleteMessage<Uint8Array> implements BinaryMessage {
  public size(): number {
    const dataSize = this.data ? this.data.byteLength : 0;
    return getHeaderSize(dataSize) + 2 + 1 + this.method.length + dataSize;
  }

  public writeCompact(encoder: Encoder): void {
    const data = this.data;
    const dataSize = data ? data.byteLength : 0;
    if (!dataSize) {
      encoder.encodeArrayHeader(2);
      encoder.encodeUnsignedInteger(this.id);
      encoder.encodeAsciiString(this.method);
      return;
    }
    encoder.encodeArrayHeader(3);
    encoder.encodeUnsignedInteger(this.id);
    encoder.encodeAsciiString(this.method);
    encoder.buf(data!, dataSize);
  }
}
