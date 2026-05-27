import {rule, lightTheme as theme} from 'nano-theme';
import * as React from 'react';
import {useStyles} from '../../styles/context';

const footerClass = rule({
  d: 'flex',
  ai: 'center',
  jc: 'flex-end',
  gap: theme.space(-1) + 'px',
  bxz: 'border-box',
  minH: '52px',
  pad: `${theme.space(-1)}px ${theme.space(1)}px`,
});

export interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Draw a divider line above the footer. */
  divider?: boolean;
  children?: React.ReactNode;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({divider, children, className, style, ...rest}) => {
  const styles = useStyles();

  return (
    <div
      {...rest}
      className={footerClass + (className ? ' ' + className : '')}
      style={{
        background: styles.bg + '',
        borderTop: divider ? `1px solid ${styles.g(0, 0.08)}` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
