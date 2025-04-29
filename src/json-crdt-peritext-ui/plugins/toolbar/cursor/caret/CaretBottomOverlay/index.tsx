import * as React from 'react';
import {rule} from 'nano-theme';
import {ManageFormattingsCard} from '../../../formatting/ManageFormattingsCard';
import {EntangledPortal, EntangledPortalStateOpts} from '../../../../../components/EntangledPortal';
import type {CaretViewProps} from '../../../../../web/react/cursor/CaretView';

const spanClass = rule({
  pe: 'none',
});

const gap = 4
const position: EntangledPortalStateOpts['position'] = (base, dest) => {
  let x = base.x - (dest.width >> 1);
  const y = base.y;
  if (x < gap) x = gap;
  else if (x + dest.width + gap > window.innerWidth) x = window.innerWidth - dest.width - gap;
  return [x, y];
};

const span = {className: spanClass};

const entangledProps = {
  position,
  span,
};

export interface CaretBottomOverlayProps extends CaretViewProps {
  children: React.ReactNode;
}

export const CaretBottomOverlay: React.FC<CaretBottomOverlayProps> = (props) => {
  const {fwd, bwd} = props;
  const inline = fwd || bwd;

  if (!inline) return;

  return (
    <EntangledPortal {...entangledProps}>
      <ManageFormattingsCard inline={inline} />
    </EntangledPortal>
  );
};
