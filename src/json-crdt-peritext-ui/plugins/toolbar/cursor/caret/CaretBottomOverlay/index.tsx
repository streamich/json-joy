// biome-ignore lint: lint/style/useImportType
import * as React from 'react';
import {FormattingsManagePane} from '../../../formatting/FormattingsManagePane';
import {BottomPanePortal} from '../../util/BottomPanePortal';
import type {CaretViewProps} from '../../../../../web/react/cursor/CaretView';

export interface CaretBottomOverlayProps extends CaretViewProps {}

export const CaretBottomOverlay: React.FC<CaretBottomOverlayProps> = (props) => {
  const {fwd, bwd} = props;
  const inline = fwd || bwd;

  if (!inline) return;

  return (
    <BottomPanePortal>
      <FormattingsManagePane inline={inline} />
    </BottomPanePortal>
  );
};
