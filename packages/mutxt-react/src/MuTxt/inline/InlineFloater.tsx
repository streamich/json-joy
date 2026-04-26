import * as React from 'react';
import {CaretToolbar} from '@jsonjoy.com/ui/lib/4-card/Toolbar/ToolbarMenu/CaretToolbar';
import {PositionAtPoint} from '@jsonjoy.com/ui/lib/utils/popup/PositionAtPoint';
import {MoveToViewport} from '@jsonjoy.com/ui/lib/utils/popup/MoveToViewport';
import {usePortal} from '@jsonjoy.com/ui/lib/utils/portal/context';
import {useMuTxt} from '../context';

export interface InlineFloaterProps {}

export const InlineFloater: React.FC<InlineFloaterProps> = () => {
  const mutxt = useMuTxt();
  const state = mutxt.inline;
  const portal = usePortal();
  const toolbarRef = React.useRef<HTMLDivElement | null>(null);
  const [scrubbing, setScrubbing] = React.useState(false);
  mutxt.version.use();

  // Track pointer interactions on the document to detect "scrubbing" (a
  // pointer-drag that starts outside the toolbar / any portal sub-tree).
  // While scrubbing, the floating toolbar is hidden so it does not get in
  // the way of the user's range selection. Pointer-downs that land inside
  // the toolbar itself (or inside any portal sub-tree opened from it, such
  // as expanded menu panes) do NOT count as scrubbing, so the toolbar
  // stays visible when users interact with it. The portal tree is used to
  // detect "inside" across disjoint DOM trees (same trick as `useClickAway`).
  React.useEffect(() => {
    const isInsideToolbar = (target: EventTarget | null): boolean => {
      if (!(target instanceof Node)) return false;
      const el = toolbarRef.current;
      if (el && el.contains(target)) return true;
      if (portal) for (const root of portal.roots) if (root.contains(target)) return true;
      return false;
    };
    const onPointerDown = (event: PointerEvent) => {
      if (isInsideToolbar(event.target)) return;
      setScrubbing(true);
    };
    const onPointerEnd = () => setScrubbing(false);
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('pointerup', onPointerEnd, true);
    document.addEventListener('pointercancel', onPointerEnd, true);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('pointerup', onPointerEnd, true);
      document.removeEventListener('pointercancel', onPointerEnd, true);
    };
  }, [portal]);

  const point = state.anchorPoint();
  if (!point) return null;
  if (scrubbing) return null;

  return (
    <PositionAtPoint point={point}>
      <MoveToViewport>
        <div ref={toolbarRef}>
          <CaretToolbar menu={state.menu.build()} expandPoint={point} />
        </div>
      </MoveToViewport>
    </PositionAtPoint>
  );
};
