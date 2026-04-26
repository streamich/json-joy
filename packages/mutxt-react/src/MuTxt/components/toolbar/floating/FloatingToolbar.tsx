import * as React from 'react';
import {ctx as scrollAreaCtx} from '@jsonjoy.com/ui/lib/4-card/ScrollArea';
import {CaretToolbar} from '@jsonjoy.com/ui/lib/4-card/Toolbar/ToolbarMenu/CaretToolbar';
import {PositionAtPoint} from '@jsonjoy.com/ui/lib/utils/popup/PositionAtPoint';
import {MoveToViewport} from '@jsonjoy.com/ui/lib/utils/popup/MoveToViewport';
import {useMuTxtState} from '../../../context';
import {FloatingToolbarState} from './FloatingToolbarState';
import type {ScrollState} from '@jsonjoy.com/ui/lib/4-card/ScrollArea';
import {useClickAway} from '@jsonjoy.com/ui/lib/hooks/useClickAway';

export interface FloatingToolbarProps {}

export const FloatingToolbar: React.FC<FloatingToolbarProps> = () => {
  const mutxt = useMuTxtState();
  const readOnly = mutxt.readOnly.use();
  const scrollArea = React.useContext(scrollAreaCtx) as ScrollState | null;
  const clickAwayRef = useClickAway(() => {
    // console.log('CLICK AWAY');
  });

  const state = React.useMemo(
    () => new FloatingToolbarState(mutxt, scrollArea),
    [mutxt, scrollArea],
  );
  React.useEffect(() => state.start(), [state]);
  mutxt.version.use();
  // const pointerDownOutsideToolbar = state.pointerDownOutsideToolbar.use();

  // const visible = state.visible.use();
  const point = state.anchorPoint();
  console.log(point, state.menu);

  if (!point) return;

  // if (pointerDownOutsideToolbar) return;

  // if (!visible) return null;

  // return (
  //   <CaretToolbar menu={state.menu} expandPoint={point} />
  // );

  return (
    <PositionAtPoint point={point}>
      <MoveToViewport>
        <div
          ref={clickAwayRef}
          // ref={state.setToolbarElement}
          // onMouseDown={state.onToolbarMouseDown}
          // onFocusCapture={state.onToolbarFocusCapture}
          // onBlurCapture={state.onToolbarBlurCapture}
        >
          {/* <ToolbarMenu menu={state.menu} disabled={readOnly} compact /> */}
          <CaretToolbar menu={state.menu} expandPoint={point} />
        </div>
      </MoveToViewport>
    </PositionAtPoint>
  );
};
