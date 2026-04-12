import * as React from 'react';
import {drule, useTheme} from 'nano-theme';
import {NiceUiSizes} from '../../../constants';

const headerClass = drule({
  d: 'flex',
  h: NiceUiSizes.NavHeight + 'px',
  ai: 'center',
  flexShrink: 0,
  bxz: 'border-box',
  pd: '0 8px',
});

export interface AppGridFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const AppGridFooter: React.FC<AppGridFooterProps> = ({children, className = '', ...rest}) => {
  const theme = useTheme();

  return (
    <div
      {...rest}
      className={
        className +
        headerClass({
          bdt: `1px solid ${theme.g(0, 0.08)}`,
        })
      }
    >
      {children}
    </div>
  );
};
