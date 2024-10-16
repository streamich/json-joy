import * as React from 'react';
import {rule, keyframes} from 'nano-theme';
import type {CaretViewProps} from '../../react/selection/CaretView';

const cursorColor = '#07f';

const animation = keyframes({
  'from,to': {
    bg: cursorColor,
  },
  '50%': {
    bg: 'transparent',
  },
});

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
  an: `.7s ${animation} step-end infinite`,
  pos: 'absolute',
  top: '-0.25em',
  left: '-0.0625em',
  w: '.2em',
  h: '1.5em',
  bg: cursorColor,
  bdrad: '0.0625em',
});

export interface RenderCaretProps extends CaretViewProps {
  children: React.ReactNode;
}

export const RenderCaret: React.FC<RenderCaretProps> = ({italic, children}) => {
  const style = italic ? {
    transform: 'rotate(11deg)',
  } : void 0;

  return (
    <span className={blockClass}>
      <span className={innerClass} style={style}>
        {children}
      </span>
    </span>
  );
};
