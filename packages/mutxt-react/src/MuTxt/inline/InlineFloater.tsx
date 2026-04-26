import * as React from 'react';
import {CaretToolbar} from '@jsonjoy.com/ui/lib/4-card/Toolbar/ToolbarMenu/CaretToolbar';
import {PositionAtPoint} from '@jsonjoy.com/ui/lib/utils/popup/PositionAtPoint';
import {MoveToViewport} from '@jsonjoy.com/ui/lib/utils/popup/MoveToViewport';
import {usePortal} from '@jsonjoy.com/ui/lib/utils/portal/context';
import {useHiddenTrace} from '@jsonjoy.com/ui/lib/context';
import {useMuTxt} from '../context';

export interface InlineFloaterProps {}

export const InlineFloater: React.FC<InlineFloaterProps> = () => {
  const mutxt = useMuTxt();
  const state = mutxt.inline;
  const portal = usePortal();
  const hidden = useHiddenTrace();
  const toolbarRef = React.useRef<HTMLDivElement | null>(null);
  const [scrubbing, setScrubbing] = React.useState(false);

  // Tracks whether a pointer-down landed outside the toolbar/portal tree.
  // Only set to true once the pointer actually moves (drag), not on a plain click.
  const pointerDownOutside = React.useRef(false);

  // Tracks whether we are in the first frame after becoming visible again.
  // anchorPoint() returns zeros while the editor is still display:none, so we
  // skip one frame to let the browser apply the layout before computing position.
  const [readyAfterUnhide, setReadyAfterUnhide] = React.useState(!hidden);

  mutxt.version.use();

  React.useLayoutEffect(() => {
    if (hidden) {
      setReadyAfterUnhide(false);
      return;
    }
    // Wait one animation frame so the browser has applied the display change
    // and getBoundingClientRect() returns real coordinates.
    const raf = requestAnimationFrame(() => setReadyAfterUnhide(true));
    return () => cancelAnimationFrame(raf);
  }, [hidden]);

  // Detect "scrubbing" — the user holding the pointer button down and dragging
  // to create a new range selection. While scrubbing the toolbar is hidden so
  // it doesn't obstruct the selection. A plain click outside the toolbar does
  // NOT count as scrubbing; only actual pointer movement with the button held
  // does. This avoids a race condition where clicking "More" transitions the
  // toolbar to context-menu mode and the very next pointerdown on the context
  // menu fires before the new portal root has been registered.
  //
  // The portal tree (same mechanism as `useClickAway`) is used to detect
  // "inside" across disjoint DOM trees, e.g. expanded context-menu panes that
  // are rendered via Portal into a separate DOM node.
  React.useEffect(() => {
    const isInsideToolbar = (target: EventTarget | null): boolean => {
      if (!(target instanceof Node)) return false;
      const el = toolbarRef.current;
      if (el && el.contains(target)) return true;
      if (portal) for (const root of portal.roots) if (root.contains(target)) return true;
      return false;
    };
    const onPointerDown = (event: PointerEvent) => {
      if (isInsideToolbar(event.target)) {
        pointerDownOutside.current = false;
        return;
      }
      pointerDownOutside.current = true;
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!pointerDownOutside.current) return;
      // Only treat as scrubbing when a button is actually held (buttons !== 0).
      if (event.buttons === 0) {
        pointerDownOutside.current = false;
        return;
      }
      setScrubbing(true);
    };
    const onPointerEnd = () => {
      pointerDownOutside.current = false;
      setScrubbing(false);
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('pointermove', onPointerMove, true);
    document.addEventListener('pointerup', onPointerEnd, true);
    document.addEventListener('pointercancel', onPointerEnd, true);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('pointermove', onPointerMove, true);
      document.removeEventListener('pointerup', onPointerEnd, true);
      document.removeEventListener('pointercancel', onPointerEnd, true);
    };
  }, [portal]);

  // When the document is visually hidden (display:none, e.g. while another
  // document tab is active), or in the first frame after becoming visible again
  // (before the browser has applied the layout), return null so the toolbar
  // does not render with a stale/zero anchor position.
  if (hidden || !readyAfterUnhide) return null;

  const point = state.anchorPoint();
  if (!point) return null;
  if (scrubbing) return null;

  return (
    <PositionAtPoint point={point}>
      <MoveToViewport>
        <div ref={toolbarRef}>
          <CaretToolbar menu={state.menu.build()} more={{small: true}} context={{showSearch: false}} />
        </div>
      </MoveToViewport>
    </PositionAtPoint>
  );
};
