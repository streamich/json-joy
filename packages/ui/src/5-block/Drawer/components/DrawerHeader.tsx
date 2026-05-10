import * as React from 'react';
import {drule} from 'nano-theme';
import {useStyles} from '../../../styles/context';

const headerClass = drule({
  d: 'flex',
  ai: 'center',
  flexShrink: 0,
  bxz: 'border-box',
  pd: '16px',
});

export interface DrawerHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DrawerHeader: React.FC<DrawerHeaderProps> = ({children, className = '', ...rest}) => {
  const styles = useStyles();

  return (
    <div
      {...rest}
      className={
        className +
        headerClass({
          bdb: `1px solid ${styles.g(0, 0.08)}`,
        })
      }
    >
      {children}
    </div>
  );
};
