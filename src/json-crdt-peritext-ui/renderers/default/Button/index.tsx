import {drule} from 'nano-theme';
import * as React from 'react';

const blockClass = drule({
  bdrad: '.5rem',
  bd: 0,
  col: 'black',
  ff: 'inherit',
  fz: '.875rem',
  fw: 500,
  lh: '1.15em',
  mr: 'none',
  pd: '.375rem .625rem',
  trs: 'all .2s cubic-bezier(.65,.05,.36,1)',
  '&:hover': {
    background: 'rgba(61, 37, 20, .12)',
  },
});

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({active, children, ...rest}) => {
  const className = (rest.className || '') + blockClass({
    background: active ? 'rgba(61, 37, 20, .12)' : 'rgba(61, 37, 20, .08)',
  });

  return (
    <button type={'button'} {...rest} className={className}>
      {children}
    </button>
  );
};