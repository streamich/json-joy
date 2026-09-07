import type {Styles} from '../../styles/Styles';
import type {Density, Tone} from './types';

/** Numeric scale for one {@link Density} step, in CSS pixels. */
export interface DensityScale {
  /** Card face padding. */
  pad: number;
  /** Vertical gap between zones. */
  gap: number;
  /** Card corner radius. */
  radius: number;
  /** Default `CardTitle` (md) font size. */
  title: number;
  /** Default `CardTitle` (md) line height. */
  titleLh: number;
  /** Leading header icon / type-badge box size. */
  icon: number;
  /** Gap inside horizontal groups (header, footer, relations). */
  rowGap: number;
}

/**
 * The three density steps.
 */
export const DENSITY: Record<Density, DensityScale> = {
  comfortable: {pad: 16, gap: 14, radius: 18, title: 17, titleLh: 23, icon: 38, rowGap: 8},
  compact: {pad: 12, gap: 11, radius: 14, title: 15, titleLh: 20, icon: 32, rowGap: 7},
  dense: {pad: 8, gap: 8, radius: 12, title: 14, titleLh: 18, icon: 26, rowGap: 6},
};

/**
 * Resolve a {@link Tone} to its solid theme color, or `undefined` for the
 * neutral `default` tone. Used for the card's accent edge and tint, and as the
 * default accent of toned children.
 */
export const toneColor = (styles: Styles, tone: Tone | undefined): string | undefined => {
  switch (tone) {
    case 'error':
      return styles.negative + '';
    case 'warning':
      return styles.warning + '';
    case 'success':
      return styles.positive + '';
    case 'info':
      return styles.info + '';
    default:
      return undefined;
  }
};
