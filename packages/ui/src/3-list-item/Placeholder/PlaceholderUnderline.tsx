import * as React from 'react';
import {rule} from 'nano-theme';

const underlineClass = rule({
  pb: '3px',
  bdb: '2px solid',
  'box-decoration-break': 'clone',
  '-webkit-box-decoration-break': 'clone',
});

export type PlaceholderUnderlineStyle = 'solid' | 'dashed' | 'dotted' | 'wavy';

export interface PlaceholderUnderlineProps {
  /** Underline color. Defaults to current text color. */
  color?: string;
  /** Underline thickness in pixels. Defaults to 2. */
  thickness?: number;
  /** Line style. Defaults to `solid`. `wavy` falls back to solid for the border. */
  variant?: PlaceholderUnderlineStyle;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const PlaceholderUnderline: React.FC<PlaceholderUnderlineProps> = ({
  color,
  thickness = 2,
  variant = 'solid',
  style,
  children,
}) => {
  const cssStyle = variant === 'wavy' ? 'solid' : variant;
  return (
    <span
      className={underlineClass}
      style={{
        borderBottomWidth: `${thickness}px`,
        borderBottomStyle: cssStyle,
        borderBottomColor: color ?? 'currentColor',
        ...style,
      }}
    >
      {children}
    </span>
  );
};
