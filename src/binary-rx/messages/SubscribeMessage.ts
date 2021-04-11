import {getHeaderSize} from '../codec/header';

/**
 * @category Message
 */
export class SubscribeMessage {
  constructor(
    public readonly id: number,
    public readonly method: string,
    public readonly data: undefined | Uint8Array,
  ) {}

  public size(): number {
    const dataSize = this.data ? this.data.byteLength : 0;
    return getHeaderSize(dataSize) + 3 + this.method.length + dataSize;
  }
}
