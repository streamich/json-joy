import * as React from 'react';
import {rule} from 'nano-theme';

const blockClass = rule({
  bg: '#dafbe1',
  bxsh: '0 2px 0 0 #aceebb',
  td: 'none',
});

export interface InsProps {
  children: React.ReactNode;
}

export const Ins: React.FC<InsProps> = (props) => {
  const {children} = props;

  return <ins className={blockClass}>{children}</ins>;
};
