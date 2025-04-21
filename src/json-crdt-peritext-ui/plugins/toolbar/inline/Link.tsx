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

// RESET THIS
// a: {
//   col: lightTheme.color.sem.link[0],
//   td: 'none',
//   '&:hover': {
//     col: lightTheme.color.sem.brand[0],
//   },
//   'p &': {
//     bdb: '1px solid rgba(0,137,255,.3)',
//     '&:hover': {
//       bdb: '1px solid rgba(244,18,36,.3)',
//     },
//   },
// },

export interface LinkProps {
  children: React.ReactNode;
}

export const Link: React.FC<LinkProps> = (props) => {
  const {children} = props;

  // return <span className={blockClass}>{children}</span>;
  return <a className={blockClass}>{children}</a>;
};
