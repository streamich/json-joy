import * as React from 'react';
import {keyframes, rule, useRule} from 'nano-theme';

const h = React.createElement;

const waveAnimation = keyframes({
  from: {
    transform: 'translateY(0px)',
  },
  '35%': {
    transform: 'translateY(-2.5px)',
  },
  '70%': {
    transform: 'translateY(1px)',
  },
  to: {
    transform: 'translateY(0px)',
  },
});

const className = rule(
  {
    pos: 'relative',
    d: 'flex',
    w: '32px',
    h: '32px',
    bdrad: '3px',
    cur: 'pointer',
    trs: 'all .2s',
    justifyContent: 'center',
    alignItems: 'center',
    userSelect: 'none',
    svg: {
      w: '32px',
      h: '32px',
      trs: 'transform .2s',
    },
    '&:hover': {
      bdrad: '0px',
    },
    '&:active': {
      svg: {
        transform: 'scale(.78)',
      },
    },
    '.dot-wave': {
      transformOrigin: '50% 50%',
    },
    '.dot-scale': {
      trs: 'transform .14s ease, fill .15s',
      transformOrigin: '50% 50%',
      transformBox: 'fill-box',
    },
  },
  'IconIntMore',
);

export interface Props extends React.HTMLAttributes<any> {}

export const More: React.FC<Props> = (props) => {
  const {className: classNameProp = '', onMouseEnter, onMouseLeave, onClick, ...rest} = props;
  const [hovered, setHovered] = React.useState(false);
  const [waving, setWaving] = React.useState(false);
  const animationFrameRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const triggerWave = React.useCallback(() => {
    setWaving(false);

    if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);

    animationFrameRef.current = requestAnimationFrame(() => {
      animationFrameRef.current = null;
      setWaving(true);
    });
  }, []);

  const dynamicClass = useRule(({g}) => ({
    '.dot': {
      fill: g(0, 0.6),
    },
    '.dot-wave': {
      animation: waving ? `${waveAnimation} 360ms ease-in-out 1` : 'none',
    },
    '.dot-2': {
      animationDelay: waving ? '70ms' : undefined,
    },
    '.dot-3': {
      animationDelay: waving ? '140ms' : undefined,
    },
    '.dot-scale': {
      transform: hovered ? 'scale(1.25)' : 'scale(1)',
    },
    '&:hover': {
      '.dot': {
        fill: g(0, 0.72),
      },
    },
    '&:active': {
      '.dot': {
        fill: g(0, 0.78),
      },
    },
  }));

  const handleMouseEnter = React.useCallback(
    (event: React.MouseEvent<any>) => {
      setHovered(true);
      triggerWave();
      onMouseEnter?.(event);
    },
    [onMouseEnter, triggerWave],
  );

  const handleMouseLeave = React.useCallback(
    (event: React.MouseEvent<any>) => {
      setHovered(false);
      onMouseLeave?.(event);
    },
    [onMouseLeave],
  );

  const handleClick = React.useCallback(
    (event: React.MouseEvent<any>) => {
      triggerWave();
      onClick?.(event);
    },
    [onClick, triggerWave],
  );

  return h(
    'span',
    {
      ...rest,
      className: classNameProp + className + dynamicClass,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onClick: handleClick,
    },
    h(
      'svg',
      {viewBox: '0 0 32 32'},
      h(
        'g',
        {className: 'dot-wave dot-1'},
        h('g', {className: 'dot-scale'}, h('circle', {className: 'dot', cx: '10', cy: '16', r: '1.6'})),
      ),
      h(
        'g',
        {className: 'dot-wave dot-2'},
        h('g', {className: 'dot-scale'}, h('circle', {className: 'dot', cx: '16', cy: '16', r: '1.6'})),
      ),
      h(
        'g',
        {
          className: 'dot-wave dot-3',
          onAnimationEnd: () => setWaving(false),
        },
        h('g', {className: 'dot-scale'}, h('circle', {className: 'dot', cx: '22', cy: '16', r: '1.6'})),
      ),
    ),
  );
};

export default More;
