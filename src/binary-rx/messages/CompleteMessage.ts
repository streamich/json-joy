import {getHeaderSize} from "../codec/header";

export class CompleteMessage {
  constructor (public readonly id: number, public readonly data: undefined | Uint8Array) {}

  public size (): number {
    const dataSize = this.data ? this.data.byteLength : 0;
    return getHeaderSize(dataSize) + 2 + dataSize;
  }
}
