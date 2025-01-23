// biome-ignore lint: React is used for JSX
import * as React from 'react';
import {rule} from 'nano-theme';
import {CaretToolbar} from 'nice-ui/lib/4-card/Toolbar/ToolbarMenu/CaretToolbar';
import {useToolbarPlugin} from './context';
import {useSyncStore} from '../../react/hooks';
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
  const showFocusToolbarValue = useSyncStore(showInlineToolbar);

  const handleClose = React.useCallback(() => {
    if (showInlineToolbar.value) showInlineToolbar.next(false);
  }, []);

  return (
    <span className={blockClass}>
      {children}
      <span className={overClass} contentEditable={false}>
        {showFocusToolbarValue && (
          <CaretToolbar menu={toolbar.getSelectionMenu()} onPopupClose={handleClose} />
        )}
      </span>
    </span>
  );
};
