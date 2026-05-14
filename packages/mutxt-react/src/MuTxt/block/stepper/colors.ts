import {HslColor} from '@jsonjoy.com/ui/lib/styles/color/HslColor';
import {RgbColor} from '@jsonjoy.com/ui/lib/styles/color/RgbColor';
import type {Styles} from '@jsonjoy.com/ui/lib/styles/Styles';
import type {StepState} from './types';

export interface StepStateColors {
  /** Color used for ring stroke, connector line, halo. */
  line: string;
  /** Default background fill behind the bullet disc. */
  bg: string;
  /** Color of the glyph rendered inside the bullet (for the state default bg). */
  glyph: string;
}

/** State governs color only, line thickness is configured separately. */
export const getStepStateColors = (styles: Styles, state: StepState): StepStateColors => {
  switch (state) {
    case 'pending': {
      const line = styles.grey.toString();
      return {line, bg: styles.grey.g(0.04), glyph: line};
    }
    case 'active': {
      const line = styles.g(0.05);
      return {line, bg: styles.grey.g(0.04), glyph: line};
    }
    case 'done': {
      const line = styles.positive.toString();
      return {line, bg: line, glyph: '#ffffff'};
    }
    case 'warning': {
      const line = styles.warning.toString();
      return {line, bg: styles.warning.g(0.04), glyph: line};
    }
    case 'error': {
      const line = styles.negative.toString();
      return {line, bg: styles.negative.g(0.04), glyph: line};
    }
    case 'optional': {
      const line = styles.grey.g(0.35);
      return {line, bg: styles.grey.g(0.02), glyph: line};
    }
  }
};

const GLYPH_BLACK = new HslColor(0, 0, 0.05);
const GLYPH_WHITE = new HslColor(0, 0, 0.97);

/** Pick a glyph color with enough WCAG contrast against the flattened bullet background. */
export const pickGlyphColor = (styles: Styles, bgCss: string, fallback: string): string => {
  const bg = HslColor.from(bgCss);
  if (!bg) return fallback;
  const flattened = bg.flatten(styles.bg.fg);
  const choice = flattened.bestContrast(GLYPH_BLACK, GLYPH_WHITE);
  if (flattened.contrast(choice) < 4) return fallback;
  return toHex(choice.toString());
};

/** Format any CSS color as `#RRGGBB` or `#RRGGBBAA`. */
export const toHex = (css: string): string => {
  const rgb = RgbColor.fromString(css);
  if (rgb) return rgb.hex();
  const hsl = HslColor.from(css);
  return hsl ? hsl.toRgb().hex() : css;
};
