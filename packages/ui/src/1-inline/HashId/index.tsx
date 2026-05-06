import * as React from 'react';
import {theme, rule, useRule} from 'nano-theme';

const blockClass = rule({
  ...theme.font.mono.mid,
  d: 'inline-flex',
  ai: 'center',
  fz: '12px',
  lh: '18px',
  letterSpacing: '0.01em',
  pd: '1px 6px',
  bdrad: '4px',
  cur: 'default',
  whiteSpace: 'nowrap',
});

const ELLIPSIS = '…';

export interface HashIdProps {
  /** Full identifier string. */
  value: string;
  /** Number of leading characters to keep. Default: 6. */
  prefix?: number;
  /** Number of trailing characters to keep. Default: 4. */
  suffix?: number;
  /** Show the full string (no truncation). */
  full?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<HTMLSpanElement>;
}

const truncate = (value: string, prefix: number, suffix: number): string => {
  if (value.length <= prefix + suffix + 1) return value;
  return value.slice(0, prefix) + ELLIPSIS + value.slice(value.length - suffix);
};

export const HashId: React.FC<HashIdProps> = ({value, prefix = 6, suffix = 4, full, className, style, onClick}) => {
  const display = full ? value : truncate(value, prefix, suffix);

  const dynamicClass = useRule((t) => ({
    bg: t.g(0, 0.05),
    col: t.g(0.25),
  }));

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: presentational hash chip; click is non-essential and screen readers expose the full value via title
    <span
      className={blockClass + dynamicClass + (className ? ` ${className}` : '')}
      style={style}
      title={value}
      data-value={value}
      onClick={onClick}
    >
      {display}
    </span>
  );
};
