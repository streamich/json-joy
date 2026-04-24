import * as React from 'react';
import {AnchorPointHandle} from './AnchorPointHandle';
import {anchorContext} from './context';
import {PositionPopup} from './PositionPopup';
import type {AnchorPoint} from './types';

export interface PositionAtPointProps {
  point: AnchorPoint;
  animate?: boolean;
  fadeIn?: boolean;
  children?: React.ReactNode;
}

export const PositionAtPoint: React.FC<PositionAtPointProps> = ({point, animate, fadeIn, children}) => {
  const handle = React.useMemo(() => AnchorPointHandle.fromPoint(point), [point]);

  return (
    <anchorContext.Provider value={handle}>
      <PositionPopup animate={animate} fadeIn={fadeIn}>{children}</PositionPopup>
    </anchorContext.Provider>
  );
};
