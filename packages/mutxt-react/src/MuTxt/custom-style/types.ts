import type {FontKind} from '../types';

/**
 * `CustomStyle` is a per-field optional bag of typography (and, at block
 * scope, layout) declarations. Every field is optional. A value expresses
 * an override, absence means "inherit from the next-higher scope".
 */
export interface CustomStyle {
  // --------------------------------------------------------------------- Font
  /** Font family. Built-in `FontKind` keys resolve via `FONT_FAMILIES`. */
  ff?: FontKind | string;
  /** Font size in CSS px. */
  fz?: number;
  /** Font weight (CSS values). */
  fw?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  /** Font-stretch percent (CSS `font-stretch`, 50..200). */
  fs?: number;
  /** Apply `font-optical-sizing: auto`. */
  os?: boolean;
  /** Ligature mode. */
  lig?: 'normal' | 'none' | 'common' | 'discretionary' | 'historical';
  /** Numeric variant. */
  nv?: 'normal' | 'lining' | 'oldstyle' | 'tabular' | 'proportional';

  // ------------------------------------------------------------------ Spacing
  /** Line height (unitless multiplier). */
  lh?: number;
  /** Letter spacing in `em`. */
  ls?: number;
  /** Word spacing in `em`. */
  ws?: number;
  /** Kerning. */
  krn?: 'auto' | 'normal' | 'none';

  // -------------------------------------------------------------------- Style
  /** Italic / oblique. */
  it?: boolean;
  /** Uppercase via `text-transform`. */
  caps?: boolean;
  /** Small caps via `font-variant-caps`. */
  smcp?: boolean;
  /** Underline offset in px. */
  uo?: number;
  /** Text decoration thickness in px. */
  dt?: number;

  // -------------------------------------------------------------------- Color
  /** Foreground text color (CSS color string). */
  fg?: string;
  /** Background color. */
  bg?: string;
}

/** Keys that participate in CSS inheritance (typography). Applied at every scope. */
export const TYPOGRAPHY_KEYS = [
  'ff',
  'fz',
  'fw',
  'fs',
  'os',
  'lig',
  'nv',
  'lh',
  'ls',
  'ws',
  'krn',
  'it',
  'caps',
  'smcp',
  'uo',
  'dt',
  'fg',
  'bg',
] as const satisfies readonly (keyof CustomStyle)[];

export type TypographyKey = (typeof TYPOGRAPHY_KEYS)[number];
