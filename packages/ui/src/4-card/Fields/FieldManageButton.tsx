import * as React from 'react';
import {useLockScrolling} from '../../hooks/useLockScrolling';
import {useSingletonPopup} from '../../hooks/useSingletonPopup';
import {anchorContext, useAnchorPointHandle} from '../../utils/popup';
import {ContextMenu} from '../ContextMenu';
import {context as popupCtx} from '../Popup/context';
import {PopupControlled} from '../Popup/PopupControlled';
import type {MenuItem} from '../StructuralMenu/types';
import {FieldGhostButton} from './FieldGhostButton';
import {FIELD_POPUP_SCOPE} from './metrics';

export interface FieldManageButtonProps {
  /** Menu title (usually the field name). */
  title?: string;
  /** Builds the menu items when the menu opens. */
  menu: () => MenuItem[];
  /** Button height in px. */
  height: number;
  /** Definition-cell inner content (icon + label). */
  children?: React.ReactNode;
}

export const FieldManageButton: React.FC<FieldManageButtonProps> = ({title, menu, height, children}) => {
  const popup = useSingletonPopup(FIELD_POPUP_SCOPE);
  const open = popup.open;
  const anchor = useAnchorPointHandle();
  useLockScrolling(open);
  const close = React.useCallback(() => popup.setOpen(false), [popup]);
  const popupContextValue = React.useMemo(() => ({close}), [close]);

  const onMouseDown = React.useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      popup.setOpen(!popup.open);
    },
    [popup],
  );
  const onKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        popup.setOpen(!popup.open);
      }
    },
    [popup],
  );

  return (
    <popupCtx.Provider value={popupContextValue}>
      <anchorContext.Provider value={anchor}>
        <PopupControlled
          block
          open={open}
          refToggle={anchor.ref}
          onClickAway={close}
          onEsc={open ? close : undefined}
          renderContext={({onEsc}) => (
            <div style={{marginInlineStart: -6}}>
              <ContextMenu inset onEsc={onEsc} menu={{name: title ?? '', minWidth: 220, children: menu()}} />
            </div>
          )}
        >
          <FieldGhostButton
            onMouseDown={onMouseDown}
            onKeyDown={onKeyDown}
            aria-haspopup="menu"
            aria-expanded={open}
            style={{width: '100%', height, marginInlineStart: -6}}
          >
            {children}
          </FieldGhostButton>
        </PopupControlled>
      </anchorContext.Provider>
    </popupCtx.Provider>
  );
};
