import * as React from 'react';
import {rule, useTheme} from 'nano-theme';

const wrapClass = rule({
  pos: 'relative',
  ov: 'hidden',
});

const contentClass = rule({
  pos: 'relative',
});

const fadeClass = rule({
  pos: 'absolute',
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: 'none',
});

export interface FadeProps extends React.AllHTMLAttributes<any> {
  /** Height of the fully opaque (visible) area in pixels. */
  height: number;
  /** Height of the gradient fade effect in pixels. */
  fade?: number;
  /** Color of the fade effect. */
  color?: string;
  /** If true, disables cropping and shows full content. */
  full?: boolean;
  children: React.ReactNode;
}

export const Fade: React.FC<FadeProps> = ({height, fade = 0, children, color, full, style, ...rest}) => {
  const theme = useTheme();

  const fadeColor = color || theme.bg;
  const totalHeight = full ? 'auto' : height + fade;

  return (
    <div {...rest} className={wrapClass} style={{height: totalHeight, overflow: full ? 'visible' : 'hidden', ...style}}>
      <div className={contentClass}>{children}</div>
      {!full && fade > 0 && (
        <div
          className={fadeClass}
          style={{
            height: fade,
            background: `linear-gradient(to bottom, transparent 0%, ${fadeColor} 100%)`,
          }}
        />
      )}
    </div>
  );
};
