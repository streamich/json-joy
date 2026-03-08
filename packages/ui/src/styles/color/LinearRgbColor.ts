import type {RgbColor} from './RgbColor';

const enum GAMMA_PIVOT {
  WCAG = 0.03928,
  IEC = 0.04045,
}

export const fromRgb = (
  r: number,
  g: number,
  b: number,
  a: number,
  pivot: GAMMA_PIVOT = GAMMA_PIVOT.WCAG,
): LinearRgbColor => {
  const lr = r <= pivot ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const lg = g <= pivot ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const lb = b <= pivot ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
  return new LinearRgbColor(lr, lg, lb, a);
};

export class LinearRgbColor {
  public static fromRgb({r, g, b, a}: RgbColor, pivot?: GAMMA_PIVOT): LinearRgbColor {
    return fromRgb(r, g, b, a, pivot);
  }

  constructor(
    public readonly r: number,
    public readonly g: number,
    public readonly b: number,
    /** Float in range 0 to 1. */
    public readonly a: number = 1,
  ) {}

  /** Luminance of the color, in range 0 to 1. Used for contrast ratio calculations. */
  public Y(): number {
    return 0.2126 * this.r + 0.7152 * this.g + 0.0722 * this.b;
  }

  public isLight(): boolean {
    return this.Y() > 0.179;
  }

  public contrast(other: LinearRgbColor): number {
    let L1 = this.Y();
    let L2 = other.Y();
    if (L1 < L2) [L1, L2] = [L2, L1];
    return (L1 + 0.05) / (L2 + 0.05);
  }
}
