import * as React from 'react';
import {rule} from 'nano-theme';
import {PlaceholderWords} from './PlaceholderWords';

const titleClass = rule({
  d: 'block',
});

const LEVEL_HEIGHTS: Record<1 | 2 | 3 | 4, number> = {
  1: 28,
  2: 22,
  3: 18,
  4: 16,
};

const LEVEL_MIN_WIDTHS: Record<1 | 2 | 3 | 4, number> = {
  1: 60,
  2: 48,
  3: 40,
  4: 32,
};

const LEVEL_MAX_WIDTHS: Record<1 | 2 | 3 | 4, number> = {
  1: 180,
  2: 150,
  3: 120,
  4: 100,
};

export interface PlaceholderTitleProps {
  /** Heading level (1..4). Defaults to 1. Drives default sizing. */
  level?: 1 | 2 | 3 | 4;
  /** Number of word boxes. Defaults to 4. */
  words?: number;
  /** Override word height in pixels. */
  height?: number;
  /** Min word width in pixels. */
  minWidth?: number;
  /** Max word width in pixels. */
  maxWidth?: number;
  /** Seed for deterministic widths. */
  seed?: number;
  /** Override fill color (e.g. accent color). */
  color?: string;
  /** Render children instead of auto-generated words. */
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

/**
 * Block-level heading placeholder. Renders a row of larger word boxes.
 * Pass `children` to compose the heading manually (e.g. to embed a caret).
 */
export const PlaceholderTitle: React.FC<PlaceholderTitleProps> = ({
  level = 1,
  words = 4,
  height,
  minWidth,
  maxWidth,
  seed = 1,
  color,
  children,
  style,
}) => {
  const h = height ?? LEVEL_HEIGHTS[level];
  const minW = minWidth ?? LEVEL_MIN_WIDTHS[level];
  const maxW = maxWidth ?? LEVEL_MAX_WIDTHS[level];
  return (
    <span className={titleClass} style={style}>
      {children ?? (
        <PlaceholderWords count={words} seed={seed} minWidth={minW} maxWidth={maxW} height={h} color={color} />
      )}
    </span>
  );
};
