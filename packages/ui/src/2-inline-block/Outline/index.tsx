import * as React from 'react';
import {drule} from 'nano-theme';
import {fonts} from '../../styles';
import {useStyles} from '../../styles/context';
import {ColorName} from '../../styles/color/types';

const blockClass = drule({
  d: 'block',
  pos: 'relative',
  bdrad: '6px',
  bxz: 'border-box',
  mr: 0,
});

const labelClass = drule({
  ...fonts.get('mono', 'mid', 2),
  w: '100%',
  d: 'inline-block',
  bxz: 'border-box',
  pd: 0,
  mr: 0,
  fz: '11.5px',
  tt: 'uppercase',
});

export interface OutlineProps extends React.HTMLAttributes<HTMLDivElement & HTMLFieldSetElement> {
  className?: string;
  label: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  center?: boolean;
  activeBorderColor?: ColorName;
  size?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export const Outline: React.FC<OutlineProps> = ({
  className = '',
  style,
  label,
  active,
  disabled,
  center,
  activeBorderColor = 'neutral',
  size,
  children,
  ...rest
}) => {
  const styles = useStyles();

  const padding = !size ? 7 : Math.max(0, (7 + size));

  return (
    <div
      {...rest}
      className={
        className +
        blockClass({
          bg: styles.g(0, 0.08),
          ta: center ? 'center' : 'left',
          bd: disabled
            ? `1px dotted ${styles.g(0.8)}`
            : active
              ? `1px solid ${styles.col.get(activeBorderColor, 10)}`
              : `1px solid transparent`,
          bxsh: active && !disabled ? `0 0 0 1px ${styles.col.get(activeBorderColor, 'border-3')}` : 'none',
          pd: `${padding}px ${padding * 2}px`,
          '& *': {
            op: disabled ? 0.5 : 1,
          },
          '&:hover': {
            bd: disabled
              ? `1px solid ${styles.g(0.8)}`
              : active
                ? `1px solid ${styles.col.get(activeBorderColor, 10)}`
                : `1px solid ${styles.col.get('neutral', 7)}`,
            bxsh: active && !disabled ? `0 0 0 2px ${styles.col.get(activeBorderColor, 10)}` : 'none',
            '& *': {
              op: 1,
            },
          },
        })
      }
      style={style}
    >
      {!!label && (
        <label
          className={labelClass({
            col: disabled ? styles.g(0.1) : active ? styles.g(0) : styles.g(0.4),
          })}
          style={{
            fontSize: (11.5 + (.5 * (size ?? 0))) + 'px',
          }}
        >
          {label || '\uFEFF'}
        </label>
      )}
      {children}
    </div>
  );
};
