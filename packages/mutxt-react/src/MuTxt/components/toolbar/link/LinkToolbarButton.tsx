import * as React from 'react';
import {PopupControlled} from '@jsonjoy.com/ui/lib/4-card/Popup/PopupControlled';
import {ToolbarItem} from '@jsonjoy.com/ui/lib/4-card/Toolbar/ToolbarItem';
import {Iconista} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {anchorContext, useAnchorPointHandle} from '@jsonjoy.com/ui/lib/utils/popup/context';
import {useSlateEditorState} from '../../../context';
import {LinkToolbarPopup} from './LinkToolbarPopup';
import {LinkToolbarStateProvider, useLinkToolbarState} from './state';
import type {Editor} from 'slate';

const popupAnchor = {center: true, gap: 12, topIf: 180};

const preventMouseDown = (event: React.MouseEvent): void => {
  event.preventDefault();
};

export interface LinkToolbarButtonProps {
  editor: Editor;
  readOnly?: boolean;
  onVisualChange: () => void;
}

export interface LinkToolbarButtonViewProps {
  refToggle: (toggle: HTMLElement | null) => void;
}

export const LinkToolbarButtonView: React.FC<LinkToolbarButtonViewProps> = ({refToggle}) => {
  const state = useLinkToolbarState();
  const canOpen = state.canOpen.use();
  const open = state.open.use();
  const popupTitle = state.popupTitle.use();
  const selected = state.selected.use();

  return (
    <PopupControlled
      refToggle={refToggle}
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
  );
};

export const LinkToolbarButton: React.FC<LinkToolbarButtonProps> = ({editor, readOnly, onVisualChange}) => {
  const editorState = useSlateEditorState();
  const handle = useAnchorPointHandle(popupAnchor);
  const linkMenuRequest = editorState.linkMenuRequest.use();
  const syncVersion = editorState.toolbarVersion.use();

  return (
    <LinkToolbarStateProvider
      editor={editor}
      readOnly={readOnly}
      linkMenuRequest={linkMenuRequest}
      syncVersion={syncVersion}
      onVisualChange={onVisualChange}
    >
      <anchorContext.Provider value={handle}>
        <LinkToolbarButtonView refToggle={handle.ref} />
      </anchorContext.Provider>
    </LinkToolbarStateProvider>
  );
};