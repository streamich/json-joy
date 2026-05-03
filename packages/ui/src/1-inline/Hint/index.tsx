import * as React from 'react';
import {drule} from 'nano-theme';
import {useStyles} from '../../styles/context';

const hintClass = drule({
  d: 'inline-flex',
  ai: 'center',
  gap: '6px',
  bdrad: '4px',
  pd: '2px 7px',
  fz: '12.5px',
  lh: '1.4em',
  bxz: 'border-box',
  whiteSpace: 'nowrap',
  userSelect: 'none',
});

export interface HintProps extends React.AllHTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
}

export const Hint: React.FC<HintProps> = (props) => {
  const styles = useStyles();
  return (
    <span
      {...props}
      className={
        hintClass({
          bd: '1px solid ' + styles.g(0.88, 0.28),
          bg: styles.light ? styles.g(0.99, 0.6) : styles.col.g('bg-1'),
          col: styles.g(0.35, 0.7),
        }) + (props.className || '')
      }
    />
  );
};
