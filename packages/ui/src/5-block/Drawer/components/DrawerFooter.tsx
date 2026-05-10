import * as React from 'react';
import {rule, drule} from 'nano-theme';
import {useStyles} from '../../../styles/context';

const footerClass = rule({
  d: 'flex',
  ai: 'center',
  flexShrink: 0,
  bxz: 'border-box',
  pad: '12px 16px 14px',
});

const footerThemeClass = drule({});

export interface DrawerFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DrawerFooter: React.FC<DrawerFooterProps> = ({children, className, ...rest}) => {
  const styles = useStyles();
  const dynamicClass = footerThemeClass({
    bdt: `1px solid ${styles.light ? 'rgba(15,23,42,.08)' : 'rgba(255,255,255,.08)'}`,
  });
  return (
    <div {...rest} className={footerClass + dynamicClass + (className ? ' ' + className : '')}>
      {children}
    </div>
  );
};
