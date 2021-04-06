import {getHeaderSize} from "../codec/header";

export class NotificationMessage {
  constructor (public readonly method: string, public readonly data: undefined | Uint8Array) {}

  public size (): number {
    const dataSize = this.data ? this.data.byteLength : 0;
    return getHeaderSize(dataSize) + 1 + this.method.length + dataSize;
  }
}
