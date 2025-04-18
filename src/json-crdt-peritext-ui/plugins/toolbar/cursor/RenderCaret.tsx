import * as React from 'react';
import {CaretToolbar} from 'nice-ui/lib/4-card/Toolbar/ToolbarMenu/CaretToolbar';
import {useToolbarPlugin} from '../context';
import {useSyncStore, useSyncStoreOpt, useTimeout} from '../../../web/react/hooks';
import {AfterTimeout} from '../../../web/react/util/AfterTimeout';
import {CaretFrame} from './CaretFrame';
import type {CaretViewProps} from '../../../web/react/cursor/CaretView';

export interface RenderCaretProps extends CaretViewProps {
  children: React.ReactNode;
}

export const RenderCaret: React.FC<RenderCaretProps> = ({children}) => {
  const {toolbar} = useToolbarPlugin()!;
  const showInlineToolbar = toolbar.showInlineToolbar;
  const [showCaretToolbarValue, toolbarVisibilityChangeTime] = useSyncStore(showInlineToolbar);
  const focus = useSyncStoreOpt(toolbar.surface.dom?.cursor.focus) || false;
  const doHideForCoolDown = toolbarVisibilityChangeTime + 500 > Date.now();
  const enableAfterCoolDown = useTimeout(500, [doHideForCoolDown]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: showInlineToolbar.next do not need to memoize
  const handleClose = React.useCallback(() => {
    setTimeout(() => {
      if (showInlineToolbar.value) showInlineToolbar.next([false, Date.now()]);
    }, 5);
  }, []);

  let over: React.ReactNode | undefined = (
    <CaretToolbar disabled={!enableAfterCoolDown} menu={toolbar.getCaretMenu()} onPopupClose={handleClose} />
  );

  if (doHideForCoolDown) {
    over = <AfterTimeout ms={500}>{over}</AfterTimeout>;
  }

  over = null;

  return (
    <CaretFrame over={over}>
      {children}
    </CaretFrame>
  );
};
