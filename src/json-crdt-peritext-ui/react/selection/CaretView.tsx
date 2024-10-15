import * as React from 'react';
import {rule, put, keyframes} from 'nano-theme';
import {Char} from '../../constants';
import {useBrowserLayoutEffect} from '../hooks';
import {usePeritext} from '../context';

const cursorColor = '#07f';

const focusAnimation = keyframes({
  'from,to': {
    bg: cursorColor,
    w: '.125em',
  },
  '50%': {
    bg: 'transparent',
    w: '.125em',
  },
});

const caretAnimation = keyframes({
  'from,to': {
    bg: cursorColor,
    w: '.2em',
  },
  '50%': {
    bg: 'transparent',
    w: '.2em',
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
  pos: 'absolute',
  top: '-0.25em',
  left: '-0.0625em',
  // w: '0.25em',
  h: '1.5em',
  bg: cursorColor,
  bdrad: '0.0625em',
});

export interface Props {
  /** 
   * If true, renders as selection focus, otherwise renders as collapsed
   * selection - caret.
   */
  focus?: boolean;
}

export const CaretView: React.FC<Props> = ({focus}) => {
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
      <span id={dom?.selection.caretId} ref={ref} className={innerClass} style={{animation: `.7s ${focus ? focusAnimation: caretAnimation} step-end infinite`}}>
        {Char.ZeroLengthSpace}
      </span>
    </span>
  );
};
