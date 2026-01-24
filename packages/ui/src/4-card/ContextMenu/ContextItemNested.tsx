import * as React from 'react';
import {ContextItem, type ContextItemProps} from './ContextItem';
import {PopupControlled} from '../Popup/PopupControlled';
import {useAnchorPointHandle, anchorContext} from '../../utils/popup';
import type {PopupControlledProps} from '../Popup/PopupControlled';
import type {AnchorPointComputeSpec} from '../../utils/popup/types';

const anchorSpec: AnchorPointComputeSpec = {
  gap: -4,
  off: -8,
  horizontal: true,
};

export interface ContextItemNestedProps extends ContextItemProps {
  open?: PopupControlledProps['open'];
  left?: boolean;
  renderPane?: PopupControlledProps['renderContext'];
}

/**
 * Renders a {@link ContextItem} which has a nested sub-menu.
 */
export const ContextItemNested: React.FC<ContextItemNestedProps> = ({open, left, renderPane, children, ...rest}) => {
  const handle = useAnchorPointHandle(anchorSpec);

  const item = (
    <ContextItem {...rest} open={open} selected={renderPane ? open : rest.selected}>
      {children}
    </ContextItem>
  );

  if (!renderPane) return item;

  return (
    <anchorContext.Provider value={handle}>
      <PopupControlled fadeIn refToggle={handle.ref} block open={open} renderContext={renderPane}>
        {item}
      </PopupControlled>
    </anchorContext.Provider>
  );
};
