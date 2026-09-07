import {rule} from 'nano-theme';
import * as React from 'react';
import {ContextPane, type ContextPaneProps} from '../ContextMenu';

const flexClass = rule({
  d: 'flex',
  fld: 'row',
  ai: 'center',
  pd: '4px',
  h: '32px',
});

export interface ToolbarPaneProps extends ContextPaneProps {
  children?: React.ReactNode;
  compact?: boolean;
  small?: boolean;
}

export const ToolbarPane: React.FC<ToolbarPaneProps> = ({children, small, ...rest}) => {
  let style: React.CSSProperties | undefined = rest.style;

  if (small) {
    style = {padding: 2, height: 'auto'};
  } else if (rest.compact) {
    style = {padding: 2};
  }

  return (
    <ContextPane {...rest}>
      <div className={flexClass} style={style}>
        {children}
      </div>
    </ContextPane>
  );
};
