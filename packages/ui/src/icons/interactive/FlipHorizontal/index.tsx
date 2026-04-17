import * as React from 'react';
import {rule} from 'nano-theme';

const blockClass = rule({
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
  trs: 'transform .3s',
  'button:active &, a:active &': {
    transform: 'rotateY(180deg)',
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
  duration = 280,
  disabled,
  className = '',
  style,
  onClick,
  ...rest
}) => {
  const Component: any = onClick ? 'button' : 'span';

  return (
    <Component
      {...rest}
      className={className + blockClass}
      style={style}
      onClick={disabled ? undefined : onClick}
      type={onClick ? 'button' : undefined}
      disabled={onClick ? disabled : undefined}
      aria-disabled={!onClick && disabled ? true : undefined}
    >
      <span className={faceClass}>
        {children}
      </span>
    </Component>
  );
};

export default FlipHorizontal;