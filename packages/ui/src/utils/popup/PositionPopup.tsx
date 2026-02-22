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
  const ref = React.useCallback(
    (el: HTMLDivElement | null) => {
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
          const {width} = el.getBoundingClientRect();
          if (!width) return;
          const _point = point?.get();
          if (!_point) return;
        }, 50);
      });
      if (point) {
        const style = point.style();
        const s = el.style as any;
        for (const key in style) s[key as any] = (style as any)[key as any];
      }
      ro.current.observe(el);
    },
    [point, isMounted],
  );

  return (
    <Portal>
      <div ref={ref} className={positionClass + (fadeIn ? positionClassWithAnimation : '')}>
        {children}
      </div>
    </Portal>
  );
};
