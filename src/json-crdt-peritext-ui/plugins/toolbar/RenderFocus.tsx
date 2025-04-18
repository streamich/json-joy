import * as React from 'react';
import {CaretToolbar} from 'nice-ui/lib/4-card/Toolbar/ToolbarMenu/CaretToolbar';
import {MoveToViewport} from 'nice-ui/lib/utils/popup/MoveToViewport';
import {useToolbarPlugin} from './context';
import {useSyncStore, useSyncStoreOpt, useTimeout} from '../../web/react/hooks';
import {CaretFrame} from './cursor/CaretFrame';
import type {CaretViewProps} from '../../web/react/cursor/CaretView';

export interface RenderFocusProps extends CaretViewProps {
  children: React.ReactNode;
}

export const RenderFocus: React.FC<RenderFocusProps> = ({children, cursor}) => {
  const {toolbar} = useToolbarPlugin()!;
  const showInlineToolbar = toolbar.showInlineToolbar;
  const [showInlineToolbarValue, toolbarVisibilityChangeTime] = useSyncStore(showInlineToolbar);
  const enableAfterCoolDown = useTimeout(300, [toolbarVisibilityChangeTime]);
  const isScrubbing = useSyncStoreOpt(toolbar.surface.dom?.cursor.mouseDown) || false;
  // const focus = useSyncStoreOpt(toolbar.surface.dom?.cursor.focus) || false;
  // const blurTimeout = useTimeout(300, [focus]);

  const handleClose = React.useCallback(() => {
    //   toolbar.surface.dom?.focus();
    //   // if (showInlineToolbar.value) showInlineToolbar.next(false);
  }, []);

  let over: React.ReactNode | undefined;
  let under: React.ReactNode | undefined;

  if (showInlineToolbarValue && !isScrubbing && toolbar.txt.editor.mainCursor() === cursor)
    over = (
      <MoveToViewport>
        <CaretToolbar
          disabled={!enableAfterCoolDown /* || (!focus && blurTimeout) */}
          menu={toolbar.getSelectionMenu()}
          onPopupClose={handleClose}
        />
      </MoveToViewport>
    );

  under = (
    <MoveToViewport>
      <CaretToolbar
        disabled={!enableAfterCoolDown /* || (!focus && blurTimeout) */}
        menu={toolbar.getSelectionMenu()}
        onPopupClose={handleClose}
      />
    </MoveToViewport>
  );

  return (
    <CaretFrame over={over} under={under}>
      {children}
    </CaretFrame>
  );
};
