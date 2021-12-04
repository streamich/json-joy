import type {BinaryMessage} from './types';
import {getHeaderSize} from '../../codec/binary/header';
import {RequestErrorMessage} from '../nominal';

/**
 * @category Message
 */
export class BinaryRequestErrorMessage extends RequestErrorMessage<Uint8Array> implements BinaryMessage {
  public size(): number {
    const dataSize = this.data.byteLength;
    return getHeaderSize(dataSize) + 2 + 1 + this.method.length + dataSize;
  }
}
