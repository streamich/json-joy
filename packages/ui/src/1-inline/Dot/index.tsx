import * as React from 'react';
import {theme, rule, useRule} from 'nano-theme';

const blockClass = rule({
  d: 'inline-block',
  bdrad: '50%',
  flex: '0 0 auto',
});

export type DotColor = 'neutral' | 'positive' | 'negative' | 'warning' | 'blue' | 'accent' | string;

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
  color === 'positive' ||
  color === 'negative' ||
  color === 'warning' ||
  color === 'blue' ||
  color === 'accent';

const resolveColor = (color: DotColor): string => {
  if (isSemantic(color)) {
    if (color === 'neutral') return theme.g(0.5);
    return theme.color.sem[color][0];
  }
  return color;
};

export const Dot: React.FC<DotProps> = ({color = 'neutral', size = 8, glow, className, style}) => {
  const resolved = resolveColor(color);
  const dynamicClass = useRule(() => ({
    bg: resolved,
    bxsh: glow ? `0 0 0 3px ${resolved}33` : undefined,
  }));

  return (
    <span
      className={blockClass + dynamicClass + (className ? ` ${className}` : '')}
      style={{width: size, height: size, ...style}}
    />
  );
};
