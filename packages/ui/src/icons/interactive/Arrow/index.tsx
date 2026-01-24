import * as React from 'react';
import {drule, lightTheme as theme} from 'nano-theme';

const h = React.createElement;
const style = drule({
  trs: 'transform .3s',
  path: {
    fill: 'none',
    stroke: theme.g(0.4),
    strokeWidth: '2px',
    strokeLinecap: 'round',
  },
});

export interface IArrowProps extends React.SVGAttributes<SVGElement> {
  direction?: 'u' | 'r' | 'd' | 'l';
}

const Arrow: React.FC<IArrowProps> = ({direction, ...rest}) => {
  const css: any = {};

  if (direction !== 'u') {
    let deg = 90;

    switch (direction) {
      case 'd':
        deg = 180;
        break;
      case 'l':
        deg = 270;
        break;
    }

    css.transform = `rotate(${deg}deg)`;
  }

  const className = style(css);

  return h(
    'svg',
    {...rest, className: (rest.className ?? '') + className, viewBox: '0 0 32 32'},
    h(
      'path',
      {d: 'M10 18 L16 12 L22 18'},
      h('animate', {
        attributeName: 'd',
        dur: '300ms',
      }),
    ),
  );
};

export default Arrow;
