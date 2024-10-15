import * as React from 'react';
import {rule, put} from 'nano-theme';
import {Char} from '../constants';
import {useBrowserLayoutEffect} from './hooks';
import {usePeritext} from './context';

const cursorColor = '#07f';

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
  animation: '.7s jj-cursor step-end infinite',
  pos: 'absolute',
  top: '-0.25em',
  left: '-0.0625em',
  w: '0.125em',
  h: '1.5em',
  bg: cursorColor,
  bdrad: '0.0625em',
});

export interface Props {}

export const CaretView: React.FC<Props> = () => {
  const {dom} = usePeritext();
  const ref = React.useRef<HTMLSpanElement>(null);
  const timer = React.useRef<unknown>();
  useBrowserLayoutEffect(() => {
    const span = ref.current;
    if (!span) return;
    clearTimeout(timer.current as any);
    timer.current = setTimeout(() => {
      const selection = window.getSelection();
      if (!selection) return;
      const range = document.createRange();
      range.setStart(span, 0);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }, 1);
    return () => {
      clearTimeout(timer.current as any);
    };
  });

  return (
    <span className={blockClass}>
      <span id={dom?.selection.caretId} ref={ref} className={innerClass}>
        {Char.ZeroLengthSpace}
      </span>
    </span>
  );
};
