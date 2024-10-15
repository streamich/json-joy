import * as React from 'react';
import {rule} from 'nano-theme';
import {Char} from '../../constants';

const cursorColor = '#07f';

const blockClass = rule({
  pos: 'relative',
  d: 'inline-block',
  pe: 'none',
  us: 'none',
  w: '0px',
  h: '100%',
  bg: 'black',
  va: 'top',
});

const innerClass = rule({
  pos: 'absolute',
  left: '-0.25em',
  top: '.85em',
  w: '0.5em',
  h: '0.5em',
  bdrad: '50%',
  bg: cursorColor,
});

export interface AnchorViewProps {}

export const AnchorView: React.FC<AnchorViewProps> = () => {
  return (
    <span className={blockClass}>
      <span className={innerClass}>
        {Char.ZeroLengthSpace}
      </span>
    </span>
  );
};
