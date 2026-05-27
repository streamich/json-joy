import * as React from 'react';
import {rule} from 'nano-theme';

const rootClass = rule({
  pos: 'relative',
  d: 'inline-block',
  va: 'baseline',
  pe: 'none',
  us: 'none',
});

const caretClass = rule({
  d: 'block',
  w: '2px',
  h: 'calc(100% + 6px)',
  bdrad: '1px',
});

const flagClass = rule({
  pos: 'absolute',
  d: 'inline-block',
  fz: '11px',
  ff: 'system-ui, -apple-system, sans-serif',
  fw: '500',
  lh: '1',
  col: '#fff',
  pd: '3px 6px',
  ws: 'nowrap',
});

export type PlaceholderCaretPlacement = 'tl' | 'tr' | 'bl' | 'br';

export interface PlaceholderCaretProps {
  /** User label shown in the flag. Flag is omitted when empty. */
  name?: string;
  /** Any CSS color for the caret and flag. */
  color?: string;
  /** Caret height. Defaults to `1.2em`. */
  height?: number | string;
  /** Caret thickness. Defaults to `2px`. */
  width?: number | string;
  /** Where the flag sits relative to the caret. Defaults to `tr`. */
  placement?: PlaceholderCaretPlacement;
  /** Text color inside the flag. Defaults to white. */
  labelColor?: string;
  /** Gap in pixels between flag and caret. Defaults to 0 (touching). */
  offset?: number;
  style?: React.CSSProperties;
}

const radius = 4;

export const PlaceholderCaret: React.FC<PlaceholderCaretProps> = ({
  name,
  color = '#5B8DEF',
  height = '1.2em',
  width = '2px',
  placement = 'tr',
  labelColor,
  offset = 0,
  style,
}) => {
  const top = placement === 'tl' || placement === 'tr';
  const right = placement === 'tr' || placement === 'br';

  const flagStyle: React.CSSProperties = {
    background: color,
    borderTopLeftRadius: radius,
    borderTopRightRadius: radius,
    borderBottomLeftRadius: radius,
    borderBottomRightRadius: radius,
  };
  if (top) flagStyle.bottom = `calc(100% + ${offset}px)`;
  else flagStyle.top = `calc(100% + ${offset}px)`;
  if (right) flagStyle.left = 0;
  else flagStyle.right = 0;
  if (labelColor) flagStyle.color = labelColor;
  // Square the corner that meets the caret.
  if (top && right) flagStyle.borderBottomLeftRadius = 0;
  else if (top && !right) flagStyle.borderBottomRightRadius = 0;
  else if (!top && right) flagStyle.borderTopLeftRadius = 0;
  else flagStyle.borderTopRightRadius = 0;

  return (
    <span className={rootClass} style={{height, width, ...style}}>
      <span className={caretClass} style={{background: color, width}} />
      {!!name && (
        <span className={flagClass} style={flagStyle}>
          {name}
        </span>
      )}
    </span>
  );
};
