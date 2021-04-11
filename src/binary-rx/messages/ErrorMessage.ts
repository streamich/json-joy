import {getHeaderSize} from '../codec/header';

/**
 * @category Message
 */
export class ErrorMessage {
  constructor(public readonly id: number, public readonly data: Uint8Array) {}

  public size(): number {
    const dataSize = this.data.byteLength;
    return getHeaderSize(dataSize) + 2 + dataSize;
  }
}
