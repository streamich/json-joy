import type {BinaryMessage} from './types';
import {getHeaderSize} from '../../codec/binary/header';
import {RequestDataMessage} from '../nominal';

/**
 * @category Message
 */
export class BinaryRequestDataMessage extends RequestDataMessage<Uint8Array | undefined> implements BinaryMessage {
  public size(): number {
    const dataSize = this.data ? this.data.byteLength : 0;
    return getHeaderSize(dataSize) + 2 + 1 + this.method.length + dataSize;
  }
}
