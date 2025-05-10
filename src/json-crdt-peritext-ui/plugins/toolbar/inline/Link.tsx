// biome-ignore lint: React is used for JSX
import * as React from 'react';
import {rule} from 'nano-theme';

const col = '#05f';

const blockClass = rule({
  col,
  td: 'underline',
  textDecorationColor: col,
  textDecorationThickness: '1px',
  textDecorationStyle: 'wavy',
  textUnderlineOffset: '.25em',
  // textDecorationSkipInk: 'all',

  '&:hover': {
    col: col,
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
  layers?: number;
}

export const Link: React.FC<LinkProps> = (props) => {
  const {children, layers = 1} = props;
  const style: React.CSSProperties | undefined =
    layers < 2
      ? void 0
      : {
          textDecorationThickness: Math.max(Math.min(0.5 + layers * 0.5, 3), 1) + 'px',
        };

  return (
    <span className={blockClass} style={style}>
      {children}
    </span>
  );
};
