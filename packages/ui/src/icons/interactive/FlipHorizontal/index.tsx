import * as React from 'react';
import {rule, useRule} from 'nano-theme';

const faceClassName = 'flip-horizontal-face';

const wrapperClass = rule({
  pos: 'relative',
  d: 'inline-flex',
  justifyContent: 'center',
  alignItems: 'center',
  pad: 0,
  mar: 0,
  bd: 0,
  bg: 'none',
  out: 0,
  appearance: 'none',
  userSelect: 'none',
  lineHeight: 0,
  perspective: '800px',
  transformStyle: 'preserve-3d',
  verticalAlign: 'middle',
  trs: 'all .2s',
  [`.${faceClassName}`]: {
    trs: 'transform var(--flip-horizontal-duration, 180ms) cubic-bezier(.22,.61,.36,1)',
  },
  '&:active': {
    transform: 'scale(.88)',
    [`.${faceClassName}`]: {
      transform: 'rotateY(180deg)',
    },
  },
  '&:focus-visible': {
    out: 0,
  },
});

const faceClass = rule({
  d: 'inline-flex',
  justifyContent: 'center',
  alignItems: 'center',
  backfaceVisibility: 'visible',
  transformStyle: 'preserve-3d',
  willChange: 'transform',
});

export interface FlipHorizontalProps extends React.HTMLAttributes<any> {
  children: React.ReactNode;
  duration?: number;
  disabled?: boolean;
}

export const FlipHorizontal: React.FC<FlipHorizontalProps> = ({
  children,
  duration = 180,
  disabled,
  className = '',
  style,
  onClick,
  ...rest
}) => {
  const dynamicClass = useRule(({g}) => ({
    cur: disabled ? 'default' : 'pointer',
    op: disabled ? 0.5 : 1,
    pointerEvents: disabled ? 'none' : undefined,
    '&:focus-visible':
      onClick && !disabled
        ? {
            bxsh: `0 0 0 2px ${g(0, 0.14)}`,
            bdrad: '6px',
          }
        : undefined,
  }));

  const Component: any = onClick ? 'button' : 'span';
  const componentStyle: React.CSSProperties = {
    ...style,
    ['--flip-horizontal-duration' as string]: `${duration}ms`,
  };

  return (
    <Component
      {...rest}
      className={className + wrapperClass + dynamicClass}
      style={componentStyle}
      onClick={disabled ? undefined : onClick}
      type={onClick ? 'button' : undefined}
      disabled={onClick ? disabled : undefined}
      aria-disabled={!onClick && disabled ? true : undefined}
    >
      <span className={faceClass + ' ' + faceClassName}>
        {children}
      </span>
    </Component>
  );
};

export default FlipHorizontal;