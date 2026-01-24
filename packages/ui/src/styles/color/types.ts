/**
 * Color scale, 12 steps.
 */
export type ColorScale = [
  // Backgrounds
  AppBackground: number, // 0
  SubtleBackground: number, // 1
  // Component backgrounds
  ElementBackground: number, // 2
  HoveredElementBackground: number, // 3
  SelectedElementBackground: number, // 4
  // Borders
  SubtleBorder: number, // 5
  ElementBorder: number, // 6
  HoveredElementBorder: number, // 7
  // Solid backgrounds
  SolidBackground: number, // 8
  HoveredSolidBackground: number, // 9
  // Text
  LowContrastText: number, // 10
  HighContrastText: number, // 11
];

export type ColorHue = [
  /**
   * Hue in degrees from 0 to 360 (integer).
   */
  H: number,
  /**
   * Saturation in percent from 0 to 100 (integer).
   */
  S: number,
  /**
   * Custom options, specifically for this color.
   */
  options?: ColorOptions,
];

export interface ColorOptions {
  scales?: ColorScales;
}

export interface ColorPalette {
  brand?: ColorHue[];
  accent?: ColorHue[];
  neutral?: ColorHue[];
  success?: ColorHue[];
  error?: ColorHue[];
  warning?: ColorHue[];
  link?: ColorHue[];
  ai?: ColorHue[];
}

export interface ColorMapping {
  bg?: ColorSpecifier;
}

export interface ColorScales {
  /** Lightness scale for light mode */
  L?: ColorScale;
  /** Saturation multiplier scale. Defaults to 1. */
  xS?: ColorScale;
  /** Shift in Hue. Defaults to 0. */
  dH?: ColorScale;
}

export interface ColorTheme {
  scales?: ColorScales;
  light?: boolean;
  palette: ColorPalette;

  /**
   * Mapping of color palette to specific UI elements, like background color,
   * button color, etc.
   */
  mapping?: ColorMapping;
}

export type ColorScaleStep = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
export type ColorScaleStepMnemonic =
  | 'bg-1' // AppBackground
  | 'bg-2' // SubtleBackground
  | 'el-1' // ElementBackground
  | 'el-2' // HoveredElementBackground
  | 'el-3' // SelectedElementBackground
  | 'border-1' // SubtleBorder
  | 'border-2' // ElementBorder
  | 'border-3' // HoveredElementBorder
  | 'solid-1' // SolidBackground
  | 'solid-2' // HoveredSolidBackground
  | 'txt-1' // LowContrastText
  | 'txt-2'; // HighContrastText

export type ColorSpecifier = [
  type: keyof ColorPalette,
  index?: number,
  step?: ColorScaleStep | ColorScaleStepMnemonic | number,
  adjustments?: ColorAdjustments,
];

export interface ColorAdjustments {
  /** Opacity value hsl(,,, A) */
  A?: number;
  /** Lightness value hsl(,, L,) */
  L?: number;
  /** Shift in saturation hsl(, +dS,,) */
  dS?: number;
  /** Shift in lightness hsl(,, +dL,); in dark mode it is reversed hsl(,, -dL,) */
  dL?: number;
}
