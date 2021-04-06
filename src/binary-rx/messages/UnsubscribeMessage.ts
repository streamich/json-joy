export class UnsubscribeMessage {
  constructor (public readonly id: number) {}

  public size (): number {
    return 3;
  }
}
