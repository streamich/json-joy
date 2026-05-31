import type {StyleTheme} from './types';
import {Colors} from './color/Colors';
import {Fonts} from './font/Fonts';
import {theme as ltheme} from './theme/light';
import {theme as dtheme} from './theme/dark';
import {HslColor, ThemeColor} from './color';

export class Styles {
  public static readonly make = (theme?: StyleTheme, dark?: boolean) => new Styles(theme ?? (dark ? dtheme : ltheme));

  public bg: ThemeColor;
  public grey: ThemeColor;
  public surface: ThemeColor;
  public neutral: ThemeColor;

  public accent: ThemeColor;
  public accent2: ThemeColor;
  public positive: ThemeColor;
  public negative: ThemeColor;
  public important: ThemeColor;
  public warning: ThemeColor;
  public info: ThemeColor;
  public ai: ThemeColor;
  public link: ThemeColor;
  public brand1: ThemeColor;
  public brand2: ThemeColor;
  public brand3: ThemeColor;
  public brand4: ThemeColor;
  public brand5: ThemeColor;
  public brand6: ThemeColor;
  /** All brand colors as a tuple, in `brand1..6` order. */
  public brand: [ThemeColor, ThemeColor, ThemeColor, ThemeColor, ThemeColor, ThemeColor];

  /** Whether it is the "light" theme (or "dark" theme). */
  public readonly light?: boolean;

  public readonly col: Colors;
  public readonly txt: Fonts;

  constructor(public readonly theme: StyleTheme) {
    const light = (this.light = theme.light ?? true);
    this.col = new Colors(theme.color);
    this.txt = new Fonts(theme.font);
    const lightSurface = HslColor.from('#F8F9FA')!;
    const surface = light ? lightSurface : HslColor.from('#1A1A1B')!;
    const grey = new ThemeColor(new HslColor(0, 0, 0.5), lightSurface);
    const neutral = new ThemeColor(new HslColor(0.155, 0.43, 0.62), lightSurface);
    const accent = new ThemeColor(new HslColor(0.575, 0.91, 0.56), lightSurface);
    const accent2 = new ThemeColor(new HslColor(0.097, 0.85, 0.55), lightSurface);
    const positive = new ThemeColor(new HslColor(0.42, 0.69, 0.42), lightSurface);
    const negative = new ThemeColor(new HslColor(0.02, 0.75, 0.5), lightSurface);
    const important = new ThemeColor(new HslColor(0.75, 0.62, 0.55), lightSurface);
    const warning = new ThemeColor(new HslColor(0.105, 0.85, 0.5), lightSurface);
    const info = new ThemeColor(new HslColor(0.555, 0.8, 0.5), lightSurface);
    const ai = new ThemeColor(new HslColor(0.842, 0.75, 0.58), lightSurface);
    // const link = new ThemeColor(new HslColor(0.717, 0.75, 0.55), lightSurface);
    const link = new ThemeColor(HslColor.from('#07f')!, lightSurface);
    const brand1 = new ThemeColor(HslColor.from('#E44A28')!, lightSurface); // red
    const brand2 = new ThemeColor(HslColor.from('#985DF7')!, lightSurface); // purple
    const brand3 = new ThemeColor(HslColor.from('#EE69B1')!, lightSurface); // pink
    const brand4 = new ThemeColor(HslColor.from('#F6A832')!, lightSurface); // orange
    const brand5 = new ThemeColor(HslColor.from('#5FCC8A')!, lightSurface); // green
    const brand6 = new ThemeColor(HslColor.from('#58B9F8')!, lightSurface); // blue
    this.bg = light ? new ThemeColor(HslColor.from('#fff')!, lightSurface) : new ThemeColor(surface, surface);
    this.surface = new ThemeColor(surface, surface);
    this.grey = this.light ? grey : grey.toDarkTheme(surface);
    this.neutral = this.light ? neutral : neutral.toDarkTheme(surface);
    this.accent = this.light ? accent : accent.toDarkTheme(surface);
    this.accent2 = this.light ? accent2 : accent2.toDarkTheme(surface);
    this.positive = this.light ? positive : positive.toDarkTheme(surface);
    this.negative = this.light ? negative : negative.toDarkTheme(surface);
    this.important = this.light ? important : important.toDarkTheme(surface);
    this.warning = this.light ? warning : warning.toDarkTheme(surface);
    this.info = this.light ? info : info.toDarkTheme(surface);
    this.ai = this.light ? ai : ai.toDarkTheme(surface);
    this.link = this.light ? link : link.toDarkTheme(surface);
    this.brand1 = this.light ? brand1 : brand1.toDarkTheme(surface);
    this.brand2 = this.light ? brand2 : brand2.toDarkTheme(surface);
    this.brand3 = this.light ? brand3 : brand3.toDarkTheme(surface);
    this.brand4 = this.light ? brand4 : brand4.toDarkTheme(surface);
    this.brand5 = this.light ? brand5 : brand5.toDarkTheme(surface);
    this.brand6 = this.light ? brand6 : brand6.toDarkTheme(surface);
    this.brand = [this.brand1, this.brand2, this.brand3, this.brand4, this.brand5, this.brand6];
  }

  /**
   * Greyscale ramp clamped to the surface lightness. `scale=0` near black,
   * `scale=1` near bg color, invisible.
   */
  public readonly g = (scale: number, alpha: number = 1): string => {
    const bgL = this.bg.fg.l;
    const farL = this.light ? 0.04 : 0.96;
    const l = farL + (bgL - farL) * scale;
    return new HslColor(0, 0, l, alpha).toString();
  };

  /** Same range as `g()` but tinted with the neutral hue. */
  public readonly gN = (scale: number, alpha: number = 1): string => {
    const bgL = this.bg.fg.l;
    const farL = this.light ? 0.04 : 0.96;
    const l = farL + (bgL - farL) * scale;
    const tintFactor = 1 - Math.abs(scale - 0.5) * 2;
    const s = this.neutral.fg.s * tintFactor * 0.25;
    return new HslColor(this.neutral.fg.h, s, l, alpha).toString();
  };

  public toCssVars(): Record<string, string> {
    const out: Record<string, string> = {
      '--colTxtSharp': this.g(0.03, 0.97),
      '--colTxt': this.g(0.08, 0.92),
      '--colTxtLite': this.g(0.13, 0.87),
      '--colTxtDim': this.g(0.33, 0.77),
      '--colTxtActive': this.accent + '',
      '--colTxtActiveSharp': this.accent.fg.pct(0, 0.4, -0.2) + '',
      '--colTxtActiveHover': this.accent.fg.pct(0, 0.5, -0.3) + '',
      '--colBgTint': this.neutral.fg.pct(0, -0.2, 0.88) + '',
      '--colBgTintLite': this.neutral.fg.pct(0, 0, 0.96) + '',
      '--colBgTint2': this.neutral.fg.pct(0, -0.6, 0.9) + '',
      '--colLineTint': this.neutral.fg.pct(0, -0.3, -0.1, -0.6) + '',

      // Background colors for selection and hover of buttons.
      '--colBgHover': this.neutral.fg.pct(0, -0.2, 0.5, -0.72) + '',
      '--colBgActiveDim': this.neutral.fg.pct(0, -0.3, 0.5, -0.85) + '',
      '--colBgActive': this.accent.fg.pct(0, -0.1, 0.5, -0.85) + '',

      // Links
      '--colLink': this.link.fg + '',
    };
    return out;
  }
}
