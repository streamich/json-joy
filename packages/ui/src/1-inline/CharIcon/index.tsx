import * as React from 'react';
import {drule} from 'nano-theme';
import {useStyles} from '../../styles/context';

const blockClass = drule({
  textAlign: 'center',
  verticalAlign: 'middle',
  bdrad: '15%',
});

export interface CharIconProps {
  size?: number;
  children?: React.ReactNode;
}

export const CharIcon: React.FC<CharIconProps> = ({size = 16, children}) => {
  const styles = useStyles();

  const style: React.CSSProperties = {
    background: styles.col.g(2, {A: 50}),
    width: size,
    height: size,
    fontSize: 0.9 * size,
    lineHeight: `${size}px`,
  };

  return (
    <span className={blockClass({...styles.txt.get('mono', 'bold', 1)})} style={style}>
      {children}
    </span>
  );
};
