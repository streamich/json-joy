import * as React from 'react';
import {rule, lightTheme as theme} from 'nano-theme';

const defaultSize = 32;

const blockClass = rule({
  pos: 'relative',
  w: defaultSize + 'px',
  h: defaultSize + 'px',
  trs: 'transform .1s',
  cur: 'pointer',
  '&:active': {
    transform: 'scale(.8)',
  },
});

const tileSize = 38;

const tileClass = rule({
  pos: 'absolute',
  bgc: theme.g(0.2),
  w: tileSize + '%',
  h: tileSize + '%',
  bdrad: '15%',
  top: '50%',
  left: '50%',
  mar: `-${tileSize / 2}% 0 0 -${tileSize / 2}%`,
  trs: 'background-color .15s,top .15s cubic-bezier(0.175, 0.885, 0.32, 1.275), left .15s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  // op: .4,
  [`.${blockClass.trim()}:hover &`]: {
    bgc: theme.g(0.4),
    // op: 1,
  },
});

const tile1Class = rule({
  [`.${blockClass.trim()}:hover &`]: {
    // bgc: theme.color2[1],
    top: '25%',
    left: '25%',
  },
});

const tile2Class = rule({
  [`.${blockClass.trim()}:hover &`]: {
    // bgc: theme.color3[1],
    top: '25%',
    left: '75%',
  },
});

const tile3Class = rule({
  [`.${blockClass.trim()}:hover &`]: {
    // bgc: theme.color4[1],
    top: '75%',
    left: '25%',
  },
});

const tile4Class = rule({
  [`.${blockClass.trim()}:hover &`]: {
    // bgc: theme.color6[1],
    top: '75%',
    left: '75%',
  },
});

export interface Props extends React.HTMLAttributes<any> {
  size?: number;
}

export const Tiles: React.FC<Props> = ({size, ...rest}) => {
  let style: React.CSSProperties = {};

  if (size && size !== defaultSize) {
    style = {
      width: size,
      height: size,
    };
  }

  return (
    <div {...rest} className={rest.className + blockClass} style={style}>
      <div className={tileClass + tile1Class} />
      <div className={tileClass + tile2Class} />
      <div className={tileClass + tile3Class} />
      <div className={tileClass + tile4Class} />
    </div>
  );
};
