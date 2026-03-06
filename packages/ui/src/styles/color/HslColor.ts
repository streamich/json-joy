import {RgbColor} from "./RgbColor";

const HSL_REGEX = /hsla?\(?\s*(-?\d*\.?\d+)(deg|rad|grad|turn)?[,\s]+(-?\d*\.?\d+)%?[,\s]+(-?\d*\.?\d+)%?,?\s*[/\s]*(-?\d*\.?\d+)?(%)?\s*\)?/i;

const hueToRgb = (p: number, q: number, t: number): number => {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1/6) return p + (q - p) * 6 * t;
  if (t < 1/2) return q;
  if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
  return p;
};

export const toRgb = (h: number, s: number, l: number, a: number): RgbColor => {
  let r = l, g = l, b = l;
  if (s !== 0) {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hueToRgb(p, q, h + 1/3);
    g = hueToRgb(p, q, h);
    b = hueToRgb(p, q, h - 1/3);
  }
  return new RgbColor(r, g, b, a);
};

export class HslColor {
  public static fromString(hsl: string): HslColor | undefined {
    const match = HSL_REGEX.exec(hsl);
    if (!match) return;
    const parsedUnits = match[2];
    const unitAdjustment = parsedUnits === 'deg'
      ? 1 / 360
      : parsedUnits === 'rad'
        ? (1 / (Math.PI * 2))
        : parsedUnits === 'grad'
          ? (1 / 400)
          : parsedUnits === 'turn'
            ? 1
            : 1 / 360;
    const h = parseFloat(match[1]) * unitAdjustment;
    const s = parseFloat(match[3]);
    const l = parseFloat(match[4]);
    const a = match[5] === undefined ? 1 : parseFloat(match[5]) * (match[6] ? 1 / 100 : 1);
    return new HslColor(h, s / 100, l / 100, a);
  }

  public static fromRgb(rgb: RgbColor): HslColor {
    const {r, g, b, a} = rgb;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h: number = 0, s: number = 0, l: number = (max + min) / 2;
    if (max === min) return new HslColor(0, 0, l, a); // achromatic
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    if (max === g) h = (b - r) / d + 2;
    if (max === b) h = (r - g) / d + 4;
    h /= 6;
    return new HslColor(h, s, l, a);
  }

  constructor(
    /** Float in range 0 to 1. */
    public readonly h: number,
    /** Float in range 0 to 1. */
    public readonly s: number,
    /** Float in range 0 to 1. */
    public readonly l: number,
    /** Float in range 0 to 1. */
    public readonly a: number = 1,
  ) {}

  public toRgb(): RgbColor {
    return toRgb(this.h, this.s, this.l, this.a);
  }

  public toString(): string {
    const {h, s, l, a} = this;
    return `hsl(${h * 360}deg ${s * 100}% ${l * 100}% / ${a * 100}%)`;
  }
}
