import * as React from 'react';
import {PlaceholderWord, type PlaceholderWordProps} from './PlaceholderWord';

const seededRng = (seed: number): (() => number) => {
  let s = seed | 0 || 1;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
};

export interface PlaceholderWordsProps extends Omit<PlaceholderWordProps, 'width' | 'style'> {
  /** Number of word placeholders to render. Defaults to 5. */
  count?: number;
  /** Seed for deterministic word-width randomization. Defaults to 1. */
  seed?: number;
  /** Min word width in pixels. Defaults to 28. */
  minWidth?: number;
  /** Max word width in pixels. Defaults to 110. */
  maxWidth?: number;
  /** Trailing space after the last word. Useful when inline siblings follow. */
  trailing?: boolean;
}

export const PlaceholderWords: React.FC<PlaceholderWordsProps> = ({
  count = 5,
  seed = 1,
  minWidth = 28,
  maxWidth = 110,
  trailing = false,
  ...wordProps
}) => {
  const widths = React.useMemo(() => {
    const rng = seededRng(seed);
    const range = Math.max(0, maxWidth - minWidth);
    return Array.from({length: count}, () => minWidth + Math.floor(rng() * (range + 1)));
  }, [seed, count, minWidth, maxWidth]);

  return (
    <>
      {widths.map((w, i) => (
        <React.Fragment key={i}>
          <PlaceholderWord {...wordProps} width={w} />
          {i < widths.length - 1 || trailing ? ' ' : null}
        </React.Fragment>
      ))}
    </>
  );
};
