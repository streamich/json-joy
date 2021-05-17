import type {BinaryMessage} from './types';
import {getHeaderSize} from '../../codec/binary/header';
import {RequestCompleteMessage} from '../nominal';

/**
 * @category Message
 */
export class BinaryRequestCompleteMessage extends RequestCompleteMessage<Uint8Array> implements BinaryMessage {
  public size(): number {
    const dataSize = this.data ? this.data.byteLength : 0;
    return getHeaderSize(dataSize) + 2 + 1 + this.method.length + dataSize;
  }
}
