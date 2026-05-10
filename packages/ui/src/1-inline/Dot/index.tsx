import * as React from 'react';
import {drule} from 'nano-theme';
import {useStyles} from '../../styles/context';
import type {Styles} from '../../styles/Styles';

const blockClass = drule({
  d: 'inline-block',
  bdrad: '50%',
  flex: '0 0 auto',
});

export type DotColor = 'neutral' | 'success' | 'error' | 'warning' | 'link' | 'accent' | string;

export interface DotProps {
  /** Color: a semantic key from the theme or any raw CSS color string. */
  color?: DotColor;
  /** Diameter in pixels. */
  size?: number;
  /** Render an outer halo for emphasis. */
  glow?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const isSemantic = (color: string): color is Exclude<DotColor, string> =>
  color === 'neutral' ||
  color === 'success' ||
  color === 'error' ||
  color === 'warning' ||
  color === 'link' ||
  color === 'accent';

const resolveColor = (styles: Styles, color: DotColor): string => {
  if (isSemantic(color)) {
    if (color === 'neutral') return styles.g(0.5);
    return styles.col.get(color, 'solid-1');
  }
  return color;
};

export const Dot: React.FC<DotProps> = ({color = 'neutral', size = 8, glow, className, style}) => {
  const styles = useStyles();
  const resolved = resolveColor(styles, color);

  return (
    <span
      className={
        blockClass({
          bg: resolved,
          bxsh: glow ? `0 0 0 3px ${resolved}33` : undefined,
        }) + (className ? ` ${className}` : '')
      }
      style={{width: size, height: size, ...style}}
    />
  );
};
