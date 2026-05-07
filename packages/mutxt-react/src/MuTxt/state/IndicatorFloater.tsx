import * as React from 'react';
import {Hint} from '@jsonjoy.com/ui/lib/1-inline/Hint';
import {PositionAtPoint} from '@jsonjoy.com/ui/lib/utils/popup/PositionAtPoint';
import {useHiddenTrace} from '@jsonjoy.com/ui/lib/context';
import {useMuTxt} from '../context';

export type IndicatorFloaterProps = {};

export const IndicatorFloater: React.FC<IndicatorFloaterProps> = () => {
  const mutxt = useMuTxt();
  const state = mutxt.indicator;
  const hidden = useHiddenTrace();

  // Re-render on caret/selection changes so the anchor tracks the caret.
  mutxt.version.use();
  const shown = state.shown.use();
  const focused = mutxt.focused.use();
  const readOnly = mutxt.readOnly.use();
  const omniOpen = mutxt.omni.open.use();
  const linkPopupOpen = mutxt.inline.link.open.use();

  if (hidden || !shown || !focused || readOnly || omniOpen || linkPopupOpen) return null;

  const point = state.anchorPoint();
  if (!point) return null;

  return (
    <PositionAtPoint point={point}>
      <Hint>{shown.content}</Hint>
    </PositionAtPoint>
  );
};
