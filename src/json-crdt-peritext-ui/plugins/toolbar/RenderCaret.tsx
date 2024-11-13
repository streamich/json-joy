import * as React from 'react';
import {rule} from 'nano-theme';
import type {CaretViewProps} from '../../react/cursor/CaretView';

const height = 1.5;

const blockClass = rule({
  pos: 'relative',
  pe: 'none',
  us: 'none',
  w: '0px',
  h: '100%',
  bg: 'black',
  va: 'bottom',
});

const overClass = rule({
  pos: 'absolute',
  b: `${height}em`,
  l: 0,
  isolation: 'isolate',
});

export interface RenderCaretProps extends CaretViewProps {
  children: React.ReactNode;
}

export const RenderCaret: React.FC<RenderCaretProps> = ({children}) => {
  return (
    <span className={blockClass}>
      {children}
      <span className={overClass}>
        OVER
      </span>
    </span>
  );
};
