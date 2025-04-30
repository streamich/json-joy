import * as React from 'react';
import {CaretToolbar} from 'nice-ui/lib/4-card/Toolbar/ToolbarMenu/CaretToolbar';
import {MoveToViewport} from 'nice-ui/lib/utils/popup/MoveToViewport';
import {useToolbarPlugin} from '../context';
import {useSyncStore, useSyncStoreOpt, useTimeout} from '../../../web/react/hooks';
import {CaretFrame} from './CaretFrame';
import {FormattingsNewPane} from '../formatting/FormattingsNewPane';
import type {CaretViewProps} from '../../../web/react/cursor/CaretView';

export interface RenderFocusProps extends CaretViewProps {
  children: React.ReactNode;
}

export const RenderFocus: React.FC<RenderFocusProps> = ({children, cursor}) => {
  const {toolbar, surface} = useToolbarPlugin()!;
  const showInlineToolbar = toolbar.showInlineToolbar;
  const [showInlineToolbarValue, toolbarVisibilityChangeTime] = useSyncStore(showInlineToolbar);
  const enableAfterCoolDown = useTimeout(300, [toolbarVisibilityChangeTime]);
  const isScrubbing = useSyncStoreOpt(surface.dom?.cursor.mouseDown) || false;
  const formatting = useSyncStore(toolbar.newSlice);
  // const focus = useSyncStoreOpt(surface.dom?.cursor.focus) || false;
  // const blurTimeout = useTimeout(300, [focus]);

  const handleClose = React.useCallback(() => {
    //   surface.dom?.focus();
    //   // if (showInlineToolbar.value) showInlineToolbar.next(false);
  }, []);

  let over: React.ReactNode | undefined;
  let under: React.ReactNode | undefined;

  if (!formatting && showInlineToolbarValue && !isScrubbing && toolbar.txt.editor.mainCursor() === cursor)
    over = (
      <MoveToViewport>
        <CaretToolbar
          disabled={!enableAfterCoolDown /* || (!focus && blurTimeout) */}
          menu={toolbar.getSelectionMenu()}
          onPopupClose={handleClose}
        />
      </MoveToViewport>
    );

  if (!!formatting && showInlineToolbarValue && !isScrubbing && toolbar.txt.editor.mainCursor() === cursor) {
    under = <FormattingsNewPane formatting={formatting} />;
  }

  return (
    <CaretFrame over={over} under={under}>
      {children}
    </CaretFrame>
  );
};
