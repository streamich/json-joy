import * as React from 'react';
import {lightTheme, drule} from 'nano-theme';
import {useStyles} from '../../../styles/context';

const keyClass = drule({
  ...lightTheme.font.mono,
  mar: '0 .1em',
  pad: '.3em .7em',
  bdrad: '.25em',
  lh: '1em',
  fz: '.7em',
  whiteSpace: 'nowrap',
  col: '#fff',
});

interface Props {
  children?: React.ReactNode;
}

const Key: React.FC<Props> = ({children}) => {
  const styles = useStyles();
  const light = styles.light;
  const shade = light ? 0 : 1;
  const cls = keyClass({
    bg: styles.g(shade, 0.2),
    bdt: `1px solid ${styles.g(shade, 0.3)}`,
    bdb: `1px solid ${styles.g(shade, 0.0)}`,
    bdr: `1px solid ${styles.g(shade, 0.1)}`,
    boxShadow: `0 0 .125em ${styles.g(shade, 0.5)},0 .065em .19em ${styles.g(shade, 0.5)},.065em 0 .125em ${styles.g(shade, 0.2)}`,
  });

  const style: React.CSSProperties = {};

  if (!light) {
    style.boxShadow = `0 0 0 1px ${styles.g(0.1, 0.16)}`;
  }

  return (
    <kbd className={cls} style={style}>
      {children}
    </kbd>
  );
};

export default Key;
