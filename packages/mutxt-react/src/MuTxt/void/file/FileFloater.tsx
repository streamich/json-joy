import * as React from 'react';
import {PositionAtPoint} from '@jsonjoy.com/ui/lib/utils/popup/PositionAtPoint';
import {useClickAway} from '@jsonjoy.com/ui/lib/hooks/useClickAway';
import {useMuTxt} from '../../context';
import {FileToolbarPopup} from './FileToolbarPopup';
import {ctx} from './context';
import type {AnchorPoint} from '@jsonjoy.com/ui/lib/utils/popup/types';

const GAP = 8;

const pointFromRect = (rect: DOMRect): AnchorPoint => {
  const x = rect.left + rect.width / 2;
  const spaceBelow = window.innerHeight - rect.bottom;
  const spaceAbove = rect.top;
  if (spaceBelow >= spaceAbove) {
    return {x, y: rect.bottom + GAP, dx: 0, dy: 1};
  }
  return {x, y: rect.top - GAP, dx: 0, dy: -1};
};

export const FileFloater: React.FC = () => {
  const mutxt = useMuTxt();
  const fileBtn = mutxt.voids.file;
  const open = fileBtn.open.use();
  const rect = fileBtn.anchorRect.use();

  const clickAwayRef = useClickAway(
    React.useCallback(() => fileBtn.close(), [fileBtn]),
  );

  if (!open || !rect) return null;
  const point = pointFromRect(rect);

  return (
    <ctx.Provider value={fileBtn}>
      <PositionAtPoint point={point}>
        <div
          ref={clickAwayRef}
          onMouseDown={(e) => {
            if ((e.target as HTMLElement).tagName !== 'INPUT') e.preventDefault();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.stopPropagation();
              e.preventDefault();
              fileBtn.close();
            }
          }}
        >
          <FileToolbarPopup />
        </div>
      </PositionAtPoint>
    </ctx.Provider>
  );
};
