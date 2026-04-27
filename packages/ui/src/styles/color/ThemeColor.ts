import {HslColor} from "./HslColor";

const DEFAULT_BG = HslColor.from('#fff')!;

export class ThemeColor {
  constructor(
    public readonly hsl: HslColor,
    public readonly bg: HslColor = DEFAULT_BG,
  ) {}

  public isDarkTheme(): boolean {
    return this.bg.l < 0.5;
  }

  /**
   * Creates a color with the same hue but adjusts the saturation and lightness:
   *
   * - Lightness is adjusted based on `contrast` parameter: higher contrast means
   *   more lightness difference from the background. The formula is:
   *   `lightness = bg.l + (hsl.l - bg.l) * contrast`.
   * - Saturation is automatically adjusted based on background (light or dark)
   *   and the `contrast` parameter: for light backgrounds, saturation is increased for
   *   higher contrast; for dark backgrounds, saturation is decreased for higher contrast.
   *   The formula is: `saturation = hsl.s + (isDarkTheme ? -1 : 1) * contrast * 0.5`.
   *
   * @param contrast Contrast with background: 1 - highest, 0 - lowest.
   * @param alpha The alpha channel level.
   */
  public g(contrast: number = 0, alpha: number = this.hsl.a): string {
    const isDark = this.isDarkTheme();
    const lightness = this.bg.l + (this.hsl.l - this.bg.l) * contrast;
    const saturation = this.hsl.s + (isDark ? -1 : 1) * contrast * 0.5;
    const newHsl = new HslColor(this.hsl.h, saturation, lightness, alpha);
    newHsl.norm();
    return newHsl.toString();
  }

  public toString(): string {
    return this.hsl.toString();
  }
}
