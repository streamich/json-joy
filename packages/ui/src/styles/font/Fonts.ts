import {theme} from './theme';
import type {FontPalette, FontTheme, FontStyle, FontScale} from './types';

const defaultPalette = theme.palette;

export class Fonts {
  public palette: FontPalette;

  constructor(theme: FontTheme = {palette: {}}) {
    this.palette = theme.palette;
  }

  public readonly get = (
    kind: keyof FontPalette = 'ui',
    scale: keyof FontScale = 'mid',
    index: number = 0,
  ): FontStyle => {
    const fonts = this.palette[kind] ?? defaultPalette[kind] ?? defaultPalette.ui!;
    const wrappedIndex = index % fonts.length;
    const font = fonts[wrappedIndex];
    const style = font[scale] ?? defaultPalette.ui![0][scale]!;
    return style;
  };
}
