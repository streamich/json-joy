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
  /** Height of the fade effect in pixels. */
  height: number;
  /** Color of the fade effect. */
  color?: string;
  children: React.ReactNode;
}

export const Fade: React.FC<FadeProps> = ({height, children, color, style, ...rest}) => {
  const theme = useTheme();

  const fadeColor = color || theme.bg;

  return (
    <div {...rest} className={wrapClass} style={{height, ...style}}>
      <div className={contentClass}>{children}</div>
      <div
        className={fadeClass}
        style={{
          height,
          background: `linear-gradient(to bottom, transparent 0%, ${fadeColor} 100%)`,
        }}
      />
    </div>
  );
};
