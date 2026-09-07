import {drule} from 'nano-theme';
import * as React from 'react';
import {fonts} from '../../styles';
import type {ColorName} from '../../styles/color/types';
import {useStyles} from '../../styles/context';

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
  label?: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  /** Paint the outline (and label) in the error color, e.g. a failed validation. */
  invalid?: boolean;
  center?: boolean;
  ghost?: boolean | 'hint';
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
  invalid,
  center,
  ghost,
  activeBorderColor = 'neutral',
  size,
  children,
  ...rest
}) => {
  const styles = useStyles();

  const padding = !size ? 7 : Math.max(0, 7 + size);

  const borderCol = invalid && !disabled ? 'error' : activeBorderColor;
  // Error borders use the bright solid step (8), not the dark text step (10).
  const borderStep = invalid && !disabled ? 8 : 10;
  const invalidBd = `1px solid ${styles.col.get('error', 8)}`;
  const ghostIdleBg = ghost === 'hint' ? styles.g(0, 0.02) : 'transparent';
  const ghostHoverBg = ghost === 'hint' ? styles.g(0, 0.05) : styles.g(0, 0.04);
  const blockStyle = ghost
    ? {
        bg: active && !disabled ? styles.g(0, 0.06) : ghostIdleBg,
        ta: center ? ('center' as const) : ('start' as const),
        bd:
          active && !disabled
            ? `1px solid ${styles.col.get(borderCol, borderStep)}`
            : invalid && !disabled
              ? invalidBd
              : '1px solid transparent',
        bxsh: active && !disabled ? `0 0 0 1px ${styles.col.get(borderCol, 'border-3')}` : 'none',
        pd: `${padding}px ${padding * 2}px`,
        '& *': {
          op: disabled ? 0.5 : 1,
        },
        '&:hover': {
          bg: disabled ? ghostIdleBg : active ? styles.g(0, 0.06) : ghostHoverBg,
          bd:
            active && !disabled
              ? `1px solid ${styles.col.get(borderCol, borderStep)}`
              : invalid && !disabled
                ? invalidBd
                : '1px solid transparent',
          bxsh: active && !disabled ? `0 0 0 2px ${styles.col.get(borderCol, borderStep)}` : 'none',
          '& *': {
            op: 1,
          },
        },
      }
    : {
        bg: styles.g(0, 0.08),
        ta: center ? ('center' as const) : ('start' as const),
        bd: disabled
          ? `1px dotted ${styles.g(0.8)}`
          : active
            ? `1px solid ${styles.col.get(borderCol, borderStep)}`
            : invalid
              ? invalidBd
              : `1px solid transparent`,
        bxsh: active && !disabled ? `0 0 0 1px ${styles.col.get(borderCol, 'border-3')}` : 'none',
        pd: `${padding}px ${padding * 2}px`,
        '& *': {
          op: disabled ? 0.5 : 1,
        },
        '&:hover': {
          bd: disabled
            ? `1px solid ${styles.g(0.8)}`
            : active
              ? `1px solid ${styles.col.get(borderCol, borderStep)}`
              : invalid
                ? invalidBd
                : `1px solid ${styles.col.get('neutral', 7)}`,
          bxsh: active && !disabled ? `0 0 0 2px ${styles.col.get(borderCol, borderStep)}` : 'none',
          '& *': {
            op: 1,
          },
        },
      };

  return (
    <div {...rest} className={className + blockClass(blockStyle)} style={style}>
      {!!label && (
        // biome-ignore lint/a11y/noLabelWithoutControl: label is used as visual decoration
        <label
          className={labelClass({
            col: disabled ? styles.g(0.1) : invalid ? styles.col.get('error', 9) : active ? styles.g(0) : styles.g(0.4),
          })}
          style={{
            fontSize: 11.5 + 0.5 * (size ?? 0) + 'px',
          }}
        >
          {label || '\uFEFF'}
        </label>
      )}
      {children}
    </div>
  );
};
