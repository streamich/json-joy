import * as React from 'react';
import {PopupControlled, type PopupControlledProps} from './PopupControlled';
import {context} from './context';
import {useAnchorPointHandle, anchorContext} from '../../utils/popup';
import {useLockScrolling} from '../../hooks/useLockScrolling';
import type {AnchorPointComputeSpec} from '../../utils/popup/types';

export interface PopupProps extends Omit<PopupControlledProps, 'open'> {
  anchor?: AnchorPointComputeSpec;
}

export const Popup: React.FC<PopupProps> = (props) => {
  const {anchor: anchorSpec, ...rest} = props;
  const [open, setOpen] = React.useState(false);
  const contextValue = React.useMemo(() => ({close: () => setOpen(false)}), []);
  const handle = useAnchorPointHandle(anchorSpec);

  // Lock page scrolling on open popup.
  useLockScrolling(open);

  const handleClick = () => {
    setOpen((open) => !open);
  };

  const handleClickAway = () => {
    setOpen(false);
  };

  return (
    <context.Provider value={contextValue}>
      <anchorContext.Provider value={handle}>
        <PopupControlled
          {...rest}
          refToggle={handle.ref}
          onEsc={open ? () => setOpen(false) : undefined}
          onHeadClick={handleClick}
          onClickAway={handleClickAway}
          open={open}
        />
      </anchorContext.Provider>
    </context.Provider>
  );
};
