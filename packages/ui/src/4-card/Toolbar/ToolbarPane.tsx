import * as React from 'react';
import {ContextPane, type ContextPaneProps} from '../ContextMenu';
import {rule} from 'nano-theme';

const flexClass = rule({
  d: 'flex',
  fld: 'row',
  ai: 'center',
  pd: '4px',
  h: '32px',
});

export interface ToolbarPaneProps extends ContextPaneProps {
  children?: React.ReactNode;
}

export const ToolbarPane: React.FC<ToolbarPaneProps> = ({children, ...rest}) => {
  return (
    <ContextPane {...rest}>
      <div className={flexClass}>{children}</div>
    </ContextPane>
  );
};
