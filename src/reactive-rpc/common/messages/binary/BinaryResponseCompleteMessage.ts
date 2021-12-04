import type {BinaryMessage} from './types';
import {getHeaderSize} from '../../codec/binary/header';
import {ResponseCompleteMessage} from '../nominal';

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
}
