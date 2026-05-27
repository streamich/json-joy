import * as React from 'react';
import {rule} from 'nano-theme';
import {useStyles} from '../../styles/context';

const wordClass = rule({
  d: 'inline-block',
  bxz: 'border-box',
  bdrad: '3px',
  va: 'middle',
});

export type PlaceholderWordVariant = 'default' | 'string' | 'number' | 'boolean' | 'null' | 'key' | 'bold';

const VARIANT_COLORS: Record<Exclude<PlaceholderWordVariant, 'default'>, string> = {
  string: '#5FCC8A',
  number: '#58B9F8',
  boolean: '#F6A832',
  null: '#9CA3AF',
  key: '#985DF7',
  bold: '#000',
};

export interface PlaceholderWordProps {
  /** Word width. Defaults to `60`. */
  width?: number | string;
  /** Word height. Defaults to `12`. */
  height?: number | string;
  /** Background color. Overrides `variant`. */
  color?: string;
  /** Color preset. Useful for typed JSON values / rich-text emphasis. */
  variant?: PlaceholderWordVariant;
  /** Italic skew (about -10deg). */
  italic?: boolean;
  /** Background opacity 0..1. */
  opacity?: number;
  style?: React.CSSProperties;
}

export const PlaceholderWord: React.FC<PlaceholderWordProps> = ({
  width = 60,
  height = 12,
  color,
  variant = 'default',
  italic,
  opacity,
  style,
}) => {
  const styles = useStyles();
  const defaultBg = styles.g(0, styles.light ? 0.09 : 0.14);
  const bg = color ?? (variant !== 'default' ? VARIANT_COLORS[variant] : defaultBg);
  return (
    <span
      className={wordClass}
      style={{
        background: bg,
        width,
        height,
        opacity,
        transform: italic ? 'skewX(-10deg)' : undefined,
        ...style,
      }}
    />
  );
};
