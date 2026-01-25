import * as React from 'react';
import {CaretToolbar} from '@jsonjoy.com/ui/lib/4-card/Toolbar/ToolbarMenu/CaretToolbar';
import {useToolbarPlugin} from '../../context';
import {CaretFrame} from '../util/CaretFrame';
import {FormattingsNewPane} from '../../formatting/FormattingsNewPane';
import {BottomPanePortal} from '../util/BottomPanePortal';
import {TopPanePortal} from '../util/TopPanePortal';
import {useSyncStore, useSyncStoreOpt, useTimeout} from '../../../PeritextWebUi/react/hooks';
import type {CaretViewProps} from '../../../PeritextWebUi/react/cursor/CaretView';

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
      <TopPanePortal>
        <CaretToolbar
          disabled={!enableAfterCoolDown /* || (!focus && blurTimeout) */}
          menu={toolbar.getSelectionMenu()}
          onPopupClose={handleClose}
        />
      </TopPanePortal>
    );

  if (!!formatting && showInlineToolbarValue && !isScrubbing && toolbar.txt.editor.mainCursor() === cursor) {
    under = (
      <BottomPanePortal>
        <FormattingsNewPane formatting={formatting} onSave={() => formatting.save()} />
      </BottomPanePortal>
    );
  }

  return (
    <CaretFrame over={over} under={under}>
      {children}
    </CaretFrame>
  );
};
