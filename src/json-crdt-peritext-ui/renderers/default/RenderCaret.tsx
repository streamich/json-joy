import * as React from 'react';
import useHarmonicIntervalFn from 'react-use/lib/useHarmonicIntervalFn';
import {rule} from 'nano-theme';
import type {CaretViewProps} from '../../react/selection/CaretView';

const color = '#07f';
const ms = 350;

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
  top: '-0.25em',
  left: '-0.0625em',
  w: '.2em',
  h: '1.5em',
  bg: color,
  bdrad: '0.0625em',
  'mix-blend-mode': 'multiply',
});

export interface RenderCaretProps extends CaretViewProps {
  children: React.ReactNode;
}

export const RenderCaret: React.FC<RenderCaretProps> = ({italic, children}) => {
  const [show, setShow] = React.useState(true);
  useHarmonicIntervalFn(() => setShow(Date.now() % (ms + ms) > ms), ms);

  const style: React.CSSProperties = {
    background: show ? color : 'transparent',
  };

  if (italic) {
    style.transform = 'rotate(11deg)';
  }

  return (
    <span className={blockClass}>
      <span className={innerClass} style={style}>
        {children}
      </span>
    </span>
  );
};