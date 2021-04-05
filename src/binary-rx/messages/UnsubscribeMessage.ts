export class UnsubscribeMessage {
  constructor (public readonly id: number) {}

  public maxLength (): number {
    return 3;
  }
}
