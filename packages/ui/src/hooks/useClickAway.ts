import {useEffect, useRef, type RefCallback, useCallback} from 'react';
import {usePortal} from '../utils/portal/context';

const defaultEvents = ['mousedown', 'touchstart'];

export const useClickAway = (
  onClickAway: (event: Event) => void,
  events: string[] = defaultEvents,
): RefCallback<HTMLElement> => {
  const portal = usePortal();
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const handler = (event: Event) => {
      const {current: el} = ref;
      const target = event.target as Node | null;
      if (!el || !target) return;
      if (el.contains(target)) return;
      if (!portal) {
        onClickAway(event);
        return;
      }
      for (const root of portal.roots) if (root.contains(target)) return;
      onClickAway(event);
    };
    for (const eventName of events) document.addEventListener(eventName, handler);
    return () => {
      for (const eventName of events) document.removeEventListener(eventName, handler);
    };
  }, [onClickAway, events, portal]);
  const refCallback: RefCallback<HTMLElement> = useCallback((el: HTMLElement | null) => {
    ref.current = el;
  }, []);
  return refCallback;
};
