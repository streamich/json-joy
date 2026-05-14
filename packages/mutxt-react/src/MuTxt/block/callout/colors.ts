import {HslColor, LinearRgbColor, ThemeColor} from '@jsonjoy.com/ui';
import {RgbColor} from '@jsonjoy.com/ui/lib/styles/color/RgbColor';
import type {Styles} from '@jsonjoy.com/ui/lib/styles/Styles';

export const DEFAULT_ACCENT = '#07f';

export interface CalloutColors {
  /** Strong accent (vertical left border, indicator background tint). */
  accent: string;
  /** Soft tinted background of the callout block. */
  bg: string;
  /** Subtly darker bg used on hover. */
  bgHover: string;
  /** Outer hairline border color. */
  bd: string;
  /** Subtly darker border used on hover. */
  bdHover: string;
  /** Drop shadow color (with built-in alpha). */
  shadow: string;
  /** Title / icon color (contrast-tuned against white). */
  title: string;
}

/** Format any CSS color string as `#RRGGBB(AA)`. */
export const toHex = (css: string): string => {
  const rgb = RgbColor.fromString(css);
  if (rgb) return rgb.hex();
  const hsl = HslColor.from(css);
  return hsl ? hsl.toRgb().hex() : css;
};

/**
 * Resolve all callout-related colors from a single accent string. Accepts hex
 * or anything `HslColor.from` understands. Falls back to `DEFAULT_ACCENT` on
 * unparseable input.
 */
export const getCalloutColors = (styles: Styles, accent: string): CalloutColors => {
  const hsl = HslColor.from(accent) ?? HslColor.from(DEFAULT_ACCENT)!;
  const surface = styles.light ? HslColor.from('#fff')! : HslColor.from('#000')!;
  const themed = new ThemeColor(hsl.norm(), surface);
  const titleHsl = (HslColor.from(accent) ?? HslColor.from(DEFAULT_ACCENT)!)
    .toLinearRgb()
    .adjToContrast(new LinearRgbColor(1, 1, 1));
  const shadow = themed.fg.copy();
  shadow.a = 0.08;
  return {
    accent: themed.toString(),
    bg: themed.g(0.02),
    bgHover: themed.g(0.04),
    bd: themed.col(0.16).fg.pct(0, -0.5).toString(),
    bdHover: themed.col(0.22).fg.pct(0, -0.5).toString(),
    shadow: shadow.toString(),
    title: titleHsl.toString(),
  };
};
