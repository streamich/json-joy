import * as React from 'react';
import {rule} from 'nano-theme';
import {useStyles} from '../../styles/context';

const blockquoteClass = rule({
  d: 'block',
  pd: '4px 0 4px 16px',
  bdl: '4px solid',
});

export interface PlaceholderBlockquoteProps {
  /** Left-bar color. Defaults to the theme muted color. */
  color?: string;
  /** Bar width in pixels. Defaults to 4. */
  thickness?: number;
  /** Indent from the bar in pixels. Defaults to 16. */
  indent?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const PlaceholderBlockquote: React.FC<PlaceholderBlockquoteProps> = ({
  color,
  thickness = 4,
  indent = 16,
  style,
  children,
}) => {
  const styles = useStyles();
  const bar = color ?? styles.g(0, 0.35);
  return (
    <span
      className={blockquoteClass}
      style={{
        borderLeftWidth: `${thickness}px`,
        borderLeftStyle: 'solid',
        borderLeftColor: bar,
        paddingLeft: `${indent}px`,
        ...style,
      }}
    >
      {children}
    </span>
  );
};
