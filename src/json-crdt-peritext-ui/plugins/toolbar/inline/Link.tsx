// biome-ignore lint: React is used for JSX
import * as React from 'react';
import {rule} from 'nano-theme';

const blockClass = rule({
  col: 'blue',
  td: 'underline',
  textDecorationColor: 'blue',
  textDecorationThickness: '1px',
  textDecorationStyle: 'wavy',
  textUnderlineOffset: '.25em',
  // textDecorationSkipInk: 'all',

  '&:hover': {
    col: 'blue',
  },
  pd: 0,
  mr: 0,

  // Needed temporarily, to reset nano-theme styles
  bdb: 'none',
  'p &': {
    bdb: 'none',
    '&:hover': {
      bdb: 'none',
    },
  },
});

export interface LinkProps {
  children: React.ReactNode;
}

export const Link: React.FC<LinkProps> = (props) => {
  const {children} = props;

  // return <span className={blockClass}>{children}</span>;
  return <span className={blockClass}>{children}</span>;
};
