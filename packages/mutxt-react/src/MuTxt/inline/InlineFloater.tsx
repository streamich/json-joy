import * as React from 'react';
import {ToolbarMenu} from '@jsonjoy.com/ui/lib/4-card/Toolbar/ToolbarMenu';
import {PositionAtPoint} from '@jsonjoy.com/ui/lib/utils/popup/PositionAtPoint';
import {MoveToViewport} from '@jsonjoy.com/ui/lib/utils/popup/MoveToViewport';
import {usePortal} from '@jsonjoy.com/ui/lib/utils/portal/context';
import {useHiddenTrace} from '@jsonjoy.com/ui/lib/context';
import {useMuTxt} from '../context';
import type {AnchorPoint} from '@jsonjoy.com/ui/lib/utils/popup/types';

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

  // Last successfully computed anchor point. Used as a fallback so the toolbar
  // does not unmount when the editor's range selection is briefly cleared
  // (e.g. while the user is interacting with a focusable element inside our
  // own portal subtree, like the search input in the More context-menu pane).
  // Tracked via refs only — touching React state on every focus event would
  // re-render this component, which spread-recreates the menu prop downstream
  // and resets ContextMenuState (path$, search$, open hover panel, etc.).
  const lastPointRef = React.useRef<AnchorPoint | undefined>(undefined);
  const focusInTreeRef = React.useRef(false);

  mutxt.version.use();
  const dismissed = state.dismissed.use();

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

  // The portal tree (same mechanism as `useClickAway`) is used to detect
  // "inside" across disjoint DOM trees, e.g. expanded context-menu panes that
  // are rendered via Portal into a separate DOM node.
  const isInsideTree = React.useCallback(
    (target: EventTarget | Node | null): boolean => {
      if (!(target instanceof Node)) return false;
      const el = toolbarRef.current;
      if (el && el.contains(target)) return true;
      if (portal) for (const root of portal.roots) if (root.contains(target)) return true;
      return false;
    },
    [portal],
  );

  // Track whether focus currently lives inside our toolbar/portal subtree.
  // Only writes to a ref; reading happens at render time (driven by the
  // existing `mutxt.version.use()` re-render trigger) so we don't add new
  // re-renders that would reset downstream menu state.
  React.useEffect(() => {
    const sync = () => {
      focusInTreeRef.current = isInsideTree(document.activeElement);
    };
    sync();
    document.addEventListener('focusin', sync, true);
    document.addEventListener('focusout', sync, true);
    return () => {
      document.removeEventListener('focusin', sync, true);
      document.removeEventListener('focusout', sync, true);
    };
  }, [isInsideTree]);

  // Expose the focus-tree check to InlineState so its blur-driven dismiss
  // can skip dismissing when the user just clicked a toolbar button.
  React.useEffect(() => {
    state.isFocusInToolbar = () => focusInTreeRef.current;
    return () => {
      state.isFocusInToolbar = null;
    };
  }, [state]);

  // Keep the editor focused while the user mousedowns on toolbar/portal
  // elements. Without this, the browser steals focus to the clicked element
  // (or to <body> in Safari/Firefox where buttons aren't focusable on
  // mousedown), the editor's onBlur fires, dismissed flips to true, and
  // React unmounts the toolbar before the click event ever lands on the
  // button. preventDefault on mousedown is the standard contenteditable
  // trick: it suppresses the focus shift without preventing click. Inputs
  // (e.g. the context-menu search box) are exempted so they can take focus.
  React.useEffect(() => {
    const onMouseDown = (event: MouseEvent) => {
      if (!isInsideTree(event.target)) return;
      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) return;
      event.preventDefault();
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [isInsideTree]);

  // Synchronously update the positioned div's left/top and visibility on
  // scroll and resize. Going through React on every scroll event is too slow:
  // by the time the re-render and the layout effect commit, the browser has
  // typically already painted the new scroll frame, leaving the toolbar one
  // frame behind and visibly stuttering. Mutating the DOM inline inside the
  // scroll handler keeps the toolbar locked to the selection.
  //
  // The positioned div is the grandparent of `toolbarRef` — `MoveToViewport`
  // wraps the inner div in a `<span>`, and `PositionPopup` wraps that in the
  // `position: fixed` div whose left/top we need to mutate.
  const updatePosition = React.useCallback(() => {
    const inner = toolbarRef.current;
    if (!inner) return;
    const positionedDiv = inner.parentElement?.parentElement;
    if (!(positionedDiv instanceof HTMLElement)) return;
    const point = state.anchorPoint() ?? lastPointRef.current;
    if (!point) return;
    if (!state.isToolbarWithinViewport(point, inner)) {
      if (positionedDiv.style.visibility !== 'hidden') positionedDiv.style.visibility = 'hidden';
      return;
    }
    if (positionedDiv.style.visibility === 'hidden') positionedDiv.style.visibility = '';
    const s = positionedDiv.style;
    if (point.dx >= 0) {
      s.left = point.x + 'px';
      if (s.right) s.right = '';
    } else {
      s.right = window.innerWidth - point.x + 'px';
      if (s.left) s.left = '';
    }
    if (point.dy >= 0) {
      s.top = point.y + 'px';
      if (s.bottom) s.bottom = '';
    } else {
      s.bottom = window.innerHeight - point.y + 'px';
      if (s.top) s.top = '';
    }
    lastPointRef.current = point;
  }, [state]);

  // Re-evaluate position after every render so a stale `visibility: hidden`
  // (left over from a previous scroll-out) doesn't survive a new selection
  // bringing the toolbar back into the viewport.
  React.useLayoutEffect(() => {
    updatePosition();
  });

  React.useEffect(() => {
    document.addEventListener('scroll', updatePosition, {capture: true, passive: true});
    window.addEventListener('resize', updatePosition, {passive: true});
    return () => {
      document.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [updatePosition]);

  // Detect "scrubbing" — the user holding the pointer button down and dragging
  // to create a new range selection. While scrubbing the toolbar is hidden so
  // it doesn't obstruct the selection. A plain click outside the toolbar does
  // NOT count as scrubbing; only actual pointer movement with the button held
  // does. This avoids a race condition where clicking "More" transitions the
  // toolbar to context-menu mode and the very next pointerdown on the context
  // menu fires before the new portal root has been registered.
  React.useEffect(() => {
    const isInsideToolbar = (target: EventTarget | null): boolean => isInsideTree(target);
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
  }, [isInsideTree]);

  // When the document is visually hidden (display:none, e.g. while another
  // document tab is active), or in the first frame after becoming visible again
  // (before the browser has applied the layout), return null so the toolbar
  // does not render with a stale/zero anchor position.
  if (hidden || !readyAfterUnhide) return;
  if (dismissed) return;

  const computedPoint = state.anchorPoint();
  if (computedPoint) lastPointRef.current = computedPoint;
  const point = computedPoint ?? (focusInTreeRef.current ? lastPointRef.current : undefined);
  if (!point) return;
  if (scrubbing) return;

  return (
    <PositionAtPoint point={point}>
      <MoveToViewport>
        <div ref={toolbarRef}>
          <ToolbarMenu menu={state.menu.build()} onEsc={() => state.dismissed.next(true)} />
        </div>
      </MoveToViewport>
    </PositionAtPoint>
  );
};
