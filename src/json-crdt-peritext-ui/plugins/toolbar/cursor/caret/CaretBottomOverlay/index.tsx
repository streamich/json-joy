import * as React from 'react';
import {ManageFormattingsCard} from '../../../formatting/ManageFormattingsCard';
import {EntangledPortal, EntangledPortalStateOpts} from '../../../../../components/EntangledPortal';
import type {CaretViewProps} from '../../../../../web/react/cursor/CaretView';

const position: EntangledPortalStateOpts['position'] = (base, dest) => {
  const x = base.x - (dest.width >> 1);
  const y = base.y;
  return [x, y];
};

export interface CaretBottomOverlayProps extends CaretViewProps {
  children: React.ReactNode;
}

export const CaretBottomOverlay: React.FC<CaretBottomOverlayProps> = (props) => {
  const {fwd, bwd} = props;
  const inline = fwd || bwd;

  if (!inline) return;

  return (
    <EntangledPortal position={position}>
      <ManageFormattingsCard inline={inline} />
    </EntangledPortal>
  );
};
