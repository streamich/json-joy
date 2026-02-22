import * as React from 'react';
import {AnchorPointHandle} from './AnchorPointHandle';
import {anchorContext} from './context';
import type {AnchorPoint} from './types';
import {PositionPopup} from './PositionPopup';

export interface PositionAtPointProps {
  point: AnchorPoint;
  children?: React.ReactNode;
}

export const PositionAtPoint: React.FC<PositionAtPointProps> = ({point, children}) => {
  const handle = React.useMemo(() => AnchorPointHandle.fromPoint(point), [point]);

  return (
    <anchorContext.Provider value={handle}>
      <PositionPopup>{children}</PositionPopup>
    </anchorContext.Provider>
  );
};
