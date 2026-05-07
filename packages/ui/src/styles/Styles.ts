import type {StyleTheme} from './types';
import {Colors} from './color/Colors';
import {Fonts} from './font/Fonts';
import {theme as ltheme} from './theme/light';
import {theme as dtheme} from './theme/dark';
import {HslColor, ThemeColor} from './color';
// import {Color} from './color/Color';

export class Styles {
  public static readonly make = (theme?: StyleTheme, dark?: boolean) => new Styles(theme ?? (dark ? dtheme : ltheme));

  public bg: HslColor;
  public accent: ThemeColor;
  public neutral: ThemeColor;

  /** Whether it is the "light" theme (or "dark" theme). */
  public readonly light?: boolean;

  public readonly col: Colors;
  public readonly txt: Fonts;

  constructor(public readonly theme: StyleTheme) {
    this.light = theme.light ?? true;
    this.col = new Colors(theme.color);
    this.txt = new Fonts(theme.font);
    const bg = HslColor.from('#F8F9FA')!;
    const accent = new ThemeColor(new HslColor(.575, .91, .56), bg);
    const neutral = new ThemeColor(new HslColor(.155, .43, .62), bg);
    this.bg = this.light ? bg : HslColor.from('#1A1A1B')!;
    this.accent = this.light ? accent : accent.toDarkTheme(this.bg);
    this.neutral = this.light ? neutral : neutral.toDarkTheme(this.bg);
  }

  public readonly g = (shade: number, opacity: number = 1): string => {
    const min = this.light ? (0 + 10) : 255;
    const max = this.light ? (255 - 20) : 0;
    const g = Math.round(min + (max - min) * shade);
    return `rgba(${g},${g},${g},${opacity})`;
  };
}
