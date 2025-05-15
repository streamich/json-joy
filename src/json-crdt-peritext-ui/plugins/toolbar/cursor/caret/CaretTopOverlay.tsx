import * as React from 'react';
import {CaretToolbar} from 'nice-ui/lib/4-card/Toolbar/ToolbarMenu/CaretToolbar';
import {useToolbarPlugin} from '../../context';
import {useSyncStore, useTimeout} from '../../../../web/react/hooks';
import {AfterTimeout} from '../../../../web/react/util/AfterTimeout';
import type {CaretViewProps} from '../../../../web/react/cursor/CaretView';

export interface CaretTopOverlayProps extends CaretViewProps {
  children: React.ReactNode;
}

export const CaretTopOverlay: React.FC<CaretTopOverlayProps> = () => {
  const {toolbar} = useToolbarPlugin()!;
  const showInlineToolbar = toolbar.showInlineToolbar;
  const [, toolbarVisibilityChangeTime] = useSyncStore(showInlineToolbar);
  const doHideForCoolDown = toolbarVisibilityChangeTime + 500 > Date.now();
  const enableAfterCoolDown = useTimeout(500, [doHideForCoolDown]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: showInlineToolbar.next do not need to memoize
  const handleClose = React.useCallback(() => {
    setTimeout(() => {
      if (showInlineToolbar.value) showInlineToolbar.next([false, Date.now()]);
    }, 5);
  }, []);

  let element: React.ReactNode | undefined = (
    <CaretToolbar disabled={!enableAfterCoolDown} menu={toolbar.getCaretMenu()} onPopupClose={handleClose} />
  );

  if (doHideForCoolDown) {
    element = <AfterTimeout ms={500}>{element}</AfterTimeout>;
  }

  element = null;

  return element;
};
