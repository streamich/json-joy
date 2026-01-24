import * as React from 'react';
import {ContextTitle, type ContextTitleProps} from './ContextTitle';
import {PopupControlled} from '../Popup/PopupControlled';
import {useAnchorPointHandle, anchorContext} from '../../utils/popup';
import type {AnchorPointComputeSpec} from '../../utils/popup/types';
import type {PopupControlledProps} from '../Popup/PopupControlled';

const anchorSpec: AnchorPointComputeSpec = {
  gap: -4,
  off: -16,
  horizontal: true,
};

export interface ContextTitleNestedProps extends ContextTitleProps {
  open?: PopupControlledProps['open'];
  left?: boolean;
  renderPane?: PopupControlledProps['renderContext'];
}

/**
 * Renders a {@link ContextTitle} which has a nested sub-menu.
 */
export const ContextTitleNested: React.FC<ContextTitleNestedProps> = ({open, left, renderPane, children, ...rest}) => {
  const handle = useAnchorPointHandle(anchorSpec);

  const item = <ContextTitle {...rest}>{children}</ContextTitle>;

  if (!renderPane) return item;

  return (
    <anchorContext.Provider value={handle}>
      <PopupControlled fadeIn refToggle={handle.ref} block open={open} renderContext={renderPane}>
        {item}
      </PopupControlled>
    </anchorContext.Provider>
  );
};
