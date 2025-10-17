import * as React from 'react';
import {FormattingsManagePane} from '../../../formatting/FormattingsManagePane';
import {BottomPanePortal} from '../../util/BottomPanePortal';
import {useToolbarPlugin} from '../../../context';
import type {PeritextEventDetailMap} from '../../../../../../json-crdt-extensions/peritext/events';
import type {CaretViewProps} from '../../../../../web/react/cursor/CaretView';

const isDirectCaretPlacement = (event: PeritextEventDetailMap['change']['ev'] | undefined): boolean => {
  if (event && event.type === 'cursor') {
    const detail = event.detail;
    const at = detail.at;
    if (Array.isArray(at) && at.length === 1 && typeof at[0] === 'number') return true;
    const move = detail.move;
    if (
      Array.isArray(move) &&
      move.length === 1 &&
      Array.isArray(move[0]) &&
      move[0][0] === 'focus' &&
      typeof move[0][1] === 'number'
    )
      return true;
  }
  return false;
};

export interface CaretBottomOverlayProps extends CaretViewProps {}

export const CaretBottomOverlay: React.FC<CaretBottomOverlayProps> = (props) => {
  const {fwd, bwd} = props;
  const inline = fwd || bwd;
  const {toolbar} = useToolbarPlugin()!;

  if (!inline) return;
  if (!isDirectCaretPlacement(toolbar.lastEvent)) return;

  return (
    <BottomPanePortal>
      <FormattingsManagePane inline={inline} />
    </BottomPanePortal>
  );
};
