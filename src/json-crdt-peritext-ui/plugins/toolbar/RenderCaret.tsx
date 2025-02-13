// biome-ignore lint: React is used for JSX
import * as React from 'react';
import {rule} from 'nano-theme';
import {CaretToolbar} from 'nice-ui/lib/4-card/Toolbar/ToolbarMenu/CaretToolbar';
import {useToolbarPlugin} from './context';
import {useSyncStore, useSyncStoreOpt, useTimeout} from '../../react/hooks';
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

  const handleClose = React.useCallback(() => {
    setTimeout(() => {
      if (showInlineToolbar.value) showInlineToolbar.next([false, Date.now()]);
    }, 5);
  }, []);

  let toolbarElement = <CaretToolbar disabled={!enableAfterCoolDown} menu={toolbar.getCaretMenu()} onPopupClose={handleClose} />;

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
      {/* <span
        className={overClass}
        contentEditable={false}
      >
        {(showCaretToolbarValue && focus) && (toolbarElement)}
      </span> */}
    </span>
  );
};
