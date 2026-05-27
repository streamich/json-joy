import * as React from 'react';
import {rule, drule} from 'nano-theme';
import {useStyles} from '../../../styles/context';

const h = React.createElement;

const className = rule(
  {
    pos: 'relative',
    d: 'flex',
    w: '32px',
    h: '32px',
    justifyContent: 'center',
    alignItems: 'center',
    userSelect: 'none',
    svg: {
      w: '32px',
      h: '32px',
      d: 'block',
    },
    '.chevron': {
      fill: 'none',
      strokeWidth: '2px',
      strokeLinecap: 'square',
      strokeLinejoin: 'miter',
      trs: 'transform .2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    },
    // Move the brackets apart along the top-right / bottom-left diagonal on hover
    // of the icon or its host button/anchor.
    '&:hover, button:hover &, a:hover &': {
      '.chevron-tr': {
        transform: 'translate(2.5px, -2.5px)',
      },
      '.chevron-bl': {
        transform: 'translate(-2.5px, 2.5px)',
      },
    },
    'button:active &, a:active &, &:active': {
      '.chevron-tr': {
        transform: 'translate(1px, -1px)',
      },
      '.chevron-bl': {
        transform: 'translate(-1px, 1px)',
      },
    },
  },
  'IconIntExpand',
);

const dynamicClassBuilder = drule({});

export interface Props extends React.HTMLAttributes<any> {
  /** Icon dimension in pixels (square). Defaults to 32. */
  size?: number;
  /** Solid stroke color override. Defaults to the themed grey. */
  color?: string;
}

export const Expand: React.FC<Props> = (props) => {
  const {className: classNameProp = '', size, color, style: styleProp, ...rest} = props;
  const styles = useStyles();
  const sizeStyle: React.CSSProperties | undefined = size ? {width: size, height: size, ...styleProp} : styleProp;
  const strokeRest = color ?? styles.g(0, 0.6);
  const strokeHover = color ?? styles.g(0);
  const dynamicClass = dynamicClassBuilder({
    '.chevron': {
      stroke: strokeRest,
    },
    '&:hover, button:hover &, a:hover &': {
      '.chevron': {
        stroke: strokeHover,
      },
    },
  });

  return h(
    'span',
    {
      ...rest,
      className: classNameProp + className + dynamicClass,
      style: sizeStyle,
    },
    h(
      'svg',
      {viewBox: '0 0 32 32', style: size ? {width: size, height: size} : undefined},
      h('path', {className: 'chevron chevron-tr', d: 'M16 9 L23 9 L23 16'}),
      h('path', {className: 'chevron chevron-bl', d: 'M9 16 L9 23 L16 23'}),
    ),
  );
};

export default Expand;
