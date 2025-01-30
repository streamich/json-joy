// biome-ignore lint: React is used for JSX
import * as React from 'react';
import {rule} from 'nano-theme';
import {CaretToolbar} from 'nice-ui/lib/4-card/Toolbar/ToolbarMenu/CaretToolbar';
import {useToolbarPlugin} from './context';
import {useSyncStore, useTimeout} from '../../react/hooks';
import {AfterTimeout} from '../../react/util/AfterTimeout';
import type {CaretViewProps} from '../../react/cursor/CaretView';

const height = 1.8;

const blockClass = rule({
  pos: 'relative',
  w: '0px',
  h: '100%',
  va: 'bottom',
});

const overClass = rule({
  pos: 'absolute',
  b: `${height}em`,
  l: 0,
  isolation: 'isolate',
  us: 'none',
  transform: 'translateX(calc(-50% + 0px))',
});

export interface RenderFocusProps extends CaretViewProps {
  children: React.ReactNode;
}

export const RenderFocus: React.FC<RenderFocusProps> = ({children}) => {
  const {toolbar} = useToolbarPlugin()!;
  const showInlineToolbar = toolbar.showInlineToolbar;
  const [showInlineToolbarValue, toolbarVisibilityChangeTime] = useSyncStore(showInlineToolbar);
  const focus = true; //useSyncStoreOpt(toolbar.surface.dom?.cursor.focus) || false;
  const doHideForCoolDown = toolbarVisibilityChangeTime + 500 > Date.now();
  const enableAfterCoolDown = useTimeout(500, [toolbarVisibilityChangeTime]);

  console.log('showInlineToolbarValue:', showInlineToolbarValue, 'focus:', focus, 'enableAfterCoolDown:', enableAfterCoolDown, 'toolbarVisibilityChangeTime:', toolbarVisibilityChangeTime);

  const handleClose = React.useCallback(() => {
    toolbar.surface.dom?.focus();
    // if (showInlineToolbar.value) showInlineToolbar.next(false);
  }, []);

  let toolbarElement = <CaretToolbar disabled={!enableAfterCoolDown} menu={toolbar.getSelectionMenu()} onPopupClose={handleClose} />;
  
  if (doHideForCoolDown) {
    toolbarElement = (
      <AfterTimeout ms={500}>
        {toolbarElement}
      </AfterTimeout>
    );
  }

  return (
    <span className={blockClass}>
      {children}
      <span className={overClass} contentEditable={false}>
        {toolbarElement}
      </span>
    </span>
  );
};
