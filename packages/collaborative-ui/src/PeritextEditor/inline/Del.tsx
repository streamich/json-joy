import * as React from 'react';
import {rule} from 'nano-theme';

const delClass = rule({
  bg: '#ffebe9',
  bxsh: '0 2px 0 0 #ffcecb',
  col: 'red',
});

export interface DelProps {
  children: React.ReactNode;
}

export const Del: React.FC<DelProps> = (props) => {
  const {children} = props;

  return <del className={delClass}>{children}</del>;
};
