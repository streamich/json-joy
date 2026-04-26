import * as React from 'react';
import {ContextMenu} from '@jsonjoy.com/ui/lib/4-card/ContextMenu/ContextMenu';
import {PositionAtPoint} from '@jsonjoy.com/ui/lib/utils/popup/PositionAtPoint';
import {useMuTxt} from '../../context';
import {SlashMenuState} from './SlashMenuState';

export interface SlashMenuProps {}

export const SlashMenu: React.FC<SlashMenuProps> = () => {
  const mutxt = useMuTxt();
  const state = React.useMemo(() => new SlashMenuState(mutxt), [mutxt]);

  React.useEffect(() => {
    mutxt.onSlashKey = state.handleSlashKey;
    return () => {
      if (mutxt.onSlashKey === state.handleSlashKey) mutxt.onSlashKey = undefined;
    };
  }, [mutxt, state]);

  mutxt.wnd.use();
  mutxt.editableBox.use();

  const open = state.open.use();
  if (!open) return;

  const point = state.point();
  if (!point) return;

  return (
    <PositionAtPoint point={point}>
      <ContextMenu
        inset
        menu={state.menu}
        onEsc={state.close}
      />
    </PositionAtPoint>
  );
};
