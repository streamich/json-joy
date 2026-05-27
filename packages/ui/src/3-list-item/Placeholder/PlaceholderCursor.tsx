import * as React from 'react';
import {rule} from 'nano-theme';
import {CursorIcon} from '../../icons/svg/CursorIcon';

const rootClass = rule({
  pos: 'relative',
  d: 'inline-block',
  pe: 'none',
  us: 'none',
  va: 'top',
  lh: '1',
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
  bdrad: '4px',
  ws: 'nowrap',
  bxsh: '0 1px 2px rgba(0,0,0,0.18)',
});

export interface PlaceholderCursorProps {
  /** User label shown in the flag. Flag is omitted when empty. */
  name?: string;
  /** Any CSS color for the cursor body and flag. */
  color?: string;
  /** Pointer icon width in pixels. Height scales proportionally. Defaults to 22. */
  size?: number;
  /** Text color inside the flag. Defaults to white. */
  labelColor?: string;
  /** Pixel offset of the flag from the cursor hot-spot tail `[x, y]`. */
  flagOffset?: [number, number];
  style?: React.CSSProperties;
}

export const PlaceholderCursor: React.FC<PlaceholderCursorProps> = ({
  name,
  color = '#5B8DEF',
  size = 22,
  labelColor,
  flagOffset,
  style,
}) => {
  const [dx, dy] = flagOffset ?? [size * 0.5, size * 0.7];
  const height = (size * 38) / 26;

  const flagStyle: React.CSSProperties = {
    background: color,
    left: dx,
    top: dy,
  };
  if (labelColor) flagStyle.color = labelColor;

  return (
    <span className={rootClass} style={{width: size, height, ...style}}>
      <CursorIcon width={size} color={color} />
      {!!name && (
        <span className={flagClass} style={flagStyle}>
          {name}
        </span>
      )}
    </span>
  );
};
