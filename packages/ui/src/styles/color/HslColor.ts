const HSL_REGEX = /hsla?\(?\s*(-?\d*\.?\d+)(deg|rad|grad|turn)?[,\s]+(-?\d*\.?\d+)%?[,\s]+(-?\d*\.?\d+)%?,?\s*[/\s]*(-?\d*\.?\d+)?(%)?\s*\)?/i;

export class HslColor {
  public static fromHsl(hsl: string): HslColor | undefined {
    const match = HSL_REGEX.exec(hsl);
    if (!match) return;
    const parsedUnits = match[2];
    const unitAdjustment = parsedUnits === 'deg'
      ? 1
      : parsedUnits === 'rad'
        ? (360 / (Math.PI * 2))
        : parsedUnits === 'grad'
          ? (360 / 400)
          : parsedUnits === 'turn'
            ? 360
            : 1;
    const h = parseFloat(match[1]) * unitAdjustment;
    const s = parseFloat(match[3]);
    const l = parseFloat(match[4]);
    const a = match[5] === undefined ? 100 : parseFloat(match[5]) * (match[6] ? 1 : 100);
    return new HslColor(h, s, l, a);
  }

  constructor(
    /** Float in deg, 0 to 360. */
    public readonly h: number,
    /** Float in %, 0 to 100. */
    public readonly s: number,
    /** Float in %, 0 to 100. */
    public readonly l: number,
    /** Float in %, 0 to 100. */
    public readonly a: number = 100,
  ) {}

  public toHsl(): string {
    const {h, s, l, a} = this;
    return `hsl(${h}deg ${s}% ${l}% / ${a}%)`;
  }

  public toString(): string {
    return this.toHsl();
  }
}
