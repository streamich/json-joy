import * as React from 'react';
import {rule, drule} from 'nano-theme';
import {useStyles} from '../../styles/context';

const blockClass = rule({
  d: 'block',
  bxz: 'border-box',
  bdrad: '4px',
});

const defaultClass = drule({
  bg: 'var(--colBgHover)',
});

const buttonClass = drule({
  op: 0.45,
});

const LINE_RATIOS = [0.8, 0.65, 0.5, 0.72, 0.58];

export type PlaceholderVariant = 'text' | 'button' | 'paragraph' | 'image' | 'card' | 'block' | 'avatar';

const DEFAULTS: Record<PlaceholderVariant, {width: string; height: string; bdrad?: string}> = {
  text: {width: '60%', height: '12px', bdrad: '3px'},
  button: {width: '40%', height: '36px', bdrad: '18px'},
  paragraph: {width: '100%', height: 'auto'},
  image: {width: '100%', height: '200px', bdrad: '6px'},
  card: {width: '100%', height: '300px', bdrad: '8px'},
  block: {width: '100%', height: '48px'},
  avatar: {width: '32px', height: '32px', bdrad: '50%'},
};

export interface PlaceholderProps {
  variant?: PlaceholderVariant;
  width?: number | string;
  height?: number | string;
  /** Number of lines for `paragraph` variant. Defaults to 3. */
  lines?: number;
  style?: React.CSSProperties;
}

export const Placeholder: React.FC<PlaceholderProps> = ({variant = 'block', width, height, lines = 3, style}) => {
  const styles = useStyles();
  // const defaultCls = defaultClass({bg: styles.g(0, styles.light ? 0.09 : 0.14)});
  const defaultCls = defaultClass({});
  const buttonCls = buttonClass({bg: styles.col.get('link', 'solid-1')});
  const def = DEFAULTS[variant];

  if (variant === 'paragraph') {
    return (
      <span style={{display: 'block', ...(style || {})}}>
        {Array.from({length: lines}, (_, i) => (
          <span
            key={i}
            className={`${blockClass} ${defaultCls}`}
            style={{
              display: 'block',
              width: `${LINE_RATIOS[i % LINE_RATIOS.length] * 100}%`,
              height: '12px',
              marginBottom: i < lines - 1 ? '6px' : 0,
            }}
          />
        ))}
      </span>
    );
  }

  return (
    <span
      className={`${blockClass} ${variant === 'button' ? buttonCls : defaultCls}`}
      style={{
        width: width ?? def.width,
        height: height ?? def.height,
        borderRadius: def.bdrad,
        ...style,
      }}
    />
  );
};
