import * as React from 'react';
import {rule, put} from 'nano-theme';
import {Char} from '../../constants';

// const cursorColor = '#07f';
const cursorColor = 'red';

put('', {
  '@keyframes jj-cursor': {
    'from,to': {
      bg: cursorColor,
    },
    '50%': {
      bg: 'transparent',
    },
  },
});

const blockClass = rule({
  d: 'inline-block',
  pointerEvents: 'none',
  pos: 'relative',
  w: '0px',
  h: '100%',
  bg: 'black',
  verticalAlign: 'top',
});

export interface AnchorViewProps {}

export const AnchorView: React.FC<AnchorViewProps> = () => {
  return (
    <span className={blockClass}>
      {Char.ZeroLengthSpace}
    </span>
  );
};
