export class NotificationMessage {
  constructor (public readonly method: string, public readonly data: undefined | Uint8Array) {}

  public maxLength (): number {
    return 4 + 1 + this.method.length + (this.data ? this.data.byteLength : 0);
  }
}
