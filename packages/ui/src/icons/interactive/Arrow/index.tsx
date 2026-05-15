import * as React from 'react';
import {drule} from 'nano-theme';

const h = React.createElement;
const style = drule({
  trs: 'transform .3s',
  o: 0.7,
  path: {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2px',
    strokeLinecap: 'round',
  },
});

export interface IArrowProps extends React.SVGAttributes<SVGElement> {
  direction?: 'u' | 'r' | 'd' | 'l';
  size?: number;
}

const Arrow: React.FC<IArrowProps> = ({direction, size = 16, ...rest}) => {
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
    {
      width: size,
      height: size,
      ...rest,
      className: (rest.className ?? '') + className,
      viewBox: '0 0 32 32',
    },
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
