// biome-ignore lint: React is used for JSX
import * as React from 'react';
import {rule} from 'nano-theme';
import {CaretToolbar} from 'nice-ui/lib/4-card/Toolbar/ToolbarMenu/CaretToolbar';
import {useToolbarPlugin} from './context';
import {useSyncStore, useSyncStoreOpt} from '../../react/hooks';
import type {CaretViewProps} from '../../react/cursor/CaretView';
import {AfterTimeout} from '../../react/util/AfterTimeout';

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
  const showInlineToolbarValue = useSyncStore(showInlineToolbar);
  const focus = useSyncStoreOpt(toolbar.surface.dom?.cursor.focus) || false;
  // const mouseDown = !!useSyncStoreOpt(toolbar.surface.dom?.cursor.mouseDown);


  // const showInlineToolbar = toolbar.showInlineToolbar;
  // const showCaretToolbarValue = useSyncStore(showInlineToolbar);

  const handleClose = React.useCallback(() => {
    if (showInlineToolbar.value) showInlineToolbar.next(false);
  }, []);

  return (
    <span className={blockClass}>
      {children}
      <span className={overClass} contentEditable={false}>
        {(showInlineToolbarValue && focus) && (
          <AfterTimeout ms={500}>
            <CaretToolbar menu={toolbar.getSelectionMenu()} onPopupClose={handleClose} />
          </AfterTimeout>
        )}
      </span>
    </span>
  );
};
