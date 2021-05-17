import type {BinaryMessage} from './types';
import {getHeaderSize} from '../../codec/binary/header';
import {ResponseErrorMessage} from '../nominal';

/**
 * @category Message
 */
export class BinaryResponseErrorMessage extends ResponseErrorMessage<Uint8Array> implements BinaryMessage {
  public size(): number {
    const dataSize = this.data.byteLength;
    return getHeaderSize(dataSize) + 2 + dataSize;
  }
}
