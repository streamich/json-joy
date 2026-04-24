import * as React from 'react';
import {ctx as scrollAreaCtx} from '@jsonjoy.com/ui/lib/4-card/ScrollArea';
import {ExpandableToolbar} from '@jsonjoy.com/ui/lib/4-card/Toolbar/ToolbarMenu/ExpandableToolbar';
import {PositionAtPoint} from '@jsonjoy.com/ui/lib/utils/popup/PositionAtPoint';
import {useMuTxtState} from '../../../context';
import {FloatingBlockToolbarState} from './FloatingBlockToolbarState';
import type {ScrollState} from '@jsonjoy.com/ui/lib/4-card/ScrollArea';

export interface FloatingBlockToolbarProps {}

export const FloatingBlockToolbar: React.FC<FloatingBlockToolbarProps> = () => {
  const mutxt = useMuTxtState();
  const scrollArea = React.useContext(scrollAreaCtx) as ScrollState | null;
  const state = React.useMemo(() => new FloatingBlockToolbarState(mutxt, scrollArea), [mutxt, scrollArea]);
  const currentBlock = state.blockMeta();
  const cursor = mutxt.cursor.use();
  const readOnly = mutxt.readOnly.use();
  mutxt.version.use();
  mutxt.scrollVersion.use();

  if (!currentBlock || readOnly || !cursor || mutxt.api.hasSelection()) return;
  const point = state.point();
  if (!point) return;
  if (!state.isInViewport(point)) return;

  const menu = state.menu(currentBlock);
  if (!menu) return;

  return (
    <PositionAtPoint point={point} animate>
      <div onMouseDown={e => e.preventDefault()}>
        <ExpandableToolbar
        pane={{
          // borderless: true,
          transparent: true,
        }}
        compact
        menu={menu}
        />
      </div>
    </PositionAtPoint>
  );
};
