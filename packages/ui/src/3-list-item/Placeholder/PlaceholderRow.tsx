import * as React from 'react';
import {rule} from 'nano-theme';

const rowClass = rule({
  d: 'block',
  ws: 'nowrap',
});

export interface PlaceholderRowProps {
  /** Indent depth (multiplied by `indentSize`). Defaults to 0. */
  indent?: number;
  /** Pixels per indent unit. Defaults to 20. */
  indentSize?: number;
  /** Margin-bottom in pixels. Use to separate rows in a list/JSON tree. */
  gap?: number;
  /** Allow content to wrap (default rows do not wrap). */
  wrap?: boolean;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const PlaceholderRow: React.FC<PlaceholderRowProps> = ({
  indent = 0,
  indentSize = 20,
  gap,
  wrap,
  style,
  children,
}) => (
  <span
    className={rowClass}
    style={{
      paddingLeft: indent * indentSize,
      marginBottom: gap,
      whiteSpace: wrap ? 'normal' : undefined,
      ...style,
    }}
  >
    {children}
  </span>
);
