export class CompleteMessage {
  constructor (public readonly id: number, public readonly data: undefined | Uint8Array) {}

  public maxLength (): number {
    return 5 + 2 + (this.data ? this.data.byteLength : 0);
  }
}
