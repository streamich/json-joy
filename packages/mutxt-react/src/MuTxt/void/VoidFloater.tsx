import * as React from 'react';
import {ContextMenu} from '@jsonjoy.com/ui/lib/4-card/ContextMenu/ContextMenu';
import {PositionAtPoint} from '@jsonjoy.com/ui/lib/utils/popup/PositionAtPoint';
import {useMuTxt} from '../context';

export interface VoidFloaterProps {}

export const VoidFloater: React.FC<VoidFloaterProps> = () => {
  const mutxt = useMuTxt();
  const voids = mutxt.voids;
  const open = voids.open.use();

  if (!open) return;

  const point = voids.point();
  if (!point) return;
  
  return (
    <PositionAtPoint point={point} animate>
      {/* <div ref={composedRef} className={handleClass} onMouseDown={(e) => e.preventDefault()}> */}
        <ContextMenu
          inset
          menu={voids.menu.build()}
        />
      {/* </div> */}
    </PositionAtPoint>
  );
};
