import type {BinaryMessage} from './types';
import {getHeaderSize} from '../../codec/binary/header';
import {ResponseDataMessage} from '../nominal';

/**
 * @category Message
 */
export class BinaryResponseDataMessage extends ResponseDataMessage<Uint8Array> implements BinaryMessage {
  public size(): number {
    const dataSize = this.data.byteLength;
    return getHeaderSize(dataSize) + 2 + dataSize;
  }
}
