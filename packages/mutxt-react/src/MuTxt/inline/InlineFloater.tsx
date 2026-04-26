import * as React from 'react';
import {ctx as scrollAreaCtx} from '@jsonjoy.com/ui/lib/4-card/ScrollArea';
import {CaretToolbar} from '@jsonjoy.com/ui/lib/4-card/Toolbar/ToolbarMenu/CaretToolbar';
import {PositionAtPoint} from '@jsonjoy.com/ui/lib/utils/popup/PositionAtPoint';
import {MoveToViewport} from '@jsonjoy.com/ui/lib/utils/popup/MoveToViewport';
import {useMuTxt} from '../context';
import {useClickAway} from '@jsonjoy.com/ui/lib/hooks/useClickAway';
import type {ScrollState} from '@jsonjoy.com/ui/lib/4-card/ScrollArea';

export interface InlineFloaterProps {}

export const InlineFloater: React.FC<InlineFloaterProps> = () => {
  const mutxt = useMuTxt();
  const state = mutxt.inline;
  const readOnly = mutxt.readOnly.use();
  const scrollArea = React.useContext(scrollAreaCtx) as ScrollState | null;
  const clickAwayRef = useClickAway(() => {
    // console.log('CLICK AWAY');
  });
  mutxt.version.use();
  // const pointerDownOutsideToolbar = state.pointerDownOutsideToolbar.use();

  // const visible = state.visible.use();
  const point = state.anchorPoint();
  // console.log(point, state.menu);

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
          {/* <CaretToolbar menu={state.menu} expandPoint={point} /> */}
          toolbar....
        </div>
      </MoveToViewport>
    </PositionAtPoint>
  );
};
