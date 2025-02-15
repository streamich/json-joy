// biome-ignore lint: React is used for JSX
import * as React from 'react';
import {rule} from 'nano-theme';

const blockClass = rule({
  bg: '#222',
  col: 'transparent',
  bdrad: '2px',
  '&:hover': {
    bg: '#222',
    col: 'rgba(255, 255, 255, 0.2)',
  },
});

export interface SpoilerProps {
  children: React.ReactNode;
}

export const Spoiler: React.FC<SpoilerProps> = (props) => {
  const {children} = props;

  return <span className={blockClass}>{children}</span>;
};
