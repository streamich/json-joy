export class SubscribeMessage {
  constructor (public readonly id: number, public readonly method: string, public readonly data: undefined | Uint8Array) {}

  public maxLength (): number {
    return 4 + 2 + 1 + this.method.length + (this.data ? this.data.byteLength : 0);
  }
}
