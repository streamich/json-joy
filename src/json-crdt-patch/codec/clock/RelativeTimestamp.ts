export class RelativeTimestamp {
  public constructor(public readonly sessionIndex: number, public readonly timeDiff: number) {}

  public toJson() {
    return [this.sessionIndex, this.timeDiff];
  }

  public compact(): string {
    return this.sessionIndex + ',' + this.timeDiff;
  }

  public encode(buf: Uint8Array, offset: number): number {
    return 0;
  }

  public push(arr: unknown[]) {
    arr.push(this.sessionIndex, this.timeDiff);
  }
}
