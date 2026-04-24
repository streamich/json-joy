import * as React from 'react';
import {ctx as scrollAreaCtx} from '@jsonjoy.com/ui/lib/4-card/ScrollArea';
import {ToolbarMenu} from '@jsonjoy.com/ui/lib/4-card/Toolbar/ToolbarMenu';
import {PositionAtPoint} from '@jsonjoy.com/ui/lib/utils/popup/PositionAtPoint';
import {MoveToViewport} from '@jsonjoy.com/ui/lib/utils/popup/MoveToViewport';
import {useMuTxtState} from '../../../context';
import {FloatingToolbarState} from './FloatingToolbarState';
import type {ScrollState} from '@jsonjoy.com/ui/lib/4-card/ScrollArea';

export interface FloatingToolbarProps {}

export const FloatingToolbar: React.FC<FloatingToolbarProps> = () => {
  const mutxt = useMuTxtState();
  const readOnly = mutxt.readOnly.use();
  const scrollArea = React.useContext(scrollAreaCtx) as ScrollState | null;

  const floatingState = React.useMemo(
    () => new FloatingToolbarState(mutxt, scrollArea),
    [mutxt, scrollArea],
  );
  React.useEffect(() => floatingState.start(), [floatingState]);

  const visible = floatingState.visible.use();
  const point = floatingState.point.use();

  if (!visible) return null;

  return (
    <PositionAtPoint point={point}>
      <MoveToViewport>
        <div
          ref={floatingState.setToolbarElement}
          onMouseDown={floatingState.onToolbarMouseDown}
          onFocusCapture={floatingState.onToolbarFocusCapture}
          onBlurCapture={floatingState.onToolbarBlurCapture}
        >
          <ToolbarMenu menu={floatingState.menu} disabled={readOnly} compact />
        </div>
      </MoveToViewport>
    </PositionAtPoint>
  );
};
