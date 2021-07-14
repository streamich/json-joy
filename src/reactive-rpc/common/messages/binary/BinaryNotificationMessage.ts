import type {BinaryMessage} from './types';
import {getHeaderSize} from '../../codec/binary/header';
import {NotificationMessage} from '../nominal';

/**
 * @category Message
 */
export class BinaryNotificationMessage extends NotificationMessage<Uint8Array> implements BinaryMessage {
  public size(): number {
    const dataSize = this.data ? this.data.byteLength : 0;
    return getHeaderSize(dataSize) + 1 + this.method.length + dataSize;
  }
}
