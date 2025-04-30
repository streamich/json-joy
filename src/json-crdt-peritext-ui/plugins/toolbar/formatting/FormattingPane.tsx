import * as React from 'react';
import {ContextPane, ContextPaneProps} from 'nice-ui/lib/4-card/ContextMenu/ContextPane';

export interface FormattingPaneProps extends ContextPaneProps {
  onEsc?: () => void;
  children?: React.ReactNode;
}

export const FormattingPane: React.FC<FormattingPaneProps> = ({onEsc, children, ...rest}) => {
  return (
    <div onKeyDown={onEsc ? (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onEsc();
      }
    } : void 0}>
      <ContextPane {...rest} style={{width: 'calc(min(600px, max(65vw, 260px)))', ...rest.style}}>
        {children}
      </ContextPane>
    </div>
  );
};
