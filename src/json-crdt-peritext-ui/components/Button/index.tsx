// biome-ignore lint: React is used for JSX
import * as React from 'react';
import {drule} from 'nano-theme';

const blockClass = drule({
  bd: 0,
  col: 'black',
  ff: 'inherit',
  fw: 500,
  lh: '1.15em',
  mr: 'none',
  pd: '.375em .625em',
  trs: 'all .15s cubic-bezier(.65,.05,.36,1)',
});

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  small?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({active, small, children, ...rest}) => {
  const className =
    (rest.className || '') +
    blockClass({
      bdrad: active ? '12px' : '6px',
      bg: active ? '#07f' : 'rgba(61, 37, 20, .08)',
      col: active ? 'white' : 'black',
      fz: small ? '11px' : '14px',
      '&:hover': {
        bg: active ? '#06e' : 'rgba(61, 37, 20, .12)',
      },
      '&:active': {
        bg: active ? '#05d' : 'rgba(61, 37, 20, .18)',
      },
    });

  return (
    <button type={'button'} {...rest} className={className}>
      {children}
    </button>
  );
};
