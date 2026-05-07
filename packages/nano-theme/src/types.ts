export type Scale = -5 | -4 | -3 | -2 | -1 | 0 | 1 | 2 | 3 | 4 | 5;

export interface Theme {
  /** Whether the theme is "light theme". */
  isLight: boolean;

  /** Name of the theme. */
  name: 'light' | 'dark' | string;

  /** Background color. */
  bg: string;

  /** Font palette. */
  font: ThemeFontPalette;

  /** Color palette. */
  color: ColorPalette;

  /** Generate a shade of green color. */
  green: (opacity: number) => string;

  /** Generate a shade of red color. */
  red: (opacity: number) => string;

  /** Generate a shade of red color. */
  blue: (opacity: number) => string;

  /** Spacing calculator. */
  space: (scale?: Scale) => number;

  /** Font size calculator. */
  fontSize: (scale?: Scale) => number;

  /** Gray color calculator. */
  g: (shade: number, opacity?: number) => string;
}

export interface ColorPalette {
  /** A list of nice looking colors. */
  color: string[];

  /** Semantic color. */
  sem: {
    /** Bright accent color to be used in small quantities throughout UI. */
    accent: ColorTuple;

    /** Link color. */
    link: ColorTuple;

    /** Business color. */
    blue: ColorTuple;

    /** Something positive - usually green. */
    positive: ColorTuple;

    /** Something negative, error - usually red. */
    negative: ColorTuple;

    /** Something to raise attention - usually yellow/orange. */
    warning: ColorTuple;

    /** Brand colors. */
    brand: string[];
  };

  /** Colors for specific UI elements. */
  ui: {
    lightLine: string;
    line: string;
    lineDark: string;
  };
}

export type ColorTuple = [main: string, light?: string, dark?: string];

export interface ThemeFontPalette {
  /** A palette of sans-serif fonts. */
  sans: {
    lite: ThemeFontStyle;
    mid: ThemeFontStyle;
    bold: ThemeFontStyle;
    black: ThemeFontStyle;
  };

  /** A palette of serif fonts. */
  serif: {
    lite: ThemeFontStyle;
    mid: ThemeFontStyle;
    bold: ThemeFontStyle;
    black: ThemeFontStyle;
  };

  /** A palette of slab fonts. */
  slab: {
    lite: ThemeFontStyle;
    mid: ThemeFontStyle;
    bold: ThemeFontStyle;
    black: ThemeFontStyle;
  };

  /** Monospace fonts. */
  mono: {
    mid: ThemeFontStyle;
    bold: ThemeFontStyle;
  };

  /** Fonts to be used in UI elements. */
  ui1: {
    lite: ThemeFontStyle;
    mid: ThemeFontStyle;
    bold: ThemeFontStyle;
    black: ThemeFontStyle;
  };
  ui2: {
    lite: ThemeFontStyle;
    mid: ThemeFontStyle;
    bold: ThemeFontStyle;
    black: ThemeFontStyle;
  };
  ui3: {
    lite: ThemeFontStyle;
    mid: ThemeFontStyle;
    bold: ThemeFontStyle;
    black: ThemeFontStyle;
  };
}

export interface ThemeFontStyle {
  /** Font weight. */
  fw: number | undefined;
  /** Font family. */
  ff: string;
}
