import * as React from 'react';
import {rule, drule, keyframes} from 'nano-theme';
import {Char} from '../../constants';
import {useBrowserLayoutEffect} from '../hooks';
import {usePeritext} from '../context';

const width = .125;
const color = '#07f';
const animationTime = '1s';

const animation = keyframes({
  'from,to': {
    bg: color,
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

const innerClass = drule({
  an: `${animationTime} ${animation} step-end infinite`,
  pos: 'absolute',
  top: '-0.175em',
  left: `-${width / 2}em`,
  w: width + 'em',
  h: '1.5em',
  bg: color,
});

export interface FocusViewProps {
  left?: boolean;
}

export const FocusView: React.FC<FocusViewProps> = ({left}) => {
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
      <span
        id={dom?.selection.caretId}
        ref={ref}
        className={innerClass({
          bdrad: left ? `0 ${width * .5}em ${width * .5}em 0` : `${width * .5}em 0 0 ${width * .5}em`,
        })}
      >
        {Char.ZeroLengthSpace}
      </span>
    </span>
  );
};
