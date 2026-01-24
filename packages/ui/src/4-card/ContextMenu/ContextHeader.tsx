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
      bg: theme.g(0, 0.04),
    });

  const style: React.CSSProperties = {
    ...rest.style,
    padding: compact ? '8px' : void 0,
  };

  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
};
