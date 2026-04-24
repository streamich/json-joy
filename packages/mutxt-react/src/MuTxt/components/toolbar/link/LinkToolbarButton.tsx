import * as React from 'react';
import {PopupControlled} from '@jsonjoy.com/ui/lib/4-card/Popup/PopupControlled';
import {ToolbarItem} from '@jsonjoy.com/ui/lib/4-card/Toolbar/ToolbarItem';
import {Iconista} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {anchorContext, useAnchorPointHandle} from '@jsonjoy.com/ui/lib/utils/popup/context';
import {useMuTxtState} from '../../../context';
import {LinkToolbarPopup} from './LinkToolbarPopup';
import {LinkButtonState} from './state';
import {ctx} from './context';

const popupAnchor = {center: true, gap: 12, topIf: 180};

const preventMouseDown = (event: React.MouseEvent): void => {
  event.preventDefault();
};

export interface LinkToolbarButtonProps {}

export interface LinkToolbarButtonViewProps {
  refToggle: (toggle: HTMLElement | null) => void;
}

export const LinkToolbarButton: React.FC<LinkToolbarButtonViewProps> = ({refToggle}) => {
  const mutxt = useMuTxtState();
  const state = React.useMemo(() => new LinkButtonState(mutxt), [mutxt]);
  const handle = useAnchorPointHandle(popupAnchor);
  const canOpen = state.canOpen.use();
  const open = state.open.use();
  const popupTitle = state.popupTitle.use();
  const selected = state.selected.use();

  const mergedRefToggle = React.useCallback(
    (el: HTMLElement | null) => {
      handle.ref(el);
      if (typeof refToggle === 'function') refToggle(el);
    },
    [handle, refToggle],
  );

  return (
    <ctx.Provider value={state}>
      <anchorContext.Provider value={handle}>
        <PopupControlled
          refToggle={mergedRefToggle}
          open={open}
          onEsc={state.close}
          onClickAway={state.close}
          onHeadClick={(event) => {
            event.preventDefault();
            state.toggle();
          }}
          renderContext={() => <LinkToolbarPopup />}
        >
          <ToolbarItem
            type="button"
            selected={selected}
            disabled={!canOpen}
            onMouseDown={preventMouseDown}
            tooltip={{nowrap: true, renderTooltip: () => popupTitle, shortcut: 'Cmd+K'}}
          >
            <Iconista set="vscode" icon="link" width={16} height={16} />
          </ToolbarItem>
        </PopupControlled>
      </anchorContext.Provider>
    </ctx.Provider>
  );
};
