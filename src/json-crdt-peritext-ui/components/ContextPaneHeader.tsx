import * as React from 'react';
import {ContextHeader} from 'nice-ui/lib/4-card/ContextMenu/ContextHeader';
import {BasicButtonBack} from 'nice-ui/lib/2-inline-block/BasicButton/BasicButtonBack';
import {BasicButtonClose} from 'nice-ui/lib/2-inline-block/BasicButton/BasicButtonClose';
import {Flex} from 'nice-ui/lib/3-list-item/Flex';

export interface ContextPaneHeaderProps {
  children?: React.ReactNode;
  onBackClick?: React.MouseEventHandler;
  onCloseClick?: React.MouseEventHandler;
}

export const ContextPaneHeader: React.FC<ContextPaneHeaderProps> = ({children, onBackClick, onCloseClick}) => {
  return (
    <ContextHeader compact>
      <Flex style={{alignItems: 'center'}}>
        {!!onBackClick && <BasicButtonBack onClick={onBackClick} />}
        {children}
        {!!onCloseClick && <BasicButtonClose onClick={onCloseClick} />}
      </Flex>
    </ContextHeader>
  );
};
