import * as React from 'react';
import {ManageFormattingsCard} from '../../../formatting/ManageFormattingsCard';
import {EntangledPortal} from '../../../../../components/EntangledPortal';
import type {CaretViewProps} from '../../../../../web/react/cursor/CaretView';

export interface CaretBottomOverlayProps extends CaretViewProps {
  children: React.ReactNode;
}

export const CaretBottomOverlay: React.FC<CaretBottomOverlayProps> = (props) => {
  const {fwd, bwd} = props;
  const inline = fwd || bwd;

  if (!inline) return;

  return (
    <EntangledPortal>
      <ManageFormattingsCard inline={inline} />
    </EntangledPortal>
  );
};
