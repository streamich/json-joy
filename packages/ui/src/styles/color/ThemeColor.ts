import {HslColor} from './HslColor';

const DEFAULT_BG = HslColor.from('#fff')!;

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

export class ThemeColor {
  constructor(
    public readonly fg: HslColor,
    public readonly bg: HslColor = DEFAULT_BG,
  ) {}

  public isDarkTheme(): boolean {
    return this.bg.l < 0.5;
  }

  /**
   * @param contrast Contrast with background: 1 - highest, 0 - lowest.
   * @param alpha The alpha channel level.
   */
  public g(contrast: number = 1, alpha: number = this.fg.a): string {
    return this.col(contrast, alpha).toString();
  }

  public col(contrast: number = 0, alpha: number = this.fg.a): ThemeColor {
    const isDark = this.isDarkTheme();
    const bgL = this.bg.l;
    const fgS = this.fg.s;
    const lightness = isDark ? bgL + (1 - bgL) * contrast : bgL - bgL * contrast;
    const saturation = clamp(fgS + (isDark ? 1 : -1) * contrast * 0.5, 0, 1);
    // const saturation = fgS;
    const newHsl = new HslColor(this.fg.h, saturation, lightness, alpha);
    return new ThemeColor(newHsl, this.bg);
  }

  public toDarkTheme(bgDark: HslColor): ThemeColor {
    const dContrast = this.bg.l - this.fg.l;
    const newL = clamp(bgDark.l + dContrast, 0, 1);
    const newS = this.fg.s > 0.6 ? this.fg.s * 0.9 : this.fg.s;
    const newH = this.fg.h;
    return new ThemeColor(new HslColor(newH, newS, newL, this.fg.a), bgDark);
  }

  public lerp(other: ThemeColor, t: number): ThemeColor {
    return new ThemeColor(this.fg.mix(other.fg, t), this.bg.mix(other.bg, t));
  }

  public toString(): string {
    return this.fg.toString();
  }
}
