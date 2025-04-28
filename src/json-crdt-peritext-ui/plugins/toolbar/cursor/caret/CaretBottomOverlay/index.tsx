import * as React from 'react';
// import {MoveToViewport} from 'nice-ui/lib/utils/popup/MoveToViewport';
import {ManageFormattingsCard} from '../../../formatting/ManageFormattingsCard';
import type {CaretViewProps} from '../../../../../web/react/cursor/CaretView';

export interface CaretBottomOverlayProps extends CaretViewProps {
  children: React.ReactNode;
}

export const CaretBottomOverlay: React.FC<CaretBottomOverlayProps> = (props) => {
  const {fwd, bwd} = props;
  const inline = fwd || bwd;

  if (!inline) return;

  return (
    <ManageFormattingsCard inline={inline} />
  );
};
