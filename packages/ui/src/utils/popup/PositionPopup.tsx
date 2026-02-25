import * as React from 'react';
import {ZINDEX} from '../../constants';
import {rule} from 'nano-theme';
import {useAnchorPoint} from './context';
import useMountedState from 'react-use/lib/useMountedState';
import {Portal} from '../portal';

const positionClass = rule({
  d: 'block',
  pos: 'fixed',
  z: ZINDEX.CONTEXT,
});

const positionClassWithAnimation = rule({
  an: 'fadeInScaleIn .04s',
});

export interface PositionPopupProps {
  fadeIn?: boolean;
  children: React.ReactNode;
}

/**
 * Places popup at the anchor point.
 */
export const PositionPopup: React.FC<PositionPopupProps> = ({fadeIn, children}) => {
  const point = useAnchorPoint();
  const isMounted = useMountedState();
  const timer = React.useRef<unknown>(null);
  const ro = React.useRef<ResizeObserver | null>(null);
  const elRef = React.useRef<HTMLDivElement | null>(null);

  const applyStyle = React.useCallback(() => {
    const el = elRef.current;
    if (!el || !point) return;
    const style = point.style();
    const s = el.style as any;
    for (const key in style) s[key as any] = (style as any)[key as any];
  }, [point]);

  /**
   * Position the popup in a layout effect rather than inside the ref callback.
   *
   * React guarantees that ALL refs in a render batch are assigned before any
   * useLayoutEffect fires. By the time this runs, the toggle element's ref
   * (set by the ancestor BasicTooltip / PopupControlled) is already populated
   * on the AnchorPointHandle, so point.style() can compute the correct position.
   * This avoids the position:0,0 flash that would occur if we tried to
   * position inside the ref callback, where sibling/ancestor refs are not yet set.
   *
   * useLayoutEffect runs synchronously before the browser paints, so there is
   * no visible flash of mis-positioned content.
   */
  React.useLayoutEffect(() => {
    applyStyle();
  });

  const ref = React.useCallback(
    (el: HTMLDivElement | null) => {
      elRef.current = el;
      if (!el) {
        ro.current?.disconnect();
        return;
      }
      ro.current = new ResizeObserver(() => {
        if (timer.current) {
          clearTimeout(timer.current as any);
          timer.current = null;
        }
        timer.current = setTimeout(() => {
          if (!isMounted()) return;
          applyStyle();
        }, 50);
      });
      ro.current.observe(el);
    },
    [applyStyle, isMounted],
  );

  return (
    <Portal>
      <div ref={ref} className={positionClass + (fadeIn ? positionClassWithAnimation : '')}>
        {children}
      </div>
    </Portal>
  );
};
