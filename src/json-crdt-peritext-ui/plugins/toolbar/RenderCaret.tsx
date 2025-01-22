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

export interface RenderCaretProps extends CaretViewProps {
  children: React.ReactNode;
}

export const RenderCaret: React.FC<RenderCaretProps> = ({children}) => {
  const {toolbar} = useToolbarPlugin()!;
  const showInlineToolbar = toolbar.showInlineToolbar;
  const showCaretToolbarValue = useSyncStore(showInlineToolbar);

  const handleClose = React.useCallback(() => {
    setTimeout(() => {
      if (showInlineToolbar.value) showInlineToolbar.next(false);
    }, 5);
  }, []);

  return (
    <span className={blockClass}>
      {children}
      <span
        className={overClass}
        contentEditable={false}
        // onMouseDown={(e) => {
        //   e.stopPropagation();
        // }}
        // onMouseUp={(e) => {
        //   e.stopPropagation();
        // }}
        // onClick={(e) => {
        //   e.stopPropagation();
        // }}
      >
        {showCaretToolbarValue && (
          <CaretToolbar menu={toolbar.getCaretMenu()} onPopupClose={handleClose} />
        )}
      </span>
    </span>
  );
};
