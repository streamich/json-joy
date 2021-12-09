import type {BinaryMessage} from './types';
import {getHeaderSize} from '../../codec/binary/header';
import {ResponseCompleteMessage} from '../nominal';
import type {Encoder} from '../../../../json-pack';

/**
 * @category Message
 */
export class BinaryResponseCompleteMessage
  extends ResponseCompleteMessage<Uint8Array | undefined>
  implements BinaryMessage
{
  public size(): number {
    const dataSize = this.data ? this.data.byteLength : 0;
    return getHeaderSize(dataSize) + 2 + dataSize;
  }

  public writeCompact(encoder: Encoder): void {
    const data = this.data;
    const dataSize = data ? data.byteLength : 0;
    if (!dataSize) {
      encoder.encodeArrayHeader(2);
      encoder.u8(0);
      encoder.encodeUnsignedInteger(this.id);
      return;
    }
    encoder.encodeArrayHeader(3);
    encoder.u8(0);
    encoder.encodeUnsignedInteger(this.id);
    encoder.buf(data!, dataSize);
  }
}
