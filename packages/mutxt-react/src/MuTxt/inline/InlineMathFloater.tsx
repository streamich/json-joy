import * as React from 'react';
import {PositionAtPoint} from '@jsonjoy.com/ui/lib/utils/popup/PositionAtPoint';
import {useClickAway} from '@jsonjoy.com/ui/lib/hooks/useClickAway';
import {useMuTxt} from '../context';
import {InlineMathPopup} from './InlineMathPopup';

export const InlineMathFloater: React.FC = () => {
  const mutxt = useMuTxt();
  const state = mutxt.inline.math;
  const open = state.open.use();
  const point = state.point.use();

  const clickAwayRef = useClickAway(React.useCallback(() => state.close(), [state]));

  if (!open || !point) return null;

  return (
    <PositionAtPoint point={point} animate>
      <div
        ref={clickAwayRef}
        onMouseDown={(e) => {
          // Allow focus on input-like fields inside the popup. Suppress the
          // default mousedown elsewhere so the surrounding editor doesn't
          // pull focus back to itself.
          const target = e.target as HTMLElement;
          const tag = target.tagName;
          if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'MATH-FIELD') {
            e.preventDefault();
          }
          e.stopPropagation();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.stopPropagation();
            e.preventDefault();
            state.close();
          }
        }}
      >
        <InlineMathPopup state={state} />
      </div>
    </PositionAtPoint>
  );
};
