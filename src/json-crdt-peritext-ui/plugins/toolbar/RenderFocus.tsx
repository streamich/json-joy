// biome-ignore lint: React is used for JSX
import * as React from 'react';
import {rule} from 'nano-theme';
import {CaretToolbar} from 'nice-ui/lib/4-card/Toolbar/ToolbarMenu/CaretToolbar';
import {useToolbarPlugin} from './context';
import {useSyncStore, useSyncStoreOpt, useTimeout} from '../../react/hooks';
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
  const enableAfterCoolDown = useTimeout(500, [toolbarVisibilityChangeTime]);
  const isScrubbing = useSyncStoreOpt(toolbar.surface.dom?.cursor.mouseDown) || false;

  const handleClose = React.useCallback(() => {
    //   toolbar.surface.dom?.focus();
    //   // if (showInlineToolbar.value) showInlineToolbar.next(false);
  }, []);

  let toolbarElement: React.ReactNode = null;

  if (showInlineToolbarValue && !isScrubbing)
    toolbarElement = (
      <CaretToolbar disabled={!enableAfterCoolDown} menu={toolbar.getSelectionMenu()} onPopupClose={handleClose} />
    );

  return (
    <span className={blockClass}>
      {children}
      <span className={overClass} contentEditable={false}>
        {toolbarElement}
      </span>
    </span>
  );
};
