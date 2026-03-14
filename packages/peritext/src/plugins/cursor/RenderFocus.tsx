import * as React from 'react';
import {rule, drule, keyframes} from 'nano-theme';
import {CursorConstants} from './constants';
import {usePeritext} from '../../web/react';
import {useSyncStoreOpt} from '../../web/react/hooks';
import type {FocusViewProps} from '../../web/react/cursor/FocusView';

const width = 0.14;
const animationTime = '1s';

const animation = keyframes({
  'from,to': {
    bg: 'var(--caret-color)',
  },
  '50%': {
    bg: 'transparent',
  },
});

const blockClass = rule({
  pos: 'relative',
  pe: 'none',
  us: 'none',
  w: '0px',
  h: '100%',
  va: 'bottom',
});

const innerClass = drule({
  an: `${animationTime} ${animation} step-end infinite`,
  pos: 'absolute',
  bg: 'var(--caret-color)',
  w: `calc(max(${width}em, 2px))`,
  t: '-.175em',
  h: '1.45em',
  'mix-blend-mode': 'multiply',
});

export interface RenderFocusProps extends FocusViewProps {
  children: React.ReactNode;
}

export const RenderFocus: React.FC<RenderFocusProps> = ({left, italic, children}) => {
  const {dom} = usePeritext();
  const focus = useSyncStoreOpt(dom?.cursor.focus) || false;

  const style: React.CSSProperties = focus ? {} : {background: `var(--${CursorConstants.CaretColorBlurred})`, animation: 'none'};

  if (italic) {
    style.rotate = '11deg';
  }

  return (
    <span className={blockClass}>
      {children}
      <span
        className={innerClass({
          bdrad: left ? `0 ${width * 0.5}em ${width * 0.5}em 0` : `${width * 0.5}em 0 0 ${width * 0.5}em`,
        })}
        style={style}
      />
    </span>
  );
};
