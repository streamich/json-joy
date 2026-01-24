import * as React from 'react';
import {lightTheme as theme, rule} from 'nano-theme';

const buttonAttrs = (onClick?: React.MouseEventHandler): null | Partial<React.HTMLAttributes<any>> => {
  if (!onClick) return null;
  return {
    onClick,
    onKeyDown: (event) => {
      switch (event.key) {
        case 'Enter':
        case ' ':
          onClick(event as any);
          break;
      }
    },
    tabIndex: 0,
    role: 'button',
  };
};

const blockClass = rule({
  ...theme.font.ui3,
  col: theme.g(0.4),
  fz: '8.5px',
  d: 'block',
  pad: '0px 20px',
  mar: 0,
  textTransform: 'uppercase',
  lh: '2.1em',
  letterSpacing: '1px',
  ta: 'right',
  us: 'none',
});

export interface ContextTitleProps extends React.HTMLAttributes<any> {
  icon?: React.ReactNode;
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler;
}

export const ContextTitle: React.FC<ContextTitleProps> = ({icon, children, onClick, ...rest}) => {
  if (icon) {
    children = (
      <span>
        <span
          style={{
            display: 'inline-block',
            transform: 'scale(.75)',
            opacity: 0.8,
            transformOrigin: '50% 100%',
            verticalAlign: 'bottom',
            marginTop: -8,
          }}
        >
          {icon}&nbsp;
        </span>
        {children}
      </span>
    );
  }

  return (
    <h6 {...rest} className={blockClass} {...buttonAttrs(onClick)}>
      {children}
    </h6>
  );
};
