const rbgRound = (value: number) => Math.min(Math.floor(value * 256), 255);

export class RgbColor {
  constructor(
    /** Float in range 0 to 1. */
    public readonly r: number,
    /** Float in range 0 to 1. */
    public readonly g: number,
    /** Float in range 0 to 1. */
    public readonly b: number,
    /** Float in range 0 to 1. */
    public readonly a: number = 100,
  ) {}

  public u8(): [r: number, g: number, b: number, a: number] {
    return [rbgRound(this.r), rbgRound(this.g), rbgRound(this.b), rbgRound(this.a)];
  }

  public rgb(): string {
    const [r, g, b] = this.u8();
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  public rgba(): string {
    const [r, g, b, a] = this.u8();
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a / 255 + ')';
  }
}
