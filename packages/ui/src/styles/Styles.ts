import type {StyleTheme} from './types';
import {Colors} from './color/Colors';
import {Fonts} from './font/Fonts';
import {theme as ltheme} from './theme/light';
import {theme as dtheme} from './theme/dark';
// import {Color} from './color/Color';

export class Styles {
  public static readonly make = (theme?: StyleTheme, dark?: boolean) => new Styles(theme ?? (dark ? dtheme : ltheme));

  /**
   * Whether it is the "light" theme (or "dark" theme).
   */
  public readonly light?: boolean;

  public readonly col: Colors;
  public readonly txt: Fonts;

  constructor(public readonly theme: StyleTheme) {
    this.light = theme.light ?? true;
    this.col = new Colors(theme.color);
    this.txt = new Fonts(theme.font);
  }

  public readonly g = (shade: number, opacity: number = 1): string => {
    const g = Math.round(255 * shade);
    return `rgba(${g},${g},${g},${opacity})`;
    // const {col} = this;
    // const step = Math.round((1 - L) * 11);
    // const color0 = col.col(['neutral', 0, step]);
    // const {H, S, light} = color0;
    // return new Color(H, S, L * 100 - 100, A * 100, light) + '';
  };
}
