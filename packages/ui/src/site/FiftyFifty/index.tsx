import * as React from 'react';
import {rule} from 'nano-theme';

export interface FiftyFiftyProps {
  left?: React.ReactNode;
  right?: React.ReactNode;
  /** When stacked on small screens, render `left` on top. Defaults to true. */
  leftFirst?: boolean;
  /** Vertical alignment of the two sides on wide screens. Defaults to `center`. */
  verticalAlign?: 'start' | 'center' | 'end';
  /** Gap between the two sides in pixels. Defaults to 32. */
  gap?: number;
  /** Left-side share of horizontal space, between 0 and 1. Defaults to 0.5. */
  leftShare?: number;
  className?: string;
  style?: React.CSSProperties;
}

const blockClass = rule({
  d: 'grid',
  w: '100%',
  bxz: 'border-box',
  '@media only screen and (max-width: 900px)': {
    gridTemplateColumns: '1fr !important',
  },
});

const reverseStackClass = rule({
  '@media only screen and (max-width: 900px)': {
    '& > :first-child': {order: 2},
  },
});

const sideClass = rule({
  minW: 0,
});

export const FiftyFifty: React.FC<FiftyFiftyProps> = ({
  left,
  right,
  leftFirst = true,
  verticalAlign = 'center',
  gap = 32,
  leftShare = 0.5,
  className,
  style,
}) => {
  const cls = blockClass + (leftFirst ? '' : ' ' + reverseStackClass) + (className ? ' ' + className : '');
  const ls = Math.max(0, Math.min(1, leftShare));
  const rs = 1 - ls;

  return (
    <div
      className={cls}
      style={{
        gridTemplateColumns: `minmax(0, ${ls}fr) minmax(0, ${rs}fr)`,
        alignItems: verticalAlign,
        gap: `${gap}px`,
        ...style,
      }}
    >
      <div className={sideClass}>{left}</div>
      <div className={sideClass}>{right}</div>
    </div>
  );
};
