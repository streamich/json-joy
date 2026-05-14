import * as React from 'react';

/**
 * Coordinates "only one popup open at a time" across components sharing the
 * same `scope` string. Opening one entry closes any other entry in the same
 * scope by broadcasting the change to all subscribers.
 */
interface Registry {
  active: number | null;
  subs: Set<(id: number | null) => void>;
  next: number;
}

const registries = new Map<string, Registry>();

const getRegistry = (scope: string): Registry => {
  let r = registries.get(scope);
  if (!r) {
    r = {active: null, subs: new Set(), next: 0};
    registries.set(scope, r);
  }
  return r;
};

export interface SingletonPopupHandle {
  /** Stable id for the calling component within its scope. */
  id: number;
  /** True when this entry is the currently-open one in the scope. */
  open: boolean;
  /** Open or close this entry. */
  setOpen: (open: boolean) => void;
}

export const useSingletonPopup = (scope: string): SingletonPopupHandle => {
  const reg = getRegistry(scope);
  const idRef = React.useRef<number>(-1);
  if (idRef.current === -1) idRef.current = reg.next++;
  const id = idRef.current;
  const [active, setActive] = React.useState<number | null>(reg.active);
  React.useEffect(() => {
    reg.subs.add(setActive);
    return () => {
      reg.subs.delete(setActive);
      if (reg.active === id) {
        reg.active = null;
        reg.subs.forEach((fn) => fn(null));
      }
    };
  }, [id, reg]);
  const setOpen = React.useCallback(
    (next: boolean) => {
      const target = next ? id : null;
      if (reg.active === target) return;
      reg.active = target;
      reg.subs.forEach((fn) => fn(target));
    },
    [id, reg],
  );
  return {id, open: active === id, setOpen};
};
