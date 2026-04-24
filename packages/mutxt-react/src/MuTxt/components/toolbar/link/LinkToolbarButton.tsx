import * as React from 'react';
import {PopupControlled} from '@jsonjoy.com/ui/lib/4-card/Popup/PopupControlled';
import {ToolbarItem} from '@jsonjoy.com/ui/lib/4-card/Toolbar/ToolbarItem';
import {Iconista} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {anchorContext, useAnchorPointHandle} from '@jsonjoy.com/ui/lib/utils/popup/context';
import {useMuTxtState} from '../../../context';
import {LinkToolbarPopup} from './LinkToolbarPopup';
import {LinkButtonState} from './state';
import {ctx} from './context';
import {useT} from 'use-t';

const popupAnchor = {center: true, gap: 12, topIf: 180};

const preventMouseDown = (event: React.MouseEvent): void => {
  event.preventDefault();
};

export interface LinkToolbarButtonProps {
  refToggle?: (toggle: HTMLElement | null) => void;
}

export const LinkToolbarButton: React.FC<LinkToolbarButtonProps> = ({refToggle}) => {
  const [t] = useT();
  const mutxt = useMuTxtState();
  const state = React.useMemo(() => new LinkButtonState(mutxt), [mutxt]);
  const handle = useAnchorPointHandle(popupAnchor);
  const canOpen = state.canOpen.use();
  const open = state.open.use();
  const selected = state.selected.use();

  React.useEffect(() => {
    mutxt.requestLinkMenu = state.toggle;
    return () => {
      if (mutxt.requestLinkMenu === state.toggle) mutxt.requestLinkMenu = undefined;
    };
  }, [mutxt, state]);

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
            tooltip={{nowrap: true, renderTooltip: () => t('Link'), shortcut: 'Cmd+K'}}
          >
            <Iconista set="vscode" icon="link" width={16} height={16} />
          </ToolbarItem>
        </PopupControlled>
      </anchorContext.Provider>
    </ctx.Provider>
  );
};
