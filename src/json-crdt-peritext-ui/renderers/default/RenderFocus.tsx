import * as React from 'react';
import {rule, drule, keyframes} from 'nano-theme';

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
  top: '-0.15em',
  left: `-${width / 2}em`,
  w: width + 'em',
  h: '1.45em',
  bg: color,
  'mix-blend-mode': 'multiply',
});

export interface RenderFocusProps {
  left?: boolean;
  children: React.ReactNode;
}

export const RenderFocus: React.FC<RenderFocusProps> = ({left, children}) => {
  return (
    <span className={blockClass}>
      <span
        className={innerClass({
          bdrad: left ? `0 ${width * .5}em ${width * .5}em 0` : `${width * .5}em 0 0 ${width * .5}em`,
        })}
      >
        {children}
      </span>
    </span>
  );
};
