import * as React from 'react';
import type {CaretViewProps} from '../../../../web/react/cursor/CaretView';

export interface CaretBottomOverlayProps extends CaretViewProps {
  children: React.ReactNode;
}

export const CaretBottomOverlay: React.FC<CaretBottomOverlayProps> = (props) => {
  const {fwd, bwd} = props;
  const inline = fwd || bwd;

  console.log('attr', inline?.attr());

  return null;
};
