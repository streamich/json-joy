import * as React from 'react';
import {drule} from 'nano-theme';
import {fonts} from '../../styles';
import {useStyles} from '../../styles/context';

const keyClass = drule({
  ...fonts.get('mono'),
  bdrad: '4px',
  pd: '0 3px',
  fz: '12.1px',
  lh: '1.2em',
  bxz: 'border-box',
  pe: 'none',
});

const keySmallClass = drule({
  bdrad: '2px',
  lh: '1.1em',
  fz: '10px',
  bxsh: '0 1px 0 0 rgba(0,0,0,0.1)',
});

export interface KeyLiteProps extends React.AllHTMLAttributes<any> {
  small?: boolean;
  children: React.ReactNode;
}

export const KeyLite: React.FC<KeyLiteProps> = ({small, ...props}) => {
  const styles = useStyles();
  const light = styles.light;

  const style: React.CSSProperties = {
    ...props.style,
  };

  if (!light) {
    style.boxShadow = `0 0 0 1px ${styles.g(0.1, 0.16)}`;
  }

  return (
    <kbd
      {...props}
      className={
        keyClass({
          bd: '1px solid ' + styles.g(0.8, 0.4),
          bg: styles.col.g('bg-1'),
          col: styles.g(0.2),
        }) + (small ? ' ' + keySmallClass() : '') + (props.className ? ' ' + props.className : '')
      }
      style={style}
    />
  );
};
