import * as React from 'react';
import {drule, useTheme} from 'nano-theme';

const blockClass = drule({
  pd: '8px 20px',
});

export interface ContextHeaderProps extends React.AllHTMLAttributes<any> {
  compact?: boolean;
  children?: React.ReactNode;
}

export const ContextHeader: React.FC<ContextHeaderProps> = ({compact, children, ...rest}) => {
  const theme = useTheme();

  const className =
    (rest.className || '') +
    blockClass({
      bg: theme.g(0, 0.05),
    });

  const style: React.CSSProperties = {
    padding: compact ? '8px' : void 0,
    ...rest.style,
  };

  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
};
