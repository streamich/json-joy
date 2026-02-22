import * as React from 'react';
import {drule} from 'nano-theme';
import {fonts} from '../../styles';
import {useStyles} from '../../styles/context';

const blockClass = drule({
  d: 'block',
  pos: 'relative',
  bdrad: '6px',
  bxz: 'border-box',
  mr: 0,
});

const legendClass = drule({
  ...fonts.get('ui', 'mid', 2),
  pad: '0 5px',
  fz: '12px',
});

export interface NotchedOutlineProps extends React.HTMLAttributes<HTMLDivElement & HTMLFieldSetElement> {
  className?: string;
  label: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export const NotchedOutline: React.FC<NotchedOutlineProps> = ({
  className = '',
  style,
  label,
  active,
  disabled,
  children,
  ...rest
}) => {
  const styles = useStyles();

  const Comp = label ? 'fieldset' : 'div';

  return (
    <Comp
      {...rest}
      className={
        className +
        blockClass({
          bd: disabled
            ? `1px dotted ${styles.g(0.8)}`
            : active
              ? `1px solid ${styles.col.get('success', 'border-1')}`
              : `1px solid ${styles.col.get('neutral', 'border-1')}`,
          bxsh: active && !disabled ? `0 0 0 1px ${styles.col.get('success', 'border-3')}` : 'none',
          pd: !label ? '5px 8px' : '0 8px 6px',
          '& *': {
            op: disabled ? 0.5 : 1,
          },
          '&:hover': {
            bd: disabled
              ? `1px solid ${styles.g(0.8)}`
              : active
                ? `1px solid ${styles.col.get('success', 'border-2')}`
                : `1px solid ${styles.col.get('neutral', 'border-2')}`,
            bxsh: active && !disabled ? `0 0 0 2px ${styles.col.get('success', 'border-2')}` : 'none',
            '& *': {
              op: 1,
            },
          },
        })
      }
      style={style}
    >
      {!!label && (
        <legend
          className={legendClass({
            bg: active ? styles.col.map('bg') : 'transparent',
            col: disabled ? styles.g(0.6) : active ? styles.g(0.3) : styles.g(0.5),
            'fieldset:hover &': {
              col: disabled ? styles.g(0.6) : active ? styles.g(0.1) : styles.g(0.5),
            },
          })}
          style={{
            padding: label ? undefined : 0,
          }}
        >
          {label || '\uFEFF'}
        </legend>
      )}
      {children}
    </Comp>
  );
};
