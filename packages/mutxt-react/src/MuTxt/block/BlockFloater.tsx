import * as React from 'react';
import {ExpandableToolbar} from '@jsonjoy.com/ui/lib/4-card/Toolbar/ToolbarMenu/ExpandableToolbar';
import {PositionAtPoint} from '@jsonjoy.com/ui/lib/utils/popup/PositionAtPoint';
import {useClickAway} from '@jsonjoy.com/ui/lib/hooks/useClickAway';
import {useMuTxt} from '../context';

export interface BlockFloaterProps {}

export const BlockFloater: React.FC<BlockFloaterProps> = () => {
  const mutxt = useMuTxt();
  const state = mutxt.block;
  const cursor = mutxt.cursor.use();
  const readOnly = mutxt.readOnly.use();
  const dismissed = state.dismissed.use();
  mutxt.version.use();
  mutxt.scrollVersion.use();
  mutxt.editableBox.use();
  mutxt.wnd.use();

  const clickAwayRef = useClickAway(
    React.useCallback(() => {
      state.dismissed.next(true);
    }, [state]),
  );

  if (readOnly || !cursor || mutxt.api.hasSelection()) return;
  if (dismissed) return;
  if (!state.currentBlockFormat()) return;
  const point = state.point();
  if (!point) return;
  if (!state.isInViewport(point)) return;

  const menu = state.menu.build();
  if (!menu) return;

  return (
    <PositionAtPoint point={point} animate>
      <div ref={clickAwayRef} onMouseDown={(e) => e.preventDefault()}>
        <ExpandableToolbar
          pane={{
            transparent: true,
          }}
          compact
          menu={menu}
        />
      </div>
    </PositionAtPoint>
  );
};
