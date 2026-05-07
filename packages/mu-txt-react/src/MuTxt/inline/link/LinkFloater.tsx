import * as React from 'react';
import {PositionAtPoint} from '@jsonjoy.com/ui/lib/utils/popup/PositionAtPoint';
import {useClickAway} from '@jsonjoy.com/ui/lib/hooks/useClickAway';
import {useMuTxt} from '../../context';
import {LinkToolbarPopup} from './LinkToolbarPopup';
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

export const LinkFloater: React.FC = () => {
  const mutxt = useMuTxt();
  const link = mutxt.inline.link;
  const open = link.open.use();
  const rect = link.anchorRect.use();

  const clickAwayRef = useClickAway(React.useCallback(() => link.close(), [link]));

  if (!open || !rect) return null;
  const point = pointFromRect(rect);

  return (
    <ctx.Provider value={link}>
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
              link.close();
            }
          }}
        >
          <LinkToolbarPopup />
        </div>
      </PositionAtPoint>
    </ctx.Provider>
  );
};
