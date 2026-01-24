export interface FontTheme {
  palette: FontPalette;
}

export interface FontPalette {
  /** A palette of sans-serif fonts. */
  sans?: FontScale[];
  /** A palette of serif fonts. */
  serif?: FontScale[];
  /** A palette of slab fonts. */
  slab?: FontScale[];
  /** Monospace fonts. */
  mono?: FontScale[];
  /** Fonts to be used in UI elements. */
  ui?: FontScale[];
}

export interface FontScale {
  lite?: FontStyle;
  mid?: FontStyle;
  bold?: FontStyle;
  black?: FontStyle;
}

export interface FontStyle {
  /** Font weight. */
  fw?: number | undefined;
  /** Font family. */
  ff: string;
}
