import {HsvColor} from './HsvColor';
import {RgbColor} from './RgbColor';

const HSL_REGEX =
  /hsla?\(?\s*(-?\d*\.?\d+)(deg|rad|grad|turn)?[,\s]+(-?\d*\.?\d+)%?[,\s]+(-?\d*\.?\d+)%?,?\s*[/\s]*(-?\d*\.?\d+)?(%)?\s*\)?/i;

const hueToRgb = (p: number, q: number, t: number): number => {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
};

export const toRgb = (h: number, s: number, l: number, a: number): RgbColor => {
  let r = l,
    g = l,
    b = l;
  if (s !== 0) {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hueToRgb(p, q, h + 1 / 3);
    g = hueToRgb(p, q, h);
    b = hueToRgb(p, q, h - 1 / 3);
  }
  return new RgbColor(r, g, b, a);
};

const clamp = (num: number) => Math.min(1, Math.max(0, num));

export class HslColor {
  public static from(source: string | RgbColor | HsvColor | HslColor): HslColor | undefined {
    if (source instanceof HslColor) return source.copy();
    if (source instanceof RgbColor) return HslColor.fromRgb(source);
    if (source instanceof HsvColor) return HslColor.fromHsv(source);
    if (typeof source !== 'string') return;
    if (source[0] === 'h') return HslColor.fromString(source);
    const rgb = RgbColor.fromString(source);
    return rgb ? HslColor.fromRgb(rgb) : rgb;
  }

  public static fromString(hsl: string): HslColor | undefined {
    const match = HSL_REGEX.exec(hsl);
    if (!match) return;
    const parsedUnits = match[2];
    const unitAdjustment =
      parsedUnits === 'deg'
        ? 1 / 360
        : parsedUnits === 'rad'
          ? 1 / (Math.PI * 2)
          : parsedUnits === 'grad'
            ? 1 / 400
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
    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    let h: number = 0,
      s: number = 0,
      l: number = (max + min) / 2;
    if (max === min) return new HslColor(0, 0, l, a); // achromatic
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    if (max === g) h = (b - r) / d + 2;
    if (max === b) h = (r - g) / d + 4;
    h /= 6;
    return new HslColor(h, s, l, a);
  }

  public static fromHsv(hsv: HsvColor): HslColor {
    const {h, s, v, a} = hsv;
    const l = v * (1 - s / 2);
    const sl = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l);
    return new HslColor(h, sl, l, a);
  }

  constructor(
    /** Float in range 0 to 1. */
    public h: number,
    /** Float in range 0 to 1. */
    public s: number,
    /** Float in range 0 to 1. */
    public l: number,
    /** Float in range 0 to 1. */
    public a: number = 1,
  ) {}

  public bump(dh: number = 0, ds: number = 0, dl: number = 0, da: number = 0): HslColor {
    if (dh !== 0) this.h = clamp(this.h + dh);
    if (ds !== 0) this.s = clamp(this.s + ds);
    if (dl !== 0) this.l = clamp(this.l + dl);
    if (da !== 0) this.a = clamp(this.a + da);
    return this;
  }

  public copy(dh: number = 0, ds: number = 0, dl: number = 0, da: number = 0): HslColor {
    return new HslColor(clamp(this.h + dh), clamp(this.s + ds), clamp(this.l + dl), clamp(this.a + da));
  }

  public toRgb(): RgbColor {
    return toRgb(this.h, this.s, this.l, this.a);
  }

  public toHsv(): HsvColor {
    const {h, s, l, a} = this;
    const v = l + s * Math.min(l, 1 - l);
    const sv = v === 0 ? 0 : 2 * (1 - l / v);
    return new HsvColor(h, sv, v, a);
  }

  public eq(other: HslColor): boolean {
    return this.h === other.h && this.s === other.s && this.l === other.l && this.a === other.a;
  }

  /**
   * Generates a perceptually normalized HSL color. Adjusts Lightness for human
   * luminance and tapers Saturation for design system harmony.
   */
  public norm(): HslColor {
    const { h, s, l } = this;

    // 1. Calculate Hue-based Luminance Weight
    const h6 = h * 6;
    const rw = Math.max(0, Math.min(1, Math.abs(h6 - 3) - 1));
    const gw = Math.max(0, Math.min(1, 2 - Math.abs(h6 - 2)));
    const bw = Math.max(0, Math.min(1, 2 - Math.abs(h6 - 4)));
    const hueWeight = (rw * 0.2126) + (gw * 0.7152) + (bw * 0.0722);

    // 2. Adjust Lightness (L)
    // Ensures a "500" Blue and "500" Yellow have the same perceived weight
    const adjustedL = l / (1 + s * (hueWeight - 0.5));
    this.l = clamp(adjustedL);

    // 3. Normalize Saturation (S)
    // Principle: Pure saturation at extremes (very light/dark) looks "unnatural."
    // We apply a "bell curve" to saturation based on the target lightness.
    // Near L=0.5, we allow 100% of the input S. At L=0 or L=1, we taper it down.
    const saturationTaper = Math.pow(Math.sin(this.l * Math.PI), 0.8);
    
    // Boost saturation for darker tones (600-800) to keep them from looking grey
    // but keep it very low for the "950" and "25" levels.
    this.s = clamp(s * saturationTaper);

    return this;
  }

  public toString(): string {
    const {h, s, l, a} = this;
    const H = +(h * 360).toFixed(3);
    const S = +(s * 100).toFixed(3);
    const L = +(l * 100).toFixed(3);
    let str= 'hsl(' + H + ' ' + S + '% ' + L + '%';
    str += (a === 1 ? ')' : ' / ' + +(a * 100).toFixed(3) + '%)');
    return str;
  }
}
