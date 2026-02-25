import * as React from 'react';
import {rule} from 'nano-theme';

const blockClass = rule({
  bg: '#222',
  col: 'transparent',
  bdrad: 'calc(min(2px, 0.15em))',
  '&:hover': {
    col: 'inherit',
    bg: 'rgba(0,0,0,.16)',
  },
});

export interface SpoilerProps {
  children: React.ReactNode;
}

export const Spoiler: React.FC<SpoilerProps> = (props) => {
  const {children} = props;

  return <span className={blockClass}>{children}</span>;
};
