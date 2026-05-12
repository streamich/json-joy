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
  public neutral: ThemeColor;
  public accent: ThemeColor;
  public accent2: ThemeColor;
  public positive: ThemeColor;
  public negative: ThemeColor;
  public warning: ThemeColor;
  public info: ThemeColor;
  public ai: ThemeColor;
  public link: ThemeColor;

  /** Whether it is the "light" theme (or "dark" theme). */
  public readonly light?: boolean;

  public readonly col: Colors;
  public readonly txt: Fonts;

  constructor(public readonly theme: StyleTheme) {
    this.light = theme.light ?? true;
    this.col = new Colors(theme.color);
    this.txt = new Fonts(theme.font);
    const lightSurface = HslColor.from('#F8F9FA')!;
    const darkSurface = HslColor.from('#1A1A1B')!;
    const surface = this.light ? lightSurface : darkSurface;
    const grey = new ThemeColor(new HslColor(0, 0, 0.5), lightSurface);
    const neutral = new ThemeColor(new HslColor(0.155, 0.43, 0.62), lightSurface);
    const accent = new ThemeColor(new HslColor(0.575, 0.91, 0.56), lightSurface);
    const accent2 = new ThemeColor(new HslColor(0.097, 0.85, 0.55), lightSurface);
    const positive = new ThemeColor(new HslColor(0.42, 0.69, 0.42), lightSurface);
    const negative = new ThemeColor(new HslColor(0.02, 0.75, 0.5), lightSurface);
    const warning = new ThemeColor(new HslColor(0.105, 0.85, 0.5), lightSurface);
    const info = new ThemeColor(new HslColor(0.555, 0.8, 0.5), lightSurface);
    const ai = new ThemeColor(new HslColor(0.842, 0.75, 0.58), lightSurface);
    const link = new ThemeColor(new HslColor(0.717, 0.75, 0.55), lightSurface);
    this.bg = new ThemeColor(surface, surface);
    this.grey = this.light ? grey : grey.toDarkTheme(surface);
    this.neutral = this.light ? neutral : neutral.toDarkTheme(surface);
    this.accent = this.light ? accent : accent.toDarkTheme(surface);
    this.accent2 = this.light ? accent2 : accent2.toDarkTheme(surface);
    this.positive = this.light ? positive : positive.toDarkTheme(surface);
    this.negative = this.light ? negative : negative.toDarkTheme(surface);
    this.warning = this.light ? warning : warning.toDarkTheme(surface);
    this.info = this.light ? info : info.toDarkTheme(surface);
    this.ai = this.light ? ai : ai.toDarkTheme(surface);
    this.link = this.light ? link : link.toDarkTheme(surface);
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
      '--colTxtSharp': this.g(.05, .95),
      '--colTxtLite': this.g(.13, .87),
    };
    return out;
  }
}
