import * as React from 'react';
import {useStyles} from '../../styles/context';

// 6×6 transparency checkerboard shown behind the color when it may have alpha.
const checkerStyle: React.CSSProperties = {
  background:
    'linear-gradient(45deg, #ccc 25%, transparent 25%), ' +
    'linear-gradient(-45deg, #ccc 25%, transparent 25%), ' +
    'linear-gradient(45deg, transparent 75%, #ccc 75%), ' +
    'linear-gradient(-45deg, transparent 75%, #ccc 75%), #fff',
  backgroundSize: '6px 6px',
  backgroundPosition: '0 0, 0 3px, 3px -3px, -3px 0',
};

export interface ColorPreviewProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** CSS color shown in the swatch. */
  color: string;
  /** Rendered box size in px — width and height, border included (border-box). @default 16 */
  size?: number;
  /** Show a transparency checkerboard behind the color (for alpha colors). */
  checkerboard?: boolean;
}

/**
 * Small non-interactive color swatch: a rounded, softly-shadowed box with a
 * near-white ring, showing `color` over an optional transparency checkerboard.
 * The shared swatch visual used by the context-menu color control (`ArgColor`)
 * and the inline `ColorValue`. Extra span props (event handlers, `style`) pass
 * through, so a caller can layer interactivity or opacity on top.
 */
export const ColorPreview: React.FC<ColorPreviewProps> = ({color, size = 16, checkerboard, style, ...rest}) => {
  const styles = useStyles();
  return (
    <span
      style={{
        position: 'relative',
        boxSizing: 'border-box',
        display: 'inline-block',
        width: size,
        height: size,
        border: `2px solid ${styles.g(0.99, 0.9)}`,
        borderRadius: 4,
        boxShadow: '0px 1px 2px rgba(0,0,0,.2)',
        overflow: 'hidden',
        flexShrink: 0,
        ...(checkerboard ? checkerStyle : null),
        ...style,
      }}
      {...rest}
    >
      <span style={{position: 'absolute', inset: 0, background: color}} />
    </span>
  );
};
