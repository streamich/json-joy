// biome-ignore lint: lint/style/useImportType
import * as React from 'react';
import {rule} from 'nano-theme';
import {FormattingsManagePane} from '../../../formatting/FormattingsManagePane';
import {EntangledPortal, type EntangledPortalStateOpts} from '../../../../../components/EntangledPortal';
import type {CaretViewProps} from '../../../../../web/react/cursor/CaretView';

const spanClass = rule({
  pe: 'none',
});

const gap = 4;
const position: EntangledPortalStateOpts['position'] = (base, dest) => {
  let x = base.x - (dest.width >> 1);
  let y = base.y;
  if (x < gap) x = gap;
  else if (x + dest.width + gap > window.innerWidth) x = window.innerWidth - dest.width - gap;
  const {scrollY} = window;
  const body = document.body;
  const html = document.documentElement;
  const pageHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
  if (base.y + dest.height + scrollY > pageHeight) y = base.y - (base.y + dest.height + scrollY - pageHeight);
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
      <FormattingsManagePane inline={inline} />
    </EntangledPortal>
  );
};
